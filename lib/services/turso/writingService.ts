/**
 * Writing Service - Turso Implementation
 * Database abstraction layer for writing operations using Turso DB
 *
 * This service handles all writing-related operations:
 * - Writing submissions (exercises, homework)
 * - Peer reviews and teacher reviews
 * - Writing progress and statistics
 */

import { db } from '@/turso/client';
import {
  WritingSubmission,
  WritingExerciseType,
  WritingProgress,
  WritingStats,
  TranslationExercise,
  CreativeWritingExercise,
} from '@/lib/models/writing';
import { CEFRLevel } from '@/lib/models/cefr';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database row to WritingSubmission object
 */
function rowToSubmission(row: any): WritingSubmission {
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
    status: row.status as 'draft' | 'submitted' | 'reviewed',
    startedAt: Number(row.started_at) || Number(row.created_at),
    submittedAt: row.submitted_at ? Number(row.submitted_at) : undefined,
    lastSavedAt: Number(row.updated_at),
    aiFeedback: row.ai_feedback ? JSON.parse(row.ai_feedback as string) : undefined,
    teacherFeedback: row.teacher_feedback as string | undefined,
    teacherScore: row.teacher_score ? Number(row.teacher_score) : undefined,
    reviewedBy: row.reviewed_by as string | undefined,
    reviewedAt: row.reviewed_at ? Number(row.reviewed_at) : undefined,
    version: Number(row.version) || 1,
    previousVersions: row.previous_versions ? JSON.parse(row.previous_versions as string) : undefined,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

/**
 * Convert database row to WritingExercise object
 */
function rowToExercise(row: any): TranslationExercise | CreativeWritingExercise {
  if (row.type === 'translation') {
    return {
      exerciseId: row.exercise_id as string,
      type: 'translation' as const,
      level: row.level as CEFRLevel,
      title: row.title as string,
      englishText: row.english_text as string,
      correctGermanText: row.correct_german_text as string,
      category: row.category as string,
      difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
      estimatedTime: Number(row.estimated_time),
      targetGrammar: row.target_grammar ? JSON.parse(row.target_grammar as string) : undefined,
      targetVocabulary: row.target_vocabulary ? JSON.parse(row.target_vocabulary as string) : undefined,
      hints: row.hints ? JSON.parse(row.hints as string) : undefined,
      completionCount: Number(row.completion_count) || 0,
      averageScore: Number(row.average_score) || 0,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    };
  } else {
    return {
      exerciseId: row.exercise_id as string,
      type: row.type as 'creative' | 'guided' | 'descriptive' | 'dialogue' | 'essay',
      level: row.level as CEFRLevel,
      title: row.title as string,
      prompt: row.prompt as string,
      imageUrl: row.image_url as string | undefined,
      minWords: Number(row.min_words),
      maxWords: row.max_words ? Number(row.max_words) : undefined,
      suggestedStructure: row.suggested_structure ? JSON.parse(row.suggested_structure as string) : undefined,
      category: row.category as string,
      tone: row.tone as 'formal' | 'informal' | 'neutral' | undefined,
      targetGrammar: row.target_grammar ? JSON.parse(row.target_grammar as string) : undefined,
      suggestedVocabulary: row.suggested_vocabulary ? JSON.parse(row.suggested_vocabulary as string) : undefined,
      exampleResponse: row.example_response as string | undefined,
      difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
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
function rowToProgress(row: any): WritingProgress {
  return {
    progressId: row.progress_id as string,
    userId: row.user_id as string,
    date: row.date as string,
    exercisesCompleted: Number(row.exercises_completed),
    translationsCompleted: Number(row.translations_completed || 0),
    creativeWritingsCompleted: Number(row.creative_writings_completed || 0),
    totalWordsWritten: Number(row.total_words_written || row.words_written || 0),
    timeSpent: Number(row.time_spent),
    averageGrammarScore: Number(row.average_grammar_score || 0),
    averageVocabularyScore: Number(row.average_vocabulary_score || 0),
    averageOverallScore: Number(row.average_overall_score || row.average_score || 0),
    currentStreak: Number(row.current_streak || 0),
    longestStreak: Number(row.longest_streak || 0),
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
    recentScores: row.recent_scores ? JSON.parse(row.recent_scores as string) : [],
    updatedAt: Number(row.updated_at),
  };
}

// ============================================================================
// WRITING EXERCISES
// ============================================================================

/**
 * Get writing exercises by level and type
 * @param level - CEFR level
 * @param exerciseType - Optional exercise type filter
 * @returns Array of exercises
 */
export async function getWritingExercises(
  level: CEFRLevel,
  exerciseType?: WritingExerciseType
): Promise<(TranslationExercise | CreativeWritingExercise)[]> {
  try {
    let sql = 'SELECT * FROM writing_exercises WHERE level = ?';
    const args: any[] = [level];

    if (exerciseType) {
      sql += ' AND type = ?';
      args.push(exerciseType);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToExercise);
  } catch (error) {
    console.error('[writingService:turso] Error fetching writing exercises:', error);
    throw error;
  }
}

/**
 * Get a single writing exercise by ID
 * @param exerciseId - Exercise ID
 * @returns Exercise object or null
 */
export async function getWritingExercise(
  exerciseId: string
): Promise<TranslationExercise | CreativeWritingExercise | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM writing_exercises WHERE exercise_id = ? LIMIT 1',
      args: [exerciseId],
    });

    if (result.rows.length === 0) return null;
    return rowToExercise(result.rows[0]);
  } catch (error) {
    console.error('[writingService:turso] Error fetching writing exercise:', error);
    throw error;
  }
}

