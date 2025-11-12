/**
 * Writing Service - Database abstraction layer for writing operations
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
 */

import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  WritingSubmission,
  WritingExerciseType,
  WritingProgress,
  WritingStats,
  TranslationExercise,
  CreativeWritingExercise,
} from '../models/writing';
import { CEFRLevel } from '../models/cefr';

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
    const exercisesRef = collection(db, 'writing-exercises');
    let q;

    if (exerciseType) {
      q = query(
        exercisesRef,
        where('level', '==', level),
        where('type', '==', exerciseType),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        exercisesRef,
        where('level', '==', level),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      exerciseId: doc.id,
      ...doc.data(),
    })) as (TranslationExercise | CreativeWritingExercise)[];
  } catch (error) {
    console.error('[writingService] Error fetching writing exercises:', error);
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
    const exerciseRef = doc(db, 'writing-exercises', exerciseId);
    const exerciseSnap = await getDoc(exerciseRef);

    if (!exerciseSnap.exists()) return null;

    return {
      exerciseId: exerciseSnap.id,
      ...exerciseSnap.data(),
    } as TranslationExercise | CreativeWritingExercise;
  } catch (error) {
    console.error('[writingService] Error fetching writing exercise:', error);
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
    const submissionsRef = collection(db, 'writing-submissions');
    let q;

    if (exerciseType) {
      q = query(
        submissionsRef,
        where('userId', '==', userId),
        where('exerciseType', '==', exerciseType),
        orderBy('updatedAt', 'desc')
      );
    } else {
      q = query(
        submissionsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      submissionId: doc.id,
      ...doc.data(),
    })) as WritingSubmission[];
  } catch (error) {
    console.error('[writingService] Error fetching student submissions:', error);
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
    const submissionRef = doc(db, 'writing-submissions', submissionId);
    const submissionSnap = await getDoc(submissionRef);

    if (!submissionSnap.exists()) return null;

    return {
      submissionId: submissionSnap.id,
      ...submissionSnap.data(),
    } as WritingSubmission;
  } catch (error) {
    console.error('[writingService] Error fetching writing submission:', error);
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
    const submissionsRef = collection(db, 'writing-submissions');
    const q = query(
      submissionsRef,
      where('exerciseId', '==', exerciseId),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      submissionId: doc.id,
      ...doc.data(),
    })) as WritingSubmission[];
  } catch (error) {
    console.error('[writingService] Error fetching exercise submissions:', error);
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
    const submissionsRef = collection(db, 'writing-submissions');
    let q;

    if (statusFilter === 'submitted') {
      q = query(
        submissionsRef,
        where('status', '==', 'submitted'),
        orderBy('submittedAt', 'desc')
      );
    } else if (statusFilter === 'reviewed') {
      q = query(
        submissionsRef,
        where('status', '==', 'reviewed'),
        orderBy('updatedAt', 'desc')
      );
    } else {
      q = query(
        submissionsRef,
        where('status', 'in', ['submitted', 'reviewed']),
        orderBy('updatedAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      submissionId: doc.id,
      ...doc.data(),
    })) as WritingSubmission[];
  } catch (error) {
    console.error('[writingService] Error fetching all writing submissions:', error);
    throw error;
  }
}

/**
 * Get count of pending writing submissions
 * @returns Number of submissions awaiting review
 */
export async function getPendingWritingCount(): Promise<number> {
  try {
    const submissionsRef = collection(db, 'writing-submissions');
    const q = query(
      submissionsRef,
      where('status', '==', 'submitted')
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('[writingService] Error fetching pending writing count:', error);
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
    const submissionsRef = collection(db, 'writing-submissions');
    const now = Date.now();

    const submission = {
      ...submissionData,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(submissionsRef, submission);

    return {
      submissionId: docRef.id,
      ...submission,
    } as WritingSubmission;
  } catch (error) {
    console.error('[writingService] Error creating writing submission:', error);
    throw error;
  }
}

/**
 * Update a writing submission
 * @param submissionId - Submission ID
 * @param updates - Partial submission data to update
 */
export async function updateWritingSubmission(
  submissionId: string,
  updates: Partial<WritingSubmission>
): Promise<void> {
  try {
    const submissionRef = doc(db, 'writing-submissions', submissionId);
    await updateDoc(submissionRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[writingService] Error updating writing submission:', error);
    throw error;
  }
}

/**
 * Submit a writing exercise (change status from draft to submitted)
 * @param submissionId - Submission ID
 */
export async function submitWriting(submissionId: string): Promise<void> {
  try {
    const submissionRef = doc(db, 'writing-submissions', submissionId);
    const now = Date.now();

    await updateDoc(submissionRef, {
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('[writingService] Error submitting writing:', error);
    throw error;
  }
}

/**
 * Delete a writing submission
 * @param submissionId - Submission ID
 */
export async function deleteWritingSubmission(submissionId: string): Promise<void> {
  try {
    const submissionRef = doc(db, 'writing-submissions', submissionId);
    await deleteDoc(submissionRef);
  } catch (error) {
    console.error('[writingService] Error deleting writing submission:', error);
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
    console.error('[writingService] Error fetching peer reviews:', error);
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
    console.error('[writingService] Error fetching assigned peer reviews:', error);
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
    console.error('[writingService] Error creating peer review:', error);
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
    console.error('[writingService] Error updating peer review:', error);
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
    console.error('[writingService] Error fetching teacher review:', error);
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
    console.error('[writingService] Error fetching teacher reviews:', error);
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

    const review = {
      ...reviewData,
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

    return {
      reviewId: docRef.id,
      ...review,
    };
  } catch (error) {
    console.error('[writingService] Error creating teacher review:', error);
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
    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[writingService] Error updating teacher review:', error);
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
    const progressRef = collection(db, 'writing-progress');
    const q = query(
      progressRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as WritingProgress);
  } catch (error) {
    console.error('[writingService] Error fetching writing progress:', error);
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
    const statsRef = doc(db, 'writing-stats', userId);
    const statsSnap = await getDoc(statsRef);

    if (!statsSnap.exists()) {
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

    const stats = statsSnap.data() as WritingStats;
    return stats;
  } catch (error) {
    console.error('[writingService] Error fetching writing stats:', error);
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
    const statsRef = doc(db, 'writing-stats', userId);
    await updateDoc(statsRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[writingService] Error updating writing stats:', error);
    throw error;
  }
}

/**
 * Update daily writing progress
 * @param progressId - Progress ID
 * @param progressData - Progress data to update
 */
export async function updateWritingProgress(
  progressId: string,
  progressData: WritingProgress
): Promise<void> {
  try {
    const progressRef = doc(db, 'writing-progress', progressId);
    await updateDoc(progressRef, {
      ...progressData,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[writingService] Error updating writing progress:', error);
    throw error;
  }
}

// ============================================================================
// POSTGRESQL MIGRATION EXAMPLE (commented out)
// ============================================================================

/*
// To switch to PostgreSQL, replace the implementations above with:

import { sql } from '@vercel/postgres';

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

export async function getPeerReviews(submissionId: string): Promise<any[]> {
  const result = await sql`
    SELECT * FROM peer_reviews
    WHERE submission_id = ${submissionId}
    ORDER BY created_at DESC
  `;

  return result.rows;
}

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
