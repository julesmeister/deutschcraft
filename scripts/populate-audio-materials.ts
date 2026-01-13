/**
 * Populate audio_materials table with MP3 files from R2
 * Run with: npx tsx scripts/populate-audio-materials.ts
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createAudioMaterial } from '@/lib/services/turso/materialsService';
import * as dotenv from 'dotenv';
import { basename, dirname } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;
const PREFIX = 'materials/';

interface MP3File {
  key: string;
  size: number;
}

/**
 * Extract metadata from filename
 * Example: Schritte_int_Neu_5_AB_CD_1_Track_01_L01_Schritt_C_16a_und_c.mp3
 */
function parseFilename(filename: string, filePath: string) {
  // Extract level from path
  const pathParts = filePath.split('/');
  let level: 'A1.1' | 'A1.2' | 'A2.1' | 'A2.2' | 'B1.1' | 'B1.2' | null = null;

  // Look for level in path (e.g., "Schritte International Neu A1.1")
  for (const part of pathParts) {
    if (part.includes('A1.1')) level = 'A1.1';
    else if (part.includes('A1.2')) level = 'A1.2';
    else if (part.includes('A2.1')) level = 'A2.1';
    else if (part.includes('A2.2')) level = 'A2.2';
    else if (part.includes('B1.1')) level = 'B1.1';
    else if (part.includes('B1.2')) level = 'B1.2';
  }

  // Determine book type (KB = Kursbuch, AB = Arbeitsbuch)
  let bookType: 'KB' | 'AB' = 'KB';
  if (filename.includes('_AB_') || filePath.includes('audio AB')) {
    bookType = 'AB';
  } else if (filename.includes('_KB_') || filePath.includes('audio KB')) {
    bookType = 'KB';
  }

  // Extract CD number
  const cdMatch = filename.match(/CD_(\d+)/i) || filePath.match(/CD (\d+)/i);
  const cdNumber = cdMatch ? `CD ${cdMatch[1]}` : null;

  // Extract Track number
  const trackMatch = filename.match(/Track_(\d+)/i);
  const trackNumber = trackMatch ? `Track ${trackMatch[1]}` : null;

  // Extract lesson number
  const lessonMatch = filename.match(/L0?(\d+)_|Lektion_(\d+)/i);
  const lessonNumber = lessonMatch ? parseInt(lessonMatch[1] || lessonMatch[2]) : null;

  // Create a clean title
  const cleanName = filename
    .replace(/Schritte_int_Neu_\d+_/gi, '')
    .replace(/_/g, ' ')
    .replace('.mp3', '')
    .trim();

  const title = `${level || 'Unknown'} - ${bookType} - ${trackNumber || 'Track'} - ${cleanName}`;

  return {
    level: level || 'A1.1', // Default to A1.1 if not found
    bookType,
    cdNumber,
    trackNumber,
    lessonNumber,
    title,
    description: `${bookType === 'KB' ? 'Kursbuch' : 'Arbeitsbuch'} audio file`,
  };
}

/**
 * List all MP3 files in R2 bucket
 */
async function listMP3Files(): Promise<MP3File[]> {
  const mp3Files: MP3File[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: PREFIX,
      ContinuationToken: continuationToken,
    });

    const response = await r2Client.send(command);

    if (response.Contents) {
      for (const item of response.Contents) {
        if (item.Key && item.Key.toLowerCase().endsWith('.mp3')) {
          mp3Files.push({
            key: item.Key,
            size: item.Size || 0,
          });
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return mp3Files;
}

/**
 * Main function
 */
async function main() {
  console.log('🎵 Populating audio_materials table from R2\n');
  console.log(`Source: ${BUCKET_NAME}/${PREFIX}`);
  console.log(`Public URL: ${R2_PUBLIC_URL}\n`);

  // List all MP3 files
  console.log('📂 Listing MP3 files from R2...');
  const mp3Files = await listMP3Files();
  console.log(`Found ${mp3Files.length} MP3 files\n`);

  if (mp3Files.length === 0) {
    console.log('No MP3 files found. Exiting.');
    return;
  }

  console.log('💾 Inserting into database...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const [index, file] of mp3Files.entries()) {
    try {
      const fileName = basename(file.key);
      const filePath = file.key.replace(PREFIX, '');
      const fileUrl = `${R2_PUBLIC_URL}/${file.key}`;

      const metadata = parseFilename(fileName, filePath);

      await createAudioMaterial({
        title: metadata.title,
        fileName: fileName,
        fileUrl: fileUrl,
        fileSize: file.size,
        level: metadata.level,
        bookType: metadata.bookType,
        cdNumber: metadata.cdNumber,
        trackNumber: metadata.trackNumber,
        lessonNumber: metadata.lessonNumber,
        description: metadata.description,
        isPublic: true,
      });

      successCount++;

      if ((index + 1) % 100 === 0) {
        console.log(`✅ Processed ${index + 1}/${mp3Files.length} files...`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${file.key}:`, error);
      errorCount++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Database Population Summary');
  console.log('='.repeat(60));
  console.log(`Total files:    ${mp3Files.length}`);
  console.log(`✅ Inserted:     ${successCount}`);
  console.log(`❌ Failed:       ${errorCount}`);
  console.log('='.repeat(60));

  if (errorCount === 0) {
    console.log('\n🎉 All files inserted successfully!');
  } else {
    console.log(`\n⚠️  ${errorCount} file(s) failed to insert.`);
  }
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
