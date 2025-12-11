/**
 * Fix B1 Irregular Verbs Category
 * Analyzes and redistributes misplaced words to appropriate categories
 */

import * as fs from 'fs';
import * as path from 'path';

const SPLIT_DIR = path.join(process.cwd(), 'lib/data/vocabulary/split/b1');

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

interface CategoryFile {
  level: string;
  category: string;
  totalCards: number;
  flashcards: Flashcard[];
}

// Words to remove (non-existent/invalid)
const REMOVE_WORDS = [
  'belach',
  'belanagel',
  'belarsch',
];

// Nouns to move
const NOUNS = [
  'beklemmung',
  'beköstigung',
  'bekräftigung',
  'belag',
  'belagerung',
  'belang',
  'belanlosigkeit',
  'belangung',
  'belappung',
  'belaschung',
  'belastung',
  'belatmung',
  'beläubung',
];

// Adjectives to move
const ADJECTIVES = [
  'bekümmert',
  'belanglos',
  'belangreich',
  'belastend',
];

// Regular verbs (should stay in intermediate-verbs or be removed)
const REGULAR_VERBS = [
  'bekämpfen',
  'bekleiden',
  'belagern',
  'belasten',
  'bekümmern',
];

// Phrases/multi-word entries to remove
const PHRASES = [
  'belagerte stadt',
];

// Keep these as irregular verbs
const KEEP_IRREGULAR = [
  'beifahren',
  'bekennen',
  'bekneifen',
  'beladen',
  'reißen',
  'streichen',
  'treiben',
];

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

function categorizeWord(german: string): 'remove' | 'noun' | 'adjective' | 'regular-verb' | 'phrase' | 'keep' {
  if (REMOVE_WORDS.includes(german)) return 'remove';
  if (PHRASES.includes(german)) return 'remove';
  if (NOUNS.includes(german)) return 'noun';
  if (ADJECTIVES.includes(german)) return 'adjective';
  if (REGULAR_VERBS.includes(german)) return 'regular-verb';
  if (KEEP_IRREGULAR.includes(german)) return 'keep';
  return 'remove'; // Default: remove unknown words
}

async function main() {
  console.log('🔧 Fixing B1 Irregular Verbs Category\n');
  console.log('='.repeat(50));

  // Load irregular verbs
  const irregularVerbs = loadCategoryFile('irregular-verbs.json');
  console.log(`\n📂 Loaded ${irregularVerbs.flashcards.length} cards from irregular-verbs.json`);

  // Categorize all cards
  const toRemove: Flashcard[] = [];
  const toMoveToNouns: Flashcard[] = [];
  const toMoveToAdjectives: Flashcard[] = [];
  const toMoveToRegularVerbs: Flashcard[] = [];
  const toKeep: Flashcard[] = [];

  irregularVerbs.flashcards.forEach(card => {
    const category = categorizeWord(card.german);
    switch (category) {
      case 'remove':
        toRemove.push(card);
        break;
      case 'noun':
        toMoveToNouns.push(card);
        break;
      case 'adjective':
        toMoveToAdjectives.push(card);
        break;
      case 'regular-verb':
        toMoveToRegularVerbs.push(card);
        break;
      case 'keep':
        toKeep.push(card);
        break;
    }
  });

  console.log('\n📊 Analysis Results:');
  console.log(`   ✅ Keep as irregular verbs: ${toKeep.length}`);
  console.log(`   📝 Move to nouns: ${toMoveToNouns.length}`);
  console.log(`   🎨 Move to adjectives: ${toMoveToAdjectives.length}`);
  console.log(`   🔄 Move to regular verbs: ${toMoveToRegularVerbs.length}`);
  console.log(`   ❌ Remove (invalid): ${toRemove.length}`);

  // Show what will be removed
  if (toRemove.length > 0) {
    console.log('\n❌ Words to remove:');
    toRemove.forEach(card => {
      console.log(`   - ${card.german} (${card.english})`);
    });
  }

  // Update irregular-verbs.json to only keep actual irregular verbs
  irregularVerbs.flashcards = toKeep;
  saveCategoryFile('irregular-verbs.json', irregularVerbs);
  console.log(`\n✅ Updated irregular-verbs.json (${toKeep.length} cards)`);

  // Move nouns to abstract-concepts.json (since they're mostly abstract nouns)
  if (toMoveToNouns.length > 0) {
    const abstractConcepts = loadCategoryFile('abstract-concepts.json');
    toMoveToNouns.forEach(card => {
      card.category = 'Abstract Concepts';
      card._meta.hierarchy[1] = 'Abstract Concepts';
    });
    abstractConcepts.flashcards.push(...toMoveToNouns);
    saveCategoryFile('abstract-concepts.json', abstractConcepts);
    console.log(`✅ Moved ${toMoveToNouns.length} nouns to abstract-concepts.json`);
  }

  // Move adjectives to adjectives.json
  if (toMoveToAdjectives.length > 0) {
    const adjectives = loadCategoryFile('adjectives.json');
    toMoveToAdjectives.forEach(card => {
      card.category = 'Adjectives';
      card._meta.hierarchy[1] = 'Adjectives';
    });
    adjectives.flashcards.push(...toMoveToAdjectives);
    saveCategoryFile('adjectives.json', adjectives);
    console.log(`✅ Moved ${toMoveToAdjectives.length} adjectives to adjectives.json`);
  }

  // Move regular verbs to intermediate-verbs.json
  if (toMoveToRegularVerbs.length > 0) {
    const intermediateVerbs = loadCategoryFile('intermediate-verbs.json');
    toMoveToRegularVerbs.forEach(card => {
      card.category = 'Intermediate Verbs';
      card._meta.hierarchy[1] = 'Intermediate Verbs';
    });
    intermediateVerbs.flashcards.push(...toMoveToRegularVerbs);
    saveCategoryFile('intermediate-verbs.json', intermediateVerbs);
    console.log(`✅ Moved ${toMoveToRegularVerbs.length} regular verbs to intermediate-verbs.json`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ Done! All categories have been fixed.');
  console.log('\n📝 Summary:');
  console.log(`   Irregular Verbs: ${irregularVerbs.flashcards.length} cards`);
  console.log(`   Removed: ${toRemove.length} invalid words`);
  console.log(`   Redistributed: ${toMoveToNouns.length + toMoveToAdjectives.length + toMoveToRegularVerbs.length} words`);
}

main().catch(console.error);
