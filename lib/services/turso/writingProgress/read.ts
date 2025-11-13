/**
 * Writing Progress Read Operations
 * Functions for fetching writing progress data
 */

import { db } from '@/turso/client';
import { WritingProgress } from '@/lib/models/writing';
import { formatDateISO } from '@/lib/utils/dateHelpers';
import { rowToProgress } from './helpers';

/**
 * Fetch writing progress for a user
 */
export async function fetchUserWritingProgress(
  userId: string,
  limitCount: number = 30
): Promise<WritingProgress[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM writing_progress WHERE user_id = ? ORDER BY date DESC LIMIT ?',
      args: [userId, limitCount],
    });

    return result.rows.map(rowToProgress);
  } catch (error) {
    console.error('[writingProgressService:turso] Error fetching user writing progress:', error);
    throw error;
  }
}

/**
 * Get today's writing progress
 */
export async function getTodayWritingProgress(userId: string): Promise<WritingProgress> {
  try {
    const today = formatDateISO(new Date());

    const result = await db.execute({
      sql: 'SELECT * FROM writing_progress WHERE user_id = ? AND date = ? LIMIT 1',
      args: [userId, today],
    });

    if (result.rows.length === 0) {
      // Return default empty progress
      const now = Date.now();
      return {
        progressId: `WPROG_${today.replace(/-/g, '')}_${userId}`,
        userId,
        date: today,
        exercisesCompleted: 0,
        translationsCompleted: 0,
        creativeWritingsCompleted: 0,
        totalWordsWritten: 0,
        timeSpent: 0,
        averageGrammarScore: 0,
        averageVocabularyScore: 0,
        averageOverallScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: now,
        updatedAt: now,
      };
    }

    return rowToProgress(result.rows[0]);
  } catch (error) {
    console.error('[writingProgressService:turso] Error fetching today writing progress:', error);
    throw error;
  }
}
