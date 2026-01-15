/**
 * Upload MP3 files from local Schritte directory as blobs to Turso (V3 - Optimized)
 * Run with: npx tsx scripts/upload-audio-blobs-to-turso-v3.ts
 *
 * Improvements over V2:
 * - Efficient batch querying to check existing blobs
 * - Faster filtering
 * - Better progress reporting
 */

import * as dotenv from 'dotenv';
// Load environment variables FIRST
dotenv.config({ path: '.env.local' });

import { db } from '@/turso/client';
import * as fs from 'fs';
import * as path from 'path';

// Local directory containing Schritte materials
const SCHRITTE_DIR = 'C:\\Users\\User\\Documents\\Schritte';
const BATCH_SIZE = 10; // Process 10 files at a time
const BATCH_DELAY_MS = 2000; // Wait 2 seconds between batches
const MAX_FILE_SIZE_MB = 10; // Skip files larger than 10MB initially

interface AudioFile {
  filePath: string;
  fileName: string;
  size: number;
}

/**
 * Get all file names that already have blobs
 */
async function getFilesWithBlobs(): Promise<Set<string>> {
  try {
    const result = await db.execute({
      sql: 'SELECT file_name FROM audio_materials WHERE audio_blob IS NOT NULL',
      args: [],
    });

    return new Set(result.rows.map(row => row.file_name as string));
  } catch (error) {
    console.error('Error fetching files with blobs:', error);
    return new Set();
  }
}

/**
 * Recursively scan directory for MP3 files
 */
function scanDirectory(dir: string): AudioFile[] {
  const results: AudioFile[] = [];

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        results.push(...scanDirectory(fullPath));
      } else if (item.isFile() && item.name.toLowerCase().endsWith('.mp3')) {
        const stats = fs.statSync(fullPath);
        results.push({
          filePath: fullPath,
          fileName: item.name,
          size: stats.size,
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return results;
}

/**
 * Update audio material with blob data
 */
async function updateAudioBlob(fileName: string, audioBuffer: Buffer): Promise<boolean> {
  try {
    await db.execute({
      sql: 'UPDATE audio_materials SET audio_blob = ? WHERE file_name = ?',
      args: [audioBuffer, fileName],
    });
    return true;
  } catch (error) {
    console.error(`Error updating blob for ${fileName}:`, error);
    return false;
  }
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function
 */
async function main() {
  console.log('🎵 Uploading MP3 files as blobs to Turso database (V3 - Optimized)\n');
  console.log(`Source: ${SCHRITTE_DIR}`);
  console.log(`Batch size: ${BATCH_SIZE} files`);
  console.log(`Max file size: ${MAX_FILE_SIZE_MB} MB\n`);

  // Check if directory exists
  if (!fs.existsSync(SCHRITTE_DIR)) {
    console.error(`❌ Directory not found: ${SCHRITTE_DIR}`);
    process.exit(1);
  }

  // Scan for MP3 files
  console.log('📂 Scanning for MP3 files...');
  const allAudioFiles = scanDirectory(SCHRITTE_DIR);
  console.log(`Found ${allAudioFiles.length} MP3 files\n`);

  if (allAudioFiles.length === 0) {
    console.log('No MP3 files found. Exiting.');
    return;
  }

  // Get files that already have blobs (efficient single query)
  console.log('🔍 Checking which files already have blobs...');
  const filesWithBlobs = await getFilesWithBlobs();
  console.log(`${filesWithBlobs.size} files already have blobs\n`);

  // Filter files: ≤ MAX_FILE_SIZE_MB and no existing blob
  const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  const filesToUpload = allAudioFiles.filter(
    file => file.size <= maxSizeBytes && !filesWithBlobs.has(file.fileName)
  );

  console.log(`Found ${filesToUpload.length} files to upload (≤ ${MAX_FILE_SIZE_MB} MB, no existing blob)\n`);

  if (filesToUpload.length === 0) {
    console.log('✅ All eligible files already have blobs!');

    // Check for large files
    const largeFiles = allAudioFiles.filter(f => f.size > maxSizeBytes);
    if (largeFiles.length > 0) {
      console.log(`\n📝 Note: ${largeFiles.length} file(s) > ${MAX_FILE_SIZE_MB} MB were not processed.`);
      console.log('💡 To upload these, increase MAX_FILE_SIZE_MB in the script.');
    }
    return;
  }

  // Sort by size (smallest first)
  filesToUpload.sort((a, b) => a.size - b.size);

  const totalSize = filesToUpload.reduce((sum, file) => sum + file.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`Total size to upload: ${totalSizeMB} MB\n`);

  console.log('💾 Starting upload...\n');

  let successCount = 0;
  let errorCount = 0;
  let totalBytesUploaded = 0;

  // Process in batches
  for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
    const batch = filesToUpload.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(filesToUpload.length / BATCH_SIZE);

    console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} files):`);

    for (const file of batch) {
      try {
        const audioBuffer = fs.readFileSync(file.filePath);
        const success = await updateAudioBlob(file.fileName, audioBuffer);

        if (success) {
          successCount++;
          totalBytesUploaded += file.size;
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
          console.log(`  ✅ ${file.fileName.substring(0, 40)}... (${fileSizeMB} MB)`);
        } else {
          errorCount++;
          console.log(`  ❌ ${file.fileName} - Failed`);
        }
      } catch (error) {
        errorCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ ${file.fileName} - ${errorMsg.substring(0, 60)}`);
      }
    }

    // Progress update
    const uploadedMB = (totalBytesUploaded / (1024 * 1024)).toFixed(2);
    const progress = ((i + batch.length) / filesToUpload.length * 100).toFixed(1);
    console.log(`  📊 Progress: ${progress}% | Uploaded: ${uploadedMB}/${totalSizeMB} MB\n`);

    // Delay between batches
    if (i + BATCH_SIZE < filesToUpload.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  // Print summary
  console.log('='.repeat(60));
  console.log('📊 Upload Summary');
  console.log('='.repeat(60));
  console.log(`Files to upload:  ${filesToUpload.length}`);
  console.log(`✅ Uploaded:       ${successCount}`);
  console.log(`❌ Failed:         ${errorCount}`);
  console.log(`📦 Total uploaded: ${(totalBytesUploaded / (1024 * 1024)).toFixed(2)} MB`);
  console.log('='.repeat(60));

  if (errorCount === 0) {
    console.log('\n🎉 All files uploaded successfully!');
  } else {
    console.log(`\n⚠️  ${errorCount} file(s) failed. Re-run to retry.`);
  }

  // Note about large files
  const largeFiles = allAudioFiles.filter(f => f.size > maxSizeBytes);
  if (largeFiles.length > 0) {
    console.log(`\n📝 ${largeFiles.length} file(s) > ${MAX_FILE_SIZE_MB} MB were skipped.`);
  }
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
