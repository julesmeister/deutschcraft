/**
 * Writing Progress Helpers
 * Data conversion utilities for writing progress
 */

import { WritingProgress, WritingStats } from '@/lib/models/writing';

/**
 * Convert database row to WritingProgress object
 */
export function rowToProgress(row: any): WritingProgress {
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
export function rowToStats(row: any): WritingStats {
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
