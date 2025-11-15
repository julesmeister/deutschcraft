#!/usr/bin/env tsx

/**
 * Merge Orphaned Files into Split Structure
 *
 * This script takes orphaned files (those without split counterparts)
 * and creates appropriate split category files for them.
 *
 * Usage:
 *   npx tsx scripts/merge-orphaned-files.ts [--execute]
 */

import fs from 'fs';
import path from 'path';

const EXECUTE = process.argv.includes('--execute');
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

interface OrphanedFile {
  filename: string;
  cards: Flashcard[];
  targetLevel: string;
  targetCategory: string;
  targetFile: string;
}

/**
 * Mapping of orphaned files to their split destinations
 */
const ORPHAN_MAPPINGS: Record<string, { level: string; category: string }> = {
  'verbs.json': { level: 'b1', category: 'Intermediate Verbs' },
  'basic-verbs.json': { level: 'a1', category: 'Basic Verbs' },
  'liste-der-verben-mit-prpositionen.json': { level: 'b1', category: 'Verbs With Prepositions' },
  'gempowerment.json': { level: 'b1', category: 'Gempowerment' },
  'common-verbs.json': { level: 'a2', category: 'Common Verbs' },
  'passiv.json': { level: 'b1', category: 'Passive Voice' },
};

/**
 * Normalize category name to filename
 */
