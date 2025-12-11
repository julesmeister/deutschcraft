/**
 * Check if B1 irregular verbs exist in other levels
 */

import * as fs from 'fs';
import * as path from 'path';

const LEVELS_DIR = path.join(process.cwd(), 'lib/data/vocabulary/levels');
const B1_IRREGULAR_VERBS = path.join(process.cwd(), 'lib/data/vocabulary/split/b1/irregular-verbs.json');

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
}

interface LevelData {
  flashcards: Flashcard[];
}

// Load B1 irregular verbs
const b1IrregularData = JSON.parse(fs.readFileSync(B1_IRREGULAR_VERBS, 'utf-8'));
const b1Verbs = b1IrregularData.flashcards.map((c: Flashcard) => c.german.toLowerCase());

console.log('🔍 Checking B1 Irregular Verbs for Duplicates\n');
console.log('='.repeat(50));
console.log(`\nB1 Irregular Verbs: ${b1Verbs.length} total`);

// Check each level
const duplicates: Record<string, string[]> = {};

for (const level of ['a1', 'a2', 'b2', 'c1', 'c2']) {
  const filePath = path.join(LEVELS_DIR, `${level}.json`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data: LevelData = JSON.parse(content);

    b1Verbs.forEach(verb => {
      const found = data.flashcards.find(card =>
        card.german.toLowerCase() === verb
      );

      if (found) {
        if (!duplicates[verb]) {
          duplicates[verb] = [];
        }
        duplicates[verb].push(level.toUpperCase());
      }
    });
  }
}

console.log('\n📊 Results:');
const duplicateVerbs = Object.keys(duplicates);

if (duplicateVerbs.length > 0) {
  console.log(`\n❌ Found ${duplicateVerbs.length} verbs that exist in other levels:\n`);
  duplicateVerbs.forEach(verb => {
    console.log(`   ${verb}: ${duplicates[verb].join(', ')}`);
  });
} else {
  console.log('\n✅ No duplicates found! All verbs are unique to B1.');
}

console.log('\n' + '='.repeat(50));
console.log(`\nUnique B1 verbs: ${b1Verbs.length - duplicateVerbs.length}/${b1Verbs.length}`);
