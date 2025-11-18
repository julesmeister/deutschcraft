/**
 * Script to extract nouns that are missing articles
 * Run with: npx tsx scripts/extract-missing-nouns.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import nounArticles from '../lib/data/vocabulary/noun-articles.json';

const SPLIT_DIR = path.join(__dirname, '../lib/data/vocabulary/split');

// Categories that contain nouns
const NOUN_CATEGORIES = [
  'Animals',
  'Body Parts',
  'Clothing',
  'Colors',
  'Countries',
  'Family',
  'Food Drinks',
  'Fruits',
  'Home',
  'Numbers',
  'Time',
  'Transportation',
  'Vegetables',
  'Weather',
  'Professions',
  'Places',
  'Objects',
  'Nature',
  'Education',
  'Technology',
];

interface Flashcard {
  german: string;
  english: string;
  category: string;
  level: string;
}

interface VocabFile {
  flashcards: Flashcard[];
}

const missingNouns = new Map<string, { english: string; category: string; level: string }>();

function extractMissingNouns(filePath: string, level: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data: VocabFile = JSON.parse(content);

  data.flashcards.forEach(card => {
    // Only process nouns
    if (!NOUN_CATEGORIES.some(cat => card.category.includes(cat))) {
      return;
    }

    // Skip if already has article
    if (card.german.startsWith('der ') || card.german.startsWith('die ') || card.german.startsWith('das ')) {
      return;
    }

    // Skip verbs, adjectives, adverbs, phrases
    if (
      card.german.includes(' ') || // phrases
      card.english.startsWith('to ') || // verbs
      /^\w+en$/.test(card.german) // verbs ending in -en
    ) {
      return;
    }

    const cleanWord = card.german.replace(/^(der|die|das)\s+/, '');

    // Check if in our mapping
    if (!(nounArticles.articles as Record<string, string>)[cleanWord]) {
      if (!missingNouns.has(cleanWord)) {
        missingNouns.set(cleanWord, {
          english: card.english,
          category: card.category,
          level: card.level,
        });
      }
    }
  });
}

function processAllFiles() {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

  for (const level of levels) {
    const levelDir = path.join(SPLIT_DIR, level);

    if (!fs.existsSync(levelDir)) continue;

    const files = fs.readdirSync(levelDir).filter(f => f.endsWith('.json') && f !== '_index.json');

    for (const file of files) {
      const filePath = path.join(levelDir, file);
      extractMissingNouns(filePath, level.toUpperCase());
    }
  }

  // Sort alphabetically
  const sorted = Array.from(missingNouns.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  console.log('Missing Nouns (need articles):');
  console.log('================================\n');

  // Group by level
  const byLevel = new Map<string, Array<[string, any]>>();
  sorted.forEach(([word, info]) => {
    if (!byLevel.has(info.level)) {
      byLevel.set(info.level, []);
    }
    byLevel.get(info.level)!.push([word, info]);
  });

  for (const [level, words] of byLevel.entries()) {
    console.log(`\n${level} (${words.length} nouns):`);
    console.log('---');
    words.slice(0, 50).forEach(([word, info]) => {
      console.log(`"${word}": "???",  // ${info.english} (${info.category})`);
    });
    if (words.length > 50) {
      console.log(`... and ${words.length - 50} more`);
    }
  }

  console.log(`\n\nTotal missing: ${missingNouns.size} nouns`);
}

processAllFiles();
