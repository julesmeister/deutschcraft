/**
 * Check all B1 verb categories for duplicates across other levels
 */

import * as fs from 'fs';
import * as path from 'path';

const LEVELS_DIR = path.join(process.cwd(), 'lib/data/vocabulary/levels');
const B1_SPLIT_DIR = path.join(process.cwd(), 'lib/data/vocabulary/split/b1');

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

const VERB_CATEGORIES = [
  'irregular-verbs.json',
  'separable-verbs.json',
  'intermediate-verbs.json',
  'reflexive-verbs.json',
  'verbs-with-prepositions.json',
  'positional-verbs.json',
  'state-change-verbs.json'
];

console.log('🔍 Checking All B1 Verb Categories for Duplicates\n');
console.log('='.repeat(60));

let totalDuplicates = 0;
let totalVerbs = 0;

for (const categoryFile of VERB_CATEGORIES) {
  const filePath = path.join(B1_SPLIT_DIR, categoryFile);
  if (!fs.existsSync(filePath)) {
    console.log(`\n⚠️  ${categoryFile} not found, skipping...`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const verbs = data.flashcards.map((c: Flashcard) => c.german.toLowerCase());
  totalVerbs += verbs.length;

  console.log(`\n📂 ${categoryFile.replace('.json', '')}: ${verbs.length} verbs`);

  const duplicates: Record<string, string[]> = {};

  for (const level of ['a1', 'a2', 'b2', 'c1', 'c2']) {
    const levelPath = path.join(LEVELS_DIR, `${level}.json`);
    if (fs.existsSync(levelPath)) {
      const content = fs.readFileSync(levelPath, 'utf-8');
      const levelData: LevelData = JSON.parse(content);

      verbs.forEach(verb => {
        const found = levelData.flashcards.find(card =>
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

  const duplicateVerbs = Object.keys(duplicates);
  if (duplicateVerbs.length > 0) {
    console.log(`   ❌ Found ${duplicateVerbs.length} duplicates:`);
    duplicateVerbs.forEach(verb => {
      console.log(`      ${verb}: ${duplicates[verb].join(', ')}`);
    });
    totalDuplicates += duplicateVerbs.length;
  } else {
    console.log(`   ✅ All unique!`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Summary:`);
console.log(`   Total verbs checked: ${totalVerbs}`);
console.log(`   Total duplicates found: ${totalDuplicates}`);
console.log(`   Unique verbs: ${totalVerbs - totalDuplicates}`);

if (totalDuplicates > 0) {
  console.log(`\n⚠️  Action needed: Remove ${totalDuplicates} duplicates`);
} else {
  console.log(`\n✅ All B1 verbs are unique across all levels!`);
}
