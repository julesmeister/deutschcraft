/**
 * Turso Flashcard Service - Basic Progress Read Operations
 * Handles core flashcard progress queries and study statistics
 */

import { db } from "@/turso/client";
import { FlashcardProgress, StudyProgress, CategoryStats } from "@/lib/models";
import {
  getVocabularyMetadata,
  getDisplayCategories,
} from "@/lib/services/vocabularyData";
import { rowToFlashcardProgress, rowToStudyProgress } from "./progressMappers";

// ============================================================================
// BASIC READ OPERATIONS
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
    // 1. Fetch minimal progress data from DB
    // Note: Cannot use SQL GROUP BY because category/tags are stored in JSON files,
    // not in the database. This approach minimizes data transfer (3 fields only).
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

    // 2. Aggregate in memory using static JSON metadata (O(1) lookups)
    const statsMap = new Map<
      string,
      { total: number; learned: number; mastered: number }
    >();

    for (const row of result.rows) {
      const wordId = row.word_id as string;
      const repetitions = (row.repetitions as number) || 0;
      const masteryLevel = (row.mastery_level as number) || 0;

      // Look up metadata from JSON file (O(1) map lookup)
      const metadata = getVocabularyMetadata(wordId);

      // Get display categories for this flashcard
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
    // ID Normalization REMOVED (Semantic IDs)
    const finalFlashcardId = flashcardId;

    const progressId = `${userId}_${finalFlashcardId}`;
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

