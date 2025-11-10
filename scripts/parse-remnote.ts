/**
 * RemNote German Vocabulary Parser
 * Converts RemNote markdown format to JSON flashcards
 */

import * as fs from 'fs';
import * as path from 'path';

interface Flashcard {
  id: string;
  front: string;  // German word/phrase
  back: string;   // English translation
  category?: string;
  level: CEFRLevel;
  tags: string[];
  exampleSentences?: string[];
  notes?: string;
  metadata?: {
    source: string;
    lineNumber: number;
    hierarchy: string[];
  };
}

type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface ParsedData {
  flashcards: Flashcard[];
  categories: Set<string>;
  hierarchy: string[];
}

/**
 * Determine CEFR level based on word characteristics
 * Improved distribution based on actual German learning progression:
 * - A1: Most basic, high-frequency words
 * - A2: Common everyday vocabulary
 * - B1: Intermediate, separable verbs, compound words
 * - B2: Advanced vocabulary, complex structures
 * - C1/C2: Specialized, abstract, idiomatic
 */
function determineCEFRLevel(word: string, category: string, tags: string[]): CEFRLevel {
  const lowerWord = word.toLowerCase();

  // A1 Level: Most basic, high-frequency words (top 500 German words)
  const a1Words = [
    'sein', 'haben', 'werden', 'können', 'müssen', 'sagen', 'machen', 'geben', 'kommen', 'sollen',
    'wollen', 'gehen', 'wissen', 'sehen', 'lassen', 'stehen', 'finden', 'bleiben', 'liegen', 'heißen',
    'gut', 'groß', 'neu', 'erste', 'lang', 'deutsch', 'viel', 'ganz', 'mehr', 'wenig',
    'heute', 'hier', 'jetzt', 'immer', 'sehr', 'auch', 'noch', 'nur', 'schon', 'wie',
    'aber', 'oder', 'und', 'nicht', 'ja', 'nein', 'danke', 'bitte'
  ];

  // A2 Level: Common everyday words
  const a2Words = [
    'nehmen', 'tun', 'bringen', 'zeigen', 'brauchen', 'denken', 'helfen', 'kaufen', 'leben', 'lernen',
    'sprechen', 'arbeiten', 'essen', 'trinken', 'schlafen', 'laufen', 'fahren', 'spielen', 'lesen', 'schreiben',
    'klein', 'jung', 'alt', 'schnell', 'langsam', 'einfach', 'schwer', 'wichtig', 'richtig', 'falsch',
    'gestern', 'morgen', 'oft', 'manchmal', 'dort', 'dann', 'deshalb', 'weil'
  ];

  // Check if it's a very basic word (EXACT match only for RemNote words)
  if (a1Words.some(kw => lowerWord === kw)) {
    return 'A1';
  }
  if (a2Words.some(kw => lowerWord === kw)) {
    return 'A2';
  }

  // Category-based intelligent assignment
  if (category === 'Richtung') {
    // RemNote directional phrases are intermediate level (not basic "links/rechts")
    return 'B1';
  }

  if (category === 'Gempowerment') {
    // Motivational phrases: B1-B2 (typically more complex)
    return lowerWord.length > 25 ? 'B2' : 'B1';
  }

  if (category === 'Verbs') {
    // RemNote verbs are ALL intermediate+ level
    // Separable prefix verbs -> B1 (taught at intermediate level)
    if (lowerWord.startsWith('ab') || lowerWord.startsWith('an') ||
        lowerWord.startsWith('auf') || lowerWord.startsWith('aus') ||
        lowerWord.startsWith('ein') || lowerWord.startsWith('mit') ||
        lowerWord.startsWith('zu') || lowerWord.startsWith('vor')) {
      return 'B1';
    }

    // Inseparable prefix verbs (be-, er-, ver-, etc.) -> B1-B2
    if (lowerWord.startsWith('be') || lowerWord.startsWith('er') ||
        lowerWord.startsWith('ver') || lowerWord.startsWith('zer') ||
        lowerWord.startsWith('ent') || lowerWord.startsWith('ge')) {
      return lowerWord.length > 10 ? 'B2' : 'B1';
    }

    // Long complex verbs -> B2-C1
    if (lowerWord.length > 12) return 'B2';
    if (lowerWord.length > 15) return 'C1';

    // All other RemNote verbs: B1 minimum (they're from advanced study notes)
    return 'B1';
  }

  if (category === 'Adverbs') {
    // All RemNote adverbs are intermediate+ level
    if (lowerWord.length <= 9) return 'B1';
    return 'B2';
  }

  if (category === 'Redemittel') {
    // Short phrases -> B1
    if (lowerWord.length <= 15) return 'B1';

    // Medium phrases -> B2
    if (lowerWord.length <= 30) return 'B2';

    // Long, complex phrases -> C1
    return 'C1';
  }

  if (category === 'Da / Wo-Wörter') {
    // Da/Wo compounds: B1 level (two-way prepositions)
    return 'B1';
  }

  if (category === 'Liste der Verben mit Präpositionen') {
    // Verbs with prepositions: B2 level (advanced grammar)
    return 'B2';
  }

  // Default distribution for uncategorized RemNote words
  // All RemNote vocabulary is intermediate+ level (B1 minimum)
  if (lowerWord.length <= 9) return 'B1';
  if (lowerWord.length <= 13) return 'B2';
  return 'C1';
}

