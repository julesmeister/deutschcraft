/**
 * Expand Reflexive Verbs for A2 and B1
 * A2: Everyday, common reflexive verbs (50 new verbs)
 * B1: More complex, specific reflexive verbs (40 new verbs)
 */

import fs from 'fs';
import path from 'path';

const VOCAB_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'split');

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  tags: string[];
  _meta: {
    source: string;
    lineNumber: number;
    hierarchy: string[];
  };
}

interface VocabFile {
  level: string;
  category: string;
  totalCards: number;
  flashcards: Flashcard[];
}

// Load all existing words to check for duplicates
function loadAllWords(): Set<string> {
  const allWords = new Set<string>();
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

  for (const level of levels) {
    const levelDir = path.join(VOCAB_DIR, level);
    if (!fs.existsSync(levelDir)) continue;

    const files = fs.readdirSync(levelDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(levelDir, file), 'utf-8')) as VocabFile;
        if (content && content.flashcards && Array.isArray(content.flashcards)) {
          content.flashcards.forEach(card => {
            allWords.add(card.german.toLowerCase());
          });
        }
      } catch (error) {}
    }
  }

  return allWords;
}

// A2: Common, everyday reflexive verbs
const A2_REFLEXIVE_VERBS = [
  { german: 'sich anmelden', english: 'to register / to sign up' },
  { german: 'sich abmelden', english: 'to sign off / to unregister' },
  { german: 'sich anziehen', english: 'to get dressed' },
  { german: 'sich ausziehen', english: 'to get undressed' },
  { german: 'sich umziehen', english: 'to change clothes' },
  { german: 'sich waschen', english: 'to wash oneself' },
  { german: 'sich duschen', english: 'to shower / to take a shower' },
  { german: 'sich baden', english: 'to take a bath' },
  { german: 'sich kämmen', english: 'to comb one\'s hair' },
  { german: 'sich schminken', english: 'to put on makeup' },
  { german: 'sich rasieren', english: 'to shave' },
  { german: 'sich putzen', english: 'to clean oneself / to brush (teeth)' },
  { german: 'sich die Zähne putzen', english: 'to brush one\'s teeth' },
  { german: 'sich die Hände waschen', english: 'to wash one\'s hands' },
  { german: 'sich hinlegen', english: 'to lie down' },
  { german: 'sich hinsetzen', english: 'to sit down' },
  { german: 'sich hinstellen', english: 'to stand (somewhere)' },
  { german: 'sich ausruhen', english: 'to rest' },
  { german: 'sich entspannen', english: 'to relax' },
  { german: 'sich erholen', english: 'to recover / to relax' },
  { german: 'sich erkälten', english: 'to catch a cold' },
  { german: 'sich verletzen', english: 'to injure oneself / to get hurt' },
  { german: 'sich verbrennen', english: 'to burn oneself' },
  { german: 'sich schneiden', english: 'to cut oneself' },
  { german: 'sich freuen auf', english: 'to look forward to' },
  { german: 'sich freuen über', english: 'to be happy about' },
  { german: 'sich ärgern über', english: 'to be annoyed about' },
  { german: 'sich aufregen über', english: 'to get upset about' },
  { german: 'sich sorgen um', english: 'to worry about' },
  { german: 'sich Sorgen machen', english: 'to worry' },
  { german: 'sich fürchten vor', english: 'to be afraid of' },
  { german: 'sich schämen', english: 'to be ashamed' },
  { german: 'sich schämen für', english: 'to be ashamed of' },
  { german: 'sich verlieben in', english: 'to fall in love with' },
  { german: 'sich trennen von', english: 'to separate from / to break up with' },
  { german: 'sich streiten mit', english: 'to argue with' },
  { german: 'sich versöhnen mit', english: 'to reconcile with / to make up with' },
  { german: 'sich verabschieden von', english: 'to say goodbye to' },
  { german: 'sich bedanken bei', english: 'to thank' },
  { german: 'sich entschuldigen bei', english: 'to apologize to' },
  { german: 'sich entschuldigen für', english: 'to apologize for' },
  { german: 'sich beschweren bei', english: 'to complain to' },
  { german: 'sich beschweren über', english: 'to complain about' },
  { german: 'sich melden', english: 'to get in touch / to respond' },
  { german: 'sich umdrehen', english: 'to turn around' },
  { german: 'sich umsehen', english: 'to look around' },
  { german: 'sich umhören', english: 'to ask around / to inquire' },
  { german: 'sich erkundigen nach', english: 'to inquire about' },
  { german: 'sich orientieren', english: 'to orient oneself / to find one\'s way' },
  { german: 'sich verlaufen', english: 'to get lost (on foot)' },
  { german: 'sich verfahren', english: 'to get lost (by car)' },
  { german: 'sich verspäten', english: 'to be late' },
  { german: 'sich verhalten', english: 'to behave' },
  { german: 'sich benehmen', english: 'to behave / to conduct oneself' },
  { german: 'sich verstecken', english: 'to hide' }
];

