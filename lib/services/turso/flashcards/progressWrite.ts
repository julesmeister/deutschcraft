/**
 * Turso Flashcard Service - Progress Write Operations
 * Handles saving flashcard progress and daily study statistics
 */

import { db } from '@/turso/client';
import { FlashcardProgress } from '@/lib/models';

// ============================================================================
// WRITE OPERATIONS - Progress
// ============================================================================

/**
 * Save or update flashcard progress (Enhanced with SRS state tracking)
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
              id, flashcard_id, user_id, word_id, level,
              state,
              repetitions, ease_factor, interval, next_review_date,
              correct_count, incorrect_count, last_review_date, mastery_level,
              consecutive_correct, consecutive_incorrect,
              lapse_count, last_lapse_date,
              first_seen_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              state = excluded.state,
              repetitions = excluded.repetitions,
              ease_factor = excluded.ease_factor,
              interval = excluded.interval,
              next_review_date = excluded.next_review_date,
              correct_count = excluded.correct_count,
              incorrect_count = excluded.incorrect_count,
              last_review_date = excluded.last_review_date,
              mastery_level = excluded.mastery_level,
              consecutive_correct = excluded.consecutive_correct,
              consecutive_incorrect = excluded.consecutive_incorrect,
              lapse_count = excluded.lapse_count,
              last_lapse_date = excluded.last_lapse_date,
              updated_at = excluded.updated_at`,
      args: [
        progressId,
        progressData.flashcardId || '',
        progressData.userId || '',
        progressData.wordId || '',
        progressData.level || null,
        progressData.state || 'new',
        progressData.repetitions || 0,
        progressData.easeFactor || 2.5,
        progressData.interval || 1,
        progressData.nextReviewDate || now,
        progressData.correctCount || 0,
        progressData.incorrectCount || 0,
        progressData.lastReviewDate || null,
        progressData.masteryLevel || 0,
        progressData.consecutiveCorrect || 0,
        progressData.consecutiveIncorrect || 0,
        progressData.lapseCount || 0,
        progressData.lastLapseDate || null,
        progressData.firstSeenAt || now,
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
