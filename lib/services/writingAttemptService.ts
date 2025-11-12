/**
 * Writing Attempt Service
 * Handles logic for multiple attempts on the same exercise
 */

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WritingSubmission } from '@/lib/models/writing';

/**
 * Get the next attempt number for a user/exercise combination
 * Returns 1 for first attempt, 2 for second, etc.
 */
export async function getNextAttemptNumber(
  userId: string,
  exerciseId: string
): Promise<number> {
  const submissionsRef = collection(db, 'writing-submissions');
  const q = query(
    submissionsRef,
    where('userId', '==', userId),
    where('exerciseId', '==', exerciseId),
    orderBy('attemptNumber', 'desc')
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return 1; // First attempt
  }

  const lastSubmission = snapshot.docs[0].data() as WritingSubmission;
  return (lastSubmission.attemptNumber || 0) + 1;
}

/**
 * Get all attempts for a specific user/exercise combination
 * Returns array sorted by attempt number (oldest first)
 */
export async function getUserExerciseAttempts(
  userId: string,
  exerciseId: string
): Promise<WritingSubmission[]> {
  const submissionsRef = collection(db, 'writing-submissions');
  const q = query(
    submissionsRef,
    where('userId', '==', userId),
    where('exerciseId', '==', exerciseId),
    orderBy('attemptNumber', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    submissionId: doc.id,
  })) as WritingSubmission[];
}

/**
 * Get the latest attempt for a user/exercise
 */
export async function getLatestAttempt(
  userId: string,
  exerciseId: string
): Promise<WritingSubmission | null> {
  const submissionsRef = collection(db, 'writing-submissions');
  const q = query(
    submissionsRef,
    where('userId', '==', userId),
    where('exerciseId', '==', exerciseId),
    orderBy('attemptNumber', 'desc')
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    ...doc.data(),
    submissionId: doc.id,
  } as WritingSubmission;
}

/**
 * Check if user has any draft attempts for this exercise
 */
export async function hasDraftAttempt(
  userId: string,
  exerciseId: string
): Promise<WritingSubmission | null> {
  const submissionsRef = collection(db, 'writing-submissions');
  const q = query(
    submissionsRef,
    where('userId', '==', userId),
    where('exerciseId', '==', exerciseId),
    where('status', '==', 'draft'),
    orderBy('attemptNumber', 'desc')
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    ...doc.data(),
    submissionId: doc.id,
  } as WritingSubmission;
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
}
