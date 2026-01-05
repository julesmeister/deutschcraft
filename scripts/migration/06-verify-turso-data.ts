/**
 * Step 6: Verify Turso Database Contents
 * Checks what data exists in Turso and compares with JSON flashcards
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const MAPPING_FILE = path.join(process.cwd(), 'scripts/migration/content-based-mapping.json');

async function verifyTursoData() {
  console.log('🔍 Verifying Turso Database Contents\n');
  console.log('='.repeat(50));

  // Connect to Turso
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.error('❌ Missing Turso credentials');
    process.exit(1);
  }

  const db = createClient({ url: dbUrl, authToken });

  try {
    // Load mapping
    const mappingContent = fs.readFileSync(MAPPING_FILE, 'utf-8');
    const mappingData = JSON.parse(mappingContent);
    const mapping = new Map(Object.entries(mappingData.mapping));

    console.log(`\n📊 JSON Flashcards: ${mapping.size} flashcards\n`);

    // Check vocabulary table
    console.log('📖 Checking vocabulary table...');
    const vocabResult = await db.execute('SELECT COUNT(*) as count FROM vocabulary');
    const vocabCount = vocabResult.rows[0]?.count || 0;
    console.log(`   Total records: ${vocabCount}`);

    if (vocabCount > 0) {
      // Sample IDs
      const sampleResult = await db.execute('SELECT word_id FROM vocabulary LIMIT 10');
      console.log(`   Sample IDs:`);
      sampleResult.rows.forEach(row => {
        const wordId = row.word_id as string;
        const hasMapping = mapping.has(wordId);
        console.log(`      ${wordId} ${hasMapping ? '✅' : '❌ (not in JSON)'}`);
      });

      // Count how many have mappings
      const allVocabResult = await db.execute('SELECT word_id FROM vocabulary');
      let matchedCount = 0;
      let unmatchedCount = 0;

      for (const row of allVocabResult.rows) {
        const wordId = row.word_id as string;
        if (mapping.has(wordId)) {
          matchedCount++;
        } else {
          unmatchedCount++;
        }
      }

      console.log(`\n   📊 Mapping Coverage:`);
      console.log(`      Matched: ${matchedCount} (${((matchedCount / Number(vocabCount)) * 100).toFixed(1)}%)`);
      console.log(`      Unmatched: ${unmatchedCount} (${((unmatchedCount / Number(vocabCount)) * 100).toFixed(1)}%)`);
    }

    // Check flashcard_progress table
    console.log('\n📈 Checking flashcard_progress table...');
    const progressResult = await db.execute('SELECT COUNT(*) as count FROM flashcard_progress');
    const progressCount = progressResult.rows[0]?.count || 0;
    console.log(`   Total records: ${progressCount}`);

    if (progressCount > 0) {
      const sampleProgressResult = await db.execute('SELECT flashcard_id, user_id FROM flashcard_progress LIMIT 5');
      console.log(`   Sample records:`);
      sampleProgressResult.rows.forEach(row => {
        const flashcardId = row.flashcard_id as string;
        const userId = row.user_id as string;
        const hasMapping = mapping.has(flashcardId);
        console.log(`      User: ${userId.substring(0, 20)}... | ID: ${flashcardId} ${hasMapping ? '✅' : '❌'}`);
      });
    }

    // Check flashcards table (if exists)
    console.log('\n📇 Checking flashcards table...');
    try {
      const flashcardsResult = await db.execute('SELECT COUNT(*) as count FROM flashcards');
      const flashcardsCount = flashcardsResult.rows[0]?.count || 0;
      console.log(`   Total records: ${flashcardsCount}`);

      if (flashcardsCount > 0) {
        const sampleFlashcardsResult = await db.execute('SELECT id, german, english FROM flashcards LIMIT 5');
        console.log(`   Sample flashcards:`);
        sampleFlashcardsResult.rows.forEach(row => {
          const id = row.id as string;
          const german = row.german as string;
          const english = row.english as string;
          const hasMapping = mapping.has(id);
          console.log(`      ${id} | ${german} = ${english} ${hasMapping ? '✅' : '❌'}`);
        });
      }
    } catch (error) {
      console.log('   ℹ️  flashcards table does not exist');
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

verifyTursoData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
