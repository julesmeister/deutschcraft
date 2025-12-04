/**
 * Populate Dictionary Database from Vocabulary Files
 *
 * This script:
 * 1. Scans all vocabulary JSON files in lib/data/vocabulary/split/
 * 2. Extracts German-English word pairs
 * 3. Checks if they exist in the dictionary database
 * 4. Adds missing entries to the database
 */

import fs from 'fs';
import path from 'path';
import { db, initDictionary, getDictionaryCount } from '../lib/db/dictionary';

interface Flashcard {
  german: string;
  english: string;
  category: string;
  level: string;
}

interface VocabularyFile {
  level: string;
  category: string;
  flashcards: Flashcard[];
}

const VOCAB_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'split');

/**
 * Recursively find all JSON files in vocabulary directory
 */
function findVocabularyFiles(dir: string): string[] {
  const files: string[] = [];

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findVocabularyFiles(fullPath));
    } else if (item.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check if a word pair exists in the database
 */
function wordExists(german: string, english: string): boolean {
  const stmt = db.prepare(
    'SELECT COUNT(*) as count FROM dictionary WHERE german = ? AND english = ?'
  );
  const result = stmt.get(german, english) as { count: number };
  return result.count > 0;
}

/**
 * Add a word pair to the database
 */
function addWord(german: string, english: string): void {
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO dictionary (german, english) VALUES (?, ?)'
  );
  stmt.run(german, english);
}

/**
 * Process a single vocabulary file
 */
function processVocabularyFile(filePath: string): { added: number; skipped: number } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data: VocabularyFile = JSON.parse(content);

  let added = 0;
  let skipped = 0;

  // Skip index files (they don't contain flashcards, just metadata)
  if (!data.flashcards || !Array.isArray(data.flashcards)) {
    return { added: 0, skipped: 0 };
  }

  for (const flashcard of data.flashcards) {
    const { german, english } = flashcard;

    if (!german || !english) {
      console.warn(`⚠️  Skipping invalid entry in ${filePath}: german="${german}", english="${english}"`);
      skipped++;
      continue;
    }

    if (wordExists(german, english)) {
      skipped++;
    } else {
      addWord(german, english);
      added++;
      console.log(`✅ Added: ${german} → ${english}`);
    }
  }

  return { added, skipped };
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Dictionary Population\n');

  // Initialize database
  initDictionary();
  console.log(`📊 Current dictionary size: ${getDictionaryCount()} entries\n`);

  // Find all vocabulary files
  const vocabFiles = findVocabularyFiles(VOCAB_DIR);
  console.log(`📂 Found ${vocabFiles.length} vocabulary files\n`);

  let totalAdded = 0;
  let totalSkipped = 0;

  // Process each file
  for (const filePath of vocabFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`\n📖 Processing: ${relativePath}`);

    const { added, skipped } = processVocabularyFile(filePath);
    totalAdded += added;
    totalSkipped += skipped;

    console.log(`   Added: ${added}, Skipped: ${skipped}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Total entries processed: ${totalAdded + totalSkipped}`);
  console.log(`   ✅ New entries added: ${totalAdded}`);
  console.log(`   ⏭️  Entries skipped (already exist): ${totalSkipped}`);
  console.log(`   📚 Final dictionary size: ${getDictionaryCount()} entries`);
  console.log('='.repeat(60));
  console.log('\n✨ Dictionary population complete!');
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
