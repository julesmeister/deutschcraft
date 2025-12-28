/**
 * Turso Flashcard Service - Progress Read Operations
 * Handles fetching flashcard progress and study statistics
 */

import { db } from "@/turso/client";
import {
  FlashcardProgress,
  StudyProgress,
  CardState,
  CategoryStats,
} from "@/lib/models";
import {
  getVocabularyMetadata,
  getDisplayCategories,
} from "@/lib/services/vocabularyData";

// ============================================================================
// READ OPERATIONS - Progress
// ============================================================================

/**
 * Get flashcard progress for a user
 * @param userId - User's email
 * @returns Array of flashcard progress objects
 */
export async function getFlashcardProgress(
  userId: string
): Promise<FlashcardProgress[]> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM flashcard_progress WHERE user_id = ? ORDER BY updated_at DESC",
      args: [userId],
    });

    return result.rows.map(rowToFlashcardProgress);
  } catch (error) {
    console.error(
      "[flashcardService:turso] Error fetching flashcard progress:",
      error
    );
    throw error;
  }
}

/**
 * Get flashcard progress grouped by category
 * Joins progress with vocabulary table to get category information
 * @param userId - User's email
 * @returns Array of category statistics
 */
export async function getCategoryProgress(
  userId: string
): Promise<CategoryStats[]> {
  try {
    // 1. Fetch only progress data from DB (no JOINs)
    const result = await db.execute({
      sql: `
        SELECT
          word_id,
          repetitions,
          mastery_level
        FROM flashcard_progress
        WHERE user_id = ?
      `,
      args: [userId],
    });

    // 2. Aggregate in memory using static JSON data
    const statsMap = new Map<
      string,
      { total: number; learned: number; mastered: number }
    >();

    for (const row of result.rows) {
      const wordId = row.word_id as string;
      const repetitions = (row.repetitions as number) || 0;
      const masteryLevel = (row.mastery_level as number) || 0;

      // Look up metadata from JSON file instead of DB
      const metadata = getVocabularyMetadata(wordId);
      const tags = getDisplayCategories(metadata);

      // Add stats for EACH tag
      for (const tag of tags) {
        const current = statsMap.get(tag) || {
          total: 0,
          learned: 0,
          mastered: 0,
        };

        current.total++;
        if (repetitions > 0) current.learned++;
        if (masteryLevel >= 70) current.mastered++;

        statsMap.set(tag, current);
      }
    }

    // 3. Convert to array and sort
    const statsArray: CategoryStats[] = Array.from(statsMap.entries()).map(
      ([category, stats]) => ({
        category,
        total: stats.total,
        learned: stats.learned,
        mastered: stats.mastered,
        percentage: stats.total
          ? Math.round((stats.learned / stats.total) * 100)
          : 0,
      })
    );

    // Sort by learned count descending
    return statsArray.sort((a, b) => b.learned - a.learned);
  } catch (error) {
    console.error(
      "[flashcardService:turso] Error fetching category progress:",
      error
    );
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
      sql: "SELECT * FROM flashcard_progress WHERE id = ? LIMIT 1",
      args: [progressId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToFlashcardProgress(result.rows[0]);
  } catch (error) {
    console.error(
      "[flashcardService:turso] Error fetching single flashcard progress:",
      error
    );
    throw error;
  }
}

/**
 * Get study progress for a user (last 30 days)
 * @param userId - User's email
 * @returns Array of study progress objects
 */
export async function getStudyProgress(
  userId: string
): Promise<StudyProgress[]> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM progress WHERE user_id = ? ORDER BY date DESC LIMIT 30",
      args: [userId],
    });

    return result.rows.map(rowToStudyProgress);
  } catch (error) {
    console.error(
      "[flashcardService:turso] Error fetching study progress:",
      error
    );
    throw error;
  }
}

/**
 * Get recent study progress entries across all users
 * Used for activity feeds and dashboard
 * @param limit - Maximum number of entries to return
 * @returns Array of study progress objects sorted by date (most recent first)
 */
export async function getRecentStudyProgress(
  limit: number = 20
): Promise<StudyProgress[]> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM progress ORDER BY date DESC LIMIT ?",
      args: [limit],
    });

    return result.rows.map(rowToStudyProgress);
  } catch (error) {
    console.error(
      "[flashcardService:turso] Error fetching recent study progress:",
      error
    );
    throw error;
  }
}

/**
 * Get flashcard progress by card state
 * @param userId - User's email
 * @param state - Card state to filter by
 * @param limit - Maximum number of cards to return
 * @returns Array of flashcard progress objects
 */
export async function getFlashcardProgressByState(
  userId: string,
  state: CardState,
  limit = 100
): Promise<FlashcardProgress[]> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM flashcard_progress WHERE user_id = ? AND state = ? ORDER BY next_review_date ASC LIMIT ?",
      args: [userId, state, limit],
    });

    return result.rows.map(rowToFlashcardProgress);
  } catch (error) {
    console.error(
      "[flashcardService:turso] Error fetching flashcard progress by state:",
      error
    );
    throw error;
  }
}

/**
 * Get due flashcards for review
 * @param userId - User's email
 * @param limit - Maximum number of cards to return
 * @returns Array of flashcard progress objects that are due for review
 */
export async function getDueFlashcards(
  userId: string,
  limit = 100
): Promise<FlashcardProgress[]> {
  try {
    const now = Date.now();
    const result = await db.execute({
      sql: "SELECT * FROM flashcard_progress WHERE user_id = ? AND next_review_date <= ? ORDER BY next_review_date ASC LIMIT ?",
      args: [userId, now, limit],
    });

    return result.rows.map(rowToFlashcardProgress);
  } catch (error) {
    console.error(
      "[flashcardService:turso] Error fetching due flashcards:",
      error
    );
    throw error;
  }
}

/**
 * Get struggling flashcards
 * Uses multiple criteria to identify struggling cards
 * @param userId - User's email
 * @param limit - Maximum number of cards to return
 * @returns Array of flashcard progress objects for struggling cards
 */
export async function getStrugglingFlashcards(
  userId: string,
  limit = 100
): Promise<FlashcardProgress[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM flashcard_progress
            WHERE user_id = ?
            AND (
              mastery_level < 40 OR
              consecutive_incorrect >= 2 OR
              lapse_count >= 3 OR
              state IN ('lapsed', 'relearning')
            )
            ORDER BY mastery_level ASC
            LIMIT ?`,
      args: [userId, limit],
    });

    return result.rows.map(rowToFlashcardProgress);
  } catch (error) {
    console.error(
      "[flashcardService:turso] Error fetching struggling flashcards:",
      error
    );
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToFlashcardProgress(row: any): FlashcardProgress {
  return {
    flashcardId: row.flashcard_id as string,
    userId: row.user_id as string,
    wordId: row.word_id as string,
    level: row.level as string | undefined,
    state: row.state as "new" | "learning" | "review" | "relearning" | "lapsed",
    repetitions: row.repetitions as number,
    easeFactor: row.ease_factor as number,
    interval: row.interval as number,
    nextReviewDate: row.next_review_date as number,
    correctCount: row.correct_count as number,
    incorrectCount: row.incorrect_count as number,
    consecutiveCorrect: row.consecutive_correct as number,
    consecutiveIncorrect: row.consecutive_incorrect as number,
    lastReviewDate: row.last_review_date as number | null | undefined,
    masteryLevel: row.mastery_level as number,
    lapseCount: row.lapse_count as number,
    lastLapseDate: row.last_lapse_date as number | null | undefined,
    firstSeenAt: row.first_seen_at as number | undefined,
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