// ============================================================================
// WRITING SUBMISSIONS - READ OPERATIONS
// ============================================================================

/**
 * Get student's submissions
 * @param userId - Student's user ID
 * @param exerciseType - Optional exercise type filter
 * @returns Array of submissions sorted by date
 */
export async function getStudentSubmissions(
  userId: string,
  exerciseType?: WritingExerciseType
): Promise<WritingSubmission[]> {
  try {
    let sql = 'SELECT * FROM writing_submissions WHERE user_id = ?';
    const args: any[] = [userId];

    if (exerciseType) {
      sql += ' AND exercise_type = ?';
      args.push(exerciseType);
    }

    sql += ' ORDER BY updated_at DESC';

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToSubmission);
  } catch (error) {
    console.error('[writingService:turso] Error fetching student submissions:', error);
    throw error;
  }
}

/**
 * Get single submission by ID
 * @param submissionId - Submission ID
 * @returns Submission object or null
 */
export async function getWritingSubmission(
  submissionId: string
): Promise<WritingSubmission | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM writing_submissions WHERE submission_id = ? LIMIT 1',
      args: [submissionId],
    });

    if (result.rows.length === 0) return null;
    return rowToSubmission(result.rows[0]);
  } catch (error) {
    console.error('[writingService:turso] Error fetching writing submission:', error);
    throw error;
  }
}

/**
 * Get all student submissions for a specific exercise
 * @param exerciseId - Exercise ID
 * @returns Array of submissions sorted by submission date
 */
export async function getExerciseSubmissions(
  exerciseId: string
): Promise<WritingSubmission[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM writing_submissions WHERE exercise_id = ? ORDER BY submitted_at DESC',
      args: [exerciseId],
    });

    return result.rows.map(rowToSubmission);
  } catch (error) {
    console.error('[writingService:turso] Error fetching exercise submissions:', error);
    throw error;
  }
}

/**
 * Get all writing submissions (for teacher review)
 * @param statusFilter - Optional status filter ('submitted', 'reviewed', or 'all')
 * @returns Array of submissions
 */
export async function getAllWritingSubmissions(
  statusFilter?: 'submitted' | 'reviewed' | 'all'
): Promise<WritingSubmission[]> {
  try {
    let sql: string;
    const args: any[] = [];

    if (statusFilter === 'submitted') {
      sql = "SELECT * FROM writing_submissions WHERE status = 'submitted' ORDER BY submitted_at DESC";
    } else if (statusFilter === 'reviewed') {
      sql = "SELECT * FROM writing_submissions WHERE status = 'reviewed' ORDER BY updated_at DESC";
    } else {
      sql = "SELECT * FROM writing_submissions WHERE status IN ('submitted', 'reviewed') ORDER BY updated_at DESC";
    }

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToSubmission);
  } catch (error) {
    console.error('[writingService:turso] Error fetching all writing submissions:', error);
    throw error;
  }
}

/**
 * Get count of pending writing submissions
 * @returns Number of submissions awaiting review
 */
