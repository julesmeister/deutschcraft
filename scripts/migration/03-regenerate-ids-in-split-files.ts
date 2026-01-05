/**
 * Step 3: Regenerate IDs in Split Files (Content-Based)
 * Generates new semantic IDs based ONLY on flashcard content
 * Does NOT use old IDs (which are corrupted)
 *
 * CRITICAL: Old IDs are unreliable due to pre-existing data corruption
 * This script generates fresh IDs based on german/english/category/level
 */

import fs from 'fs';
import path from 'path';
import { generateFlashcardId } from '../../lib/utils/flashcardIdGenerator';

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const SPLIT_BASE_DIR = path.join(process.cwd(), 'lib/data/vocabulary/split');
const BACKUP_SUFFIX = `.backup-${Date.now()}`;

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level?: string;
  [key: string]: any;
}

async function regenerateIds() {
  console.log('🔄 Regenerating IDs in Split Files (Content-Based)\\n');
  console.log('='.repeat(50));
  console.log('⚠️  Ignoring old IDs due to pre-existing corruption\\n');

  let totalFiles = 0;
  let totalFlashcards = 0;
  let totalErrors = 0;

  for (const level of LEVELS) {
    const levelDir = path.join(SPLIT_BASE_DIR, level);

    if (!fs.existsSync(levelDir)) {
      console.warn(`⚠️  Warning: ${level} split directory not found, skipping...`);
      continue;
    }

    console.log(`\\n📂 Processing ${level.toUpperCase()}...`);

    const files = fs.readdirSync(levelDir);
    const categoryFiles = files.filter(
      (f) => f.endsWith('.json') && f !== '_index.json' && !f.includes('.backup-')
    );

    console.log(`   Found ${categoryFiles.length} category files`);

    for (const file of categoryFiles) {
      const filePath = path.join(levelDir, file);

      try {
        // Backup original file
        const backupPath = `${filePath}${BACKUP_SUFFIX}.json`;
        fs.copyFileSync(filePath, backupPath);

        // Read and parse
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        if (!data.flashcards || !Array.isArray(data.flashcards)) {
          console.warn(`   ⚠️  ${file}: No flashcards array found`);
          continue;
        }

        let regeneratedCount = 0;

        // Regenerate each flashcard ID based on content
        for (const flashcard of data.flashcards) {
          const oldId = flashcard.id;

          // Generate new ID from content
          const newId = generateFlashcardId(
            level.toLowerCase(),
            flashcard.category || data.category || file.replace('.json', ''),
            flashcard.german,
            flashcard.english
          );

          flashcard.id = newId;
          regeneratedCount++;

          // Optional: Log if ID changed significantly
          if (oldId && oldId !== newId && regeneratedCount <= 3) {
            console.log(`      ${oldId} → ${newId}`);
          }
        }

        // Update totalCards count
        data.totalCards = data.flashcards.length;

        // Write updated file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        console.log(`   ✅ ${file}: ${regeneratedCount} IDs regenerated`);
        totalFiles++;
        totalFlashcards += regeneratedCount;

      } catch (error) {
        console.error(`   ❌ Error processing ${file}:`, error);
        totalErrors++;
      }
    }
  }

  console.log('\\n' + '='.repeat(50));
  console.log('\\n📊 Regeneration Summary:');
  console.log(`   - Total files processed: ${totalFiles}`);
  console.log(`   - Total flashcards regenerated: ${totalFlashcards}`);
  console.log(`   - Errors: ${totalErrors}`);
  console.log(`\\n✅ ID regeneration complete!`);
  console.log(`\\n💡 Tip: Backup files saved with suffix: ${BACKUP_SUFFIX}.json`);
  console.log(`💡 To rollback, run: npx tsx scripts/migration/rollback.ts`);
}

regenerateIds().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
