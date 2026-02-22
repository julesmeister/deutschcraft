import allFlashcards from "@/lib/data/vocabulary/all-flashcards.json";
import a1Index from "@/lib/data/vocabulary/split/a1/_index.json";
import a2Index from "@/lib/data/vocabulary/split/a2/_index.json";
import b1Index from "@/lib/data/vocabulary/split/b1/_index.json";
import b2Index from "@/lib/data/vocabulary/split/b2/_index.json";
import c1Index from "@/lib/data/vocabulary/split/c1/_index.json";
import c2Index from "@/lib/data/vocabulary/split/c2/_index.json";

interface FlashcardData {
  id: string;
  german: string;
  english: string;
  category?: string;
  level: string;
  tags?: string[];
  gender?: string;
  partOfSpeech?: string;
}

interface LevelIndex {
  level: string;
  categories: { name: string; ids: string[] }[];
}

// In-memory map for fast lookups
// Key: wordId (or flashcardId), Value: FlashcardData
let vocabularyMap: Map<string, FlashcardData> | null = null;

// Secondary map: split file ID → category name (e.g., "a1-adjectives-gross-big-tall" → "Adjectives")
let splitIdCategoryMap: Map<string, { category: string; level: string }> | null = null;

function initializeSplitIdMap() {
  if (splitIdCategoryMap) return splitIdCategoryMap;

  splitIdCategoryMap = new Map();
  const indices = [a1Index, a2Index, b1Index, b2Index, c1Index, c2Index] as LevelIndex[];

  for (const index of indices) {
    for (const cat of index.categories) {
      for (const id of cat.ids) {
        splitIdCategoryMap.set(id, { category: cat.name, level: index.level });
      }
    }
  }

  return splitIdCategoryMap;
}

function initializeVocabularyMap() {
  if (vocabularyMap) return vocabularyMap;

  vocabularyMap = new Map();

  // Type assertion since we're importing JSON
  const cards = allFlashcards as FlashcardData[];

  for (const card of cards) {
    // Map by ID
    vocabularyMap.set(card.id, card);
  }

  return vocabularyMap;
}

/**
 * Get vocabulary metadata by ID from static JSON files
 * Avoids database lookups for static content
 * Supports both all-flashcards IDs (e.g., "syllabus-a1-10000")
 * and split file IDs (e.g., "a1-adjectives-gross-big-tall")
 */
export function getVocabularyMetadata(
  wordId: string
): FlashcardData | undefined {
  const map = initializeVocabularyMap();
  const result = map.get(wordId);
  if (result) return result;

  // Fallback: try split file ID → synthesize metadata from index
  const splitMap = initializeSplitIdMap();
  const splitInfo = splitMap.get(wordId);
  if (splitInfo) {
    return {
      id: wordId,
      german: "",
      english: "",
      category: splitInfo.category,
      level: splitInfo.level,
      tags: [],
    };
  }

  return undefined;
}

/**
 * Get all vocabulary metadata
 */
export function getAllVocabularyMetadata(): FlashcardData[] {
  return allFlashcards as FlashcardData[];
}

/**
 * Get display categories for a flashcard, filtering out system tags
 * Filters out: 'syllabus', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
 * Prioritizes tags, falls back to category, then 'Uncategorized'
 */
export function getDisplayCategories(
  metadata: FlashcardData | undefined
): string[] {
  if (!metadata) return ["Uncategorized"];

  const IGNORED_TAGS = new Set([
    "syllabus",
    "A1",
    "A2",
    "B1",
    "B2",
    "C1",
    "C2",
  ]);

  // 1. Try tags first, filtering out ignored ones
  let categories: string[] = [];
  if (metadata.tags && metadata.tags.length > 0) {
    categories = metadata.tags.filter((tag) => !IGNORED_TAGS.has(tag));
  }

  // 2. If no valid tags found (or all were filtered), try category
  if (categories.length === 0 && metadata.category) {
    if (!IGNORED_TAGS.has(metadata.category)) {
      categories.push(metadata.category);
    }
  }

  // 3. Fallback
  if (categories.length === 0) {
    return ["Uncategorized"];
  }

  return categories;
}