export async function getPendingWritingCount(): Promise<number> {
  try {
    const result = await db.execute({
      sql: "SELECT COUNT(*) as count FROM writing_submissions WHERE status = 'submitted'",
      args: [],
    });

    return Number(result.rows[0].count) || 0;
  } catch (error) {
    console.error('[writingService:turso] Error fetching pending writing count:', error);
    throw error;
  }
}

// ============================================================================
// WRITING SUBMISSIONS - WRITE OPERATIONS
// ============================================================================

/**
 * Create a new writing submission
 * @param submissionData - Submission data without submissionId
 * @returns Created submission with generated ID
 */
export async function createWritingSubmission(
  submissionData: Omit<WritingSubmission, 'submissionId' | 'createdAt' | 'updatedAt' | 'version'>
): Promise<WritingSubmission> {
  try {
    const now = Date.now();
    const submissionId = `ws_${now}_${Math.random().toString(36).substr(2, 9)}`;

    await db.execute({
      sql: `INSERT INTO writing_submissions (
        submission_id, user_id, exercise_id, exercise_type, level, attempt_number,
        content, word_count, character_count, original_text, status,
        started_at, submitted_at, last_saved_at, ai_feedback, teacher_feedback,
        teacher_score, reviewed_by, reviewed_at, version, previous_versions,
        created_at, updated_at,
        is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        submissionId,
        submissionData.userId,
        submissionData.exerciseId,
        submissionData.exerciseType,
        submissionData.level,
        submissionData.attemptNumber,
        submissionData.content,
        submissionData.wordCount,
        submissionData.characterCount,
        submissionData.originalText || null,
        submissionData.status,
        submissionData.startedAt,
        submissionData.submittedAt || null,
        submissionData.lastSavedAt,
        submissionData.aiFeedback ? JSON.stringify(submissionData.aiFeedback) : null,
        submissionData.teacherFeedback || null,
        submissionData.teacherScore || null,
        submissionData.reviewedBy || null,
        submissionData.reviewedAt || null,
        1,
        submissionData.previousVersions ? JSON.stringify(submissionData.previousVersions) : null,
        now,
        now,
        submissionData.isPublic ? 1 : 0
      ],
    });

    return {
      submissionId,
      ...submissionData,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('[writingService:turso] Error creating writing submission:', error);
    throw error;
  }
}

/**
 * Update an existing writing submission
 * @param submissionId - Submission ID
 * @param updates - Partial submission data to update
 */
export async function updateWritingSubmission(
  submissionId: string,
  updates: Partial<WritingSubmission>
): Promise<void> {
  try {
    const now = Date.now();
    const sets: string[] = ['updated_at = ?'];
    const args: any[] = [now];

    if (updates.content !== undefined) {
      sets.push('content = ?');
      args.push(updates.content);
    }
    if (updates.wordCount !== undefined) {
      sets.push('word_count = ?');
      args.push(updates.wordCount);
    }
    if (updates.characterCount !== undefined) {
      sets.push('character_count = ?');
      args.push(updates.characterCount);
    }
    if (updates.status !== undefined) {
      sets.push('status = ?');
      args.push(updates.status);
    }
    if (updates.submittedAt !== undefined) {
      sets.push('submitted_at = ?');
      args.push(updates.submittedAt);
    }
    if (updates.lastSavedAt !== undefined) {
      sets.push('last_saved_at = ?');
      args.push(updates.lastSavedAt);
    }
    if (updates.aiFeedback !== undefined) {
      sets.push('ai_feedback = ?');
      args.push(JSON.stringify(updates.aiFeedback));
    }
    if (updates.teacherFeedback !== undefined) {
      sets.push('teacher_feedback = ?');
      args.push(updates.teacherFeedback);
    }
    if (updates.teacherScore !== undefined) {
      sets.push('teacher_score = ?');
      args.push(updates.teacherScore);
    }
    if (updates.reviewedBy !== undefined) {
      sets.push('reviewed_by = ?');
      args.push(updates.reviewedBy);
    }
    if (updates.reviewedAt !== undefined) {
      sets.push('reviewed_at = ?');
      args.push(updates.reviewedAt);
    }
    if (updates.isPublic !== undefined) {
      sets.push('is_public = ?');
      args.push(updates.isPublic ? 1 : 0);
    }

    args.push(submissionId);

    await db.execute({
      sql: `UPDATE writing_submissions SET ${sets.join(', ')} WHERE submission_id = ?`,
      args,
    });
  } catch (error) {
    console.error('[writingService:turso] Error updating writing submission:', error);
    throw error;
  }
}

/**
 * Submit a writing exercise (change status from draft to submitted)
 * @param submissionId - Submission ID
 */
export async function submitWriting(submissionId: string): Promise<void> {
  try {
    const now = Date.now();
    await db.execute({
      sql: "UPDATE writing_submissions SET status = 'submitted', submitted_at = ?, updated_at = ? WHERE submission_id = ?",
      args: [now, now, submissionId],
    });
  } catch (error) {
    console.error('[writingService:turso] Error submitting writing:', error);
    throw error;
  }
}

/**
 * Delete a writing submission
 * @param submissionId - Submission ID
 */
export async function deleteWritingSubmission(submissionId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM writing_submissions WHERE submission_id = ?',
      args: [submissionId],
    });
  } catch (error) {
    console.error('[writingService:turso] Error deleting writing submission:', error);
    throw error;
  }
}

// ============================================================================
// PEER REVIEWS
// ============================================================================

/**
 * Get peer reviews for a submission
 * @param submissionId - Submission ID
 * @returns Array of peer reviews sorted by date
 */
export async function getPeerReviews(submissionId: string): Promise<any[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM peer_reviews WHERE submission_id = ? ORDER BY created_at DESC',
      args: [submissionId],
    });

    return result.rows.map(row => ({
      reviewId: row.review_id,
      submissionId: row.submission_id,
      reviewerId: row.reviewer_id,
      rating: Number(row.rating),
      comments: row.comments,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }));
  } catch (error) {
    console.error('[writingService:turso] Error fetching peer reviews:', error);
    throw error;
  }
}

/**
 * Get reviews assigned to a student (to do)
 * @param reviewerId - Reviewer's user ID
 * @returns Array of assigned peer reviews
 */
export async function getAssignedPeerReviews(reviewerId: string): Promise<any[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM peer_reviews WHERE reviewer_id = ? ORDER BY created_at DESC',
      args: [reviewerId],
    });

    return result.rows.map(row => ({
      reviewId: row.review_id,
      submissionId: row.submission_id,
      reviewerId: row.reviewer_id,
      rating: Number(row.rating),
      comments: row.comments,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }));
  } catch (error) {
    console.error('[writingService:turso] Error fetching assigned peer reviews:', error);
    throw error;
  }
}

/**
 * Create a peer review
 * @param reviewData - Peer review data
 * @returns Created review with generated ID
 */
export async function createPeerReview(reviewData: any): Promise<any> {
  try {
    const now = Date.now();
    const reviewId = `pr_${now}_${Math.random().toString(36).substr(2, 9)}`;

    await db.execute({
      sql: `INSERT INTO peer_reviews (
        review_id, submission_id, reviewer_id, rating, comments,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        reviewId,
        reviewData.submissionId,
        reviewData.reviewerId,
        reviewData.rating,
        reviewData.comments,
        now,
        now,
      ],
    });

    return {
      reviewId,
      ...reviewData,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('[writingService:turso] Error creating peer review:', error);
    throw error;
  }
}

/**
 * Update a peer review
 * @param reviewId - Review ID
 * @param updates - Partial review data to update
 */
export async function updatePeerReview(reviewId: string, updates: any): Promise<void> {
  try {
    const setClauses: string[] = [];
    const args: any[] = [];

    if (updates.rating !== undefined) {
      setClauses.push('rating = ?');
      args.push(updates.rating);
    }
    if (updates.comments !== undefined) {
      setClauses.push('comments = ?');
      args.push(updates.comments);
    }

    setClauses.push('updated_at = ?');
    args.push(Date.now());

    args.push(reviewId);

    await db.execute({
      sql: `UPDATE peer_reviews SET ${setClauses.join(', ')} WHERE review_id = ?`,
      args,
    });
  } catch (error) {
    console.error('[writingService:turso] Error updating peer review:', error);
    throw error;
  }
}

// ============================================================================
// TEACHER REVIEWS
// ============================================================================

/**
 * Get teacher review for a submission
 * @param submissionId - Submission ID
 * @returns Teacher review or null
 */
export async function getTeacherReview(submissionId: string): Promise<any | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM teacher_reviews WHERE submission_id = ? LIMIT 1',
      args: [submissionId],
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      reviewId: row.review_id,
      submissionId: row.submission_id,
      teacherId: row.teacher_id,
      grammarScore: Number(row.grammar_score),
      vocabularyScore: Number(row.vocabulary_score),
      coherenceScore: Number(row.coherence_score),
      overallScore: Number(row.overall_score),
      comments: row.comments,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    };
  } catch (error) {
    console.error('[writingService:turso] Error fetching teacher review:', error);
    throw error;
  }
}