// B1: More complex, specific reflexive verbs
const B1_REFLEXIVE_VERBS = [
  { german: 'sich einigen auf', english: 'to agree on' },
  { german: 'sich einigen mit', english: 'to come to an agreement with' },
  { german: 'sich aussprechen für', english: 'to speak out for / to advocate' },
  { german: 'sich aussprechen gegen', english: 'to speak out against' },
  { german: 'sich aussprechen mit', english: 'to have a frank talk with' },
  { german: 'sich einsetzen für', english: 'to stand up for / to campaign for' },
  { german: 'sich engagieren für', english: 'to be committed to / to work for' },
  { german: 'sich widmen', english: 'to dedicate oneself to' },
  { german: 'sich konzentrieren auf', english: 'to concentrate on' },
  { german: 'sich bemühen um', english: 'to make an effort / to try hard' },
  { german: 'sich anstrengen', english: 'to make an effort / to exert oneself' },
  { german: 'sich vornehmen', english: 'to intend / to plan / to resolve' },
  { german: 'sich vorstellen', english: 'to imagine' },
  { german: 'sich durchsetzen', english: 'to prevail / to assert oneself' },
  { german: 'sich wehren', english: 'to defend oneself / to fight back' },
  { german: 'sich rächen', english: 'to take revenge / to get revenge' },
  { german: 'sich rächen an', english: 'to take revenge on' },
  { german: 'sich richten nach', english: 'to go by / to follow' },
  { german: 'sich richten an', english: 'to be directed at / to address' },
  { german: 'sich beziehen auf', english: 'to refer to' },
  { german: 'sich berufen auf', english: 'to refer to / to invoke' },
  { german: 'sich verlassen auf', english: 'to rely on / to count on' },
  { german: 'sich beschäftigen mit', english: 'to deal with / to occupy oneself with' },
  { german: 'sich befassen mit', english: 'to deal with / to concern oneself with' },
  { german: 'sich auseinandersetzen mit', english: 'to deal with / to come to terms with' },
  { german: 'sich auskennen', english: 'to know one\'s way around / to be knowledgeable' },
  { german: 'sich auskennen mit', english: 'to be familiar with' },
  { german: 'sich zurechtfinden', english: 'to find one\'s way / to get oriented' },
  { german: 'sich anpassen an', english: 'to adapt to / to adjust to' },
  { german: 'sich gewöhnen an', english: 'to get used to' },
  { german: 'sich umgewöhnen', english: 'to readjust / to change one\'s habits' },
  { german: 'sich verändern', english: 'to change (oneself)' },
  { german: 'sich verwandeln in', english: 'to transform into / to turn into' },
  { german: 'sich entwickeln', english: 'to develop / to evolve' },
  { german: 'sich verbessern', english: 'to improve' },
  { german: 'sich verschlechtern', english: 'to worsen / to deteriorate' },
  { german: 'sich lohnen', english: 'to be worthwhile' },
  { german: 'sich rentieren', english: 'to be profitable / to pay off' },
  { german: 'sich eignen für', english: 'to be suitable for' },
  { german: 'sich handeln um', english: 'to be about / to concern' }
];

