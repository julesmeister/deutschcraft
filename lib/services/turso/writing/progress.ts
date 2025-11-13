/**
 * Writing Progress & Stats - Turso Implementation
 * Database operations for writing progress tracking and statistics
 */

import { db } from '@/turso/client';
import { WritingProgress, WritingStats } from '@/lib/models/writing';
import { CEFRLevel } from '@/lib/models/cefr';
import { rowToProgress, rowToStats } from './helpers';

/**
 * Get student's writing progress (daily metrics)
 * @param userId - Student's user ID
 * @param limitCount - Number of days to fetch (default 30)
 * @returns Array of progress entries
 */
export async function getWritingProgress(
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
    console.error('[writingService:turso] Error fetching writing progress:', error);
    throw error;
  }
}

/**
 * Get student's writing statistics
 * @param userId - Student's user ID
 * @returns WritingStats object or default stats if none exist
 */
export async function getWritingStats(userId: string): Promise<WritingStats> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM writing_stats WHERE user_id = ? LIMIT 1',
      args: [userId],
    });

    if (result.rows.length === 0) {
      // Return default stats if none exist
      return {
        userId,
        totalExercisesCompleted: 0,
        totalTranslations: 0,
        totalCreativeWritings: 0,
        totalWordsWritten: 0,
        totalTimeSpent: 0,
        averageGrammarScore: 0,
        averageVocabularyScore: 0,
        averageCoherenceScore: 0,
        averageOverallScore: 0,
        exercisesByLevel: {} as Record<CEFRLevel, number>,
        currentStreak: 0,
        longestStreak: 0,
        recentScores: [],
        updatedAt: Date.now(),
      };
    }

    return rowToStats(result.rows[0]);
  } catch (error) {
    console.error('[writingService:turso] Error fetching writing stats:', error);
    throw error;
  }
}

/**
 * Update writing statistics
 * @param userId - Student's user ID
 * @param updates - Partial stats data to update
 */
export async function updateWritingStats(
  userId: string,
  updates: Partial<WritingStats>
): Promise<void> {
  try {
    const setClauses: string[] = [];
    const args: any[] = [];

    if (updates.totalExercisesCompleted !== undefined) {
      setClauses.push('total_exercises_completed = ?');
      args.push(updates.totalExercisesCompleted);
    }
    if (updates.totalTranslations !== undefined) {
      setClauses.push('total_translations = ?');
      args.push(updates.totalTranslations);
    }
    if (updates.totalCreativeWritings !== undefined) {
      setClauses.push('total_creative_writings = ?');
      args.push(updates.totalCreativeWritings);
    }
    if (updates.totalWordsWritten !== undefined) {
      setClauses.push('total_words_written = ?');
      args.push(updates.totalWordsWritten);
    }
    if (updates.totalTimeSpent !== undefined) {
      setClauses.push('total_time_spent = ?');
      args.push(updates.totalTimeSpent);
    }
    if (updates.averageGrammarScore !== undefined) {
      setClauses.push('average_grammar_score = ?');
      args.push(updates.averageGrammarScore);
    }
    if (updates.averageVocabularyScore !== undefined) {
      setClauses.push('average_vocabulary_score = ?');
      args.push(updates.averageVocabularyScore);
    }
    if (updates.averageCoherenceScore !== undefined) {
      setClauses.push('average_coherence_score = ?');
      args.push(updates.averageCoherenceScore);
    }
    if (updates.averageOverallScore !== undefined) {
      setClauses.push('average_overall_score = ?');
      args.push(updates.averageOverallScore);
    }
    if (updates.exercisesByLevel !== undefined) {
      setClauses.push('exercises_by_level = ?');
      args.push(JSON.stringify(updates.exercisesByLevel));
    }
    if (updates.currentStreak !== undefined) {
      setClauses.push('current_streak = ?');
      args.push(updates.currentStreak);
    }
    if (updates.longestStreak !== undefined) {
      setClauses.push('longest_streak = ?');
      args.push(updates.longestStreak);
    }
    if (updates.recentScores !== undefined) {
      setClauses.push('recent_scores = ?');
      args.push(JSON.stringify(updates.recentScores));
    }

    setClauses.push('updated_at = ?');
    args.push(Date.now());

    args.push(userId);

    await db.execute({
      sql: `UPDATE writing_stats SET ${setClauses.join(', ')} WHERE user_id = ?`,
      args,
    });
  } catch (error) {
    console.error('[writingService:turso] Error updating writing stats:', error);
    throw error;
  }
}

/**
 * Update daily writing progress
 * @param progressId - Progress ID (format: userId_date)
 * @param progressData - Progress data to update
 */
export async function updateWritingProgress(
  progressId: string,
  progressData: WritingProgress
): Promise<void> {
  try {
    await db.execute({
      sql: `INSERT INTO writing_progress (
        user_id, date, exercises_completed, words_written, time_spent, average_score, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        exercises_completed = excluded.exercises_completed,
        words_written = excluded.words_written,
        time_spent = excluded.time_spent,
        average_score = excluded.average_score,
        updated_at = excluded.updated_at`,
      args: [
        progressData.userId,
        progressData.date,
        progressData.exercisesCompleted,
        progressData.totalWordsWritten,
        progressData.timeSpent,
        progressData.averageOverallScore,
        Date.now(),
      ],
    });
  } catch (error) {
    console.error('[writingService:turso] Error updating writing progress:', error);
    throw error;
  }
}
