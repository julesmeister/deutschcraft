/**
 * Writing Attempt Service - Turso Implementation
 * Handles logic for multiple attempts on the same exercise
 */

import { db } from '@/turso/client';
import { WritingSubmission } from '@/lib/models/writing';

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
    exerciseType: row.exercise_type as any,
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
    structuredFields: row.structured_fields ? JSON.parse(row.structured_fields as string) : undefined,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

// ============================================================================
// ATTEMPT OPERATIONS
// ============================================================================

/**
 * Get the next attempt number for a user/exercise combination
 * Returns 1 for first attempt, 2 for second, etc.
 */
export async function getNextAttemptNumber(
  userId: string,
  exerciseId: string
): Promise<number> {
  try {
    const result = await db.execute({
      sql: `SELECT attempt_number FROM writing_submissions
            WHERE user_id = ? AND exercise_id = ?
            ORDER BY attempt_number DESC
            LIMIT 1`,
      args: [userId, exerciseId],
    });

    if (result.rows.length === 0) {
      return 1; // First attempt
    }

    const lastAttemptNumber = Number(result.rows[0].attempt_number) || 0;
    return lastAttemptNumber + 1;
  } catch (error) {
    console.error('[writingAttemptService:turso] Error getting next attempt number:', error);
    throw error;
  }
}

/**
 * Get all attempts for a specific user/exercise combination
 * Returns array sorted by attempt number (oldest first)
 */
export async function getUserExerciseAttempts(
  userId: string,
  exerciseId: string
): Promise<WritingSubmission[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM writing_submissions
            WHERE user_id = ? AND exercise_id = ?
            ORDER BY attempt_number ASC`,
      args: [userId, exerciseId],
    });

    return result.rows.map(rowToSubmission);
  } catch (error) {
    console.error('[writingAttemptService:turso] Error getting user exercise attempts:', error);
    throw error;
  }
}

/**
 * Get the latest attempt for a user/exercise
 */
export async function getLatestAttempt(
  userId: string,
  exerciseId: string
): Promise<WritingSubmission | null> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM writing_submissions
            WHERE user_id = ? AND exercise_id = ?
            ORDER BY attempt_number DESC
            LIMIT 1`,
      args: [userId, exerciseId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToSubmission(result.rows[0]);
  } catch (error) {
    console.error('[writingAttemptService:turso] Error getting latest attempt:', error);
    throw error;
  }
}

/**
 * Check if user has any draft attempts for this exercise
 */
export async function hasDraftAttempt(
  userId: string,
  exerciseId: string
): Promise<WritingSubmission | null> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM writing_submissions
            WHERE user_id = ? AND exercise_id = ? AND status = 'draft'
            ORDER BY attempt_number DESC
            LIMIT 1`,
      args: [userId, exerciseId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToSubmission(result.rows[0]);
  } catch (error) {
    console.error('[writingAttemptService:turso] Error checking for draft attempt:', error);
    throw error;
  }
}

/**
 * Get attempt statistics for display
 */
export async function getAttemptStats(
  userId: string,
  exerciseId: string
): Promise<{
  totalAttempts: number;
  reviewedAttempts: number;
  averageScore: number;
  bestScore: number;
  latestScore: number;
}> {
  try {
    const attempts = await getUserExerciseAttempts(userId, exerciseId);

    const reviewedAttempts = attempts.filter(a => a.status === 'reviewed');
    const scores = reviewedAttempts
      .map(a => a.teacherScore)
      .filter((score): score is number => score !== undefined && score > 0);

    return {
      totalAttempts: attempts.length,
      reviewedAttempts: reviewedAttempts.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      latestScore: scores.length > 0 ? scores[scores.length - 1] : 0,
    };
  } catch (error) {
    console.error('[writingAttemptService:turso] Error getting attempt stats:', error);
    throw error;
  }
}
