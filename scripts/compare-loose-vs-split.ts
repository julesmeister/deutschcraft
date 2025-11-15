#!/usr/bin/env tsx

/**
 * Compare Loose Files vs Split Files
 *
 * This script compares flashcards in loose root files with split directory files
 * to ensure no data is lost before cleanup.
 *
 * Usage:
 *   npx tsx scripts/compare-loose-vs-split.ts
 */

import fs from 'fs';
import path from 'path';

const REMNOTE_DIR = path.join(process.cwd(), 'lib', 'data', 'remnote');
const SPLIT_DIR = path.join(REMNOTE_DIR, 'split');

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  tags?: string[];
  _meta?: any;
}

interface FileComparison {
  looseFile: string;
  splitFiles: string[];
  looseCards: Flashcard[];
  splitCards: Flashcard[];
  uniqueInLoose: Flashcard[];
  uniqueInSplit: Flashcard[];
  identical: boolean;
}

interface ComparisonReport {
  totalLooseFiles: number;
  filesWithUniqueData: FileComparison[];
  filesIdentical: string[];
  filesNotInSplit: string[];
  totalUniqueCardsInLoose: number;
  summary: {
    safeToDelete: string[];
    requiresMerge: Array<{ file: string; uniqueCards: number }>;
    notFound: string[];
  };
}

/**
 * Normalize category name for comparison
 */
function normalizeCategory(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/--/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Load flashcards from a JSON file
 */
function loadFlashcards(filePath: string): Flashcard[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Handle different JSON structures
    if (Array.isArray(data)) {
      return data;
    } else if (data.flashcards && Array.isArray(data.flashcards)) {
      return data.flashcards;
    } else if (data.cards && Array.isArray(data.cards)) {
      return data.cards;
    }

    return [];
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return [];
  }
}

/**
 * Find split files that might contain data for a loose file
 */
function findMatchingSplitFiles(looseFileName: string): string[] {
  const normalized = normalizeCategory(looseFileName.replace('.json', ''));
  const matchingFiles: string[] = [];

  // Search all split directories
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

  for (const level of levels) {
    const levelDir = path.join(SPLIT_DIR, level);
    if (!fs.existsSync(levelDir)) continue;

    const files = fs.readdirSync(levelDir);
    for (const file of files) {
      if (file === '_index.json') continue;

      const fileNormalized = normalizeCategory(file.replace('.json', ''));
      if (fileNormalized === normalized) {
        matchingFiles.push(path.join(levelDir, file));
      }
    }
  }

  return matchingFiles;
}

/**
 * Create a unique key for a flashcard to detect duplicates
 */
function createCardKey(card: Flashcard): string {
  // Use german word + english translation as unique identifier
  return `${card.german?.toLowerCase()?.trim()}|${card.english?.toLowerCase()?.trim()}`;
}

/**
 * Compare two sets of flashcards
 */
function compareFlashcards(
  looseCards: Flashcard[],
  splitCards: Flashcard[]
): { uniqueInLoose: Flashcard[]; uniqueInSplit: Flashcard[] } {
  const looseKeys = new Set(looseCards.map(createCardKey));
  const splitKeys = new Set(splitCards.map(createCardKey));

  const uniqueInLoose = looseCards.filter(
    card => !splitKeys.has(createCardKey(card))
  );

  const uniqueInSplit = splitCards.filter(
    card => !looseKeys.has(createCardKey(card))
  );

  return { uniqueInLoose, uniqueInSplit };
}

/**
 * Compare a loose file with its split counterparts
 */
function compareFile(looseFileName: string): FileComparison {
  const looseFilePath = path.join(REMNOTE_DIR, looseFileName);
  const splitFiles = findMatchingSplitFiles(looseFileName);

  const looseCards = loadFlashcards(looseFilePath);
  const splitCards = splitFiles.flatMap(loadFlashcards);

  const { uniqueInLoose, uniqueInSplit } = compareFlashcards(looseCards, splitCards);

  return {
    looseFile: looseFileName,
    splitFiles: splitFiles.map(f => path.relative(REMNOTE_DIR, f)),
    looseCards,
    splitCards,
    uniqueInLoose,
    uniqueInSplit,
    identical: uniqueInLoose.length === 0 && uniqueInSplit.length === 0,
  };
}

/**
 * Perform comprehensive comparison
 */
function performComparison(): ComparisonReport {
  console.log('🔍 Comparing loose files with split files...\n');

  const files = fs.readdirSync(REMNOTE_DIR);
  const looseFiles = files.filter(
    f =>
      f.endsWith('.json') &&
      f !== 'stats.json' &&
      f !== 'all-flashcards.json' &&
      !f.startsWith('--avoided-infinite-recursion--')
  );

  const report: ComparisonReport = {
    totalLooseFiles: looseFiles.length,
    filesWithUniqueData: [],
    filesIdentical: [],
    filesNotInSplit: [],
    totalUniqueCardsInLoose: 0,
    summary: {
      safeToDelete: [],
      requiresMerge: [],
      notFound: [],
    },
  };

  for (const file of looseFiles) {
    const comparison = compareFile(file);

    if (comparison.splitFiles.length === 0) {
      report.filesNotInSplit.push(file);
      report.summary.notFound.push(file);
      console.log(`⚠️  ${file}`);
      console.log(`   No matching split files found`);
      console.log(`   Contains ${comparison.looseCards.length} cards\n`);
    } else if (comparison.uniqueInLoose.length > 0) {
      report.filesWithUniqueData.push(comparison);
      report.totalUniqueCardsInLoose += comparison.uniqueInLoose.length;
      report.summary.requiresMerge.push({
        file,
        uniqueCards: comparison.uniqueInLoose.length,
      });
      console.log(`🔄 ${file}`);
      console.log(`   Has ${comparison.uniqueInLoose.length} unique cards not in split files`);
      console.log(`   Matches: ${comparison.splitFiles.join(', ')}\n`);
    } else {
      report.filesIdentical.push(file);
      report.summary.safeToDelete.push(file);
      console.log(`✅ ${file}`);
      console.log(`   Identical to split files - safe to delete`);
      console.log(`   Matches: ${comparison.splitFiles.join(', ')}\n`);
    }
  }

  return report;
}

