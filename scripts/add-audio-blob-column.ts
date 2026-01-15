/**
 * Add audio_blob column to audio_materials table for storing MP3 data
 * Run with: npx tsx scripts/add-audio-blob-column.ts
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

import { db } from '@/turso/client';

async function addBlobColumn() {
  console.log('Adding audio_blob column to audio_materials table...\n');

  try {
    // Add blob column for storing audio data
    await db.execute({
      sql: `ALTER TABLE audio_materials ADD COLUMN audio_blob BLOB`,
      args: [],
    });

    console.log('✅ audio_blob column added successfully!');

    // Check table structure
    const result = await db.execute({
      sql: `PRAGMA table_info(audio_materials)`,
      args: [],
    });

    console.log('\n📋 Updated table structure:');
    console.table(result.rows);

  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate column name')) {
      console.log('⚠️  audio_blob column already exists');
    } else {
      console.error('❌ Error adding column:', error);
      throw error;
    }
  }
}

// Run the migration
addBlobColumn()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