/**
 * Get all reviews by a teacher
 * @param teacherId - Teacher's user ID
 * @returns Array of teacher reviews
 */
export async function getTeacherReviews(teacherId: string): Promise<any[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM teacher_reviews WHERE teacher_id = ? ORDER BY created_at DESC',
      args: [teacherId],
    });

    return result.rows.map(row => ({
      reviewId: row.review_id,
      submissionId: row.submission_id,
      teacherId: row.teacher_id,
      grammarScore: Number(row.grammar_score),
      vocabularyScore: Number(row.vocabulary_score),
      coherenceScore: Number(row.coherence_score),
      overallScore: Number(row.overall_score),
      comments: row.comments,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }));
  } catch (error) {
    console.error('[writingService:turso] Error fetching teacher reviews:', error);
    throw error;
  }
}

/**
 * Create a teacher review
 * Also updates the submission status to 'reviewed'
 * @param reviewData - Teacher review data
 * @returns Created review with generated ID
 */
export async function createTeacherReview(reviewData: any): Promise<any> {
  try {
    const now = Date.now();
    const reviewId = `tr_${now}_${Math.random().toString(36).substr(2, 9)}`;

    // Use batch to ensure atomicity
    await db.batch([
      {
        sql: `INSERT INTO teacher_reviews (
          review_id, submission_id, teacher_id, grammar_score, vocabulary_score,
          coherence_score, overall_score, comments, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          reviewId,
          reviewData.submissionId,
          reviewData.teacherId,
          reviewData.grammarScore,
          reviewData.vocabularyScore,
          reviewData.coherenceScore,
          reviewData.overallScore,
          reviewData.comments,
          now,
          now,
        ],
      },
      {
        sql: `UPDATE writing_submissions SET
          status = 'reviewed',
          teacher_score = ?,
          teacher_feedback = ?,
          updated_at = ?
        WHERE submission_id = ?`,
        args: [
          reviewData.overallScore,
          JSON.stringify({
            grammarScore: reviewData.grammarScore,
            vocabularyScore: reviewData.vocabularyScore,
            coherenceScore: reviewData.coherenceScore,
            overallScore: reviewData.overallScore,
          }),
          now,
          reviewData.submissionId,
        ],
      },
    ]);

    return {
      reviewId,
      ...reviewData,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('[writingService:turso] Error creating teacher review:', error);
    throw error;
  }
}

/**
 * Update a teacher review
 * @param reviewId - Review ID
 * @param updates - Partial review data to update
 */
export async function updateTeacherReview(reviewId: string, updates: any): Promise<void> {
  try {
    const setClauses: string[] = [];
    const args: any[] = [];

    if (updates.grammarScore !== undefined) {
      setClauses.push('grammar_score = ?');
      args.push(updates.grammarScore);
    }
    if (updates.vocabularyScore !== undefined) {
      setClauses.push('vocabulary_score = ?');
      args.push(updates.vocabularyScore);
    }
    if (updates.coherenceScore !== undefined) {
      setClauses.push('coherence_score = ?');
      args.push(updates.coherenceScore);
    }
    if (updates.overallScore !== undefined) {
      setClauses.push('overall_score = ?');
      args.push(updates.overallScore);
    }
    if (updates.comments !== undefined) {
      setClauses.push('comments = ?');
      args.push(updates.comments);
    }

    setClauses.push('updated_at = ?');
    args.push(Date.now());

    args.push(reviewId);

    await db.execute({
      sql: `UPDATE teacher_reviews SET ${setClauses.join(', ')} WHERE review_id = ?`,
      args,
    });
  } catch (error) {
    console.error('[writingService:turso] Error updating teacher review:', error);
    throw error;
  }
}

// ============================================================================
// WRITING PROGRESS & STATS
// ============================================================================

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