/**
 * Parse RemNote markdown file
 */
function parseRemNoteFile(filePath: string): ParsedData {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const flashcards: Flashcard[] = [];
  const categories = new Set<string>();
  const hierarchyStack: string[] = [];
  let currentCategory = 'Uncategorized';
  let flashcardId = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Skip empty lines
    if (!line.trim()) continue;

    // Calculate indentation level
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    const level = Math.floor(indent / 4);

    // Remove leading dash and whitespace
    const cleanLine = line.trim().replace(/^-\s*/, '');

    // Skip lines with portal markers or infinite recursion warnings
    if (cleanLine.includes('Portal') ||
        cleanLine.includes('Avoided infinite recursion') ||
        cleanLine.includes('{{') ||
        cleanLine.includes('Aliases')) {
      continue;
    }

    // Update hierarchy stack
    const hierarchyItem = cleanLine.split('↔')[0].trim();
    hierarchyStack[level] = hierarchyItem;
    hierarchyStack.length = level + 1;

    // Check if line contains a flashcard (has ↔ delimiter)
    if (cleanLine.includes('↔')) {
      const [front, back] = cleanLine.split('↔').map(s => s.trim());

      // Skip if front or back is empty
      if (!front || !back) continue;

      // Determine category from hierarchy
      if (level > 0) {
        currentCategory = hierarchyStack[0] || 'Uncategorized';
        categories.add(currentCategory);
      }

      // Collect example sentences (lines after the flashcard that don't have ↔)
      const exampleSentences: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        if (!nextLine) break;
        if (nextLine.startsWith('-')) break;

        // Clean up example sentences
        const cleanExample = nextLine
          .replace(/^-\s*/, '')
          .replace(/\*\*/g, '')  // Remove bold
          .replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1')  // Extract link text
          .trim();

        if (cleanExample && !cleanExample.includes('{{') && !cleanExample.includes('→')) {
          exampleSentences.push(cleanExample);
        }
        j++;
      }

      // Extract tags from hierarchy
      const tags: string[] = [];
      if (hierarchyStack.length > 1) {
        tags.push(...hierarchyStack.slice(1, -1).filter(Boolean));
      }

      // Determine CEFR level
      const cefrLevel = determineCEFRLevel(front, currentCategory, tags);

      // Remap generic category names to specific ones
      const specificCategory = remapCategory(front, currentCategory, cefrLevel);

      // Create flashcard
      const flashcard: Flashcard = {
        id: `remnote-${flashcardId++}`,
        front,
        back,
        category: specificCategory,
        level: cefrLevel,
        tags,
        exampleSentences: exampleSentences.length > 0 ? exampleSentences : undefined,
        metadata: {
          source: 'RemNote German.md',
          lineNumber,
          hierarchy: [...hierarchyStack],
        },
      };

      flashcards.push(flashcard);
    }
  }

  return {
    flashcards,
    categories,
    hierarchy: [],
  };
}