function categoryToFilename(category: string): string {
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Load flashcards from orphaned file
 */
function loadOrphanedFile(filename: string): Flashcard[] {
  const filePath = path.join(REMNOTE_DIR, filename);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (Array.isArray(data)) {
      return data;
    } else if (data.flashcards) {
      return data.flashcards;
    }
    return [];
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
}

/**
 * Determine target split file for orphaned data
 */
function determineTarget(filename: string, cards: Flashcard[]): OrphanedFile {
  const mapping = ORPHAN_MAPPINGS[filename];

  if (!mapping) {
    // Fallback: try to infer from first card
    const firstCard = cards[0];
    const level = firstCard?.level?.toLowerCase() || 'b1';
    const category = firstCard?.category || 'Miscellaneous';

    return {
      filename,
      cards,
      targetLevel: level,
      targetCategory: category,
      targetFile: path.join(SPLIT_DIR, level, `${categoryToFilename(category)}.json`),
    };
  }

  return {
    filename,
    cards,
    targetLevel: mapping.level,
    targetCategory: mapping.category,
    targetFile: path.join(SPLIT_DIR, mapping.level, `${categoryToFilename(mapping.category)}.json`),
  };
}

/**
 * Check if target file already exists and load its data
 */
function loadExistingTargetFile(targetFile: string): Flashcard[] {
  if (!fs.existsSync(targetFile)) {
    return [];
  }

  try {
    const content = fs.readFileSync(targetFile, 'utf-8');
    const data = JSON.parse(content);
    return data.flashcards || [];
  } catch (error) {
    return [];
  }
}

/**
 * Create unique key for flashcard
 */
function createCardKey(card: Flashcard): string {
  return `${card.german?.toLowerCase()?.trim()}|${card.english?.toLowerCase()?.trim()}`;
}

/**
 * Merge cards, avoiding duplicates
 */
function mergeCards(existing: Flashcard[], newCards: Flashcard[]): Flashcard[] {
  const existingKeys = new Set(existing.map(createCardKey));
  const uniqueNew = newCards.filter(card => !existingKeys.has(createCardKey(card)));

  return [...existing, ...uniqueNew];
}

/**
 * Create or update split file with merged data
 */
function createSplitFile(orphan: OrphanedFile, existingCards: Flashcard[]): void {
  const mergedCards = mergeCards(existingCards, orphan.cards);

  const splitFileData = {
    level: orphan.targetLevel.toUpperCase(),
    category: orphan.targetCategory,
    totalCards: mergedCards.length,
    flashcards: mergedCards,
  };

  // Ensure directory exists
  const targetDir = path.dirname(orphan.targetFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(
    orphan.targetFile,
    JSON.stringify(splitFileData, null, 2),
    'utf-8'
  );
}

/**
 * Update or create index file for the level
 */
function updateIndexFile(level: string): void {
  const indexPath = path.join(SPLIT_DIR, level, '_index.json');
  const levelDir = path.join(SPLIT_DIR, level);

  if (!fs.existsSync(levelDir)) {
    return;
  }

  // Get all category files
  const files = fs.readdirSync(levelDir).filter(f => f.endsWith('.json') && f !== '_index.json');

  const categories = files.map(file => {
    const filePath = path.join(levelDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    return {
      name: content.category,
      count: content.totalCards,
      file: file,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const totalCards = categories.reduce((sum, cat) => sum + cat.count, 0);

  const indexData = {
    level: level.toUpperCase(),
    totalCards,
    totalCategories: categories.length,
    categories,
  };

  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
}

/**
 * Validate JSON syntax before proceeding
 */
function validateMerge(orphans: OrphanedFile[]): boolean {
  console.log('\n🔍 Validating merge plan...\n');

  let hasErrors = false;

  for (const orphan of orphans) {
    // Check if cards are valid
    if (orphan.cards.length === 0) {
      console.error(`❌ ${orphan.filename} has no cards!`);
      hasErrors = true;
      continue;
    }

    // Check if all cards have required fields
    for (const card of orphan.cards) {
      if (!card.german || !card.english) {
        console.error(`❌ ${orphan.filename} has card missing german or english:`, card);
        hasErrors = true;
      }
    }

    // Check target is valid
    if (!orphan.targetLevel || !orphan.targetCategory) {
      console.error(`❌ ${orphan.filename} has invalid target mapping`);
      hasErrors = true;
    }

    console.log(`✅ ${orphan.filename} - ${orphan.cards.length} cards → ${path.relative(REMNOTE_DIR, orphan.targetFile)}`);
  }

  if (hasErrors) {
    console.error('\n❌ Validation failed! Please fix errors above.');
    return false;
  }

  console.log('\n✅ Validation passed!\n');
  return true;
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(70));
  console.log('🔄 MERGE ORPHANED FILES INTO SPLIT STRUCTURE');
  console.log('='.repeat(70));

  if (!EXECUTE) {
    console.log('\n⚠️  DRY RUN MODE - No files will be modified');
    console.log('   Run with --execute to apply changes\n');
  }

  // Find orphaned files
  const orphanedFilenames = Object.keys(ORPHAN_MAPPINGS);

  console.log(`\n📋 Processing ${orphanedFilenames.length} orphaned files...\n`);

  // Load and prepare orphaned files
  const orphans: OrphanedFile[] = [];

  for (const filename of orphanedFilenames) {
    const cards = loadOrphanedFile(filename);

    if (cards.length === 0) {
      console.warn(`⚠️  ${filename} - No cards found, skipping`);
      continue;
    }

    const orphan = determineTarget(filename, cards);
    orphans.push(orphan);

    console.log(`📄 ${filename}`);
    console.log(`   Cards: ${cards.length}`);
    console.log(`   Target: ${orphan.targetLevel.toUpperCase()} / ${orphan.targetCategory}`);
    console.log(`   File: ${path.relative(REMNOTE_DIR, orphan.targetFile)}`);
    console.log();
  }

  // Validate before proceeding
  if (!validateMerge(orphans)) {
    process.exit(1);
  }

  if (!EXECUTE) {
    console.log('='.repeat(70));
    console.log('💡 SUMMARY (DRY RUN)');
    console.log('='.repeat(70));
    console.log(`\nWould process ${orphans.length} files:`);
    orphans.forEach(o => {
      console.log(`  - ${o.filename}: ${o.cards.length} cards → ${path.basename(o.targetFile)}`);
    });
    console.log('\nRun with --execute to apply these changes.');
    console.log('='.repeat(70) + '\n');
    return;
  }

  // Execute merge
  console.log('='.repeat(70));
  console.log('⚙️  EXECUTING MERGE');
  console.log('='.repeat(70) + '\n');

  const affectedLevels = new Set<string>();
  let totalCardsAdded = 0;
  let filesCreated = 0;
  let filesUpdated = 0;

  for (const orphan of orphans) {
    const existingCards = loadExistingTargetFile(orphan.targetFile);
    const isNewFile = existingCards.length === 0;
    const beforeCount = existingCards.length;

    // Merge and create file
    createSplitFile(orphan, existingCards);

    const afterCount = orphan.cards.length + beforeCount;
    const cardsAdded = afterCount - beforeCount;

    affectedLevels.add(orphan.targetLevel);
    totalCardsAdded += cardsAdded;

    if (isNewFile) {
      filesCreated++;
      console.log(`✅ Created ${path.relative(REMNOTE_DIR, orphan.targetFile)}`);
    } else {
      filesUpdated++;
      console.log(`✅ Updated ${path.relative(REMNOTE_DIR, orphan.targetFile)}`);
    }
    console.log(`   Added ${cardsAdded} unique cards (${beforeCount} → ${afterCount})\n`);
  }

  // Update index files
  console.log('📑 Updating index files...\n');
  for (const level of affectedLevels) {
    updateIndexFile(level);
    console.log(`✅ Updated ${level}/_index.json`);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('✨ MERGE COMPLETE');
  console.log('='.repeat(70));
  console.log(`\nFiles created:     ${filesCreated}`);
  console.log(`Files updated:     ${filesUpdated}`);
  console.log(`Total cards added: ${totalCardsAdded}`);
  console.log(`Levels affected:   ${Array.from(affectedLevels).join(', ')}`);
  console.log('\nNext steps:');
  console.log('1. Run: npm run vocab:compare');
  console.log('   (Verify orphaned files now show as identical)');
  console.log('2. Run: npm run flashcards:merge all');
  console.log('   (Update main level files)');
  console.log('3. Delete orphaned files manually or run cleanup script');
  console.log('='.repeat(70) + '\n');
}

main();
