/**
 * Analyze B2 Categories
 * Check which categories have fewer than 30 cards
 */

import fs from 'fs';
import path from 'path';

const B2_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'split', 'b2');

interface CategoryFile {
  level: string;
  category: string;
  totalCards: number;
  flashcards: any[];
}

const files = fs.readdirSync(B2_DIR)
  .filter(f => f.endsWith('.json') && !f.startsWith('_'));

const categories: Array<{ file: string; category: string; count: number }> = [];

for (const file of files) {
  const filePath = path.join(B2_DIR, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CategoryFile;

  categories.push({
    file: file,
    category: content.category,
    count: content.flashcards.length
  });
}

// Sort by count
categories.sort((a, b) => a.count - b.count);

console.log('📊 B2 Category Analysis\n');
console.log('Categories with <30 cards:\n');

const small = categories.filter(c => c.count < 30);
small.forEach(c => {
  console.log(`   ${c.count.toString().padStart(2)} cards - ${c.category} (${c.file})`);
});

console.log(`\n📈 All Categories (sorted by size):\n`);
categories.forEach(c => {
  const status = c.count < 30 ? '❗' : '✅';
  console.log(`   ${status} ${c.count.toString().padStart(3)} cards - ${c.category}`);
});

console.log(`\n📊 Summary:`);
console.log(`   Total categories: ${categories.length}`);
console.log(`   Under 30 cards: ${small.length}`);
console.log(`   30+ cards: ${categories.length - small.length}`);
console.log(`   Total B2 cards: ${categories.reduce((sum, c) => sum + c.count, 0)}`);
