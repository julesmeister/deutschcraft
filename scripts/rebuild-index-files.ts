/**
 * Rebuild _index.json Files with New Semantic IDs
 * Reads the actual flashcard files to build accurate category indexes
 */

import fs from 'fs';
import path from 'path';

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const SPLIT_BASE_DIR = path.join(process.cwd(), 'lib/data/vocabulary/split');

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  [key: string]: any;
}

interface CategoryInfo {
  name: string;
  count: number;
  file: string;
  ids: string[];
}

interface CategoryIndex {
  level: string;
  totalCards: number;
  totalCategories: number;
  categories: CategoryInfo[];
}

async function rebuildIndexFiles() {
  console.log('🔨 Rebuilding _index.json Files with New Semantic IDs\n');
  console.log('='.repeat(60));

  for (const level of LEVELS) {
    const levelDir = path.join(SPLIT_BASE_DIR, level);

    if (!fs.existsSync(levelDir)) {
      console.warn(`⚠️  ${level.toUpperCase()}: Directory not found, skipping...`);
      continue;
    }

    console.log(`\n📂 Processing ${level.toUpperCase()}...`);

    // Read all category files
    const files = fs.readdirSync(levelDir);
    const categoryFiles = files.filter(
      (f) => f.endsWith('.json') && f !== '_index.json' && !f.includes('.backup-')
    );

    console.log(`   Found ${categoryFiles.length} category files`);

    const categories: CategoryInfo[] = [];
    let totalCards = 0;

    // Process each category file
    for (const file of categoryFiles.sort()) {
      const filePath = path.join(levelDir, file);

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        if (!data.flashcards || !Array.isArray(data.flashcards)) {
          console.warn(`   ⚠️  ${file}: No flashcards array`);
          continue;
        }

        // Extract IDs from flashcards
        const ids = data.flashcards.map((f: Flashcard) => f.id);
        const categoryName = data.category || file.replace('.json', '');

        categories.push({
          name: categoryName,
          count: ids.length,
          file: file,
          ids: ids,
        });

        totalCards += ids.length;

        // Show sample IDs for first category
        if (categories.length === 1) {
          console.log(`   Sample IDs from ${file}:`);
          ids.slice(0, 3).forEach((id: string) => {
            console.log(`     - ${id}`);
          });
        }

      } catch (error) {
        console.error(`   ❌ Error reading ${file}:`, error);
      }
    }

    // Build index
    const index: CategoryIndex = {
      level: level.toUpperCase(),
      totalCards,
      totalCategories: categories.length,
      categories,
    };

    // Backup old index if exists
    const indexPath = path.join(levelDir, '_index.json');
    if (fs.existsSync(indexPath)) {
      const backupPath = path.join(levelDir, `_index.backup-${Date.now()}.json`);
      fs.copyFileSync(indexPath, backupPath);
      console.log(`   💾 Backed up old index`);
    }

    // Write new index
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`   ✅ Rebuilt _index.json: ${totalCards} cards, ${categories.length} categories`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All _index.json files rebuilt successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Restart dev server to pick up new index files');
  console.log('   2. Check flashcards page - due counts should now appear');
  console.log('   3. Verify progress bars show correctly');
}

rebuildIndexFiles().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
