#!/usr/bin/env tsx

/**
 * Split Flashcards Script
 *
 * This script splits large flashcard JSON files into smaller, category-based files
 * for better organization and maintainability.
 *
 * Usage:
 *   npx tsx scripts/split-flashcards.ts [level]
 *   npx tsx scripts/split-flashcards.ts all
 *
 * Examples:
 *   npx tsx scripts/split-flashcards.ts a1
 *   npx tsx scripts/split-flashcards.ts b1
 *   npx tsx scripts/split-flashcards.ts all
 */

import fs from 'fs';
import path from 'path';

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  tags: string[];
  _meta: {
    source: string;
    lineNumber: number;
    hierarchy: string[];
  };
}

interface FlashcardLevel {
  level: string;
  totalCards: number;
  flashcards: Flashcard[];
}

interface CategoryGroup {
  category: string;
  cards: Flashcard[];
}

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const DATA_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'levels');
const OUTPUT_BASE_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'split');

/**
 * Load a flashcard level file
 */
function loadLevelFile(level: string): FlashcardLevel | null {
  const filePath = path.join(DATA_DIR, `${level}.json`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as FlashcardLevel;
  } catch (error) {
    console.error(`❌ Error reading ${level}.json:`, error);
    return null;
  }
}

/**
 * Group flashcards by category
 */
function groupByCategory(flashcards: Flashcard[]): CategoryGroup[] {
  const categoryMap = new Map<string, Flashcard[]>();

  for (const card of flashcards) {
    const category = card.category;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(card);
  }

  // Convert to array and sort by category name
  return Array.from(categoryMap.entries())
    .map(([category, cards]) => ({ category, cards }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Create a safe filename from category name
 */
function sanitizeFilename(category: string): string {
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

/**
 * Split a level's flashcards into category-based files
 */
function splitLevel(level: string): boolean {
  console.log(`\n📂 Processing ${level.toUpperCase()}...`);

  const levelData = loadLevelFile(level);
  if (!levelData) {
    return false;
  }

  const { flashcards, totalCards } = levelData;
  console.log(`   Total cards: ${totalCards}`);

  // Group by category
  const categoryGroups = groupByCategory(flashcards);
  console.log(`   Categories: ${categoryGroups.length}`);

  // Create output directory for this level
  const outputDir = path.join(OUTPUT_BASE_DIR, level);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write category files
  let filesWritten = 0;
  for (const group of categoryGroups) {
    const filename = sanitizeFilename(group.category);
    const filePath = path.join(outputDir, `${filename}.json`);

    const categoryData = {
      level: level.toUpperCase(),
      category: group.category,
      totalCards: group.cards.length,
      flashcards: group.cards,
    };

    try {
      fs.writeFileSync(filePath, JSON.stringify(categoryData, null, 2), 'utf-8');
      console.log(`   ✅ ${group.category}: ${group.cards.length} cards → ${filename}.json`);
      filesWritten++;
    } catch (error) {
      console.error(`   ❌ Error writing ${filename}.json:`, error);
    }
  }

  // Create index file
  const indexData = {
    level: level.toUpperCase(),
    totalCards,
    totalCategories: categoryGroups.length,
    categories: categoryGroups.map(g => ({
      name: g.category,
      count: g.cards.length,
      file: `${sanitizeFilename(g.category)}.json`,
    })),
  };

  const indexPath = path.join(outputDir, '_index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
  console.log(`   📋 Index created: _index.json`);

  console.log(`   ✨ Split ${level.toUpperCase()} into ${filesWritten} files`);
  return true;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const targetLevel = args[0]?.toLowerCase();

  console.log('🔧 Flashcard Splitter Tool\n');
  console.log('=' .repeat(50));

  if (!targetLevel) {
    console.log('\n❌ Please specify a level or "all"');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/split-flashcards.ts [level]');
    console.log('  npx tsx scripts/split-flashcards.ts all');
    console.log('\nExamples:');
    console.log('  npx tsx scripts/split-flashcards.ts a1');
    console.log('  npx tsx scripts/split-flashcards.ts b1');
    console.log('  npx tsx scripts/split-flashcards.ts all');
    process.exit(1);
  }

  const levelsToProcess = targetLevel === 'all' ? LEVELS : [targetLevel];

  // Validate levels
  for (const level of levelsToProcess) {
    if (!LEVELS.includes(level)) {
      console.log(`\n❌ Invalid level: ${level}`);
      console.log(`   Valid levels: ${LEVELS.join(', ')}, all`);
      process.exit(1);
    }
  }

  // Create base output directory
  if (!fs.existsSync(OUTPUT_BASE_DIR)) {
    fs.mkdirSync(OUTPUT_BASE_DIR, { recursive: true });
  }

  // Process each level
  let successCount = 0;
  for (const level of levelsToProcess) {
    if (splitLevel(level)) {
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✨ Complete! Successfully split ${successCount}/${levelsToProcess.length} levels`);
  console.log(`\n📁 Output directory: ${OUTPUT_BASE_DIR}\n`);
}

// Run the script
main();
