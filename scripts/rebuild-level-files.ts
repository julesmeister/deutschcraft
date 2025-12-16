#!/usr/bin/env tsx

/**
 * Rebuild Level Files
 *
 * Reads all category files from split/ directories and rebuilds the main level files
 */

import fs from 'fs';
import path from 'path';

const SPLIT_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'split');
const LEVELS_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'levels');

const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

for (const level of levels) {
  const levelDir = path.join(SPLIT_DIR, level);
  const indexPath = path.join(levelDir, '_index.json');

  if (!fs.existsSync(indexPath)) {
    console.log(`⚠️  No index found for ${level.toUpperCase()}, skipping...`);
    continue;
  }

  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const allFlashcards: any[] = [];

  console.log(`\n📚 Building ${level.toUpperCase()}...`);

  for (const category of indexData.categories) {
    const categoryPath = path.join(levelDir, category.file);

    if (!fs.existsSync(categoryPath)) {
      console.log(`  ⚠️  Missing: ${category.file}`);
      continue;
    }

    const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf-8'));
    allFlashcards.push(...categoryData.flashcards);
    console.log(`  ✓ ${category.name} (${categoryData.flashcards.length} cards)`);
  }

  const outputData = {
    level: level.toUpperCase(),
    totalCards: allFlashcards.length,
    flashcards: allFlashcards
  };

  const outputPath = path.join(LEVELS_DIR, `${level}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

  console.log(`  ✅ Written ${allFlashcards.length} cards to ${level}.json`);
}

console.log('\n✨ Done rebuilding level files!\n');
