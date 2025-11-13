/**
 * Peer Reviews - Turso Implementation
 * Database operations for peer review functionality
 */

import { db } from '@/turso/client';

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
