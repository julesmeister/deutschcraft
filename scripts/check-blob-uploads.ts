/**
 * Check how many audio materials have blob data
 * Run with: npx tsx scripts/check-blob-uploads.ts
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

import { db } from '@/turso/client';

async function checkBlobUploads() {
  console.log('📊 Checking blob upload status...\n');

  try {
    // Count total audio materials
    const totalResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM audio_materials',
      args: [],
    });
    const total = totalResult.rows[0].count as number;

    // Count audio materials with blobs
    const withBlobResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM audio_materials WHERE audio_blob IS NOT NULL',
      args: [],
    });
    const withBlob = withBlobResult.rows[0].count as number;

    // Get total blob size
    const sizeResult = await db.execute({
      sql: 'SELECT SUM(LENGTH(audio_blob)) as total_size FROM audio_materials WHERE audio_blob IS NOT NULL',
      args: [],
    });
    const totalSize = sizeResult.rows[0].total_size as number;

    // Calculate statistics
    const withoutBlob = total - withBlob;
    const percentage = total > 0 ? (withBlob / total * 100).toFixed(2) : '0';
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log('='.repeat(60));
    console.log('📊 Blob Upload Statistics');
    console.log('='.repeat(60));
    console.log(`Total audio materials:     ${total}`);
    console.log(`✅ With blob data:          ${withBlob} (${percentage}%)`);
    console.log(`❌ Without blob data:       ${withoutBlob}`);
    console.log(`📦 Total blob storage:     ${sizeMB} MB`);
    console.log('='.repeat(60));

    // Get sample of materials without blobs
    if (withoutBlob > 0) {
      console.log('\n📋 Sample of materials without blobs:');
      const sampleResult = await db.execute({
        sql: 'SELECT audio_id, title, file_name FROM audio_materials WHERE audio_blob IS NULL LIMIT 5',
        args: [],
      });
      console.table(sampleResult.rows);
    }

  } catch (error) {
    console.error('❌ Error checking blob uploads:', error);
    throw error;
  }
}

// Run the check
checkBlobUploads()
  .then(() => {
    console.log('\n✅ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });
