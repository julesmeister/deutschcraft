#!/usr/bin/env tsx

/**
 * Find and Fix Duplicate Flashcard IDs
 *
 * This script scans all level files for duplicate IDs and fixes them
 * by generating unique IDs for duplicates.
 */

import fs from 'fs';
import path from 'path';

const VOCABULARY_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'levels');

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  tags?: string[];
  _meta?: any;
}

interface LevelData {
  level: string;
  totalCards: number;
  flashcards: Flashcard[];
}

/**
 * Generate unique ID for flashcard
 */
function generateUniqueId(card: Flashcard, index: number): string {
  const level = card.level?.toLowerCase() || 'a1';
  const category = card.category?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'misc';
  const german = card.german?.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20) || 'word';
  return `${level}-${category}-${german}-${index}`;
}

/**
 * Find duplicate IDs in a level file
 */
function findDuplicates(data: LevelData): Map<string, number[]> {
  const idMap = new Map<string, number[]>();

  data.flashcards.forEach((card, index) => {
    if (!idMap.has(card.id)) {
      idMap.set(card.id, []);
    }
    idMap.get(card.id)!.push(index);
  });

  // Filter to only duplicates
  const duplicates = new Map<string, number[]>();
  idMap.forEach((indices, id) => {
    if (indices.length > 1) {
      duplicates.set(id, indices);
    }
  });

  return duplicates;
}

/**
 * Fix duplicate IDs
 */
function fixDuplicates(data: LevelData): { fixed: number; data: LevelData } {
  const duplicates = findDuplicates(data);

  if (duplicates.size === 0) {
    return { fixed: 0, data };
  }

  let fixedCount = 0;
  const usedIds = new Set(data.flashcards.map(c => c.id));

  duplicates.forEach((indices, duplicateId) => {
    console.log(`   Found duplicate ID: ${duplicateId}`);
    indices.forEach((idx, i) => {
      const card = data.flashcards[idx];
      console.log(`     [${idx}] ${card.german} - ${card.english}`);
    });

    // Keep first occurrence, fix others
    for (let i = 1; i < indices.length; i++) {
      const idx = indices[i];
      const card = data.flashcards[idx];

      let newId = generateUniqueId(card, idx);
      let counter = 1;

      // Ensure uniqueness
      while (usedIds.has(newId)) {
        newId = generateUniqueId(card, idx + counter * 1000);
        counter++;
      }

      data.flashcards[idx].id = newId;
      usedIds.add(newId);
      fixedCount++;

      console.log(`     → Fixed to: ${newId}`);
    }
  });

  return { fixed: fixedCount, data };
}

/**
 * Process a level file
 */
function processLevel(level: string): number {
  const filePath = path.join(VOCABULARY_DIR, `${level}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  ${level}.json not found`);
    return 0;
  }

  // Load data
  const content = fs.readFileSync(filePath, 'utf-8');
  const data: LevelData = JSON.parse(content);

  console.log(`\n📄 ${level.toUpperCase()}.json`);
  console.log(`   Total cards: ${data.totalCards}`);

  // Find and fix duplicates
  const { fixed, data: updatedData } = fixDuplicates(data);

  if (fixed === 0) {
    console.log('   ✅ No duplicates found');
    return 0;
  }

  // Create backup
  const backupPath = `${filePath}.backup-${Date.now()}`;
  fs.writeFileSync(backupPath, content, 'utf-8');
  console.log(`   💾 Backup created: ${path.basename(backupPath)}`);

  // Write updated data
  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');
  console.log(`   ✅ Fixed ${fixed} duplicate IDs`);

  return fixed;
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(70));
  console.log('🔍 FINDING AND FIXING DUPLICATE IDS');
  console.log('='.repeat(70));

  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  let totalFixed = 0;

  for (const level of levels) {
    totalFixed += processLevel(level);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ SUMMARY');
  console.log('='.repeat(70));
  console.log(`\nTotal duplicate IDs fixed: ${totalFixed}`);

  if (totalFixed > 0) {
    console.log('\nNext steps:');
    console.log('1. Refresh the browser to see the fix');
    console.log('2. Run: npm run flashcards:split all');
    console.log('   (Update split files with new IDs)');
  }

  console.log('='.repeat(70) + '\n');
}

main();
