/**
 * Dictionary Migration Script
 * Imports German-English dictionary from JSON files into SQLite
 *
 * Usage: npx tsx scripts/migrate-dictionary.ts
 */

import { db, initDictionary, getDictionaryCount } from '../lib/db/dictionary';
import fs from 'fs';
import path from 'path';

const GERMAN_ENGLISH_PATH = 'C:\\Users\\User\\Documents\\German-English-JSON-Dictionary\\german_english.json';
const ENGLISH_GERMAN_PATH = 'C:\\Users\\User\\Documents\\German-English-JSON-Dictionary\\english_german.json';

async function migrateDictionary() {
  console.log('[Dictionary Migration] Starting...\n');

  // Check if already populated
  const existingCount = getDictionaryCount();
  if (existingCount > 0) {
    console.log(`[Dictionary Migration] Database already contains ${existingCount} entries.`);
    console.log('[Dictionary Migration] Skipping import. Delete data/dictionary.db to reimport.\n');
    return;
  }

  // Read German-English JSON
  console.log('[Dictionary Migration] Reading german_english.json...');
  const germanEnglishData = JSON.parse(fs.readFileSync(GERMAN_ENGLISH_PATH, 'utf-8'));
  const entries = Object.entries(germanEnglishData) as [string, string][];

  console.log(`[Dictionary Migration] Found ${entries.length} entries\n`);

  // Prepare insert statement
  const insert = db.prepare(`
    INSERT OR IGNORE INTO dictionary (german, english)
    VALUES (?, ?)
  `);

  // Begin transaction for performance
  const insertMany = db.transaction((entries: [string, string][]) => {
    let inserted = 0;
    for (const [german, english] of entries) {
      const result = insert.run(german, english);
      if (result.changes > 0) inserted++;
    }
    return inserted;
  });

  // Execute migration
  console.log('[Dictionary Migration] Importing entries...');
  const startTime = Date.now();
  const inserted = insertMany(entries);
  const endTime = Date.now();

  console.log(`\n[Dictionary Migration] ✅ Complete!`);
  console.log(`  • Inserted: ${inserted} entries`);
  console.log(`  • Duplicates skipped: ${entries.length - inserted}`);
  console.log(`  • Time taken: ${endTime - startTime}ms`);
  console.log(`  • Total in database: ${getDictionaryCount()}\n`);

  db.close();
}

// Run migration
migrateDictionary().catch(error => {
  console.error('[Dictionary Migration] Error:', error);
  process.exit(1);
});
