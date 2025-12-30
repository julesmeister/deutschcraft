
import fs from 'fs';
import path from 'path';

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const SPLIT_BASE_DIR = path.join(process.cwd(), 'lib', 'data', 'vocabulary', 'split');

interface CategoryEntry {
  name: string;
  count: number;
  file: string;
  ids?: string[];
}

interface IndexFile {
  level: string;
  totalCards: number;
  totalCategories: number;
  categories: CategoryEntry[];
}

interface Flashcard {
  id: string;
  [key: string]: any;
}

interface CategoryFile {
  flashcards: Flashcard[];
  [key: string]: any;
}

function updateLevel(level: string) {
  const levelDir = path.join(SPLIT_BASE_DIR, level);
  const indexFilePath = path.join(levelDir, '_index.json');

  if (!fs.existsSync(indexFilePath)) {
    console.warn(`Skipping ${level}: _index.json not found`);
    return;
  }

  try {
    const indexContent = fs.readFileSync(indexFilePath, 'utf-8');
    const indexData = JSON.parse(indexContent) as IndexFile;

    console.log(`Processing ${level}...`);

    for (const category of indexData.categories) {
      const categoryFilePath = path.join(levelDir, category.file);
      
      if (fs.existsSync(categoryFilePath)) {
        const categoryContent = fs.readFileSync(categoryFilePath, 'utf-8');
        const categoryData = JSON.parse(categoryContent) as CategoryFile;
        
        // Extract IDs
        category.ids = categoryData.flashcards.map(f => f.id);
        
        // Update count just in case
        category.count = categoryData.flashcards.length;
        
        console.log(`  Updated ${category.name}: ${category.ids.length} IDs`);
      } else {
        console.warn(`  Warning: File ${category.file} not found for category ${category.name}`);
        category.ids = [];
      }
    }

    // Update totals
    indexData.totalCards = indexData.categories.reduce((sum, cat) => sum + (cat.ids?.length || 0), 0);
    indexData.totalCategories = indexData.categories.length;

    // Save _index.json
    fs.writeFileSync(indexFilePath, JSON.stringify(indexData, null, 2));
    console.log(`Saved ${level}/_index.json`);

  } catch (error) {
    console.error(`Error processing ${level}:`, error);
  }
}

async function main() {
  for (const level of LEVELS) {
    updateLevel(level);
  }
}

main().catch(console.error);
