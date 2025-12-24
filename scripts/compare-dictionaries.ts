/**
 * Compare German Dictionary JSONL with Database
 * Efficiently streams large JSONL file and checks against SQLite database
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
  partOfSpeech?: string;
  gender?: string;
  [key: string]: any;
}

interface Stats {
  totalInJsonl: number;
  totalInDb: number;
  missingInDb: number;
  foundInDb: number;
  missingWords: string[];
}

async function compareDictionaries() {
  console.log('📚 Dictionary Comparison Tool\n');
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

  console.log(`\n📂 Reading from: ${JSONL_PATH}`);
  console.log(`💾 Comparing with: ${DB_PATH}\n`);

  // Open database connection
  const db = new Database(DB_PATH, { readonly: true });

  // Prepare statement for efficient lookups
  const lookupStmt = db.prepare(`
    SELECT german FROM dictionary WHERE german = ? LIMIT 1
  `);

  // Get total count in database (count unique German words)
  const dbCount = db.prepare('SELECT COUNT(DISTINCT german) as count FROM dictionary').get() as { count: number };
  console.log(`📊 Database contains: ${dbCount.count.toLocaleString()} words\n`);

  const stats: Stats = {
    totalInJsonl: 0,
    totalInDb: dbCount.count,
    missingInDb: 0,
    foundInDb: 0,
    missingWords: [],
  };

  // Stream JSONL file line by line
  const fileStream = fs.createReadStream(JSONL_PATH, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  console.log('🔍 Analyzing JSONL file...\n');

  let lineNumber = 0;
  const sampleMissing: string[] = [];
  const MAX_SAMPLE = 20; // Only show first 20 missing words

  for await (const line of rl) {
    lineNumber++;

    // Progress indicator every 1000 lines
    if (lineNumber % 1000 === 0) {
      process.stdout.write(`\r   Processed: ${lineNumber.toLocaleString()} entries...`);
    }

    if (!line.trim()) continue;

    try {
      const entry: DictionaryEntry = JSON.parse(line);
      stats.totalInJsonl++;

      if (!entry.word) continue;

      // Check if word exists in database
      const result = lookupStmt.get(entry.word);

      if (result) {
        stats.foundInDb++;
      } else {
        stats.missingInDb++;

        // Store sample of missing words
        if (sampleMissing.length < MAX_SAMPLE) {
          const wordInfo = entry.gender
            ? `${entry.gender} ${entry.word}`
            : entry.word;
          sampleMissing.push(wordInfo);
        }

        // Store all missing words (for export)
        stats.missingWords.push(entry.word);
      }

    } catch (error) {
      console.error(`\n⚠️  Error parsing line ${lineNumber}: ${error}`);
    }
  }

  // Close database
  db.close();

  // Print results
  console.log('\n\n' + '='.repeat(60));
  console.log('\n📊 COMPARISON RESULTS\n');
  console.log(`Total entries in JSONL:     ${stats.totalInJsonl.toLocaleString()}`);
  console.log(`Total words in Database:    ${stats.totalInDb.toLocaleString()}`);
  console.log('\n' + '-'.repeat(60));
  console.log(`✅ Found in DB:              ${stats.foundInDb.toLocaleString()} (${Math.round(stats.foundInDb / stats.totalInJsonl * 100)}%)`);
  console.log(`❌ Missing from DB:          ${stats.missingInDb.toLocaleString()} (${Math.round(stats.missingInDb / stats.totalInJsonl * 100)}%)`);
  console.log('='.repeat(60));

  // Show sample of missing words
  if (sampleMissing.length > 0) {
    console.log(`\n📝 Sample of missing words (first ${sampleMissing.length}):\n`);
    sampleMissing.forEach((word, i) => {
      console.log(`   ${i + 1}. ${word}`);
    });

    if (stats.missingInDb > MAX_SAMPLE) {
      console.log(`\n   ... and ${stats.missingInDb - MAX_SAMPLE} more`);
    }
  }

  // Export missing words to file
  if (stats.missingWords.length > 0) {
    const outputPath = path.join(process.cwd(), 'data', 'missing-words.txt');
    fs.writeFileSync(outputPath, stats.missingWords.join('\n'), 'utf-8');
    console.log(`\n💾 Full list exported to: ${outputPath}`);
  }

  console.log('\n✅ Analysis complete!\n');

  // Recommendations
  if (stats.missingInDb > 100) {
    console.log('💡 RECOMMENDATION:');
    console.log('   Your database is missing significant words from the JSONL file.');
    console.log('   Consider running the import script to add them.\n');
  }
}

// Run the comparison
compareDictionaries().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
