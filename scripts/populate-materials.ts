/**
 * Populate Materials Database
 * Scans public/materials folder and creates database records for all PDFs
 */

import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

import { createMaterial } from '@/lib/services/turso';
import * as fs from 'fs';

type CEFRLevel = 'A1.1' | 'A1.2' | 'A2.1' | 'A2.2' | 'B1.1' | 'B1.2' | 'General';
type MaterialCategory = 'Textbook' | 'Teaching Plan' | 'Copy Template' | 'Test' | 'Solutions' | 'Transcripts' | 'Extra Materials';

interface MaterialData {
  title: string;
  description: string | null;
  filePath: string;
  fileSize: number;
  level: CEFRLevel;
  category: MaterialCategory;
  lessonNumber: number | null;
  isPublic: boolean;
  uploadedBy: string | null;
  tags: string[];
}

function extractLevelFromPath(folderPath: string): CEFRLevel {
  if (folderPath.includes('A1.1')) return 'A1.1';
  if (folderPath.includes('A1.2')) return 'A1.2';
  if (folderPath.includes('A2.1')) return 'A2.1';
  if (folderPath.includes('A2.2')) return 'A2.2';
  if (folderPath.includes('B1.1') || folderPath.includes('Neu 5')) return 'B1.1';
  if (folderPath.includes('B1.2') || folderPath.includes('Neu 6')) return 'B1.2';
  return 'General';
}

function extractLessonNumber(filename: string): number | null {
  // Match patterns like "L1", "L2", "Lektion 1", etc.
  const match = filename.match(/[_\s]L(\d+)[_\s\.]/i) || filename.match(/Lektion\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function categorizeFile(filename: string, folderPath: string): MaterialCategory {
  const lower = filename.toLowerCase();
  const folder = folderPath.toLowerCase();

  // Main textbook
  if (lower.match(/^schritte international neu \d+\.pdf$/)) {
    return 'Textbook';
  }

  // Teaching plans
  if (folder.includes('unterichtsplan') || lower.includes('unterricht') || lower.includes('erste stunde')) {
    return 'Teaching Plan';
  }

  // Copy templates
  if (lower.includes('kopiervorlage')) {
    return 'Copy Template';
  }

  // Tests
  if (lower.includes('test') || lower.includes('prüfung')) {
    return 'Test';
  }

  // Solutions
  if (lower.includes('loesungen') || lower.includes('lösungen')) {
    return 'Solutions';
  }

  // Transcripts
  if (lower.includes('transkript') || lower.includes('transcript')) {
    return 'Transcripts';
  }

  // Everything else
  return 'Extra Materials';
}

function generateTitle(filename: string, category: MaterialCategory, level: CEFRLevel): string {
  // Remove file extension
  const nameWithoutExt = filename.replace('.pdf', '');

  // For main textbooks, use a clean title
  if (category === 'Textbook') {
    return `Schritte International Neu ${level} - Main Textbook`;
  }

  // For other materials, clean up the filename
  let title = nameWithoutExt
    .replace(/^\d+_?/, '') // Remove leading numbers
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return title;
}

function generateDescription(category: MaterialCategory, lessonNumber: number | null): string | null {
  const lessonPart = lessonNumber ? ` for Lesson ${lessonNumber}` : '';

  switch (category) {
    case 'Textbook':
      return 'Complete textbook with all lessons, exercises, and activities';
    case 'Teaching Plan':
      return `Detailed teaching plan${lessonPart} with objectives, activities, and timing`;
    case 'Copy Template':
      return `Printable worksheet template${lessonPart}`;
    case 'Test':
      return `Assessment test${lessonPart}`;
    case 'Solutions':
      return `Answer key and solutions${lessonPart}`;
    case 'Transcripts':
      return `Audio and video transcripts${lessonPart}`;
    case 'Extra Materials':
      return `Supplementary learning material${lessonPart}`;
    default:
      return null;
  }
}

function generateTags(category: MaterialCategory, level: CEFRLevel, lessonNumber: number | null): string[] {
  const tags: string[] = [level];

  switch (category) {
    case 'Textbook':
      tags.push('Core Material', 'Student Book');
      break;
    case 'Teaching Plan':
      tags.push('Teacher Resource', 'Lesson Planning');
      break;
    case 'Copy Template':
      tags.push('Worksheet', 'Printable', 'Practice');
      break;
    case 'Test':
      tags.push('Assessment', 'Evaluation');
      break;
    case 'Solutions':
      tags.push('Answer Key', 'Teacher Resource');
      break;
    case 'Transcripts':
      tags.push('Audio', 'Listening Practice');
      break;
    case 'Extra Materials':
      tags.push('Supplementary');
      break;
  }

  if (lessonNumber) {
    tags.push(`Lesson ${lessonNumber}`);
  }

  return tags;
}

async function scanAndPopulate() {
  const materialsDir = path.join(process.cwd(), 'public', 'materials');
  const allMaterials: MaterialData[] = [];

  console.log('🔍 Scanning materials directory...');

  function scanDirectory(dir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.toLowerCase().endsWith('.pdf')) {
        const relativePath = fullPath.replace(process.cwd(), '').replace(/\\/g, '/');
        const webPath = relativePath.replace('/public', '');
        const level = extractLevelFromPath(fullPath);
        const category = categorizeFile(item, dir);
        const lessonNumber = extractLessonNumber(item);
        const title = generateTitle(item, category, level);
        const description = generateDescription(category, lessonNumber);
        const tags = generateTags(category, level, lessonNumber);

        allMaterials.push({
          title,
          description,
          filePath: webPath,
          fileSize: stat.size,
          level,
          category,
          lessonNumber,
          isPublic: true, // Default public
          uploadedBy: null,
          tags,
        });
      }
    }
  }

  scanDirectory(materialsDir);

  console.log(`📚 Found ${allMaterials.length} PDF files`);
  console.log('💾 Populating database...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const material of allMaterials) {
    try {
      await createMaterial(material);
      successCount++;
      console.log(`✅ [${successCount}/${allMaterials.length}] ${material.title}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Failed: ${material.title}`, error);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📚 Total: ${allMaterials.length}`);
}

// Run the script
scanAndPopulate()
  .then(() => {
    console.log('\n🎉 Population complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
