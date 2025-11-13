/**
 * Writing Statistics Management
 * Functions for updating overall writing statistics
 */

import { db } from '@/turso/client';
import { WritingStats, WritingSubmission } from '@/lib/models/writing';
import { formatDateISO } from '@/lib/utils/dateHelpers';
import { CEFRLevel } from '@/lib/models/cefr';
import { rowToStats } from './helpers';
import { calculateWritingStreak } from './streaks';

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