/**
 * Print detailed report
 */
function printReport(report: ComparisonReport): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 COMPARISON REPORT');
  console.log('='.repeat(70));

  console.log(`\n📁 OVERVIEW:`);
  console.log(`   Total loose files analyzed:     ${report.totalLooseFiles}`);
  console.log(`   Files identical to split:       ${report.filesIdentical.length}`);
  console.log(`   Files with unique data:         ${report.filesWithUniqueData.length}`);
  console.log(`   Files not found in split:       ${report.filesNotInSplit.length}`);
  console.log(`   Total unique cards in loose:    ${report.totalUniqueCardsInLoose}`);

  if (report.summary.requiresMerge.length > 0) {
    console.log(`\n⚠️  FILES REQUIRING MERGE (${report.summary.requiresMerge.length}):`);
    for (const item of report.summary.requiresMerge) {
      console.log(`   ${item.file} - ${item.uniqueCards} unique cards`);
    }
  }

  if (report.summary.notFound.length > 0) {
    console.log(`\n❌ FILES NOT FOUND IN SPLIT (${report.summary.notFound.length}):`);
    for (const file of report.summary.notFound) {
      console.log(`   ${file}`);
    }
  }

  if (report.summary.safeToDelete.length > 0) {
    console.log(`\n✅ SAFE TO DELETE (${report.summary.safeToDelete.length}):`);
    report.summary.safeToDelete.slice(0, 10).forEach(file => {
      console.log(`   ${file}`);
    });
    if (report.summary.safeToDelete.length > 10) {
      console.log(`   ... and ${report.summary.safeToDelete.length - 10} more`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('💡 RECOMMENDATIONS:');
  console.log('='.repeat(70));

  if (report.summary.requiresMerge.length > 0) {
    console.log(`\n1. MERGE UNIQUE DATA:`);
    console.log(`   ${report.summary.requiresMerge.length} files have unique flashcards`);
    console.log(`   Run: npm run vocab:merge-loose-to-split`);
    console.log(`   This will preserve all unique data before cleanup`);
  }

  if (report.summary.notFound.length > 0) {
    console.log(`\n2. HANDLE ORPHANED FILES:`);
    console.log(`   ${report.summary.notFound.length} files have no split counterpart`);
    console.log(`   These need manual review to determine correct level/category`);
  }

  if (report.summary.safeToDelete.length > 0) {
    console.log(`\n3. SAFE TO DELETE:`);
    console.log(`   ${report.summary.safeToDelete.length} files are identical to split files`);
    console.log(`   These can be safely deleted after merge is complete`);
  }

  console.log('\n' + '='.repeat(70));

  if (report.totalUniqueCardsInLoose > 0) {
    console.log('\n⚠️  WARNING: DO NOT DELETE LOOSE FILES YET!');
    console.log(`   ${report.totalUniqueCardsInLoose} unique flashcards would be lost!`);
    console.log('   First run the merge script to preserve this data.');
  } else if (report.summary.notFound.length > 0) {
    console.log('\n⚠️  WARNING: Some files need manual review!');
    console.log(`   ${report.summary.notFound.length} files have no split counterpart.`);
  } else {
    console.log('\n✅ ALL DATA IS IN SPLIT FILES - SAFE TO PROCEED WITH CLEANUP!');
  }

  console.log('='.repeat(70) + '\n');
}

/**
 * Save detailed report
 */
function saveDetailedReport(report: ComparisonReport): void {
  const reportPath = path.join(process.cwd(), 'loose-vs-split-comparison.json');

  const detailedReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalLooseFiles: report.totalLooseFiles,
      identicalFiles: report.filesIdentical.length,
      filesWithUniqueData: report.filesWithUniqueData.length,
      filesNotInSplit: report.filesNotInSplit.length,
      totalUniqueCards: report.totalUniqueCardsInLoose,
    },
    filesWithUniqueData: report.filesWithUniqueData.map(f => ({
      looseFile: f.looseFile,
      splitFiles: f.splitFiles,
      uniqueCardsCount: f.uniqueInLoose.length,
      uniqueCards: f.uniqueInLoose.map(c => ({
        german: c.german,
        english: c.english,
        category: c.category,
        level: c.level,
      })),
    })),
    filesNotInSplit: report.filesNotInSplit,
    safeToDelete: report.summary.safeToDelete,
  };

  fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2), 'utf-8');
  console.log(`\n📝 Detailed report saved to: ${reportPath}\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(70));
  console.log('🔍 LOOSE FILES vs SPLIT FILES COMPARISON');
  console.log('='.repeat(70) + '\n');

  const report = performComparison();
  printReport(report);
  saveDetailedReport(report);

  // Exit with error code if data would be lost
  if (report.totalUniqueCardsInLoose > 0 || report.filesNotInSplit.length > 0) {
    process.exit(1);
  }
}

main();
