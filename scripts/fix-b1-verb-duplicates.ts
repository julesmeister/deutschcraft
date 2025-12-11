/**
 * Remove duplicate verbs and add unique B1-level irregular verbs
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
  tags: string[];
  _meta?: any;
}

interface CategoryFile {
  level: string;
  category: string;
  totalCards: number;
  flashcards: Flashcard[];
}

// Verbs to remove (exist in other levels)
const DUPLICATES = [
  'binden', 'schieben', 'schließen', 'streiten', 'werfen',
  'raten', 'erschrecken', 'treten', 'reißen', 'stehlen',
  'greifen', 'gelten', 'heben'
];

// New unique B1-level irregular verbs to add
const NEW_VERBS = [
  { german: "biegen", english: "to bend (biegt, bog, gebogen)" },
  { german: "bieten", english: "to offer (bietet, bot, geboten)" },
  { german: "bitten", english: "to ask / to request (bittet, bat, gebeten)" },
  { german: "empfehlen", english: "to recommend (empfiehlt, empfahl, empfohlen)" },
  { german: "fliegen", english: "to fly (fliegt, flog, geflogen)" },
  { german: "fließen", english: "to flow (fließt, floss, geflossen)" },
  { german: "frieren", english: "to freeze (friert, fror, gefroren)" },
  { german: "genießen", english: "to enjoy (genießt, genoss, genossen)" },
  { german: "gießen", english: "to pour / to water (gießt, goss, gegossen)" },
  { german: "riechen", english: "to smell (riecht, roch, gerochen)" },
  { german: "rufen", english: "to call / to shout (ruft, rief, gerufen)" },
  { german: "singen", english: "to sing (singt, sang, gesungen)" },
  { german: "sinken", english: "to sink (sinkt, sank, gesunken)" },
  { german: "springen", english: "to jump (springt, sprang, gesprungen)" },
  { german: "steigen", english: "to climb / to rise (steigt, stieg, gestiegen)" },
  { german: "verlieren", english: "to lose (verliert, verlor, verloren)" },
  { german: "wachsen", english: "to grow (wächst, wuchs, gewachsen)" },
  { german: "ziehen", english: "to pull / to move (zieht, zog, gezogen)" },
];

function loadCategoryFile(filename: string): CategoryFile {
  const filePath = path.join(B1_SPLIT_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function saveCategoryFile(filename: string, data: CategoryFile) {
  const filePath = path.join(B1_SPLIT_DIR, filename);
  data.totalCards = data.flashcards.length;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function checkIfExists(verb: string): boolean {
  for (const level of ['a1', 'a2', 'b2', 'c1', 'c2']) {
    const filePath = path.join(LEVELS_DIR, `${level}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes(`"german": "${verb}"`)) {
        return true;
      }
    }
  }
  return false;
}

function generateId(german: string): string {
  const clean = german.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  const random = Math.random().toString(36).substring(2, 8);
  return `b1-irregular-${clean}-${random}`;
}

async function main() {
  console.log('🔧 Fixing B1 Irregular Verbs Duplicates\n');
  console.log('='.repeat(50));

  // Load irregular verbs
  const irregularVerbs = loadCategoryFile('irregular-verbs.json');
  console.log(`\n📂 Current irregular verbs: ${irregularVerbs.flashcards.length}`);

  // Remove duplicates
  const before = irregularVerbs.flashcards.length;
  irregularVerbs.flashcards = irregularVerbs.flashcards.filter(card => {
    const isDuplicate = DUPLICATES.includes(card.german.toLowerCase());
    if (isDuplicate) {
      console.log(`   ❌ Removing duplicate: ${card.german}`);
    }
    return !isDuplicate;
  });

  console.log(`\n✅ Removed ${before - irregularVerbs.flashcards.length} duplicates`);
  console.log(`   Remaining: ${irregularVerbs.flashcards.length} verbs`);

  // Filter new verbs - only add if not in other levels
  const uniqueNewVerbs = NEW_VERBS.filter(verb => !checkIfExists(verb.german));
  console.log(`\n🔍 Checking ${NEW_VERBS.length} potential new verbs...`);
  console.log(`   ✅ Found ${uniqueNewVerbs.length} unique verbs`);

  // Add new unique verbs
  uniqueNewVerbs.forEach(verb => {
    const card: Flashcard = {
      id: generateId(verb.german),
      german: verb.german,
      english: verb.english,
      category: 'Irregular Verbs',
      level: 'B1',
      tags: ['irregular-verbs', 'B1'],
      _meta: {
        source: 'B1 Irregular Verbs Unique Addition 2025',
        lineNumber: irregularVerbs.flashcards.length,
        hierarchy: ['B1', 'Irregular Verbs', verb.german]
      }
    };
    irregularVerbs.flashcards.push(card);
    console.log(`   ➕ Added: ${verb.german}`);
  });

  saveCategoryFile('irregular-verbs.json', irregularVerbs);

  console.log('\n' + '='.repeat(50));
  console.log('✨ Done!');
  console.log(`\n📊 Final count: ${irregularVerbs.flashcards.length} irregular verbs`);
}

main().catch(console.error);
