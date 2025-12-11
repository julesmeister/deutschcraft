/**
 * Repopulate B1 Irregular Verbs
 * - Add B1-appropriate irregular verbs (not in other levels)
 * - Fix articles for abstract concepts nouns
 */

import * as fs from 'fs';
import * as path from 'path';

const LEVELS_DIR = path.join(process.cwd(), 'lib/data/vocabulary/levels');
const SPLIT_DIR = path.join(process.cwd(), 'lib/data/vocabulary/split/b1');

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  tags: string[];
  _meta?: {
    source: string;
    lineNumber: number;
    hierarchy: string[];
  };
}

interface CategoryFile {
  level: string;
  category: string;
  totalCards: number;
  flashcards: Flashcard[];
}

// B1-appropriate irregular verbs to add
const NEW_IRREGULAR_VERBS = [
  { german: "backen", english: "to bake (bäckt/backt, backte/buk, gebacken)" },
  { german: "befehlen", english: "to command (befiehlt, befahl, befohlen)" },
  { german: "beweisen", english: "to prove (beweist, bewies, bewiesen)" },
  { german: "biegen", english: "to bend (biegt, bog, gebogen)" },
  { german: "bieten", english: "to offer (bietet, bot, geboten)" },
  { german: "binden", english: "to tie / to bind (bindet, band, gebunden)" },
  { german: "bitten", english: "to ask / to request (bittet, bat, gebeten)" },
  { german: "braten", english: "to fry / to roast (brät, briet, gebraten)" },
  { german: "empfehlen", english: "to recommend (empfiehlt, empfahl, empfohlen)" },
  { german: "erschrecken", english: "to frighten (erschrickt, erschrak, erschrocken)" },
  { german: "fangen", english: "to catch (fängt, fing, gefangen)" },
  { german: "fliegen", english: "to fly (fliegt, flog, geflogen)" },
  { german: "fließen", english: "to flow (fließt, floss, geflossen)" },
  { german: "frieren", english: "to freeze (friert, fror, gefroren)" },
  { german: "gelten", english: "to be valid (gilt, galt, gegolten)" },
  { german: "genießen", english: "to enjoy (genießt, genoss, genossen)" },
  { german: "gießen", english: "to pour / to water (gießt, goss, gegossen)" },
  { german: "greifen", english: "to grasp / to reach (greift, griff, gegriffen)" },
  { german: "heben", english: "to lift / to raise (hebt, hob, gehoben)" },
  { german: "lügen", english: "to lie / to tell a lie (lügt, log, gelogen)" },
  { german: "meiden", english: "to avoid (meidet, mied, gemieden)" },
  { german: "pfeifen", english: "to whistle (pfeift, pfiff, gepfiffen)" },
  { german: "raten", english: "to advise / to guess (rät, riet, geraten)" },
  { german: "reiten", english: "to ride (horse) (reitet, ritt, geritten)" },
  { german: "riechen", english: "to smell (riecht, roch, gerochen)" },
  { german: "rufen", english: "to call / to shout (ruft, rief, gerufen)" },
  { german: "schieben", english: "to push / to shove (schiebt, schob, geschoben)" },
  { german: "schließen", english: "to close (schließt, schloss, geschlossen)" },
  { german: "schweigen", english: "to be silent (schweigt, schwieg, geschwiegen)" },
  { german: "schwimmen", english: "to swim (schwimmt, schwamm, geschwommen)" },
  { german: "singen", english: "to sing (singt, sang, gesungen)" },
  { german: "sinken", english: "to sink (sinkt, sank, gesunken)" },
  { german: "springen", english: "to jump (springt, sprang, gesprungen)" },
  { german: "stechen", english: "to sting / to prick (sticht, stach, gestochen)" },
  { german: "stehlen", english: "to steal (stiehlt, stahl, gestohlen)" },
  { german: "steigen", english: "to climb / to rise (steigt, stieg, gestiegen)" },
  { german: "streiten", english: "to argue / to quarrel (streitet, stritt, gestritten)" },
  { german: "tragen", english: "to carry / to wear (trägt, trug, getragen)" },
  { german: "treten", english: "to step / to kick (tritt, trat, getreten)" },
  { german: "verbieten", english: "to forbid (verbietet, verbot, verboten)" },
  { german: "verlieren", english: "to lose (verliert, verlor, verloren)" },
  { german: "wachsen", english: "to grow (wächst, wuchs, gewachsen)" },
  { german: "werfen", english: "to throw (wirft, warf, geworfen)" },
  { german: "ziehen", english: "to pull / to move (zieht, zog, gezogen)" },
];

