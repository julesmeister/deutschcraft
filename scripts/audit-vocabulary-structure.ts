#!/usr/bin/env tsx

/**
 * Vocabulary Structure Audit Script
 *
 * This script audits the current state of lib/data/remnote directory
 * and generates a detailed report of what needs to be cleaned up.
 *
 * Usage:
 *   npx tsx scripts/audit-vocabulary-structure.ts
 */

import fs from 'fs';
import path from 'path';

const REMNOTE_DIR = path.join(process.cwd(), 'lib', 'data', 'remnote');
const LEVELS_DIR = path.join(REMNOTE_DIR, 'levels');
const SPLIT_DIR = path.join(REMNOTE_DIR, 'split');

interface AuditReport {
  totalFiles: number;
  looseFiles: string[];
  infiniteRecursionFiles: string[];
  validCategoryFiles: string[];
  duplicates: Map<string, string[]>;
  levelsFiles: string[];
  splitFiles: string[];
  statsFile: boolean;
  readmeFile: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Check if a file is being imported anywhere in the codebase
 */
async function isFileImported(filename: string): Promise<boolean> {
  // Simple heuristic: check if file is referenced in common import locations
  const searchPaths = [
    path.join(process.cwd(), 'app'),
    path.join(process.cwd(), 'components'),
    path.join(process.cwd(), 'lib'),
  ];

  for (const searchPath of searchPaths) {
    try {
      const files = fs.readdirSync(searchPath, { recursive: true });
      for (const file of files) {
        if (typeof file === 'string' && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
          const fullPath = path.join(searchPath, file);
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes(filename)) {
            return true;
          }
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }
  }

  return false;
}

/**
 * Perform comprehensive audit
 */
async function auditStructure(): Promise<AuditReport> {
  const report: AuditReport = {
    totalFiles: 0,
    looseFiles: [],
    infiniteRecursionFiles: [],
    validCategoryFiles: [],
    duplicates: new Map(),
    levelsFiles: [],
    splitFiles: [],
    statsFile: false,
    readmeFile: false,
    issues: [],
    recommendations: [],
  };

  // Get all files in remnote directory (excluding subdirectories)
  const files = fs.readdirSync(REMNOTE_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  report.totalFiles = jsonFiles.length;

  // Categorize files
  for (const file of jsonFiles) {
    if (file === 'stats.json') {
      report.statsFile = true;
      continue;
    }

    if (file.startsWith('--avoided-infinite-recursion--')) {
      report.infiniteRecursionFiles.push(file);
      report.issues.push(`Found infinite recursion artifact: ${file}`);
    } else {
      report.looseFiles.push(file);
    }
  }

  // Check for README
  if (files.includes('README.md')) {
    report.readmeFile = true;
  }

  // Get levels directory files
  if (fs.existsSync(LEVELS_DIR)) {
    const levelsFiles = fs.readdirSync(LEVELS_DIR);
    report.levelsFiles = levelsFiles.filter(f => f.endsWith('.json') && !f.includes('.backup-'));
  }

  // Get split directory structure
  if (fs.existsSync(SPLIT_DIR)) {
    const splitDirs = fs.readdirSync(SPLIT_DIR);
    for (const dir of splitDirs) {
      const dirPath = path.join(SPLIT_DIR, dir);
      if (fs.statSync(dirPath).isDirectory()) {
        const splitFiles = fs.readdirSync(dirPath);
        report.splitFiles.push(...splitFiles.map(f => `${dir}/${f}`));
      }
    }
  }

  // Detect duplicates (same category name, different location)
  const categoryMap = new Map<string, string[]>();

  // Add loose files to map
  for (const file of report.looseFiles) {
    const basename = file.replace('.json', '');
    const normalized = basename.toLowerCase().replace(/--/g, '-');
    if (!categoryMap.has(normalized)) {
      categoryMap.set(normalized, []);
    }
    categoryMap.get(normalized)!.push(`root/${file}`);
  }

  // Add split files to map
  for (const splitFile of report.splitFiles) {
    const parts = splitFile.split('/');
    if (parts.length === 2 && parts[1] !== '_index.json') {
      const basename = parts[1].replace('.json', '');
      if (!categoryMap.has(basename)) {
        categoryMap.set(basename, []);
      }
      categoryMap.get(basename)!.push(`split/${splitFile}`);
    }
  }

  // Find duplicates
  for (const [category, locations] of categoryMap.entries()) {
    if (locations.length > 1) {
      report.duplicates.set(category, locations);
      report.issues.push(`Duplicate category "${category}" found in: ${locations.join(', ')}`);
    }
  }

  // Generate recommendations
  if (report.infiniteRecursionFiles.length > 0) {
    report.recommendations.push(
      `Delete ${report.infiniteRecursionFiles.length} infinite recursion artifacts - they are build errors`
    );
  }

  if (report.looseFiles.length > 0) {
    report.recommendations.push(
      `Organize ${report.looseFiles.length} loose files into split/ directory structure`
    );
  }

  if (report.duplicates.size > 0) {
    report.recommendations.push(
      `Resolve ${report.duplicates.size} duplicate categories by consolidating data`
    );
  }

  if (!report.statsFile) {
    report.recommendations.push('Generate stats.json file for quick category lookups');
  }

  report.recommendations.push('Rename "remnote" directory to "vocabulary" for clarity');
  report.recommendations.push('Update all import statements to use new directory name');

  return report;
}

/**
 * Print report in a readable format
 */
function printReport(report: AuditReport): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 VOCABULARY STRUCTURE AUDIT REPORT');
  console.log('='.repeat(70));

  console.log('\n📁 DIRECTORY OVERVIEW:');
  console.log(`   Total JSON files in root:  ${report.totalFiles}`);
  console.log(`   Loose category files:      ${report.looseFiles.length}`);
  console.log(`   Infinite recursion files:  ${report.infiniteRecursionFiles.length}`);
  console.log(`   Files in levels/:          ${report.levelsFiles.length}`);
  console.log(`   Files in split/:           ${report.splitFiles.length}`);
  console.log(`   stats.json exists:         ${report.statsFile ? '✅' : '❌'}`);
  console.log(`   README.md exists:          ${report.readmeFile ? '✅' : '❌'}`);

  if (report.infiniteRecursionFiles.length > 0) {
    console.log('\n⚠️  INFINITE RECURSION FILES (should be deleted):');
    report.infiniteRecursionFiles.slice(0, 5).forEach(file => {
      console.log(`   - ${file}`);
    });
    if (report.infiniteRecursionFiles.length > 5) {
      console.log(`   ... and ${report.infiniteRecursionFiles.length - 5} more`);
    }
  }

  if (report.looseFiles.length > 0) {
    console.log('\n📄 LOOSE FILES IN ROOT (should be organized):');
    report.looseFiles.slice(0, 10).forEach(file => {
      console.log(`   - ${file}`);
    });
    if (report.looseFiles.length > 10) {
      console.log(`   ... and ${report.looseFiles.length - 10} more`);
    }
  }

  if (report.duplicates.size > 0) {
    console.log('\n🔄 DUPLICATE CATEGORIES:');
    for (const [category, locations] of report.duplicates.entries()) {
      console.log(`   ${category}:`);
      locations.forEach(loc => console.log(`     - ${loc}`));
    }
  }

  if (report.issues.length > 0) {
    console.log('\n❌ ISSUES FOUND:');
    report.issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  }

  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 SUMMARY:');
  console.log(`   ${report.issues.length} issues found`);
  console.log(`   ${report.recommendations.length} recommendations`);
  console.log('='.repeat(70) + '\n');
}

/**
 * Save detailed report to JSON file
 */
function saveReport(report: AuditReport): void {
  const reportPath = path.join(process.cwd(), 'vocabulary-audit-report.json');

  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: report.totalFiles,
      looseFiles: report.looseFiles.length,
      infiniteRecursionFiles: report.infiniteRecursionFiles.length,
      duplicates: report.duplicates.size,
      issues: report.issues.length,
    },
    details: {
      looseFiles: report.looseFiles,
      infiniteRecursionFiles: report.infiniteRecursionFiles,
      levelsFiles: report.levelsFiles,
      splitFiles: report.splitFiles,
      duplicates: Object.fromEntries(report.duplicates),
    },
    issues: report.issues,
    recommendations: report.recommendations,
  };

  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf-8');
  console.log(`\n📝 Detailed report saved to: ${reportPath}\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Starting vocabulary structure audit...\n');

  const report = await auditStructure();

  printReport(report);
  saveReport(report);

  // Exit with error code if issues found
  if (report.issues.length > 0) {
    process.exit(1);
  }
}

main();