function addReflexiveVerbs() {
  const existingWords = loadAllWords();

  console.log('🔄 Expanding Reflexive Verbs for A2 and B1\n');
  console.log('═══════════════════════════════════════════════\n');

  // Add A2 reflexive verbs
  const a2FilePath = path.join(VOCAB_DIR, 'a2', 'reflexive-verbs.json');
  const a2File = JSON.parse(fs.readFileSync(a2FilePath, 'utf-8')) as VocabFile;
  const a2Original = a2File.flashcards.length;
  let a2Added = 0;
  let a2Skipped = 0;

  for (const verb of A2_REFLEXIVE_VERBS) {
    if (existingWords.has(verb.german.toLowerCase())) {
      a2Skipped++;
      continue;
    }

    const flashcard: Flashcard = {
      id: `a2-reflexive-${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`,
      german: verb.german,
      english: verb.english,
      category: 'Reflexive Verbs',
      level: 'A2',
      tags: ['reflexive', 'A2', 'expansion'],
      _meta: {
        source: 'Reflexive Verbs Expansion 2025',
        lineNumber: a2File.flashcards.length,
        hierarchy: ['A2', 'Reflexive Verbs', verb.german]
      }
    };

    a2File.flashcards.push(flashcard);
    existingWords.add(verb.german.toLowerCase());
    a2Added++;
  }

  a2File.totalCards = a2File.flashcards.length;
  fs.writeFileSync(a2FilePath, JSON.stringify(a2File, null, 2), 'utf-8');

  console.log(`✅ A2 Reflexive Verbs`);
  console.log(`   ${a2Original} → ${a2File.totalCards} cards (+${a2Added})`);
  if (a2Skipped > 0) {
    console.log(`   ⚠️  Skipped ${a2Skipped} duplicates`);
  }
  console.log();

  // Add B1 reflexive verbs
  const b1FilePath = path.join(VOCAB_DIR, 'b1', 'reflexive-verbs.json');
  const b1File = JSON.parse(fs.readFileSync(b1FilePath, 'utf-8')) as VocabFile;
  const b1Original = b1File.flashcards.length;
  let b1Added = 0;
  let b1Skipped = 0;

  for (const verb of B1_REFLEXIVE_VERBS) {
    if (existingWords.has(verb.german.toLowerCase())) {
      b1Skipped++;
      continue;
    }

    const flashcard: Flashcard = {
      id: `b1-reflexive-${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`,
      german: verb.german,
      english: verb.english,
      category: 'Reflexive Verbs',
      level: 'B1',
      tags: ['reflexive', 'B1', 'expansion'],
      _meta: {
        source: 'Reflexive Verbs Expansion 2025',
        lineNumber: b1File.flashcards.length,
        hierarchy: ['B1', 'Reflexive Verbs', verb.german]
      }
    };

    b1File.flashcards.push(flashcard);
    existingWords.add(verb.german.toLowerCase());
    b1Added++;
  }

  b1File.totalCards = b1File.flashcards.length;
  fs.writeFileSync(b1FilePath, JSON.stringify(b1File, null, 2), 'utf-8');

  console.log(`✅ B1 Reflexive Verbs`);
  console.log(`   ${b1Original} → ${b1File.totalCards} cards (+${b1Added})`);
  if (b1Skipped > 0) {
    console.log(`   ⚠️  Skipped ${b1Skipped} duplicates`);
  }
  console.log();

  console.log('═══════════════════════════════════════════════');
  console.log(`\n📊 Summary:`);
  console.log(`   A2: +${a2Added} verbs (${a2Skipped} duplicates skipped)`);
  console.log(`   B1: +${b1Added} verbs (${b1Skipped} duplicates skipped)`);
  console.log(`   Total added: ${a2Added + b1Added} reflexive verbs`);
  console.log(`\n💡 Next: Run analysis to verify total count`);
  console.log(`   npx tsx scripts/analyze-reflexive-verbs.ts\n`);
}

addReflexiveVerbs();