/**
 * Remap generic category names to specific ones based on verb type and level
 */
function remapCategory(word: string, category: string, level: CEFRLevel): string {
  // Remap Gempowerment (old school name) to Redemittel (functional phrases)
  if (category === 'Gempowerment') {
    return 'Redemittel';
  }

  // Exclude ALL RemNote entries from "Liste der Verben mit Präpositionen"
  // The syllabus files have properly formatted verbs with prepositions + cases
  // RemNote entries don't show prepositions consistently, so we exclude them all
  if (category === 'Liste der Verben mit Präpositionen') {
    return 'Intermediate Verbs';
  }

  // Only remap the generic "Verbs" category from RemNote
  if (category !== 'Verbs') {
    return category;
  }

  const lowerWord = word.toLowerCase();

  // Exclude sentences and non-verb entries
  if (word.length > 30 || word.includes(' ') || word.startsWith('das ') || word.startsWith('die ') || word.startsWith('der ')) {
    return 'Intermediate Verbs'; // These aren't proper verbs for categorization
  }

  // Exclude specific RemNote verbs that are improperly formatted or duplicates
  const excludedVerbs = ['veranstalten', 'verzichten...auf'];
  if (excludedVerbs.includes(word)) {
    return 'Intermediate Verbs';
  }

  // Modal verbs
  const modalVerbs = ['können', 'müssen', 'wollen', 'mögen', 'dürfen', 'sollen'];
  if (modalVerbs.includes(lowerWord)) {
    return 'Modal Verbs';
  }

  // Separable verbs (has separable prefix)
  const separablePrefixes = ['ab', 'an', 'auf', 'aus', 'ein', 'mit', 'nach', 'vor', 'zu', 'zurück', 'weg', 'her', 'hin'];
  if (separablePrefixes.some(prefix => lowerWord.startsWith(prefix))) {
    return 'Separable Verbs';
  }

  // Reflexive verbs (contains "sich")
  if (lowerWord.includes('sich')) {
    return 'Reflexive Verbs';
  }

  // Positional verbs (liegen, stehen, sitzen, etc.)
  const positionalVerbs = ['liegen', 'stehen', 'sitzen', 'hängen', 'stecken', 'legen', 'stellen', 'setzen'];
  if (positionalVerbs.includes(lowerWord)) {
    return 'Positional Verbs';
  }

  // State change verbs
  const stateChangeVerbs = ['werden', 'bleiben', 'scheinen', 'wirken'];
  if (stateChangeVerbs.includes(lowerWord)) {
    return 'State Change Verbs';
  }

  // Irregular verbs (common irregular verbs)
  const irregularVerbs = ['sein', 'haben', 'gehen', 'kommen', 'sehen', 'essen', 'trinken', 'schlafen',
                          'geben', 'nehmen', 'lesen', 'sprechen', 'fahren', 'laufen', 'schreiben',
                          'finden', 'tragen', 'waschen', 'helfen'];
  if (irregularVerbs.includes(lowerWord)) {
    return 'Irregular Verbs';
  }

  // Verbs with prepositions
  if (word.includes('mit') || word.includes('an') || word.includes('auf') || word.includes('für')) {
    return 'Verbs With Prepositions';
  }

  // Default: categorize by level
  if (level === 'A1' || level === 'A2') {
    return 'Regular Verbs';
  } else if (level === 'B1' || level === 'B2') {
    return 'Intermediate Verbs';
  } else {
    return 'Advanced Verbs';
  }
}

/**
 * Group flashcards by category
 */
function groupByCategory(flashcards: Flashcard[]): Record<string, Flashcard[]> {
  const grouped: Record<string, Flashcard[]> = {};

  for (const card of flashcards) {
    const category = card.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(card);
  }

  return grouped;
}

/**
 * Group flashcards by CEFR level
 */
function groupByLevel(flashcards: Flashcard[]): Record<CEFRLevel, Flashcard[]> {
  const grouped: Record<string, Flashcard[]> = {
    'A1': [],
    'A2': [],
    'B1': [],
    'B2': [],
    'C1': [],
    'C2': [],
  };

  for (const card of flashcards) {
    grouped[card.level].push(card);
  }

  return grouped as Record<CEFRLevel, Flashcard[]>;
}

