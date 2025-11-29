/**
 * Review Quiz Service
 * Firestore operations for review quizzes
 */

import { db } from '../../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { ReviewQuiz, QuizBlank } from '../../models/writing';

const COLLECTION = 'writing-review-quizzes';

/**
 * Create a new review quiz
 */
export async function createReviewQuiz(
  submissionId: string,
  userId: string,
  exerciseId: string,
  exerciseType: string,
  sourceType: 'ai' | 'teacher' | 'reference',
  originalText: string,
  correctedText: string,
  blanks: QuizBlank[]
): Promise<ReviewQuiz> {
  try {
    const now = Date.now();
    const quizData = {
      submissionId,
      userId,
      exerciseId,
      exerciseType,
      sourceType,
      originalText,
      correctedText,
      blanks,
      answers: {},
      score: 0,
      correctAnswers: 0,
      totalBlanks: blanks.length,
      status: 'in-progress' as const,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION), quizData);

    return {
      quizId: docRef.id,
      ...quizData,
    };
  } catch (error) {
    console.error('[reviewQuizService] Error creating quiz:', error);
    throw error;
  }
}

/**
 * Complete a review quiz with answers and score
 * Returns the completed quiz data for further processing (e.g., progress tracking)
 */
export async function completeReviewQuiz(
  quizId: string,
  answers: Record<number, string>,
  score: number,
  correctAnswers: number
): Promise<ReviewQuiz | null> {
  try {
    const quizRef = doc(db, COLLECTION, quizId);
    const now = Date.now();

    // Update quiz status
    await updateDoc(quizRef, {
      answers,
      score,
      correctAnswers,
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    });

    // Return the updated quiz for caller to handle progress tracking
    return await getReviewQuiz(quizId);
  } catch (error) {
    console.error('[reviewQuizService] Error completing quiz:', error);
    throw error;
  }
}

/**
 * Get a review quiz by ID
 */
export async function getReviewQuiz(quizId: string): Promise<ReviewQuiz | null> {
  try {
    const quizDoc = await getDoc(doc(db, COLLECTION, quizId));

    if (!quizDoc.exists()) {
      return null;
    }

    return {
      quizId: quizDoc.id,
      ...quizDoc.data(),
    } as ReviewQuiz;
  } catch (error) {
    console.error('[reviewQuizService] Error getting quiz:', error);
    throw error;
  }
}

/**
 * Get all quizzes for a submission
 */
export async function getQuizzesForSubmission(submissionId: string): Promise<ReviewQuiz[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('submissionId', '==', submissionId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      quizId: doc.id,
      ...doc.data(),
    } as ReviewQuiz));
  } catch (error) {
    console.error('[reviewQuizService] Error getting quizzes for submission:', error);
    throw error;
  }
}

/**
 * Get all quizzes for a user
 */
export async function getQuizzesForUser(userId: string, limitCount: number = 50): Promise<ReviewQuiz[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      quizId: doc.id,
      ...doc.data(),
    } as ReviewQuiz));
  } catch (error) {
    console.error('[reviewQuizService] Error getting quizzes for user:', error);
    throw error;
  }
}

/**
 * Get completed quizzes for a user with scores
 */
export async function getCompletedQuizzesForUser(userId: string): Promise<ReviewQuiz[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      quizId: doc.id,
      ...doc.data(),
    } as ReviewQuiz));
  } catch (error) {
    console.error('[reviewQuizService] Error getting completed quizzes:', error);
    throw error;
  }
}

/**
 * Calculate average quiz score for a user
 */
export async function getUserQuizStats(userId: string): Promise<{
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  bestScore: number;
}> {
  try {
    const quizzes = await getCompletedQuizzesForUser(userId);

    const totalQuizzes = quizzes.length;
    const completedQuizzes = quizzes.filter(q => q.status === 'completed').length;
    const scores = quizzes.map(q => q.score);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    return {
      totalQuizzes,
      completedQuizzes,
      averageScore,
      bestScore,
    };
  } catch (error) {
    console.error('[reviewQuizService] Error calculating quiz stats:', error);
    throw error;
  }
}
