/**
 * Turso Flashcard Service - Vocabulary Module
 * Handles flashcard and vocabulary word read operations
 * 
 * NOTE: Reads directly from JSON files as the source of truth for content,
 * while Turso is used for progress tracking.
 */

import { Flashcard, VocabularyWord } from '@/lib/models';
import { CEFRLevel } from '@/lib/models/cefr';

// Lazy load level data to avoid bundling all JSONs
const levelLoaders: Record<string, () => Promise<any>> = {
  A1: () => import('@/lib/data/vocabulary/levels/a1.json'),
  A2: () => import('@/lib/data/vocabulary/levels/a2.json'),
  B1: () => import('@/lib/data/vocabulary/levels/b1.json'),
  B2: () => import('@/lib/data/vocabulary/levels/b2.json'),
  C1: () => import('@/lib/data/vocabulary/levels/c1.json'),
  C2: () => import('@/lib/data/vocabulary/levels/c2.json'),
};

// ============================================================================
// READ OPERATIONS - Flashcards
// ============================================================================

/**
 * Get flashcards by level
 * @param level - CEFR level (A1-C2)
 * @returns Array of flashcard objects
 */
export async function getFlashcardsByLevel(level: CEFRLevel): Promise<Flashcard[]> {
  try {
    const loader = levelLoaders[level];
    if (!loader) {
      console.warn(`[flashcardService] No loader found for level ${level}`);
      return [];
    }

    const data = await loader();
    // Handle both default export (JSON module) and direct property access
    const fileContent = data.default || data;
    
    return (fileContent.flashcards || []).map(jsonToFlashcard);
  } catch (error) {
    console.error('[flashcardService] Error fetching flashcards:', error);
    throw error;
  }
}

/**
 * Get vocabulary word by ID
 * @param wordId - Vocabulary word ID
 * @returns Vocabulary word object or null
 */
export async function getVocabularyWord(wordId: string): Promise<VocabularyWord | null> {
  try {
    // 1. Try to infer level from ID (Semantic ID: level-category-german-english)
    // Example: a1-greetings-hallo-hello
    const levelMatch = wordId.match(/^([a-z][0-9])-|^([a-z][0-9])$/i);
    
    if (levelMatch) {
      const level = (levelMatch[1] || levelMatch[2]).toUpperCase() as CEFRLevel;
      if (levelLoaders[level]) {
        const data = await levelLoaders[level]();
        const fileContent = data.default || data;
        const found = (fileContent.flashcards || []).find((c: any) => c.id === wordId);
        if (found) return jsonToVocabularyWord(found);
      }
    }

    // 2. Fallback: Search all levels (inefficient but necessary if ID doesn't contain level)
    for (const level of Object.keys(levelLoaders)) {
      const loader = levelLoaders[level];
      const data = await loader();
      const fileContent = data.default || data;
      const found = (fileContent.flashcards || []).find((c: any) => c.id === wordId);
      if (found) return jsonToVocabularyWord(found);
    }

    return null;
  } catch (error) {
    console.error('[flashcardService] Error fetching vocabulary word:', error);
    throw error;
  }
}

/**
 * Get all vocabulary words by level
 * @param level - CEFR level (A1-C2)
 * @returns Array of vocabulary words
 */
export async function getVocabularyByLevel(level: CEFRLevel): Promise<VocabularyWord[]> {
  try {
    const loader = levelLoaders[level];
    if (!loader) return [];

    const data = await loader();
    const fileContent = data.default || data;
    
    return (fileContent.flashcards || []).map(jsonToVocabularyWord);
  } catch (error) {
    console.error('[flashcardService] Error fetching vocabulary:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function jsonToFlashcard(json: any): Flashcard {
  return {
    id: json.id,
    wordId: json.id, // In JSON, id is the wordId
    question: json.german,
    correctAnswer: json.english,
    wrongAnswers: [], // JSON doesn't store wrong answers
    type: 'translation',
    level: json.level as CEFRLevel,
    createdAt: Date.now(), // Static files don't have created_at, use current time or 0
  };
}

function jsonToVocabularyWord(json: any): VocabularyWord {
  return {
    wordId: json.id,
    germanWord: json.german,
    englishTranslation: json.english,
    partOfSpeech: json.partOfSpeech,
    gender: json.gender,
    level: json.level as CEFRLevel,
    exampleSentence: json.example,
    exampleTranslation: json.exampleTranslation,
    audioUrl: undefined,
    frequency: 5, // Default
    tags: json.tags || (json.category ? [json.category] : []),
    createdAt: Date.now(),
  };
}
