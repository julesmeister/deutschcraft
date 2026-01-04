/**
 * Step 1: Generate ID Mapping
 * Reads all flashcard JSON files and generates old -> new ID mapping
 * Output: migration-mapping.json
 */

import fs from 'fs';
import path from 'path';
import { generateIdMapping, validateIdMapping } from '../../lib/utils/flashcardIdGenerator';

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const DATA_DIR = path.join(process.cwd(), 'lib/data/vocabulary/levels');
const OUTPUT_FILE = path.join(process.cwd(), 'scripts/migration/migration-mapping.json');

interface FlashcardData {
  id: string;
  german: string;
  english: string;
  category?: string;
  level: string;
}

async function generateMapping() {
  console.log('🔍 Reading flashcard data from JSON files...\n');

  const allFlashcards: FlashcardData[] = [];
  const levelStats: Record<string, number> = {};

  // Read all level files
  for (const level of LEVELS) {
    const filePath = path.join(DATA_DIR, `${level}.json`);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Warning: ${level}.json not found, skipping...`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const flashcards = data.flashcards || [];

    levelStats[level.toUpperCase()] = flashcards.length;
    allFlashcards.push(...flashcards);

    console.log(`✅ ${level.toUpperCase()}: ${flashcards.length} flashcards`);
  }

  console.log(`\n📊 Total flashcards: ${allFlashcards.length}\n`);

  // Generate mapping
  console.log('🔄 Generating ID mapping...\n');
  const mapping = generateIdMapping(allFlashcards);

  // Validate mapping
  const validation = validateIdMapping(mapping);

  console.log('✨ Validation Results:');
  console.log(`   - Total old IDs: ${validation.stats.totalOldIds}`);
  console.log(`   - Total new IDs: ${validation.stats.totalNewIds}`);
  console.log(`   - Unique new IDs: ${validation.stats.uniqueNewIds}`);
  console.log(`   - Valid: ${validation.valid ? '✅ YES' : '❌ NO'}\n`);

  if (!validation.valid) {
    console.error('❌ ERROR: Duplicate new IDs detected:');
    validation.duplicates.forEach(dup => console.error(`   - ${dup}`));
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
    mapping: mappingObject,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`💾 Mapping saved to: ${OUTPUT_FILE}`);
  console.log('\n✅ ID mapping generation complete!');

  // Show sample mappings
  console.log('\n📋 Sample mappings (first 10):');
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
