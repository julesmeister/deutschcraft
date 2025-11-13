/**
 * Flashcard Service - Database abstraction layer for flashcard operations
 *
 * This service has been split into smaller modules to maintain the 300-line guideline:
 * - flashcards/vocabulary.ts - Flashcard and vocabulary word operations
 * - flashcards/progress.ts - Progress tracking and daily progress
 * - flashcards/stats.ts - Practice and study statistics
 *
 * This file maintains backward compatibility by re-exporting all functions.
 * All imports continue to work as before:
 * import { getFlashcardsByLevel } from '@/lib/services/flashcardService';
 * import { getFlashcardsByLevel } from '@/lib/services';
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firestore operations are isolated in the flashcards/ modules
 * - Hooks call these functions instead of using Firestore directly
 * - Easy to swap to PostgreSQL/MongoDB by changing module implementations
 */

// Re-export all functions from the modular flashcards service
export * from './flashcards';

// ============================================================================
// POSTGRESQL MIGRATION EXAMPLE (commented out)
// ============================================================================

/*
// To switch to PostgreSQL, replace the implementations above with:

import { sql } from '@vercel/postgres';

export async function getFlashcardsByLevel(level: CEFRLevel): Promise<Flashcard[]> {
  const result = await sql`
    SELECT * FROM flashcards
    WHERE level = ${level}
    ORDER BY created_at DESC
  `;

  return result.rows as Flashcard[];
}

export async function getFlashcardProgress(userId: string): Promise<FlashcardProgress[]> {
  const result = await sql`
    SELECT * FROM flashcard_progress
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `;

  return result.rows as FlashcardProgress[];
}

export async function saveFlashcardProgress(
  progressId: string,
  progressData: Partial<FlashcardProgress>
): Promise<void> {
  const { userId, flashcardId, wordId, repetitions, easeFactor, interval, nextReviewDate, masteryLevel, correctCount, incorrectCount } = progressData;

  await sql`
    INSERT INTO flashcard_progress (
      id, user_id, flashcard_id, word_id, repetitions, ease_factor, interval,
      next_review_date, mastery_level, correct_count, incorrect_count, updated_at
    )
    VALUES (
      ${progressId}, ${userId}, ${flashcardId}, ${wordId}, ${repetitions}, ${easeFactor}, ${interval},
      ${nextReviewDate}, ${masteryLevel}, ${correctCount}, ${incorrectCount}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      repetitions = EXCLUDED.repetitions,
      ease_factor = EXCLUDED.ease_factor,
      interval = EXCLUDED.interval,
      next_review_date = EXCLUDED.next_review_date,
      mastery_level = EXCLUDED.mastery_level,
      correct_count = EXCLUDED.correct_count,
      incorrect_count = EXCLUDED.incorrect_count,
      updated_at = NOW()
  `;
}

export async function saveDailyProgress(
  userId: string,
  stats: {
    cardsReviewed: number;
    timeSpent: number;
    correctCount: number;
    incorrectCount: number;
  }
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const progressId = `PROG_${today.replace(/-/g, '')}_${userId}`;

  await sql`
    INSERT INTO progress (
      id, user_id, date, cards_reviewed, time_spent, words_correct, words_incorrect, sessions_completed
    )
    VALUES (
      ${progressId}, ${userId}, ${today}, ${stats.cardsReviewed}, ${stats.timeSpent},
      ${stats.correctCount}, ${stats.incorrectCount}, 1
    )
    ON CONFLICT (id) DO UPDATE SET
      cards_reviewed = progress.cards_reviewed + EXCLUDED.cards_reviewed,
      time_spent = progress.time_spent + EXCLUDED.time_spent,
      words_correct = progress.words_correct + EXCLUDED.words_correct,
      words_incorrect = progress.words_incorrect + EXCLUDED.words_incorrect,
      sessions_completed = progress.sessions_completed + 1
  `;
}
*/
