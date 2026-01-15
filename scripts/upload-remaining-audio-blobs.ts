/**
 * Upload the remaining 2 audio files that are >10MB but <20MB
 * Run with: npx tsx scripts/upload-remaining-audio-blobs.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '@/turso/client';
import * as fs from 'fs';
import * as path from 'path';

const SCHRITTE_DIR = 'C:\\Users\\User\\Documents\\Schritte';

interface AudioFile {
  filePath: string;
  fileName: string;
  size: number;
}

/**
 * Get files without blobs
 */
async function getFilesWithoutBlobs(): Promise<string[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT file_name FROM audio_materials WHERE audio_blob IS NULL',
      args: [],
    });
    return result.rows.map(row => row.file_name as string);
  } catch (error) {
    console.error('Error fetching files without blobs:', error);
    return [];
  }
}

/**
 * Recursively scan directory for specific MP3 files
 */
function findFiles(dir: string, targetFileNames: string[]): AudioFile[] {
  const results: AudioFile[] = [];

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        results.push(...findFiles(fullPath, targetFileNames));
      } else if (item.isFile() && targetFileNames.includes(item.name)) {
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
 * Main function
 */
async function main() {
  console.log('🎵 Uploading remaining large audio files as blobs\n');

  // Get files that need blobs
  console.log('🔍 Checking which files need blobs...');
  const filesWithoutBlobs = await getFilesWithoutBlobs();
  console.log(`Found ${filesWithoutBlobs.length} files without blobs:\n`);

  filesWithoutBlobs.forEach((fileName, i) => {
    console.log(`  ${i + 1}. ${fileName}`);
  });
  console.log();

  if (filesWithoutBlobs.length === 0) {
    console.log('✅ All files already have blobs!');
    return;
  }

  // Find these files on disk
  console.log('📂 Locating files...');
  const filesToUpload = findFiles(SCHRITTE_DIR, filesWithoutBlobs);
  console.log(`Found ${filesToUpload.length} files on disk\n`);

  if (filesToUpload.length === 0) {
    console.log('❌ No files found on disk');
    return;
  }

  // Upload each file
  let successCount = 0;
  let errorCount = 0;

  for (const file of filesToUpload) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`📦 Uploading: ${file.fileName} (${fileSizeMB} MB)...`);

    try {
      const audioBuffer = fs.readFileSync(file.filePath);
      const success = await updateAudioBlob(file.fileName, audioBuffer);

      if (success) {
        console.log(`  ✅ Success!\n`);
        successCount++;
      } else {
        console.log(`  ❌ Failed\n`);
        errorCount++;
      }
    } catch (error) {
      console.error(`  ❌ Error:`, error instanceof Error ? error.message : String(error));
      console.log();
      errorCount++;
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 Upload Summary');
  console.log('='.repeat(60));
  console.log(`Files uploaded: ${successCount}`);
  console.log(`Failed:         ${errorCount}`);
  console.log('='.repeat(60));

  if (errorCount === 0) {
    console.log('\n🎉 All files uploaded successfully!');
  } else {
    console.log(`\n⚠️  ${errorCount} file(s) failed.`);
  }
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
