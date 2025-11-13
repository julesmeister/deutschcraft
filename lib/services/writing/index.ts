/**
 * Writing Service - Main Entry Point
 *
 * This service handles all writing-related operations:
 * - Writing submissions (exercises, homework)
 * - Peer reviews and teacher reviews
 * - Writing progress and statistics
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firestore operations are isolated here
 * - Hooks call these functions instead of using Firestore directly
 * - Easy to swap to PostgreSQL/MongoDB by changing implementation
 *
 * File Structure:
 * - exercises.ts - Exercise fetching operations
 * - submissions.ts - Submission CRUD operations
 * - reviews.ts - Peer and teacher review operations
 * - progress.ts - Progress tracking and statistics
 */

// Re-export all functions for backward compatibility
export * from './exercises';
export * from './submissions';
export * from './reviews';
export * from './progress';

// ============================================================================
// POSTGRESQL MIGRATION EXAMPLE (commented out)
// ============================================================================

/*
// To switch to PostgreSQL, replace the implementations in each module with:

import { sql } from '@vercel/postgres';

// Example from submissions.ts:
export async function getStudentSubmissions(
  userId: string,
  exerciseType?: WritingExerciseType
): Promise<WritingSubmission[]> {
  if (exerciseType) {
    const result = await sql`
      SELECT * FROM writing_submissions
      WHERE user_id = ${userId} AND exercise_type = ${exerciseType}
      ORDER BY updated_at DESC
    `;
    return result.rows as WritingSubmission[];
  } else {
    const result = await sql`
      SELECT * FROM writing_submissions
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;
    return result.rows as WritingSubmission[];
  }
}

// Example from submissions.ts:
export async function createWritingSubmission(
  submissionData: Omit<WritingSubmission, 'submissionId' | 'createdAt' | 'updatedAt' | 'version'>
): Promise<WritingSubmission> {
  const result = await sql`
    INSERT INTO writing_submissions (
      user_id, exercise_id, exercise_type, content, status,
      submitted_at, version, created_at, updated_at
    )
    VALUES (
      ${submissionData.userId}, ${submissionData.exerciseId},
      ${submissionData.exerciseType}, ${submissionData.content},
      ${submissionData.status}, ${submissionData.submittedAt},
      1, NOW(), NOW()
    )
    RETURNING *
  `;

  return result.rows[0] as WritingSubmission;
}

// Example from reviews.ts:
export async function getPeerReviews(submissionId: string): Promise<any[]> {
  const result = await sql`
    SELECT * FROM peer_reviews
    WHERE submission_id = ${submissionId}
    ORDER BY created_at DESC
  `;

  return result.rows;
}

// Example from progress.ts:
export async function getWritingStats(userId: string): Promise<WritingStats> {
  const result = await sql`
    SELECT * FROM writing_stats
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  if (result.rows.length === 0) {
    // Return default stats
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
      exercisesByLevel: {},
      currentStreak: 0,
      longestStreak: 0,
      recentScores: [],
      updatedAt: Date.now(),
    };
  }

  return result.rows[0] as WritingStats;
}

// ... other functions follow the same pattern
*/
