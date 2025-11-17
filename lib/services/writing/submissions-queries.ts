/**
 * Writing Submissions Service - Read Operations
 * Basic query operations for writing submissions
 */

import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  WritingSubmission,
  WritingExerciseType,
} from '../../models/writing';

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
    console.error('[submissions] Error fetching student submissions:', error);
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
    console.error('[submissions] Error fetching writing submission:', error);
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
    console.error('[submissions] Error fetching exercise submissions:', error);
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
    console.error('[submissions] Error fetching all writing submissions:', error);
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
    console.error('[submissions] Error fetching pending writing count:', error);
    throw error;
  }
}
