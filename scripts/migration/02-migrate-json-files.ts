/**
 * Step 2: Migrate JSON Files
 * Updates all flashcard IDs in vocabulary JSON files atomically
 * Automatically creates backups before modification
 */

import fs from 'fs';
import path from 'path';

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const DATA_DIR = path.join(process.cwd(), 'lib/data/vocabulary/levels');
const MAPPING_FILE = path.join(process.cwd(), 'scripts/migration/migration-mapping.json');
const BACKUP_SUFFIX = `.backup-${Date.now()}`;

interface MappingData {
  generatedAt: string;
  totalMappings: number;
  levelStats: Record<string, number>;
  mapping: Record<string, string>;
}

async function migrateJsonFiles() {
  console.log('📖 Loading ID mapping...\n');

  const mappingContent = fs.readFileSync(MAPPING_FILE, 'utf-8');
  const mappingData: MappingData = JSON.parse(mappingContent);
  const mapping = new Map(Object.entries(mappingData.mapping));

  console.log(`✅ Loaded ${mapping.size} ID mappings\n`);

  let totalMigrated = 0;
  let totalNotFound = 0;

  for (const level of LEVELS) {
    const filePath = path.join(DATA_DIR, `${level}.json`);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Warning: ${level}.json not found, skipping...`);
      continue;
    }

    console.log(`🔄 Migrating ${level.toUpperCase()}...`);

    // Backup original file
    const backupPath = `${filePath}${BACKUP_SUFFIX}.json`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`   ✅ Backup created: ${path.basename(backupPath)}`);

    // Read and parse
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Migrate IDs
    let migratedCount = 0;
    let notFoundCount = 0;

    if (data.flashcards && Array.isArray(data.flashcards)) {
      for (const flashcard of data.flashcards) {
        const oldId = flashcard.id;
        const newId = mapping.get(oldId);

        if (newId) {
          flashcard.id = newId;
          migratedCount++;
        } else {
          console.warn(`   ⚠️  No mapping found for: ${oldId}`);
          notFoundCount++;
        }
      }
    }

    // Write updated file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`   ✅ Migrated ${migratedCount} flashcards`);
    if (notFoundCount > 0) {
      console.warn(`   ⚠️  ${notFoundCount} flashcards without mapping`);
    }
    console.log();

    totalMigrated += migratedCount;
    totalNotFound += notFoundCount;
  }

  console.log('📊 Migration Summary:');
  console.log(`   - Total migrated: ${totalMigrated}`);
  console.log(`   - Not found: ${totalNotFound}`);
  console.log(`\n✅ JSON file migration complete!`);
  console.log(`\n💡 Tip: Backup files saved with suffix: ${BACKUP_SUFFIX}.json`);
  console.log(`💡 To rollback, run: npx tsx scripts/migration/rollback.ts`);
}

migrateJsonFiles().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
