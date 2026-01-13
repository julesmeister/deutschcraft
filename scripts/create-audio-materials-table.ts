/**
 * Create audio_materials table in Turso
 * Run with: npx tsx scripts/create-audio-materials-table.ts
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

import { db } from '@/turso/client';

async function createTable() {
  console.log('Creating audio_materials table...\n');

  try {
    await db.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS audio_materials (
          audio_id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_url TEXT NOT NULL,
          file_size INTEGER,
          level TEXT NOT NULL,
          book_type TEXT CHECK(book_type IN ('KB', 'AB')),
          cd_number TEXT,
          track_number TEXT,
          lesson_number INTEGER,
          description TEXT,
          is_public INTEGER DEFAULT 1,
          play_count INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `,
      args: [],
    });

    console.log('✅ audio_materials table created successfully!');

    // Create indexes for better query performance
    await db.execute({
      sql: `CREATE INDEX IF NOT EXISTS idx_audio_materials_level ON audio_materials(level)`,
      args: [],
    });

    await db.execute({
      sql: `CREATE INDEX IF NOT EXISTS idx_audio_materials_lesson ON audio_materials(lesson_number)`,
      args: [],
    });

    await db.execute({
      sql: `CREATE INDEX IF NOT EXISTS idx_audio_materials_public ON audio_materials(is_public)`,
      args: [],
    });

    console.log('✅ Indexes created successfully!\n');

    // Check table structure
    const result = await db.execute({
      sql: `PRAGMA table_info(audio_materials)`,
      args: [],
    });

    console.log('📋 Table structure:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  }
}

// Run the migration
createTable()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
