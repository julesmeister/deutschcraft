/**
 * Analyze Reflexive Verbs Across All Levels
 */

import fs from 'fs';
import path from 'path';

const VOCAB_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'split');

interface VocabFile {
  level: string;
  category: string;
  totalCards: number;
  flashcards: Array<{
    id: string;
    german: string;
    english: string;
    category: string;
    level: string;
  }>;
}

const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

console.log('📊 Reflexive Verbs Analysis Across All Levels\n');
console.log('═══════════════════════════════════════════════\n');

let totalReflexive = 0;

for (const level of levels) {
  const filePath = path.join(VOCAB_DIR, level, 'reflexive-verbs.json');

  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as VocabFile;
    console.log(`${level.toUpperCase()}: ${content.totalCards} reflexive verbs`);
    totalReflexive += content.totalCards;

    // Show first 5 examples
    console.log('   Examples:');
    content.flashcards.slice(0, 5).forEach(card => {
      console.log(`   - ${card.german} (${card.english})`);
    });
    console.log();
  } else {
    console.log(`${level.toUpperCase()}: No reflexive verbs file found\n`);
  }
}

console.log('═══════════════════════════════════════════════');
console.log(`\n📈 Total Reflexive Verbs: ${totalReflexive}`);
console.log(`🎯 Target: 250+`);
console.log(`📝 Need to add: ${Math.max(0, 250 - totalReflexive)} more verbs\n`);
