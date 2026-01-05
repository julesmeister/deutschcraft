/**
 * Step 7: Migrate Turso Database by Content Matching
 * Reads vocabulary from database, generates new IDs based on content
 * Updates all tables with new semantic IDs matching JSON files
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { generateFlashcardId } from '../../lib/utils/flashcardIdGenerator';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

const BACKUP_DIR = path.join(process.cwd(), 'scripts/migration/backups');
const UNMAPPED_FILE = path.join(process.cwd(), 'scripts/migration/turso-unmapped.json');

interface VocabularyRecord {
  word_id: string;
  german_word: string;
  english_translation: string;
  part_of_speech?: string;
  level: string;
  [key: string]: any;
}

interface UnmappedRecord extends VocabularyRecord {
  reason: string;
}

async function migrateTursoByContent() {
  console.log('🔄 Migrating Turso Database by Content Matching\n');
  console.log('='.repeat(50));

  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = Date.now();

  // Connect to Turso
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.error('❌ Missing Turso credentials');
    process.exit(1);
  }

  const db = createClient({ url: dbUrl, authToken });

  try {
    // Step 1: Read all vocabulary from database
    console.log('\n📖 Step 1: Reading vocabulary from database...');
    const vocabResult = await db.execute('SELECT * FROM vocabulary');
    console.log(`✅ Found ${vocabResult.rows.length} vocabulary records`);

    // Backup vocabulary
    const vocabBackup = path.join(BACKUP_DIR, `vocabulary-content-backup-${timestamp}.json`);
    fs.writeFileSync(vocabBackup, JSON.stringify(vocabResult.rows, null, 2));
    console.log(`💾 Backup saved: ${path.basename(vocabBackup)}`);

    // Step 2: Load JSON flashcards for matching
    console.log('\n📚 Step 2: Loading JSON flashcards for matching...');

    const LEVELS_DIR = path.join(process.cwd(), 'lib/data/vocabulary/levels');
    const jsonFlashcards = new Map<string, any>(); // content key → flashcard

    for (const level of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
      const levelFile = path.join(LEVELS_DIR, `${level}.json`);
      if (!fs.existsSync(levelFile)) continue;

      const data = JSON.parse(fs.readFileSync(levelFile, 'utf-8'));
      for (const flashcard of data.flashcards || []) {
        // Create content key for matching
        const key = `${flashcard.german?.toLowerCase()}|||${flashcard.english?.toLowerCase()}|||${flashcard.level?.toLowerCase()}`;
        jsonFlashcards.set(key, flashcard);
      }
    }

    console.log(`✅ Loaded ${jsonFlashcards.size} JSON flashcards for matching`);

    // Step 3: Generate new IDs based on content
    console.log('\n🔨 Step 3: Generating new IDs from content...');

    const idMapping = new Map<string, string>(); // old ID → new ID
    const unmappedRecords: UnmappedRecord[] = [];

    for (const row of vocabResult.rows) {
      const record = row as unknown as VocabularyRecord;
      const oldId = record.word_id;
      const german = record.german_word;
      const english = record.english_translation;
      const level = record.level;

      // Validate we have required fields
      if (!german || !english) {
        unmappedRecords.push({
          ...record,
          reason: `Missing required fields (german: ${!!german}, english: ${!!english})`
        });
        continue;
      }

      if (!level) {
        unmappedRecords.push({
          ...record,
          reason: 'Missing level field'
        });
        continue;
      }

      // Try to find matching flashcard in JSON by content
      const contentKey = `${german.toLowerCase()}|||${english.toLowerCase()}|||${level.toLowerCase()}`;
      const jsonFlashcard = jsonFlashcards.get(contentKey);

      if (!jsonFlashcard) {
        unmappedRecords.push({
          ...record,
          reason: `No matching flashcard in JSON files (${german} = ${english}, ${level})`
        });
        continue;
      }

      // Use the ID from JSON
      const newId = jsonFlashcard.id;
      idMapping.set(oldId, newId);
    }

    console.log(`✅ Generated ${idMapping.size} new IDs`);
    console.log(`⚠️  Unmapped: ${unmappedRecords.length} records`);

    if (unmappedRecords.length > 0) {
      fs.writeFileSync(UNMAPPED_FILE, JSON.stringify({
        total: unmappedRecords.length,
        records: unmappedRecords
      }, null, 2));
      console.log(`📄 Unmapped records saved to: ${path.basename(UNMAPPED_FILE)}`);
    }

    // Step 4: Update vocabulary table
    console.log('\n📊 Step 4: Updating vocabulary table...');

    let vocabUpdated = 0;
    let vocabErrors = 0;

    for (const [oldId, newId] of idMapping) {
      try {
        await db.execute({
          sql: 'UPDATE vocabulary SET word_id = ? WHERE word_id = ?',
          args: [newId, oldId]
        });
        vocabUpdated++;
      } catch (error) {
        console.error(`   ❌ Error updating ${oldId}:`, error);
        vocabErrors++;
      }
    }

    console.log(`✅ Updated ${vocabUpdated} vocabulary records`);
    if (vocabErrors > 0) {
      console.error(`⚠️  Errors: ${vocabErrors}`);
    }

    // Step 5: Update flashcard_progress table
    console.log('\n📈 Step 5: Updating flashcard_progress table...');

    const progressResult = await db.execute('SELECT * FROM flashcard_progress');
    const progressBackup = path.join(BACKUP_DIR, `flashcard_progress-content-backup-${timestamp}.json`);
    fs.writeFileSync(progressBackup, JSON.stringify(progressResult.rows, null, 2));
    console.log(`💾 Backup saved: ${path.basename(progressBackup)}`);

    let progressUpdated = 0;
    let progressSkipped = 0;
    let progressErrors = 0;

    for (const row of progressResult.rows) {
      const oldFlashcardId = row.flashcard_id as string;
      const userId = row.user_id as string;
      const newFlashcardId = idMapping.get(oldFlashcardId);

      if (newFlashcardId) {
        try {
          await db.execute({
            sql: `UPDATE flashcard_progress
                  SET flashcard_id = ?
                  WHERE user_id = ? AND flashcard_id = ?`,
            args: [newFlashcardId, userId, oldFlashcardId]
          });
          progressUpdated++;
        } catch (error) {
          console.error(`   ❌ Error updating progress for ${oldFlashcardId}:`, error);
          progressErrors++;
        }
      } else {
        progressSkipped++;
      }
    }

    console.log(`✅ Updated ${progressUpdated} progress records`);
    if (progressSkipped > 0) {
      console.warn(`⚠️  Skipped ${progressSkipped} records (no mapping found)`);
    }
    if (progressErrors > 0) {
      console.error(`⚠️  Errors: ${progressErrors}`);
    }

    // Step 6: Verify foreign key integrity
    console.log('\n🔍 Step 6: Verifying foreign key integrity...');

    try {
      const fkCheck = await db.execute('PRAGMA foreign_key_check');
      if (fkCheck.rows.length === 0) {
        console.log('✅ All foreign keys are valid');
      } else {
        console.error('❌ Foreign key violations found:');
        fkCheck.rows.forEach(row => console.error('   ', row));
      }
    } catch (error) {
      console.log('ℹ️  Foreign key check not supported (OK)');
    }

    // Step 7: Sample verification
    console.log('\n🔬 Step 7: Verifying sample records...');

    const sampleVocab = await db.execute('SELECT word_id, word, translation FROM vocabulary LIMIT 5');
    console.log('Sample vocabulary after migration:');
    sampleVocab.rows.forEach(row => {
      console.log(`   ${row.word_id}`);
      console.log(`      ${row.word} = ${row.translation}`);
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Migration Summary:');
    console.log(`   - Vocabulary records updated: ${vocabUpdated}`);
    console.log(`   - Progress records updated: ${progressUpdated}`);
    console.log(`   - Progress records skipped: ${progressSkipped}`);
    console.log(`   - Unmapped vocabulary: ${unmappedRecords.length}`);
    console.log(`   - Backup directory: ${BACKUP_DIR}`);

    console.log('\n✅ Turso database migration complete!');
    console.log('\n💡 Next: Test the app to verify progress saves/loads correctly');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n🔄 Please restore from backups in:', BACKUP_DIR);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrateTursoByContent().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
