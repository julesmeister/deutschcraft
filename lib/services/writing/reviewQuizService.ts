/**
 * Review Quiz Service - Database Switcher
 * Automatically switches between Firebase and Turso implementations
 */

import { ReviewQuiz, QuizBlank } from '../../models/writing';
import * as firebaseImpl from './firebase/reviewQuizService';
import * as tursoImpl from '../turso/reviewQuizService';

const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === 'true';

// ============================================================================
// TURSO ADAPTERS
// Adapts Turso implementation to match the existing Firestore API
// ============================================================================

async function createReviewQuizTurso(
  submissionId: string,
  userId: string,
  exerciseId: string,
  exerciseType: string,
  sourceType: 'ai' | 'teacher' | 'reference',
  originalText: string,
  correctedText: string,
  blanks: QuizBlank[]
): Promise<ReviewQuiz> {
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

  const quizId = await tursoImpl.createReviewQuiz(quizData);

  return {
    quizId,
    ...quizData,
  };
}

async function completeReviewQuizTurso(
  quizId: string,
  answers: Record<number, string>,
  score: number,
  correctAnswers: number
): Promise<ReviewQuiz | null> {
  await tursoImpl.updateQuizAnswers(quizId, answers, correctAnswers, score);
  await tursoImpl.completeQuiz(quizId);
  return await tursoImpl.getReviewQuiz(quizId);
}

const getQuizzesForSubmissionTurso = tursoImpl.getSubmissionQuizzes;

const getQuizzesForUserTurso = tursoImpl.getUserReviewQuizzes;

async function getCompletedQuizzesForUserTurso(userId: string): Promise<ReviewQuiz[]> {
  return await tursoImpl.getUserReviewQuizzes(userId, 'completed');
}

async function getUserQuizStatsTurso(userId: string) {
  const stats = await tursoImpl.getUserQuizStats(userId);
  
  // Calculate bestScore and averageScore manually as Turso optimized stats don't provide them yet
  const quizzes = await tursoImpl.getUserReviewQuizzes(userId, 'completed');
  const scores = quizzes.map(q => q.score);
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return {
    totalQuizzes: stats.totalQuizzes,
    completedQuizzes: stats.totalQuizzes,
    totalPoints: stats.totalPoints,
    bestScore,
    averageScore,
  };
}

// ============================================================================
// EXPORT SWITCHER
// ============================================================================

const implementation = USE_TURSO
  ? {
      createReviewQuiz: createReviewQuizTurso,
      completeReviewQuiz: completeReviewQuizTurso,
      getReviewQuiz: tursoImpl.getReviewQuiz,
      getQuizzesForSubmission: getQuizzesForSubmissionTurso,
      getQuizzesForUser: getQuizzesForUserTurso,
      getCompletedQuizzesForUser: getCompletedQuizzesForUserTurso,
      getUserQuizStats: getUserQuizStatsTurso,
    }
  : firebaseImpl;

export const {
  createReviewQuiz,
  completeReviewQuiz,
  getReviewQuiz,
  getQuizzesForSubmission,
  getQuizzesForUser,
  getCompletedQuizzesForUser,
  getUserQuizStats,
} = implementation;
