/**
 * Clean hashtags from English translations in intermediate-verbs.json files
 * Removes patterns like "#verben", "#Verbs", "#stub", etc.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  tags?: string[];
  _meta?: any;
}

interface VocabFile {
  level: string;
  category: string;
  totalCards: number;
  flashcards: Flashcard[];
}

const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const baseDir = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'split');

function cleanHashtags(text: string): string {
  // Remove all hashtags (# followed by alphanumeric characters)
  // Also trim any extra whitespace that might result
  return text
    .replace(/#[a-zA-Z0-9_]+/g, '') // Remove hashtags
    .replace(/\s+/g, ' ')            // Normalize whitespace
    .trim();                          // Trim edges
}

function cleanIntermediateVerbs() {
  let totalCleaned = 0;
  let filesProcessed = 0;

  for (const level of levels) {
    const filePath = path.join(baseDir, level, 'intermediate-verbs.json');

    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${level}/intermediate-verbs.json (not found)`);
      continue;
    }

    console.log(`\n📂 Processing ${level}/intermediate-verbs.json...`);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: VocabFile = JSON.parse(fileContent);

    let cleanedInFile = 0;

    data.flashcards.forEach((card) => {
      const original = card.english;
      const cleaned = cleanHashtags(card.english);

      if (original !== cleaned) {
        console.log(`  ✂️  "${card.german}"`);
        console.log(`     Before: ${original}`);
        console.log(`     After:  ${cleaned}`);
        card.english = cleaned;
        cleanedInFile++;
      }
    });

    if (cleanedInFile > 0) {
      // Write back to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  ✅ Cleaned ${cleanedInFile} cards in ${level}`);
      totalCleaned += cleanedInFile;
      filesProcessed++;
    } else {
      console.log(`  ✨ No hashtags found - already clean!`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Done! Cleaned ${totalCleaned} cards across ${filesProcessed} files`);
}

// Run the script
cleanIntermediateVerbs();
