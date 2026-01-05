import allFlashcards from "@/lib/data/vocabulary/all-flashcards.json";

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

// In-memory map for fast lookups
// Key: wordId (or flashcardId), Value: FlashcardData
let vocabularyMap: Map<string, FlashcardData> | null = null;

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
 */
export function getVocabularyMetadata(
  wordId: string
): FlashcardData | undefined {
  const map = initializeVocabularyMap();
  return map.get(wordId);
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
