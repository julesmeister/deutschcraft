/**
 * Turso Flashcard Service - Vocabulary Module
 * Handles flashcard and vocabulary word read operations
 */

import { db } from '@/turso/client';
import { Flashcard, VocabularyWord } from '@/lib/models';
import { CEFRLevel } from '@/lib/models/cefr';

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
    const result = await db.execute({
      sql: 'SELECT * FROM flashcards WHERE level = ? ORDER BY created_at DESC',
      args: [level],
    });

    return result.rows.map(rowToFlashcard);
  } catch (error) {
    console.error('[flashcardService:turso] Error fetching flashcards:', error);
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
    const result = await db.execute({
      sql: 'SELECT * FROM vocabulary WHERE word_id = ? LIMIT 1',
      args: [wordId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToVocabularyWord(result.rows[0]);
  } catch (error) {
    console.error('[flashcardService:turso] Error fetching vocabulary word:', error);
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
    const result = await db.execute({
      sql: 'SELECT * FROM vocabulary WHERE level = ? ORDER BY german_word ASC',
      args: [level],
    });

    return result.rows.map(rowToVocabularyWord);
  } catch (error) {
    console.error('[flashcardService:turso] Error fetching vocabulary:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToFlashcard(row: any): Flashcard {
  return {
    id: row.id as string,
    wordId: row.word_id as string,
    question: row.question as string,
    correctAnswer: row.correct_answer as string,
    wrongAnswers: JSON.parse(row.wrong_answers as string),
    type: row.type as 'translation' | 'fill-in-blank' | 'multiple-choice',
    level: row.level as CEFRLevel,
    createdAt: row.created_at as number,
  };
}

function rowToVocabularyWord(row: any): VocabularyWord {
  return {
    wordId: row.word_id as string,
    germanWord: row.german_word as string,
    englishTranslation: row.english_translation as string,
    partOfSpeech: row.part_of_speech as string | undefined,
    gender: row.gender as string | undefined,
    level: row.level as CEFRLevel,
    exampleSentence: row.example_sentence as string | undefined,
    exampleTranslation: row.example_translation as string | undefined,
    audioUrl: row.audio_url as string | undefined,
    frequency: row.frequency as number,
    tags: row.tags ? JSON.parse(row.tags as string) : [],
    createdAt: row.created_at as number,
  };
}
