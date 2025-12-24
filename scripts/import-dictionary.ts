/**
 * Import German Dictionary from JSONL
 * Efficiently imports missing words from JSONL file into SQLite database
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import Database from 'better-sqlite3';

// Paths
const JSONL_PATH = 'C:\\Users\\User\\Documents\\Testmanship\\app\\src\\main\\assets\\german_dictionary.jsonl';
const DB_PATH = path.join(process.cwd(), 'data', 'dictionary.db');

interface DictionaryEntry {
  word: string;
  definition?: string;
  translations?: string[];
  [key: string]: any;
}

async function importDictionary() {
  console.log('📥 Dictionary Import Tool\n');
  console.log('='.repeat(60));

  // Check if files exist
  if (!fs.existsSync(JSONL_PATH)) {
    console.error(`❌ JSONL file not found: ${JSONL_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Database file not found: ${DB_PATH}`);
    process.exit(1);
  }

  console.log(`\n📂 Importing from: ${JSONL_PATH}`);
  console.log(`💾 Importing to: ${DB_PATH}\n`);

  // Open database connection
  const db = new Database(DB_PATH);

  // Create index for faster lookups
  console.log('🔍 Creating index...');
  db.exec('CREATE INDEX IF NOT EXISTS idx_german ON dictionary(german)');

  // Prepare statements
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM dictionary WHERE german = ? LIMIT 1');
  const insertStmt = db.prepare('INSERT OR IGNORE INTO dictionary (german, english) VALUES (?, ?)');

  let stats = {
    total: 0,
    skipped: 0,
    imported: 0,
    errors: 0,
  };

  // Batch processing
  const BATCH_SIZE = 1000;
  let batch: Array<{ german: string; english: string }> = [];

  const insertBatch = () => {
    if (batch.length === 0) return;

    const transaction = db.transaction(() => {
      for (const entry of batch) {
        try {
          insertStmt.run(entry.german, entry.english);
          stats.imported++;
        } catch (error) {
          stats.errors++;
        }
      }
    });

    transaction();
    batch = [];
  };

  // Stream JSONL file
  console.log('📖 Reading JSONL file...\n');
  const fileStream = fs.createReadStream(JSONL_PATH, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    stats.total++;

    // Progress
    if (stats.total % 10000 === 0) {
      process.stdout.write(`\r   Processed: ${stats.total.toLocaleString()} | Imported: ${stats.imported.toLocaleString()} | Skipped: ${stats.skipped.toLocaleString()}`);
    }

    if (!line.trim()) continue;

    try {
      const entry: DictionaryEntry = JSON.parse(line);

      if (!entry.word) {
        stats.errors++;
        continue;
      }

      // Extract English translation from Wiktionary format
      let english = '';

      if (entry.senses && entry.senses.length > 0) {
        const firstSense = entry.senses[0];
        if (firstSense.glosses && firstSense.glosses.length > 0) {
          // Join multiple glosses with semicolons if present
          english = Array.isArray(firstSense.glosses)
            ? firstSense.glosses.join('; ')
            : firstSense.glosses;
        }
      }

      if (!english) {
        // Skip if no translation available
        stats.skipped++;
        continue;
      }

      // Clean up
      const german = entry.word.trim();
      english = english.trim();

      if (!german || !english) {
        stats.skipped++;
        continue;
      }

      // Check if already exists
      const exists = checkStmt.get(german) as { count: number };
      if (exists.count > 0) {
        stats.skipped++;
        continue;
      }

      // Add to batch
      batch.push({ german, english });

      // Insert batch if full
      if (batch.length >= BATCH_SIZE) {
        insertBatch();
      }

    } catch (error) {
      stats.errors++;
    }
  }

  // Insert remaining batch
  insertBatch();

  // Close database
  db.close();

  // Results
  console.log('\n\n' + '='.repeat(60));
  console.log('\n📊 IMPORT RESULTS\n');
  console.log(`Total entries processed:     ${stats.total.toLocaleString()}`);
  console.log(`✅ Imported:                  ${stats.imported.toLocaleString()}`);
  console.log(`⏭️  Skipped (existing/invalid): ${stats.skipped.toLocaleString()}`);
  console.log(`❌ Errors:                    ${stats.errors.toLocaleString()}`);
  console.log('='.repeat(60));

  // Verify final count
  const dbFinal = new Database(DB_PATH, { readonly: true });
  const finalCount = dbFinal.prepare('SELECT COUNT(DISTINCT german) as count FROM dictionary').get() as { count: number };
  dbFinal.close();

  console.log(`\n💾 Database now contains: ${finalCount.count.toLocaleString()} unique German words`);
  console.log('\n✅ Import complete!\n');
}

// Run the import
importDictionary().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
