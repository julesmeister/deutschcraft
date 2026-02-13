/**
 * Turso Flashcard Service - Statistics Operations
 * Handles practice and study statistics calculations
 */

import { db } from "@/turso/client";
import {
  fetchUserProgress,
  calculateStreak,
} from "@/lib/services/progressService";

/**
 * Get practice statistics for a user
 * - Cards ready for practice (next review date is today or earlier)
 * - Words to review (cards reviewed but need another look)
 * @param userId - User's email
 * @returns Practice statistics
 */
export async function getPracticeStats(userId: string): Promise<{
  cardsReady: number;
  wordsToReview: number;
  totalCards: number;
}> {
  try {
    const now = Date.now();

    // Get stats with a single query
    const result = await db.execute({
      sql: `
        SELECT 
          COUNT(*) as total_cards,
          SUM(CASE WHEN next_review_date <= ? THEN 1 ELSE 0 END) as cards_ready,
          SUM(CASE WHEN correct_count > 0 AND mastery_level < 80 THEN 1 ELSE 0 END) as words_to_review
        FROM flashcard_progress 
        WHERE user_id = ?
      `,
      args: [now, userId],
    });

    const row = result.rows[0];

    return {
      cardsReady: Number(row.cards_ready) || 0,
      wordsToReview: Number(row.words_to_review) || 0,
      totalCards: Number(row.total_cards) || 0,
    };
  } catch (error) {
    console.error(
      "[flashcardService:turso] Error getting practice stats:",
      error
    );
    throw error;
  }
}

/**
 * Get comprehensive study statistics for a user
 * - Total cards in progress
 * - Cards learned (reviewed at least once)
 * - Cards mastered (70%+ mastery level)
 * - Current study streak
 * - Overall accuracy percentage
 * @param userId - User's email
 * @returns Study statistics
 */
export async function getStudyStats(userId: string): Promise<{
  totalCards: number;
  cardsLearned: number;
  cardsMastered: number;
  streak: number;
  accuracy: number;
}> {
  try {
    // Get flashcard stats + game stats in parallel
    const [flashcardResult, pacmanResult, derdiedasResult] = await Promise.all([
      db.execute({
        sql: `
          SELECT
            COUNT(*) as total_cards,
            SUM(CASE WHEN repetitions > 0 THEN 1 ELSE 0 END) as cards_learned,
            SUM(CASE WHEN mastery_level >= 70 THEN 1 ELSE 0 END) as cards_mastered,
            SUM(correct_count) as total_correct,
            SUM(incorrect_count) as total_incorrect
          FROM flashcard_progress
          WHERE user_id = ?
        `,
        args: [userId],
      }),
      db.execute({
        sql: `SELECT COUNT(*) as total, COALESCE(SUM(correct_count), 0) as correct FROM pacman_verb_progress WHERE user_id = ?`,
        args: [userId],
      }),
      db.execute({
        sql: `SELECT COUNT(*) as total, COALESCE(SUM(correct_count), 0) as correct FROM derdiedas_progress WHERE user_id = ?`,
        args: [userId],
      }),
    ]);

    const row = flashcardResult.rows[0];

    // Check if we got any data
    if (!row) {
      return {
        totalCards: 0,
        cardsLearned: 0,
        cardsMastered: 0,
        streak: 0,
        accuracy: 0,
      };
    }

    const totalCards = Number(row.total_cards) || 0;
    const cardsLearned = Number(row.cards_learned) || 0;
    const cardsMastered = Number(row.cards_mastered) || 0;
    const totalCorrect = Number(row.total_correct) || 0;
    const totalIncorrect = Number(row.total_incorrect) || 0;

    // Add game items to cardsLearned and correct counts
    const pacmanItems = Number(pacmanResult.rows[0]?.total) || 0;
    const pacmanCorrect = Number(pacmanResult.rows[0]?.correct) || 0;
    const derdiedasItems = Number(derdiedasResult.rows[0]?.total) || 0;
    const derdiedasCorrect = Number(derdiedasResult.rows[0]?.correct) || 0;

    const combinedCardsLearned = cardsLearned + pacmanItems + derdiedasItems;
    const combinedCorrect = totalCorrect + pacmanCorrect + derdiedasCorrect;

    const totalAttempts = combinedCorrect + totalIncorrect;
    const accuracy =
      totalAttempts > 0 ? Math.round((combinedCorrect / totalAttempts) * 100) : 0;

    // Fetch study progress for streak calculation
    // Note: We use the progressService which is already switched to use Turso if configured
    const studyProgressData = await fetchUserProgress(userId, 30);
    const streak = calculateStreak(studyProgressData);

    return {
      totalCards: totalCards + pacmanItems + derdiedasItems,
      cardsLearned: combinedCardsLearned,
      cardsMastered,
      streak,
      accuracy,
    };
  } catch (error) {
    console.error("[flashcardService:turso] Error getting study stats:", error);
    throw error;
  }
}
