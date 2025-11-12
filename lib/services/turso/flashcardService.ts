/**
 * Flashcard Service - Turso Implementation
 * Database abstraction layer for flashcard operations using Turso DB
 */

import { db } from '@/turso/client';
import {
  Flashcard,
  FlashcardProgress,
  VocabularyWord,
  StudyProgress,
} from '@/lib/models';
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
// READ OPERATIONS - Progress
// ============================================================================

/**
 * Get flashcard progress for a user
 * @param userId - User's email
 * @returns Array of flashcard progress objects
 */
export async function getFlashcardProgress(userId: string): Promise<FlashcardProgress[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM flashcard_progress WHERE user_id = ? ORDER BY updated_at DESC',
      args: [userId],
    });

    return result.rows.map(rowToFlashcardProgress);
  } catch (error) {
    console.error('[flashcardService:turso] Error fetching flashcard progress:', error);
    throw error;
  }
}

/**
 * Get single flashcard progress
 * @param userId - User's email
 * @param flashcardId - Flashcard ID
 * @returns Flashcard progress object or null
 */
export async function getSingleFlashcardProgress(
  userId: string,
  flashcardId: string
): Promise<FlashcardProgress | null> {
  try {
    const progressId = `${userId}_${flashcardId}`;
    const result = await db.execute({
      sql: 'SELECT * FROM flashcard_progress WHERE id = ? LIMIT 1',
      args: [progressId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToFlashcardProgress(result.rows[0]);
  } catch (error) {
    console.error('[flashcardService:turso] Error fetching single flashcard progress:', error);
    throw error;
  }
}

/**
 * Get study progress for a user (last 30 days)
 * @param userId - User's email
 * @returns Array of study progress objects
 */
export async function getStudyProgress(userId: string): Promise<StudyProgress[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM progress WHERE user_id = ? ORDER BY date DESC LIMIT 30',
      args: [userId],
    });

    return result.rows.map(rowToStudyProgress);
  } catch (error) {
    console.error('[flashcardService:turso] Error fetching study progress:', error);
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS - Progress
// ============================================================================

/**
 * Save or update flashcard progress
 * @param progressId - Combined ID (userId_flashcardId)
 * @param progressData - Flashcard progress data
 */
export async function saveFlashcardProgress(
  progressId: string,
  progressData: Partial<FlashcardProgress>
): Promise<void> {
  try {
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO flashcard_progress (
              id, flashcard_id, user_id, word_id,
              repetitions, ease_factor, interval, next_review_date,
              correct_count, incorrect_count, last_review_date, mastery_level,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              repetitions = excluded.repetitions,
              ease_factor = excluded.ease_factor,
              interval = excluded.interval,
              next_review_date = excluded.next_review_date,
              correct_count = excluded.correct_count,
              incorrect_count = excluded.incorrect_count,
              last_review_date = excluded.last_review_date,
              mastery_level = excluded.mastery_level,
              updated_at = excluded.updated_at`,
      args: [
        progressId,
        progressData.flashcardId || '',
        progressData.userId || '',
        progressData.wordId || '',
        progressData.repetitions || 0,
        progressData.easeFactor || 2.5,
        progressData.interval || 1,
        progressData.nextReviewDate || now,
        progressData.correctCount || 0,
        progressData.incorrectCount || 0,
        progressData.lastReviewDate || null,
        progressData.masteryLevel || 0,
        progressData.createdAt || now,
        now,
      ],
    });
  } catch (error) {
    console.error('[flashcardService:turso] Error saving flashcard progress:', error);
    throw error;
  }
}

/**
 * Save or update daily study progress
 * @param userId - User's email
 * @param stats - Study statistics
 */
export async function saveDailyProgress(
  userId: string,
  stats: {
    cardsReviewed: number;
    timeSpent: number;
    correctCount: number;
    incorrectCount: number;
  }
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayFormatted = today.replace(/-/g, '');
    const progressId = `PROG_${todayFormatted}_${userId}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO progress (
              progress_id, user_id, date,
              words_studied, words_correct, words_incorrect, time_spent,
              sessions_completed, cards_reviewed, sentences_created,
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(progress_id) DO UPDATE SET
              cards_reviewed = cards_reviewed + excluded.cards_reviewed,
              time_spent = time_spent + excluded.time_spent,
              words_correct = words_correct + excluded.words_correct,
              words_incorrect = words_incorrect + excluded.words_incorrect,
              sessions_completed = sessions_completed + 1`,
      args: [
        progressId,
        userId,
        today,
        stats.cardsReviewed,
        stats.correctCount,
        stats.incorrectCount,
        stats.timeSpent,
        1,
        stats.cardsReviewed,
        0,
        now,
      ],
    });
  } catch (error) {
    console.error('[flashcardService:turso] Error saving daily progress:', error);
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

function rowToFlashcardProgress(row: any): FlashcardProgress {
  return {
    flashcardId: row.flashcard_id as string,
    userId: row.user_id as string,
    wordId: row.word_id as string,
    repetitions: row.repetitions as number,
    easeFactor: row.ease_factor as number,
    interval: row.interval as number,
    nextReviewDate: row.next_review_date as number,
    correctCount: row.correct_count as number,
    incorrectCount: row.incorrect_count as number,
    lastReviewDate: row.last_review_date as number | null | undefined,
    masteryLevel: row.mastery_level as number,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function rowToStudyProgress(row: any): StudyProgress {
  return {
    progressId: row.progress_id as string,
    userId: row.user_id as string,
    date: row.date as string,
    wordsStudied: row.words_studied as number,
    wordsCorrect: row.words_correct as number,
    wordsIncorrect: row.words_incorrect as number,
    timeSpent: row.time_spent as number,
    sessionsCompleted: row.sessions_completed as number,
    cardsReviewed: row.cards_reviewed as number,
    sentencesCreated: row.sentences_created as number,
    createdAt: row.created_at as number,
  };
}
