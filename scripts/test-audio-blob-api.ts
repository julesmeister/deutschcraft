/**
 * Test audio blob API endpoint
 * Run with: npx tsx scripts/test-audio-blob-api.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getAudioBlob } from '@/lib/services/turso/materialsService';
import { db } from '@/turso/client';

async function testBlobAPI() {
  console.log('🧪 Testing Audio Blob API\n');

  try {
    // Get a sample audio material
    const result = await db.execute({
      sql: 'SELECT audio_id, file_name, title, LENGTH(audio_blob) as blob_size FROM audio_materials WHERE audio_blob IS NOT NULL LIMIT 5',
      args: [],
    });

    console.log(`Found ${result.rows.length} audio materials with blobs:\n`);

    for (const row of result.rows) {
      console.log('─'.repeat(60));
      console.log(`Audio ID: ${row.audio_id}`);
      console.log(`File: ${row.file_name}`);
      console.log(`Title: ${row.title}`);
      console.log(`Blob Size: ${((row.blob_size as number) / (1024 * 1024)).toFixed(2)} MB`);

      // Try to fetch the blob
      const audioId = row.audio_id as string;
      console.log(`\nFetching blob for ${audioId}...`);

      const blob = await getAudioBlob(audioId);

      if (blob) {
        console.log('✅ Blob fetched successfully');
        console.log(`   - Is Buffer: ${Buffer.isBuffer(blob)}`);
        console.log(`   - Size: ${(blob.length / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`   - First 10 bytes: ${Array.from(blob.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
      } else {
        console.log('❌ Failed to fetch blob');
      }
      console.log();
    }

    console.log('='.repeat(60));
    console.log('✅ Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

testBlobAPI().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
