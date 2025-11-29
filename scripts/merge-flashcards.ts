#!/usr/bin/env tsx

/**
 * Merge Flashcards Script
 *
 * This script merges category-based flashcard files back into a single level file.
 * Useful for rebuilding the main data files from split sources.
 *
 * Usage:
 *   npx tsx scripts/merge-flashcards.ts [level]
 *   npx tsx scripts/merge-flashcards.ts all
 *
 * Examples:
 *   npx tsx scripts/merge-flashcards.ts a1
 *   npx tsx scripts/merge-flashcards.ts b1
 *   npx tsx scripts/merge-flashcards.ts all
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

interface CategoryFile {
  level: string;
  category: string;
  totalCards: number;
  flashcards: Flashcard[];
}

interface FlashcardLevel {
  level: string;
  totalCards: number;
  flashcards: Flashcard[];
}

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const SPLIT_BASE_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'split');
const OUTPUT_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'levels');

/**
 * Load all category files for a level
 */
function loadCategoryFiles(level: string): Flashcard[] {
  const levelDir = path.join(SPLIT_BASE_DIR, level);

  if (!fs.existsSync(levelDir)) {
    console.error(`❌ Split directory not found: ${levelDir}`);
    return [];
  }

  const allFlashcards: Flashcard[] = [];
  const files = fs.readdirSync(levelDir);

  // Filter out index file and only process JSON files
  const categoryFiles = files.filter(
    (f) => f.endsWith('.json') && f !== '_index.json'
  );

  console.log(`   Found ${categoryFiles.length} category files`);

  for (const file of categoryFiles) {
    const filePath = path.join(levelDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const categoryData = JSON.parse(content) as CategoryFile;
      allFlashcards.push(...categoryData.flashcards);
      console.log(`   ✅ ${categoryData.category}: ${categoryData.totalCards} cards`);
    } catch (error) {
      console.error(`   ❌ Error reading ${file}:`, error);
    }
  }

  return allFlashcards;
}

/**
 * Sort flashcards (by category, then by ID)
 */
function sortFlashcards(flashcards: Flashcard[]): Flashcard[] {
  return flashcards.sort((a, b) => {
    // First sort by category
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    // Then by ID
    return a.id.localeCompare(b.id);
  });
}

/**
 * Regenerate unique IDs for flashcards with duplicates
 */
function ensureUniqueIds(flashcards: Flashcard[]): Flashcard[] {
  const idCounts = new Map<string, number>();
  const seenIds = new Set<string>();

  return flashcards.map((card) => {
    if (seenIds.has(card.id)) {
      // Duplicate found - regenerate ID
      const count = (idCounts.get(card.id) || 1) + 1;
      idCounts.set(card.id, count);

      const newId = `${card.id}-dup${count}`;
      console.log(`   🔄 Duplicate ID found: ${card.id} → ${newId} (${card.german})`);

      return {
        ...card,
        id: newId,
      };
    }

    seenIds.add(card.id);
    idCounts.set(card.id, 1);
    return card;
  });
}

/**
 * Merge category files back into a single level file
 */
function mergeLevel(level: string, backup: boolean = false): boolean {
  console.log(`\n📂 Processing ${level.toUpperCase()}...`);

  const flashcards = loadCategoryFiles(level);

  if (flashcards.length === 0) {
    console.log(`   ⚠️  No flashcards found for ${level.toUpperCase()}`);
    return false;
  }

  // Sort flashcards first
  const sortedFlashcards = sortFlashcards(flashcards);
  console.log(`   📊 Total cards collected: ${sortedFlashcards.length}`);

  // Ensure unique IDs
  const uniqueFlashcards = ensureUniqueIds(sortedFlashcards);
  const duplicateCount = uniqueFlashcards.filter(c => c.id.includes('-dup')).length;
  if (duplicateCount > 0) {
    console.log(`   ⚠️  Fixed ${duplicateCount} duplicate IDs`);
  }

  // Create merged data
  const mergedData: FlashcardLevel = {
    level: level.toUpperCase(),
    totalCards: uniqueFlashcards.length,
    flashcards: uniqueFlashcards,
  };

  // Backup existing file if requested
  const outputPath = path.join(OUTPUT_DIR, `${level}.json`);
  if (backup && fs.existsSync(outputPath)) {
    const backupPath = path.join(
      OUTPUT_DIR,
      `${level}.backup-${Date.now()}.json`
    );
    fs.copyFileSync(outputPath, backupPath);
    console.log(`   💾 Backup created: ${path.basename(backupPath)}`);
  }

  // Write merged file
  try {
    fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf-8');
    console.log(`   ✅ Merged file written: ${level}.json`);
    console.log(`   ✨ Successfully merged ${level.toUpperCase()}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error writing merged file:`, error);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const targetLevel = args[0]?.toLowerCase();
  const skipBackup = args.includes('--no-backup');

  console.log('🔧 Flashcard Merger Tool\n');
  console.log('='.repeat(50));

  if (!targetLevel) {
    console.log('\n❌ Please specify a level or "all"');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/merge-flashcards.ts [level] [--no-backup]');
    console.log('  npx tsx scripts/merge-flashcards.ts all');
    console.log('\nExamples:');
    console.log('  npx tsx scripts/merge-flashcards.ts a1');
    console.log('  npx tsx scripts/merge-flashcards.ts b1 --no-backup');
    console.log('  npx tsx scripts/merge-flashcards.ts all');
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

  // Create output directory if needed
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Process each level
  let successCount = 0;
  for (const level of levelsToProcess) {
    if (mergeLevel(level, !skipBackup)) {
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(
    `\n✨ Complete! Successfully merged ${successCount}/${levelsToProcess.length} levels`
  );
  console.log(`\n📁 Output directory: ${OUTPUT_DIR}\n`);
}

// Run the script
main();
