/**
 * Writing Reviews Service
 * Handles peer reviews and teacher reviews for writing submissions
 */

import { db } from '../../firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { recalculateWritingStats } from './stats-calculator';

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
    const reviewsRef = collection(db, 'peer-reviews');
    const q = query(
      reviewsRef,
      where('submissionId', '==', submissionId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      reviewId: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('[reviews] Error fetching peer reviews:', error);
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
    const reviewsRef = collection(db, 'peer-reviews');
    const q = query(
      reviewsRef,
      where('reviewerId', '==', reviewerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      reviewId: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('[reviews] Error fetching assigned peer reviews:', error);
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
    const reviewsRef = collection(db, 'peer-reviews');
    const now = Date.now();

    const review = {
      ...reviewData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(reviewsRef, review);

    return {
      reviewId: docRef.id,
      ...review,
    };
  } catch (error) {
    console.error('[reviews] Error creating peer review:', error);
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
    const reviewRef = doc(db, 'peer-reviews', reviewId);
    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[reviews] Error updating peer review:', error);
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
    const reviewsRef = collection(db, 'teacher-reviews');
    const q = query(
      reviewsRef,
      where('submissionId', '==', submissionId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return {
      reviewId: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  } catch (error) {
    console.error('[reviews] Error fetching teacher review:', error);
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
    const reviewsRef = collection(db, 'teacher-reviews');
    const q = query(
      reviewsRef,
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      reviewId: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('[reviews] Error fetching teacher reviews:', error);
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
    const reviewsRef = collection(db, 'teacher-reviews');
    const now = Date.now();

    // Remove undefined fields to avoid Firebase errors
    const cleanedData = Object.fromEntries(
      Object.entries(reviewData).filter(([_, value]) => value !== undefined)
    );

    const review = {
      ...cleanedData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(reviewsRef, review);

    // Update submission status to 'reviewed' and add teacher feedback
    const submissionRef = doc(db, 'writing-submissions', reviewData.submissionId);
    await updateDoc(submissionRef, {
      status: 'reviewed',
      teacherFeedback: {
        grammarScore: reviewData.grammarScore,
        vocabularyScore: reviewData.vocabularyScore,
        coherenceScore: reviewData.coherenceScore,
        overallScore: reviewData.overallScore,
      },
      teacherScore: reviewData.overallScore,
      updatedAt: now,
    });

    // Recalculate student's writing stats
    await recalculateWritingStats(reviewData.studentId);

    return {
      reviewId: docRef.id,
      ...review,
    };
  } catch (error) {
    console.error('[reviews] Error creating teacher review:', error);
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
    const reviewRef = doc(db, 'teacher-reviews', reviewId);

    // Remove undefined fields to avoid Firebase errors
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await updateDoc(reviewRef, {
      ...cleanedUpdates,
      updatedAt: Date.now(),
    });

    // If scores were updated, update submission and recalculate stats
    if (updates.overallScore !== undefined || updates.grammarScore !== undefined) {
      // Update submission with new scores
      if (updates.submissionId) {
        const submissionRef = doc(db, 'writing-submissions', updates.submissionId);
        await updateDoc(submissionRef, {
          teacherFeedback: {
            grammarScore: updates.grammarScore,
            vocabularyScore: updates.vocabularyScore,
            coherenceScore: updates.coherenceScore,
            overallScore: updates.overallScore,
          },
          teacherScore: updates.overallScore,
          updatedAt: Date.now(),
        });
      }

      // Recalculate student's writing stats
      if (updates.studentId) {
        await recalculateWritingStats(updates.studentId);
      }
    }
  } catch (error) {
    console.error('[reviews] Error updating teacher review:', error);
    throw error;
  }
}

/**
 * Get teacher reviews for multiple submissions in batch (Firestore implementation)
 * Fetches reviews for multiple submissions - could be optimized with whereIn query
 *
 * @param submissionIds - Array of submission IDs
 * @returns Map of submission ID to teacher review
 */
export async function getTeacherReviewsBatch(
  submissionIds: string[]
): Promise<Record<string, any>> {
  if (submissionIds.length === 0) return {};

  try {
    const reviewsRef = collection(db, 'teacher-reviews');
    const reviewsMap: Record<string, any> = {};

    // Note: Firestore supports whereIn with up to 10 items
    // For better performance with many IDs, we could batch them in groups of 10
    if (submissionIds.length <= 10) {
      // Optimized: single query using whereIn
      const q = query(
        reviewsRef,
        where('submissionId', 'in', submissionIds)
      );

      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        reviewsMap[data.submissionId] = {
          reviewId: doc.id,
          ...data,
        };
      });
    } else {
      // Fallback: fetch individually for >10 submissions
      // This matches the approach in writingsService.ts
      await Promise.all(
        submissionIds.map(async (submissionId) => {
          try {
            const review = await getTeacherReview(submissionId);
            if (review) {
              reviewsMap[submissionId] = review;
            }
          } catch (error) {
            console.error(`[reviews] Error fetching review for ${submissionId}:`, error);
            // Continue with other submissions even if one fails
          }
        })
      );
    }

    return reviewsMap;
  } catch (error) {
    console.error('[reviews] Error fetching teacher reviews batch:', error);
    throw error;
  }
}
