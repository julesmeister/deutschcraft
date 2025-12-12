/**
 * Teacher Reviews - Turso Implementation
 * Database operations for teacher review functionality
 */

import { db } from '@/turso/client';

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

/**
 * Get teacher reviews for multiple submissions in batch (OPTIMIZED for Turso)
 * Uses a single SQL query with IN clause for better performance
 *
 * @param submissionIds - Array of submission IDs
 * @returns Map of submission ID to teacher review
 */
export async function getTeacherReviewsBatch(
  submissionIds: string[]
): Promise<Record<string, any>> {
  if (submissionIds.length === 0) return {};

  try {
    // Build placeholders for IN clause: (?, ?, ?)
    const placeholders = submissionIds.map(() => '?').join(', ');

    // Single optimized query instead of multiple queries
    const result = await db.execute({
      sql: `SELECT * FROM teacher_reviews WHERE submission_id IN (${placeholders})`,
      args: submissionIds,
    });

    // Convert to map for O(1) lookup
    const reviewsMap: Record<string, any> = {};

    for (const row of result.rows) {
      const submissionId = row.submission_id as string;
      reviewsMap[submissionId] = {
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
    }

    return reviewsMap;
  } catch (error) {
    console.error('[writingService:turso] Error fetching teacher reviews batch:', error);
    throw error;
  }
}