/**
 * Clean and simplify flashcard for export
 */
function simplifyFlashcard(card: Flashcard) {
  return {
    id: card.id,
    german: card.front,
    english: card.back,
    category: card.category,
    level: card.level,
    tags: card.tags.length > 0 ? card.tags : undefined,
    examples: card.exampleSentences,
    // Keep metadata for debugging but can be removed later
    _meta: card.metadata,
  };
}

/**
 * Main execution
 */
function main() {
  const inputPath = path.join(
    __dirname,
    '..',
    'remnote-german',
    'German.md'
  );

  const outputDir = path.join(__dirname, '..', 'lib', 'data', 'remnote');
  const levelsDir = path.join(outputDir, 'levels');

  console.log('📖 Parsing RemNote German vocabulary...');
  console.log(`   Input: ${inputPath}`);

  const parsed = parseRemNoteFile(inputPath);

  console.log(`\n✅ Parsed ${parsed.flashcards.length} RemNote flashcards`);
  console.log(`📂 Found ${parsed.categories.size} categories:`);
  Array.from(parsed.categories).forEach(cat => console.log(`   - ${cat}`));

  // Load syllabus vocabulary from separate category files
  console.log('\n📚 Adding syllabus-based vocabulary...');
  let syllabusIdCounter = 10000; // Start IDs from 10000 to avoid conflicts

  function loadSyllabusLevel(level: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2'): Flashcard[] {
    const levelDir = path.join(__dirname, '..', 'lib', 'data', 'syllabus', level);
    const cards: Flashcard[] = [];

    if (!fs.existsSync(levelDir)) {
      console.log(`   📂 ${level.toUpperCase()} directory not found (empty level)`);
      return cards;
    }

    const files = fs.readdirSync(levelDir).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
      console.log(`   📂 ${level.toUpperCase()} has no vocabulary files yet`);
      return cards;
    }

    for (const file of files) {
      const filePath = path.join(levelDir, file);
      const categoryName = file
        .replace('.json', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const words = JSON.parse(fileContent) as { german: string; english: string; examples?: any[] }[];

        for (const word of words) {
          cards.push({
            id: `syllabus-${level}-${syllabusIdCounter++}`,
            front: word.german,
            back: word.english,
            category: categoryName,
            level: level.toUpperCase() as CEFRLevel,
            tags: ['syllabus', level.toUpperCase()],
            exampleSentences: word.examples?.map(ex => `${ex.german} → ${ex.english}`),
            metadata: {
              source: `Syllabus ${level.toUpperCase()}`,
              lineNumber: 0,
              hierarchy: [level.toUpperCase(), categoryName, word.german],
            },
          });
        }

        console.log(`   📁 Loaded ${words.length} words from ${categoryName} (${level.toUpperCase()})`);
      } catch (error) {
        console.log(`   ⚠️  Error loading ${file}: ${error}`);
      }
    }

    return cards;
  }

  const a1SyllabusCards = loadSyllabusLevel('a1');
  const a2SyllabusCards = loadSyllabusLevel('a2');
  const b1SyllabusCards = loadSyllabusLevel('b1');
  const b2SyllabusCards = loadSyllabusLevel('b2');
  const c1SyllabusCards = loadSyllabusLevel('c1');
  const c2SyllabusCards = loadSyllabusLevel('c2');

  const totalSyllabus = a1SyllabusCards.length + a2SyllabusCards.length +
                        b1SyllabusCards.length + b2SyllabusCards.length +
                        c1SyllabusCards.length + c2SyllabusCards.length;

  console.log(`\n   ✅ Total syllabus vocabulary: ${totalSyllabus} cards`);
  console.log(`      A1: ${a1SyllabusCards.length} | A2: ${a2SyllabusCards.length} | B1: ${b1SyllabusCards.length} | B2: ${b2SyllabusCards.length} | C1: ${c1SyllabusCards.length} | C2: ${c2SyllabusCards.length}`);

  // Merge all flashcards
  const allFlashcards = [
    ...a1SyllabusCards,
    ...a2SyllabusCards,
    ...b1SyllabusCards,
    ...b2SyllabusCards,
    ...c1SyllabusCards,
    ...c2SyllabusCards,
    ...parsed.flashcards
  ];
  console.log(`\n📊 Total flashcards: ${allFlashcards.length}`);

  // Create output directories
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(levelsDir)) {
    fs.mkdirSync(levelsDir, { recursive: true });
  }

  // Group by category and level (using merged flashcards)
  const groupedByCategory = groupByCategory(allFlashcards);
  const groupedByLevel = groupByLevel(allFlashcards);

  // Write all flashcards to one file
  const allFlashcardsSimplified = allFlashcards.map(simplifyFlashcard);
  fs.writeFileSync(
    path.join(outputDir, 'all-flashcards.json'),
    JSON.stringify(allFlashcardsSimplified, null, 2),
    'utf-8'
  );
  console.log(`\n💾 Saved all flashcards to: all-flashcards.json`);

  // Write category files
  let categoryCount = 0;
  for (const [category, cards] of Object.entries(groupedByCategory)) {
    const filename = category
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const simplified = cards.map(simplifyFlashcard);

    fs.writeFileSync(
      path.join(outputDir, `${filename}.json`),
      JSON.stringify(simplified, null, 2),
      'utf-8'
    );

    categoryCount++;
  }
  console.log(`📁 Saved ${categoryCount} category files`);

  // Write level-based files
  console.log('\n📊 Writing level-based files...');
  const levelStats: Record<CEFRLevel, { count: number; categories: Record<string, number> }> = {
    'A1': { count: 0, categories: {} },
    'A2': { count: 0, categories: {} },
    'B1': { count: 0, categories: {} },
    'B2': { count: 0, categories: {} },
    'C1': { count: 0, categories: {} },
    'C2': { count: 0, categories: {} },
  };

  for (const [level, cards] of Object.entries(groupedByLevel)) {
    const simplified = cards.map(simplifyFlashcard);
    const cefrLevel = level as CEFRLevel;

    // Track statistics
    levelStats[cefrLevel].count = cards.length;
    for (const card of cards) {
      const cat = card.category || 'Uncategorized';
      levelStats[cefrLevel].categories[cat] = (levelStats[cefrLevel].categories[cat] || 0) + 1;
    }

    // Write level file
    fs.writeFileSync(
      path.join(levelsDir, `${level.toLowerCase()}.json`),
      JSON.stringify({
        level: level,
        totalCards: cards.length,
        flashcards: simplified,
      }, null, 2),
      'utf-8'
    );

    console.log(`   - ${level}: ${cards.length} cards`);
  }
  console.log(`✅ Saved 6 level files to: levels/`);

  // Write summary/stats file
  const allCategories = new Set([...Array.from(parsed.categories), 'Greetings', 'Pronouns', 'Basic Verbs', 'Family', 'Numbers', 'Colors', 'Food & Drinks', 'Home', 'Clothing', 'Time', 'Weather', 'Transportation', 'Professions', 'Workplace', 'Travel', 'Body & Health', 'Hobbies', 'Technology', 'Shopping', 'Time Expressions', 'Education', 'Nature', 'Feelings', 'Modal Verbs', 'Common Verbs']);

  const stats = {
    totalFlashcards: allFlashcards.length,
    totalCategories: allCategories.size,
    categories: Array.from(allCategories),
    categoryCounts: Object.entries(groupedByCategory).map(([category, cards]) => ({
      category,
      count: cards.length,
    })).sort((a, b) => b.count - a.count),
    levelDistribution: levelStats,
    sources: {
      syllabus: a1SyllabusCards.length + a2SyllabusCards.length,
      remnote: parsed.flashcards.length,
    },
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(outputDir, 'stats.json'),
    JSON.stringify(stats, null, 2),
    'utf-8'
  );
  console.log('📊 Saved statistics to: stats.json');

  console.log('\n🎉 Done! Files saved to:', outputDir);
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

export { parseRemNoteFile, groupByCategory, groupByLevel, simplifyFlashcard, determineCEFRLevel };
