/**
 * Step 2b: Migrate Split Category Files
 * Updates all flashcard IDs in split category files (lib/data/vocabulary/split/)
 * CRITICAL: These files are the source for merge-flashcards.ts script
 * Automatically creates backups before modification
 */

import fs from 'fs';
import path from 'path';

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const SPLIT_BASE_DIR = path.join(process.cwd(), 'lib/data/vocabulary/split');
const MAPPING_FILE = path.join(process.cwd(), 'scripts/migration/migration-mapping.json');
const BACKUP_SUFFIX = `.backup-${Date.now()}`;

interface MappingData {
  generatedAt: string;
  totalMappings: number;
  levelStats: Record<string, number>;
  mapping: Record<string, string>;
}

async function migrateSplitFiles() {
  console.log('📖 Loading ID mapping...\n');

  const mappingContent = fs.readFileSync(MAPPING_FILE, 'utf-8');
  const mappingData: MappingData = JSON.parse(mappingContent);
  const mapping = new Map(Object.entries(mappingData.mapping));

  console.log(`✅ Loaded ${mapping.size} ID mappings\n`);

  let totalMigrated = 0;
  let totalNotFound = 0;
  let totalFiles = 0;

  for (const level of LEVELS) {
    const levelDir = path.join(SPLIT_BASE_DIR, level);

    if (!fs.existsSync(levelDir)) {
      console.warn(`⚠️  Warning: ${level} split directory not found, skipping...`);
      continue;
    }

    console.log(`🔄 Migrating ${level.toUpperCase()} split files...`);

    const files = fs.readdirSync(levelDir);
    const categoryFiles = files.filter(
      (f) => f.endsWith('.json') && f !== '_index.json'
    );

    console.log(`   Found ${categoryFiles.length} category files`);

    for (const file of categoryFiles) {
      const filePath = path.join(levelDir, file);

      // Backup original file
      const backupPath = `${filePath}${BACKUP_SUFFIX}.json`;
      fs.copyFileSync(filePath, backupPath);

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
            console.warn(`      ⚠️  No mapping found for: ${oldId} in ${file}`);
            notFoundCount++;
          }
        }
      }

      // Update totalCards count
      if (data.totalCards !== undefined) {
        data.totalCards = data.flashcards.length;
      }

      // Write updated file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      if (migratedCount > 0) {
        console.log(`   ✅ ${file}: ${migratedCount} flashcards migrated`);
      }
      if (notFoundCount > 0) {
        console.warn(`      ⚠️  ${notFoundCount} flashcards without mapping`);
      }

      totalMigrated += migratedCount;
      totalNotFound += notFoundCount;
      totalFiles++;
    }

    console.log();
  }

  console.log('📊 Migration Summary:');
  console.log(`   - Total files processed: ${totalFiles}`);
  console.log(`   - Total flashcards migrated: ${totalMigrated}`);
  console.log(`   - Not found: ${totalNotFound}`);
  console.log(`\n✅ Split files migration complete!`);
  console.log(`\n💡 Tip: Backup files saved with suffix: ${BACKUP_SUFFIX}.json`);
  console.log(`💡 To rollback, run: npx tsx scripts/migration/rollback.ts`);
}

migrateSplitFiles().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
