/**
 * Writing Progress Tracking
 * Functions for updating daily writing progress
 */

import { db } from '@/turso/client';
import { WritingProgress, WritingSubmission, ReviewQuiz } from '@/lib/models/writing';
import { formatDateISO } from '@/lib/utils/dateHelpers';
import { rowToProgress } from './helpers';

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
 * Update daily writing progress after completing a review quiz
 */
export async function updateDailyProgressForQuiz(
  userId: string,
  quiz: ReviewQuiz
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

    // Increment exercises completed (review quiz counts as an activity)
    const newExercisesCompleted = currentProgress.exercisesCompleted + 1;

    // Upsert progress (quiz doesn't change word count or scores, just activity count)
    await db.execute({
      sql: `INSERT INTO writing_progress (
        progress_id, user_id, date, exercises_completed, translations_completed,
        creative_writings_completed, total_words_written, time_spent,
        average_grammar_score, average_vocabulary_score, average_overall_score,
        current_streak, longest_streak, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(progress_id) DO UPDATE SET
        exercises_completed = excluded.exercises_completed,
        updated_at = excluded.updated_at`,
      args: [
        progressId,
        userId,
        today,
        newExercisesCompleted,
        currentProgress.translationsCompleted,
        currentProgress.creativeWritingsCompleted,
        currentProgress.totalWordsWritten,
        currentProgress.timeSpent,
        currentProgress.averageGrammarScore,
        currentProgress.averageVocabularyScore,
        currentProgress.averageOverallScore,
        currentProgress.currentStreak,
        currentProgress.longestStreak,
        Date.now(),
        Date.now(),
      ],
    });
  } catch (error) {
    console.error('[writingProgressService:turso] Error updating daily progress for quiz:', error);
    throw error;
  }
}
