/**
 * Step 1: Generate ID Mapping FROM SPLIT FILES
 * Reads flashcards from split category files (source of truth)
 * Output: migration-mapping.json
 *
 * IMPORTANT: This script uses split files because:
 * - Split files are the source of truth
 * - merge-flashcards.ts builds main level files FROM split files
 * - Main level files may be out of sync with split files
 */

import fs from 'fs';
import path from 'path';
import { generateIdMapping, validateIdMapping } from '../../lib/utils/flashcardIdGenerator';

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const SPLIT_BASE_DIR = path.join(process.cwd(), 'lib/data/vocabulary/split');
const OUTPUT_FILE = path.join(process.cwd(), 'scripts/migration/migration-mapping.json');

interface FlashcardData {
  id: string;
  german: string;
  english: string;
  category?: string;
  level: string;
}

async function generateMapping() {
  console.log('🔍 Reading flashcard data from SPLIT FILES...\\n');

  const allFlashcards: FlashcardData[] = [];
  const levelStats: Record<string, number> = {};
  let totalFiles = 0;

  // Read all split category files
  for (const level of LEVELS) {
    const levelDir = path.join(SPLIT_BASE_DIR, level);

    if (!fs.existsSync(levelDir)) {
      console.warn(`⚠️  Warning: ${level} split directory not found, skipping...`);
      continue;
    }

    const files = fs.readdirSync(levelDir);
    const categoryFiles = files.filter(
      (f) => f.endsWith('.json') && f !== '_index.json' && !f.includes('.backup-')
    );

    console.log(`📂 ${level.toUpperCase()}: Found ${categoryFiles.length} category files`);

    let levelCardCount = 0;

    for (const file of categoryFiles) {
      const filePath = path.join(levelDir, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const flashcards = data.flashcards || [];

        // Add level field to each flashcard (inferred from directory)
        const flashcardsWithLevel = flashcards.map((card: any) => ({
          ...card,
          level: level.toUpperCase(),
          // Ensure category is set (use from file data or infer from filename)
          category: card.category || data.category || file.replace('.json', '')
        }));

        levelCardCount += flashcards.length;
        allFlashcards.push(...flashcardsWithLevel);
        totalFiles++;

        console.log(`   ✅ ${file}: ${flashcards.length} flashcards`);
      } catch (error) {
        console.error(`   ❌ Error reading ${file}:`, error);
      }
    }

    levelStats[level.toUpperCase()] = levelCardCount;
    console.log(`   📊 Total for ${level.toUpperCase()}: ${levelCardCount} flashcards\\n`);
  }

  console.log(`\\n📊 Grand Total: ${allFlashcards.length} flashcards from ${totalFiles} category files\\n`);

  // Generate mapping
  console.log('🔄 Generating ID mapping...\\n');
  const mapping = generateIdMapping(allFlashcards);

  // Validate mapping
  const validation = validateIdMapping(mapping);

  console.log('✨ Validation Results:');
  console.log(`   - Total old IDs: ${validation.stats.totalOldIds}`);
  console.log(`   - Total new IDs: ${validation.stats.totalNewIds}`);
  console.log(`   - Unique new IDs: ${validation.stats.uniqueNewIds}`);
  console.log(`   - Valid: ${validation.valid ? '✅ YES' : '❌ NO'}\\n`);

  if (!validation.valid) {
    console.error('❌ ERROR: Duplicate new IDs detected:');
    validation.duplicates.forEach(dup => console.error(`   - ${dup}`));

    // Show details about duplicates
    console.error('\\n🔍 Analyzing ID collisions...\\n');
    const newIdCounts = new Map<string, { oldIds: string[], flashcards: FlashcardData[] }>();

    for (const [oldId, newId] of mapping) {
      if (!newIdCounts.has(newId)) {
        newIdCounts.set(newId, { oldIds: [], flashcards: [] });
      }
      const flashcard = allFlashcards.find(f => f.id === oldId);
      if (flashcard) {
        newIdCounts.get(newId)!.oldIds.push(oldId);
        newIdCounts.get(newId)!.flashcards.push(flashcard);
      }
    }

    // Show collision details
    for (const [newId, data] of newIdCounts) {
      if (data.oldIds.length > 1) {
        console.error(`\\n   ❌ Collision: ${newId}`);
        data.flashcards.forEach((card, idx) => {
          console.error(`      ${idx + 1}. Old ID: ${data.oldIds[idx]}`);
          console.error(`         German: ${card.german}`);
          console.error(`         English: ${card.english}`);
          console.error(`         Category: ${card.category}`);
          console.error(`         Level: ${card.level}`);
        });
      }
    }

    process.exit(1);
  }

  // Convert Map to object for JSON serialization
  const mappingObject: Record<string, string> = {};
  for (const [oldId, newId] of mapping) {
    mappingObject[oldId] = newId;
  }

  // Save mapping
  const output = {
    generatedAt: new Date().toISOString(),
    totalMappings: mapping.size,
    levelStats,
    sourceType: 'split-files',
    mapping: mappingObject,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`💾 Mapping saved to: ${OUTPUT_FILE}`);
  console.log('\\n✅ ID mapping generation complete!');

  // Show sample mappings
  console.log('\\n📋 Sample mappings (first 10):');
  let count = 0;
  for (const [oldId, newId] of mapping) {
    if (count++ >= 10) break;
    console.log(`   ${oldId} -> ${newId}`);
  }
}

generateMapping().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
