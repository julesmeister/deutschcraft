/**
 * Writing Service Helpers - Turso Implementation
 * Database row conversion helpers for writing operations
 */

import {
  WritingSubmission,
  WritingExerciseType,
  WritingProgress,
  WritingStats,
  TranslationExercise,
  CreativeWritingExercise,
} from "@/lib/models/writing";
import { CEFRLevel } from "@/lib/models/cefr";

/**
 * Convert database row to WritingSubmission object
 */
export function rowToSubmission(row: any): WritingSubmission {
  return {
    submissionId: row.submission_id as string,
    userId: row.user_id as string,
    exerciseId: row.exercise_id as string,
    exerciseType: row.exercise_type as WritingExerciseType,
    level: row.level as any,
    attemptNumber: Number(row.attempt_number) || 1,
    content: row.content as string,
    wordCount: Number(row.word_count) || 0,
    characterCount: Number(row.character_count) || 0,
    originalText: row.original_text as string | undefined,
    status: row.status as "draft" | "submitted" | "reviewed",
    startedAt: Number(row.started_at) || Number(row.created_at),
    submittedAt: row.submitted_at ? Number(row.submitted_at) : undefined,
    lastSavedAt: Number(row.updated_at),
    aiFeedback: row.ai_feedback
      ? JSON.parse(row.ai_feedback as string)
      : undefined,
    aiCorrectedVersion: row.ai_corrected_version as string | undefined,
    teacherFeedback: row.teacher_feedback as string | undefined,
    teacherScore: row.teacher_score ? Number(row.teacher_score) : undefined,
    reviewedBy: row.reviewed_by as string | undefined,
    reviewedAt: row.reviewed_at ? Number(row.reviewed_at) : undefined,
    version: Number(row.version) || 1,
    previousVersions: row.previous_versions
      ? JSON.parse(row.previous_versions as string)
      : undefined,
    isPublic: Boolean(row.is_public),
    exerciseTitle: row.exercise_title as string | undefined,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

/**
 * Convert database row to WritingExercise object
 */
export function rowToExercise(
  row: any
): TranslationExercise | CreativeWritingExercise {
  if (row.type === "translation") {
    return {
      exerciseId: row.exercise_id as string,
      type: "translation" as const,
      level: row.level as CEFRLevel,
      title: row.title as string,
      englishText: row.english_text as string,
      correctGermanText: row.correct_german_text as string,
      category: row.category as string,
      difficulty: row.difficulty as "easy" | "medium" | "hard",
      estimatedTime: Number(row.estimated_time),
      targetGrammar: row.target_grammar
        ? JSON.parse(row.target_grammar as string)
        : undefined,
      targetVocabulary: row.target_vocabulary
        ? JSON.parse(row.target_vocabulary as string)
        : undefined,
      hints: row.hints ? JSON.parse(row.hints as string) : undefined,
      completionCount: Number(row.completion_count) || 0,
      averageScore: Number(row.average_score) || 0,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    };
  } else {
    return {
      exerciseId: row.exercise_id as string,
      type: row.type as
        | "creative"
        | "guided"
        | "descriptive"
        | "dialogue"
        | "essay",
      level: row.level as CEFRLevel,
      title: row.title as string,
      prompt: row.prompt as string,
      imageUrl: row.image_url as string | undefined,
      minWords: Number(row.min_words),
      maxWords: row.max_words ? Number(row.max_words) : undefined,
      suggestedStructure: row.suggested_structure
        ? JSON.parse(row.suggested_structure as string)
        : undefined,
      category: row.category as string,
      tone: row.tone as "formal" | "informal" | "neutral" | undefined,
      targetGrammar: row.target_grammar
        ? JSON.parse(row.target_grammar as string)
        : undefined,
      suggestedVocabulary: row.suggested_vocabulary
        ? JSON.parse(row.suggested_vocabulary as string)
        : undefined,
      exampleResponse: row.example_response as string | undefined,
      difficulty: row.difficulty as "easy" | "medium" | "hard",
      estimatedTime: Number(row.estimated_time),
      completionCount: Number(row.completion_count) || 0,
      averageWordCount: Number(row.average_word_count) || 0,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    };
  }
}

/**
 * Convert database row to WritingProgress object
 */
export function rowToProgress(row: any): WritingProgress {
  return {
    progressId: row.progress_id as string,
    userId: row.user_id as string,
    date: row.date as string,
    exercisesCompleted: Number(row.exercises_completed),
    translationsCompleted: Number(row.translations_completed || 0),
    creativeWritingsCompleted: Number(row.creative_writings_completed || 0),
    totalWordsWritten: Number(
      row.total_words_written || row.words_written || 0
    ),
    timeSpent: Number(row.time_spent),
    averageGrammarScore: Number(row.average_grammar_score || 0),
    averageVocabularyScore: Number(row.average_vocabulary_score || 0),
    averageOverallScore: Number(
      row.average_overall_score || row.average_score || 0
    ),
    currentStreak: Number(row.current_streak || 0),
    longestStreak: Number(row.longest_streak || 0),
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
    exercisesByLevel: row.exercises_by_level
      ? JSON.parse(row.exercises_by_level as string)
      : {},
    currentStreak: Number(row.current_streak),
    longestStreak: Number(row.longest_streak),
    recentScores: row.recent_scores
      ? JSON.parse(row.recent_scores as string)
      : [],
    updatedAt: Number(row.updated_at),
  };
}
