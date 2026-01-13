/**
 * Upload MP3s from Schritte directory to Cloudflare R2
 * Usage: npx tsx scripts/upload-mp3s.ts
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize R2 client (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const SOURCE_DIR = 'C:\\Users\\User\\Documents\\Schritte';
const R2_PREFIX = 'materials/'; // Store in materials/ folder in R2

interface UploadStats {
  total: number;
  uploaded: number;
  skipped: number;
  failed: number;
}

/**
 * Recursively find all MP3 files in a directory
 */
function findMP3Files(dir: string): string[] {
  const mp3Files: string[] = [];

  function traverse(currentDir: string) {
    const items = readdirSync(currentDir);

    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.toLowerCase().endsWith('.mp3')) {
        mp3Files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return mp3Files;
}

/**
 * Get existing files in R2 bucket
 */
async function getExistingFiles(): Promise<Set<string>> {
  const existing = new Set<string>();
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: R2_PREFIX,
      ContinuationToken: continuationToken,
    });

    const response = await r2Client.send(command);

    if (response.Contents) {
      for (const item of response.Contents) {
        if (item.Key) {
          existing.add(item.Key);
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return existing;
}

/**
 * Upload a single file to R2
 */
async function uploadFile(
  localPath: string,
  r2Key: string,
  stats: UploadStats
): Promise<void> {
  try {
    const fileContent = readFileSync(localPath);
    const fileSizeMB = (fileContent.length / 1024 / 1024).toFixed(2);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: r2Key,
      Body: fileContent,
      ContentType: 'audio/mpeg',
    });

    await r2Client.send(command);
    console.log(`✅ Uploaded (${fileSizeMB} MB): ${r2Key}`);
    stats.uploaded++;
  } catch (error) {
    console.error(`❌ Failed to upload ${r2Key}:`, error);
    stats.failed++;
  }
}

/**
 * Main upload function
 */
async function main() {
  console.log('🎵 MP3 Upload Script for Cloudflare R2\n');
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Destination: ${BUCKET_NAME}/${R2_PREFIX}`);
  console.log('\n📁 Finding MP3 files...');

  const mp3Files = findMP3Files(SOURCE_DIR);
  console.log(`Found ${mp3Files.length} MP3 files\n`);

  if (mp3Files.length === 0) {
    console.log('No MP3 files found. Exiting.');
    return;
  }

  console.log('🔍 Checking existing files in R2...');
  const existingFiles = await getExistingFiles();
  console.log(`Found ${existingFiles.size} existing files in R2\n`);

  const stats: UploadStats = {
    total: mp3Files.length,
    uploaded: 0,
    skipped: 0,
    failed: 0,
  };

  console.log('📤 Starting upload...\n');

  for (const [index, localPath] of mp3Files.entries()) {
    // Create R2 key: materials/Schritte International Neu A1.1/audio AB/file.mp3
    const relativePath = relative(SOURCE_DIR, localPath);
    const r2Key = R2_PREFIX + relativePath.split(sep).join('/');

    console.log(`[${index + 1}/${mp3Files.length}] ${relativePath}`);

    if (existingFiles.has(r2Key)) {
      console.log(`⏭️  Skipped (already exists): ${r2Key}\n`);
      stats.skipped++;
      continue;
    }

    await uploadFile(localPath, r2Key, stats);
    console.log('');
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Upload Summary');
  console.log('='.repeat(60));
  console.log(`Total files:    ${stats.total}`);
  console.log(`✅ Uploaded:     ${stats.uploaded}`);
  console.log(`⏭️  Skipped:      ${stats.skipped}`);
  console.log(`❌ Failed:       ${stats.failed}`);
  console.log('='.repeat(60));

  if (stats.failed === 0) {
    console.log('\n🎉 All uploads completed successfully!');
  } else {
    console.log(`\n⚠️  ${stats.failed} file(s) failed to upload. Check errors above.`);
  }
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
