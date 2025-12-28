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
      correctedVersion: row.corrected_version,
      strengths: row.strengths ? JSON.parse(row.strengths as string) : [],
      areasForImprovement: row.areas_for_improvement ? JSON.parse(row.areas_for_improvement as string) : [],
      meetsCriteria: Boolean(row.meets_criteria),
      requiresRevision: Boolean(row.requires_revision),
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
      correctedVersion: row.corrected_version,
      strengths: row.strengths ? JSON.parse(row.strengths as string) : [],
      areasForImprovement: row.areas_for_improvement ? JSON.parse(row.areas_for_improvement as string) : [],
      meetsCriteria: Boolean(row.meets_criteria),
      requiresRevision: Boolean(row.requires_revision),
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
          coherence_score, overall_score, comments, corrected_version,
          strengths, areas_for_improvement, meets_criteria, requires_revision,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          reviewId,
          reviewData.submissionId,
          reviewData.teacherId,
          reviewData.grammarScore,
          reviewData.vocabularyScore,
          reviewData.coherenceScore,
          reviewData.overallScore,
          reviewData.comments,
          reviewData.correctedVersion || null,
          JSON.stringify(reviewData.strengths || []),
          JSON.stringify(reviewData.areasForImprovement || []),
          reviewData.meetsCriteria ? 1 : 0,
          reviewData.requiresRevision ? 1 : 0,
          now,
          now,
        ],
      },
      {
        sql: `UPDATE writing_submissions SET
          status = 'reviewed',
          teacher_score = ?,
          teacher_feedback = ?,
          teacher_corrected_version = ?,
          teacher_corrected_at = ?,
          updated_at = ?
        WHERE submission_id = ?`,
        args: [
          reviewData.overallScore,
          JSON.stringify({
            grammarScore: reviewData.grammarScore,
            vocabularyScore: reviewData.vocabularyScore,
            coherenceScore: reviewData.coherenceScore,
            overallScore: reviewData.overallScore,
            overallComment: reviewData.comments, // Include comment in feedback JSON for easy access
          }),
          reviewData.correctedVersion || null,
          reviewData.correctedVersion ? now : null,
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
    if (updates.correctedVersion !== undefined) {
      setClauses.push('corrected_version = ?');
      args.push(updates.correctedVersion);
    }
    if (updates.strengths !== undefined) {
      setClauses.push('strengths = ?');
      args.push(JSON.stringify(updates.strengths));
    }
    if (updates.areasForImprovement !== undefined) {
      setClauses.push('areas_for_improvement = ?');
      args.push(JSON.stringify(updates.areasForImprovement));
    }
    if (updates.meetsCriteria !== undefined) {
      setClauses.push('meets_criteria = ?');
      args.push(updates.meetsCriteria ? 1 : 0);
    }
    if (updates.requiresRevision !== undefined) {
      setClauses.push('requires_revision = ?');
      args.push(updates.requiresRevision ? 1 : 0);
    }

    setClauses.push('updated_at = ?');
    args.push(Date.now());

    args.push(reviewId);

    // If updating correctedVersion or scores, we should also update writing_submissions
    // But we need submissionId for that. 
    // Ideally we should do a batch update here too, but we need to fetch the review first to get submissionId
    // For now, let's just update the review table. 
    // If submission table needs to be in sync, we might need a separate call or refactor.
    
    // Actually, let's fetch submissionId first to keep them in sync
    const reviewResult = await db.execute({
        sql: 'SELECT submission_id FROM teacher_reviews WHERE review_id = ?',
        args: [reviewId]
    });
    
    if (reviewResult.rows.length > 0) {
        const submissionId = reviewResult.rows[0].submission_id;
        
        const submissionUpdates: string[] = [];
        const submissionArgs: any[] = [];
        
        if (updates.correctedVersion !== undefined) {
            submissionUpdates.push('teacher_corrected_version = ?');
            submissionArgs.push(updates.correctedVersion);
            submissionUpdates.push('teacher_corrected_at = ?');
            submissionArgs.push(updates.correctedVersion ? Date.now() : null);
        }
        
        if (updates.overallScore !== undefined) {
             submissionUpdates.push('teacher_score = ?');
             submissionArgs.push(updates.overallScore);
        }
        
        if (submissionUpdates.length > 0) {
             submissionUpdates.push('updated_at = ?');
             submissionArgs.push(Date.now());
             submissionArgs.push(submissionId);
             
             await db.batch([
                 {
                     sql: `UPDATE teacher_reviews SET ${setClauses.join(', ')} WHERE review_id = ?`,
                     args: args
                 },
                 {
                     sql: `UPDATE writing_submissions SET ${submissionUpdates.join(', ')} WHERE submission_id = ?`,
                     args: submissionArgs
                 }
             ]);
             return;
        }
    }

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
        correctedVersion: row.corrected_version,
        strengths: row.strengths ? JSON.parse(row.strengths as string) : [],
        areasForImprovement: row.areas_for_improvement ? JSON.parse(row.areas_for_improvement as string) : [],
        meetsCriteria: Boolean(row.meets_criteria),
        requiresRevision: Boolean(row.requires_revision),
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
