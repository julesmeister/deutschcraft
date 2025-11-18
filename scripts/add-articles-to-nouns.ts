/**
 * Script to add German articles (der/die/das) to nouns in vocabulary files
 * Run with: npx tsx scripts/add-articles-to-nouns.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import nounArticles from '../lib/data/vocabulary/noun-articles.json';

const SPLIT_DIR = path.join(__dirname, '../lib/data/vocabulary/split');
const ALL_FLASHCARDS_PATH = path.join(__dirname, '../lib/data/vocabulary/all-flashcards.json');

// Categories that contain nouns (not verbs, adjectives, etc.)
const NOUN_CATEGORIES = [
  'Animals',
  'Body Parts',
  'Clothing',
  'Colors', // Some colors can be nouns
  'Countries',
  'Family',
  'Food Drinks',
  'Fruits',
  'Home',
  'Numbers', // Cardinal numbers as nouns
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
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  tags: string[];
  _meta?: any;
}

interface VocabFile {
  level: string;
  category: string;
  totalCards: number;
  flashcards: Flashcard[];
}

function shouldAddArticle(category: string, german: string): boolean {
  // Skip if already has an article
  if (german.startsWith('der ') || german.startsWith('die ') || german.startsWith('das ')) {
    return false;
  }

  // Only add to noun categories
  return NOUN_CATEGORIES.some(cat => category.includes(cat));
}

function getArticle(word: string): string | null {
  // Remove any existing articles
  const cleanWord = word.replace(/^(der|die|das)\s+/, '');

  // Look up in our mapping
  return (nounArticles.articles as Record<string, string>)[cleanWord] || null;
}

function addArticleToWord(word: string): string {
  const article = getArticle(word);
  if (article) {
    // Remove any existing article first
    const cleanWord = word.replace(/^(der|die|das)\s+/, '');
    return `${article} ${cleanWord}`;
  }
  return word;
}

function processVocabFile(filePath: string): { updated: number; skipped: number; missing: number } {
  console.log(`Processing: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const data: VocabFile = JSON.parse(content);

  let updated = 0;
  let skipped = 0;
  let missing = 0;

  data.flashcards = data.flashcards.map(card => {
    if (shouldAddArticle(card.category, card.german)) {
      const article = getArticle(card.german);

      if (article) {
        const newGerman = addArticleToWord(card.german);
        if (newGerman !== card.german) {
          console.log(`  ✓ ${card.german} → ${newGerman}`);
          updated++;
          return { ...card, german: newGerman };
        }
      } else {
        console.log(`  ⚠ Missing article for: ${card.german}`);
        missing++;
      }
    } else {
      skipped++;
    }

    return card;
  });

  // Update total cards
  data.totalCards = data.flashcards.length;

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  return { updated, skipped, missing };
}

function processAllFiles() {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalMissing = 0;

  console.log('Starting to add articles to nouns...\n');

  for (const level of levels) {
    const levelDir = path.join(SPLIT_DIR, level);

    if (!fs.existsSync(levelDir)) {
      console.log(`Skipping ${level} (directory not found)`);
      continue;
    }

    console.log(`\n📁 Processing ${level.toUpperCase()} level...`);

    const files = fs.readdirSync(levelDir).filter(f => f.endsWith('.json') && f !== '_index.json');

    for (const file of files) {
      const filePath = path.join(levelDir, file);
      const { updated, skipped, missing } = processVocabFile(filePath);
      totalUpdated += updated;
      totalSkipped += skipped;
      totalMissing += missing;
    }
  }

  console.log('\n✨ Summary:');
  console.log(`  Updated: ${totalUpdated} nouns`);
  console.log(`  Skipped: ${totalSkipped} words (not nouns or already have articles)`);
  console.log(`  Missing: ${totalMissing} nouns (need manual article assignment)`);

  if (totalMissing > 0) {
    console.log('\n⚠️  Some nouns are missing article mappings.');
    console.log('   Please update lib/data/vocabulary/noun-articles.json');
  }
}

// Run the script
processAllFiles();