// Articles for the abstract concepts nouns we just moved
const NOUN_ARTICLES: Record<string, string> = {
  "beklemmung": "die Beklemmung",
  "beköstigung": "die Beköstigung",
  "bekräftigung": "die Bekräftigung",
  "belag": "der Belag",
  "belagerung": "die Belagerung",
  "belang": "der Belang",
  "belanlosigkeit": "die Belanglosigkeit",
  "belangung": "die Belangung",
  "belappung": "die Belappung",
  "belaschung": "die Belaschung",
  "belastung": "die Belastung",
  "belatmung": "die Beatmung", // Fixed spelling
  "beläubung": "die Betäubung", // Fixed spelling
};

function loadCategoryFile(filename: string): CategoryFile {
  const filePath = path.join(SPLIT_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function saveCategoryFile(filename: string, data: CategoryFile) {
  const filePath = path.join(SPLIT_DIR, filename);
  data.totalCards = data.flashcards.length;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function loadAllLevels(): Map<string, Set<string>> {
  const verbsByLevel = new Map<string, Set<string>>();

  for (const level of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
    const filePath = path.join(LEVELS_DIR, `${level}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      const verbs = new Set<string>();

      data.flashcards.forEach((card: Flashcard) => {
        verbs.add(card.german.toLowerCase().split(' ')[0]); // Get base verb
      });

      verbsByLevel.set(level, verbs);
    }
  }

  return verbsByLevel;
}

function generateId(german: string): string {
  const clean = german.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
  const random = Math.random().toString(36).substring(2, 8);
  return `b1-irregular-${clean}-${random}`;
}

async function main() {
  console.log('🔧 Repopulating B1 Irregular Verbs\n');
  console.log('='.repeat(50));

  // Load all levels to check for duplicates
  console.log('\n📚 Loading existing vocabulary across all levels...');
  const verbsByLevel = loadAllLevels();
  const existingVerbs = new Set<string>();

  verbsByLevel.forEach((verbs, level) => {
    verbs.forEach(verb => existingVerbs.add(verb));
  });

  console.log(`   Found ${existingVerbs.size} unique verbs across all levels`);

  // Filter out verbs that already exist
  const newVerbs = NEW_IRREGULAR_VERBS.filter(verb => {
    const baseVerb = verb.german.toLowerCase().split(' ')[0];
    return !existingVerbs.has(baseVerb);
  });

  console.log(`\n✅ Found ${newVerbs.length} new B1-appropriate irregular verbs to add`);

  // Load irregular-verbs.json
  const irregularVerbs = loadCategoryFile('irregular-verbs.json');
  console.log(`\n📂 Current irregular verbs: ${irregularVerbs.flashcards.length}`);

  // Add new verbs
  newVerbs.forEach(verb => {
    const card: Flashcard = {
      id: generateId(verb.german),
      german: verb.german,
      english: verb.english,
      category: 'Irregular Verbs',
      level: 'B1',
      tags: ['irregular-verbs', 'B1'],
      _meta: {
        source: 'B1 Irregular Verbs Repopulation 2025',
        lineNumber: irregularVerbs.flashcards.length,
        hierarchy: ['B1', 'Irregular Verbs', verb.german]
      }
    };
    irregularVerbs.flashcards.push(card);
  });

  saveCategoryFile('irregular-verbs.json', irregularVerbs);
  console.log(`✅ Updated irregular-verbs.json (${irregularVerbs.flashcards.length} cards)`);

  // Fix abstract concepts articles
  console.log('\n📝 Fixing articles for abstract concepts...');
  const abstractConcepts = loadCategoryFile('abstract-concepts.json');
  let fixedCount = 0;

  abstractConcepts.flashcards.forEach(card => {
    const lowerGerman = card.german.toLowerCase();
    if (NOUN_ARTICLES[lowerGerman]) {
      card.german = NOUN_ARTICLES[lowerGerman];
      fixedCount++;
    }
  });

  saveCategoryFile('abstract-concepts.json', abstractConcepts);
  console.log(`✅ Fixed ${fixedCount} nouns with articles in abstract-concepts.json`);

  console.log('\n' + '='.repeat(50));
  console.log('✨ Done!');
  console.log(`\n📊 Summary:`);
  console.log(`   Irregular Verbs: ${irregularVerbs.flashcards.length} cards (added ${newVerbs.length})`);
  console.log(`   Abstract Concepts: ${fixedCount} nouns now have articles`);
}

main().catch(console.error);
