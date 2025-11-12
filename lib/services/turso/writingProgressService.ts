/**
 * Writing Progress Service - Turso Implementation
 * Centralized service for tracking and calculating writing progress
 */

import { db } from '@/turso/client';
import { WritingProgress, WritingStats, WritingSubmission } from '@/lib/models/writing';
import { formatDateISO } from '@/lib/utils/dateHelpers';
import { CEFRLevel } from '@/lib/models/cefr';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database row to WritingProgress object
 */
function rowToProgress(row: any): WritingProgress {
  return {
    progressId: row.progress_id as string,
    userId: row.user_id as string,
    date: row.date as string,
    exercisesCompleted: Number(row.exercises_completed),
    translationsCompleted: Number(row.translations_completed),
    creativeWritingsCompleted: Number(row.creative_writings_completed),
    totalWordsWritten: Number(row.total_words_written),
    timeSpent: Number(row.time_spent),
    averageGrammarScore: Number(row.average_grammar_score),
    averageVocabularyScore: Number(row.average_vocabulary_score),
    averageOverallScore: Number(row.average_overall_score),
    currentStreak: Number(row.current_streak),
    longestStreak: Number(row.longest_streak),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

/**
 * Convert database row to WritingStats object
 */
function rowToStats(row: any): WritingStats {
  return {
    userId: row.user_id as string,
    totalExercisesCompleted: Number(row.total_exercises_completed),
    totalTranslations: Number(row.total_translations),
    totalCreativeWritings: Number(row.total_creative_writings),
    totalWordsWritten: Number(row.total_words_written),
    totalTimeSpent: Number(row.total_time_spent),
    averageGrammarScore: Number(row.average_grammar_score),
    averageVocabularyScore: Number(row.average_vocabulary_score),
    averageCoherenceScore: Number(row.average_coherence_score),
    averageOverallScore: Number(row.average_overall_score),
    exercisesByLevel: row.exercises_by_level ? JSON.parse(row.exercises_by_level as string) : {},
    currentStreak: Number(row.current_streak),
    longestStreak: Number(row.longest_streak),
    lastPracticeDate: row.last_practice_date as string,
    recentScores: row.recent_scores ? JSON.parse(row.recent_scores as string) : [],
    updatedAt: Number(row.updated_at),
  };
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

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

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Update daily writing progress after completing an exercise
 */
export async function updateDailyProgress(
  userId: string,
  submission: WritingSubmission
): Promise<void> {
  try {
    const today = formatDateISO(new Date());
    const progressId = `WPROG_${today.replace(/-/g, '')}_${userId}`;

    // Get current progress or use defaults
    const result = await db.execute({
      sql: 'SELECT * FROM writing_progress WHERE user_id = ? AND date = ? LIMIT 1',
      args: [userId, today],
    });

    const currentProgress: WritingProgress =
      result.rows.length > 0
        ? rowToProgress(result.rows[0])
        : {
            progressId,
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
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

    // Calculate new values
    const newExercisesCompleted = currentProgress.exercisesCompleted + 1;
    const isTranslation = submission.exerciseType === 'translation';

    // Calculate new averages (using AI or teacher scores if available)
    const totalScores = currentProgress.exercisesCompleted;
    const newGrammarScore = (submission as any).aiFeedback?.grammarScore || 0;
    const newVocabScore = (submission as any).aiFeedback?.vocabularyScore || 0;
    const newOverallScore = submission.teacherScore || (submission as any).aiFeedback?.overallScore || 0;

    // Only update averages if we have a score
    const averageGrammarScore =
      newGrammarScore > 0
        ? totalScores === 0
          ? newGrammarScore
          : (currentProgress.averageGrammarScore * totalScores + newGrammarScore) / newExercisesCompleted
        : currentProgress.averageGrammarScore;

    const averageVocabularyScore =
      newVocabScore > 0
        ? totalScores === 0
          ? newVocabScore
          : (currentProgress.averageVocabularyScore * totalScores + newVocabScore) / newExercisesCompleted
        : currentProgress.averageVocabularyScore;

    const averageOverallScore =
      newOverallScore > 0
        ? totalScores === 0
          ? newOverallScore
          : (currentProgress.averageOverallScore * totalScores + newOverallScore) / newExercisesCompleted
        : currentProgress.averageOverallScore;

    const wordCount = (submission as any).wordCount || 0;

    // Upsert progress
    await db.execute({
      sql: `INSERT INTO writing_progress (
        progress_id, user_id, date, exercises_completed, translations_completed,
        creative_writings_completed, total_words_written, time_spent,
        average_grammar_score, average_vocabulary_score, average_overall_score,
        current_streak, longest_streak, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(progress_id) DO UPDATE SET
        exercises_completed = excluded.exercises_completed,
        translations_completed = excluded.translations_completed,
        creative_writings_completed = excluded.creative_writings_completed,
        total_words_written = excluded.total_words_written,
        time_spent = excluded.time_spent,
        average_grammar_score = excluded.average_grammar_score,
        average_vocabulary_score = excluded.average_vocabulary_score,
        average_overall_score = excluded.average_overall_score,
        current_streak = excluded.current_streak,
        longest_streak = excluded.longest_streak,
        updated_at = excluded.updated_at`,
      args: [
        progressId,
        userId,
        today,
        newExercisesCompleted,
        currentProgress.translationsCompleted + (isTranslation ? 1 : 0),
        currentProgress.creativeWritingsCompleted + (isTranslation ? 0 : 1),
        currentProgress.totalWordsWritten + wordCount,
        currentProgress.timeSpent,
        Math.round(averageGrammarScore),
        Math.round(averageVocabularyScore),
        Math.round(averageOverallScore),
        currentProgress.currentStreak,
        currentProgress.longestStreak,
        Date.now(),
        Date.now(),
      ],
    });
  } catch (error) {
    console.error('[writingProgressService:turso] Error updating daily progress:', error);
    throw error;
  }
}

/**
 * Calculate writing streak from progress documents
 */
export async function calculateWritingStreak(userId: string): Promise<{ current: number; longest: number }> {
  try {
    const progressDocs = await fetchUserWritingProgress(userId, 365);

    if (progressDocs.length === 0) {
      return { current: 0, longest: 0 };
    }

    // Sort by date descending
    const sorted = [...progressDocs].sort((a, b) => b.date.localeCompare(a.date));

    // Calculate current streak
    let currentStreak = 0;
    const today = formatDateISO(new Date());

    for (let i = 0; i < sorted.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = formatDateISO(expectedDate);

      const doc = sorted.find(d => d.date === expectedDateStr);
      if (doc && doc.exercisesCompleted > 0) {
        currentStreak++;
      } else if (i > 0) {
        // If not today and we didn't find it, break
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const doc of sorted.reverse()) {
      if (doc.exercisesCompleted === 0) continue;

      const currentDate = new Date(doc.date);

      if (lastDate === null) {
        tempStreak = 1;
      } else {
        const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  } catch (error) {
    console.error('[writingProgressService:turso] Error calculating writing streak:', error);
    throw error;
  }
}

/**
 * Update overall writing statistics
 */
export async function updateWritingStats(
  userId: string,
  submission: WritingSubmission
): Promise<void> {
  try {
    // Get current stats or use defaults
    const result = await db.execute({
      sql: 'SELECT * FROM writing_stats WHERE user_id = ? LIMIT 1',
      args: [userId],
    });

    const currentStats: WritingStats =
      result.rows.length > 0
        ? rowToStats(result.rows[0])
        : {
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
            lastPracticeDate: formatDateISO(new Date()),
            recentScores: [],
            updatedAt: Date.now(),
          };

    // Calculate streaks
    const streaks = await calculateWritingStreak(userId);

    // Update exercise count by level
    const exercisesByLevel = { ...currentStats.exercisesByLevel };
    const level = (submission as any).level as CEFRLevel | undefined;
    if (level && level in CEFRLevel) {
      exercisesByLevel[level] = (exercisesByLevel[level] || 0) + 1;
    }

    // Update recent scores (keep last 10) - only from teacher reviews
    const recentScores = [...currentStats.recentScores];
    if (submission.teacherScore && submission.teacherScore > 0) {
      recentScores.unshift(submission.teacherScore);
      if (recentScores.length > 10) {
        recentScores.pop();
      }
    }

    // Calculate new averages
    const total = currentStats.totalExercisesCompleted;
    const newGrammar = (submission as any).aiFeedback?.grammarScore || 0;
    const newVocab = (submission as any).aiFeedback?.vocabularyScore || 0;
    const newCoherence = (submission as any).aiFeedback?.coherenceScore || 0;
    const newOverall = submission.teacherScore || (submission as any).aiFeedback?.overallScore || 0;

    const averageGrammarScore =
      newGrammar > 0
        ? total === 0
          ? newGrammar
          : (currentStats.averageGrammarScore * total + newGrammar) / (total + 1)
        : currentStats.averageGrammarScore;

    const averageVocabularyScore =
      newVocab > 0
        ? total === 0
          ? newVocab
          : (currentStats.averageVocabularyScore * total + newVocab) / (total + 1)
        : currentStats.averageVocabularyScore;

    const averageCoherenceScore =
      newCoherence > 0
        ? total === 0
          ? newCoherence
          : (currentStats.averageCoherenceScore * total + newCoherence) / (total + 1)
        : currentStats.averageCoherenceScore;

    const averageOverallScore =
      newOverall > 0
        ? total === 0
          ? newOverall
          : (currentStats.averageOverallScore * total + newOverall) / (total + 1)
        : currentStats.averageOverallScore;

    const wordCount = (submission as any).wordCount || 0;

    // Upsert stats
    await db.execute({
      sql: `INSERT INTO writing_stats (
        user_id, total_exercises_completed, total_translations, total_creative_writings,
        total_words_written, total_time_spent, average_grammar_score, average_vocabulary_score,
        average_coherence_score, average_overall_score, exercises_by_level, current_streak,
        longest_streak, last_practice_date, recent_scores, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        total_exercises_completed = excluded.total_exercises_completed,
        total_translations = excluded.total_translations,
        total_creative_writings = excluded.total_creative_writings,
        total_words_written = excluded.total_words_written,
        total_time_spent = excluded.total_time_spent,
        average_grammar_score = excluded.average_grammar_score,
        average_vocabulary_score = excluded.average_vocabulary_score,
        average_coherence_score = excluded.average_coherence_score,
        average_overall_score = excluded.average_overall_score,
        exercises_by_level = excluded.exercises_by_level,
        current_streak = excluded.current_streak,
        longest_streak = excluded.longest_streak,
        last_practice_date = excluded.last_practice_date,
        recent_scores = excluded.recent_scores,
        updated_at = excluded.updated_at`,
      args: [
        userId,
        total + 1,
        currentStats.totalTranslations + (submission.exerciseType === 'translation' ? 1 : 0),
        currentStats.totalCreativeWritings + (submission.exerciseType !== 'translation' ? 1 : 0),
        currentStats.totalWordsWritten + wordCount,
        currentStats.totalTimeSpent,
        Math.round(averageGrammarScore),
        Math.round(averageVocabularyScore),
        Math.round(averageCoherenceScore),
        Math.round(averageOverallScore),
        JSON.stringify(exercisesByLevel),
        streaks.current,
        Math.max(streaks.longest, currentStats.longestStreak),
        formatDateISO(new Date()),
        JSON.stringify(recentScores),
        Date.now(),
      ],
    });
  } catch (error) {
    console.error('[writingProgressService:turso] Error updating writing stats:', error);
    throw error;
  }
}

/**
 * Get aggregate statistics for all students (teacher view)
 */
export async function getTeacherWritingStats(teacherId: string): Promise<{
  totalSubmissions: number;
  averageScore: number;
  totalWordsWritten: number;
  submissionsThisWeek: number;
}> {
  try {
    // Get all students for this teacher
    const studentsResult = await db.execute({
      sql: 'SELECT user_id FROM users WHERE teacher_id = ? AND role = ?',
      args: [teacherId, 'STUDENT'],
    });

    if (studentsResult.rows.length === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        totalWordsWritten: 0,
        submissionsThisWeek: 0,
      };
    }

    const studentIds = studentsResult.rows.map(row => row.user_id as string);

    // Get aggregate stats
    const placeholders = studentIds.map(() => '?').join(',');

    const submissionsResult = await db.execute({
      sql: `SELECT
              COUNT(*) as total_submissions,
              AVG(teacher_score) as average_score,
              SUM(COALESCE(word_count, 0)) as total_words
            FROM writing_submissions
            WHERE user_id IN (${placeholders})
              AND status = 'reviewed'`,
      args: studentIds,
    });

    // Get submissions this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoTimestamp = weekAgo.getTime();

    const weekResult = await db.execute({
      sql: `SELECT COUNT(*) as count
            FROM writing_submissions
            WHERE user_id IN (${placeholders})
              AND submitted_at >= ?`,
      args: [...studentIds, weekAgoTimestamp],
    });

    const stats = submissionsResult.rows[0];
    return {
      totalSubmissions: Number(stats.total_submissions) || 0,
      averageScore: Math.round(Number(stats.average_score) || 0),
      totalWordsWritten: Number(stats.total_words) || 0,
      submissionsThisWeek: Number(weekResult.rows[0].count) || 0,
    };
  } catch (error) {
    console.error('[writingProgressService:turso] Error getting teacher writing stats:', error);
    return {
      totalSubmissions: 0,
      averageScore: 0,
      totalWordsWritten: 0,
      submissionsThisWeek: 0,
    };
  }
}
