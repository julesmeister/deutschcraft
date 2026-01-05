/**
 * Turso Flashcard Service - Advanced Progress Read Operations
 * Handles complex queries for struggling cards, state-based filtering, etc.
 */

import { db } from "@/turso/client";
import { FlashcardProgress, StudyProgress, CardState } from "@/lib/models";
import { rowToFlashcardProgress, rowToStudyProgress } from "./progressMappers";

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
