/**
 * Step 4: Build Old→New ID Mapping via Content Matching
 * Matches old corrupted IDs to new semantic IDs based on flashcard content
 * Flags unmappable records for manual review
 */

import fs from 'fs';
import path from 'path';

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const SPLIT_BASE_DIR = path.join(process.cwd(), 'lib/data/vocabulary/split');
const OUTPUT_FILE = path.join(process.cwd(), 'scripts/migration/content-based-mapping.json');
const UNMAPPED_FILE = path.join(process.cwd(), 'scripts/migration/unmapped-flashcards.json');

// Find the most recent backup timestamp
const BACKUP_TIMESTAMP = '1767540358989'; // From the last regeneration

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level?: string;
}

interface UnmappedFlashcard extends Flashcard {
  reason: string;
  possibleMatches?: Array<{ id: string; similarity: string }>;
}

/**
 * Create a content-based key for matching
 */
function createContentKey(flashcard: Flashcard): string {
  const german = flashcard.german.toLowerCase().trim();
  const english = flashcard.english.toLowerCase().trim();
  const category = (flashcard.category || '').toLowerCase().trim();
  return `${german}|||${english}|||${category}`;
}

/**
 * Normalize text for fuzzy matching
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äæ]/g, 'a')
    .replace(/[öœ]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[ß]/g, 'ss')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function buildContentMapping() {
  console.log('🔍 Building Old→New ID Mapping via Content Matching\n');
  console.log('='.repeat(50));

  const oldIdToNew = new Map<string, string>();
  const newContentIndex = new Map<string, Flashcard>();
  const unmappedFlashcards: UnmappedFlashcard[] = [];

  let totalOld = 0;
  let totalNew = 0;
  let exactMatches = 0;
  let unmapped = 0;

  // Step 1: Index all NEW flashcards by content
  console.log('\n📚 Step 1: Indexing new flashcards by content...\n');

  for (const level of LEVELS) {
    const levelDir = path.join(SPLIT_BASE_DIR, level);
    if (!fs.existsSync(levelDir)) continue;

    const files = fs.readdirSync(levelDir);
    const categoryFiles = files.filter(
      (f) => f.endsWith('.json') && f !== '_index.json' && !f.includes('.backup-')
    );

    for (const file of categoryFiles) {
      const filePath = path.join(levelDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      if (!data.flashcards || !Array.isArray(data.flashcards)) continue;

      for (const flashcard of data.flashcards) {
        const key = createContentKey(flashcard);
        newContentIndex.set(key, { ...flashcard, level: level.toUpperCase() });
        totalNew++;
      }
    }
  }

  console.log(`✅ Indexed ${totalNew} new flashcards`);

  // Step 2: Match OLD flashcards to NEW by content
  console.log('\n🔗 Step 2: Matching old IDs to new IDs...\n');

  for (const level of LEVELS) {
    const levelDir = path.join(SPLIT_BASE_DIR, level);
    if (!fs.existsSync(levelDir)) continue;

    console.log(`📂 Processing ${level.toUpperCase()}...`);

    const files = fs.readdirSync(levelDir);
    const backupFiles = files.filter(
      (f) => f.includes(`.backup-${BACKUP_TIMESTAMP}.json`)
    );

    let levelMatches = 0;
    let levelUnmapped = 0;

    for (const backupFile of backupFiles) {
      const backupPath = path.join(levelDir, backupFile);
      const content = fs.readFileSync(backupPath, 'utf-8');
      const data = JSON.parse(content);

      if (!data.flashcards || !Array.isArray(data.flashcards)) continue;

      for (const oldFlashcard of data.flashcards) {
        totalOld++;
        const oldId = oldFlashcard.id;
        const key = createContentKey(oldFlashcard);

        // Try exact content match
        const newFlashcard = newContentIndex.get(key);

        if (newFlashcard) {
          oldIdToNew.set(oldId, newFlashcard.id);
          exactMatches++;
          levelMatches++;
        } else {
          // No exact match - try fuzzy matching by german + category
          const normalizedGerman = normalize(oldFlashcard.german);
          const normalizedCategory = normalize(oldFlashcard.category || '');

          let possibleMatches: Array<{ id: string; similarity: string }> = [];

          for (const [, newCard] of newContentIndex) {
            if (normalize(newCard.category || '') === normalizedCategory &&
                normalize(newCard.german) === normalizedGerman) {
              possibleMatches.push({
                id: newCard.id,
                similarity: `german+category match, english differs: "${newCard.english}" vs "${oldFlashcard.english}"`
              });
            }
          }

          unmappedFlashcards.push({
            ...oldFlashcard,
            level: level.toUpperCase(),
            reason: possibleMatches.length > 0
              ? 'English translation differs'
              : 'No matching flashcard found',
            possibleMatches: possibleMatches.length > 0 ? possibleMatches : undefined
          });
          unmapped++;
          levelUnmapped++;
        }
      }
    }

    console.log(`   ✅ Matched: ${levelMatches} | ⚠️  Unmapped: ${levelUnmapped}`);
  }

  // Save mapping
  const mappingOutput = {
    generatedAt: new Date().toISOString(),
    sourceType: 'content-based-matching',
    backupTimestamp: BACKUP_TIMESTAMP,
    stats: {
      totalOldFlashcards: totalOld,
      totalNewFlashcards: totalNew,
      exactMatches,
      unmapped,
      matchRate: `${((exactMatches / totalOld) * 100).toFixed(2)}%`
    },
    mapping: Object.fromEntries(oldIdToNew)
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mappingOutput, null, 2));

  // Save unmapped flashcards
  const unmappedOutput = {
    generatedAt: new Date().toISOString(),
    totalUnmapped: unmapped,
    flashcards: unmappedFlashcards
  };

  fs.writeFileSync(UNMAPPED_FILE, JSON.stringify(unmappedOutput, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Content Matching Summary:');
  console.log(`   - Total old flashcards: ${totalOld}`);
  console.log(`   - Total new flashcards: ${totalNew}`);
  console.log(`   - Exact matches: ${exactMatches}`);
  console.log(`   - Unmapped: ${unmapped}`);
  console.log(`   - Match rate: ${((exactMatches / totalOld) * 100).toFixed(2)}%`);

  console.log(`\n💾 Files saved:`);
  console.log(`   - Mapping: ${OUTPUT_FILE}`);
  console.log(`   - Unmapped: ${UNMAPPED_FILE}`);

  if (unmapped > 0) {
    console.log(`\n⚠️  Warning: ${unmapped} flashcards could not be mapped!`);
    console.log(`   Review ${UNMAPPED_FILE} for details`);

    // Show first few unmapped examples
    console.log('\n📋 First 5 unmapped examples:');
    unmappedFlashcards.slice(0, 5).forEach((card, idx) => {
      console.log(`\n   ${idx + 1}. Old ID: ${card.id}`);
      console.log(`      German: ${card.german}`);
      console.log(`      English: ${card.english}`);
      console.log(`      Category: ${card.category}`);
      console.log(`      Reason: ${card.reason}`);
      if (card.possibleMatches) {
        console.log(`      Possible matches:`);
        card.possibleMatches.forEach(m => {
          console.log(`         - ${m.id} (${m.similarity})`);
        });
      }
    });
  }

  console.log('\n✅ Content-based mapping complete!');
}

buildContentMapping().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
