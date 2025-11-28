/**
 * React Query hooks for Review Quiz management
 */

import { useQuery } from '@tanstack/react-query';
import {
  getReviewQuiz,
  getQuizzesForSubmission,
  getQuizzesForUser,
  getCompletedQuizzesForUser,
  getUserQuizStats,
} from '../services/writing/reviewQuizService';

/**
 * Get a single review quiz by ID
 */
export function useReviewQuiz(quizId: string | null) {
  return useQuery({
    queryKey: ['review-quiz', quizId],
    queryFn: () => (quizId ? getReviewQuiz(quizId) : null),
    enabled: !!quizId,
  });
}

/**
 * Get all quizzes for a submission
 */
export function useSubmissionQuizzes(submissionId: string | null) {
  return useQuery({
    queryKey: ['submission-quizzes', submissionId],
    queryFn: () => (submissionId ? getQuizzesForSubmission(submissionId) : []),
    enabled: !!submissionId,
  });
}

/**
 * Get all quizzes for a user (with optional limit)
 */
export function useUserQuizzes(userId: string | null, limitCount?: number) {
  return useQuery({
    queryKey: ['user-quizzes', userId, limitCount],
    queryFn: () => (userId ? getQuizzesForUser(userId, limitCount) : []),
    enabled: !!userId,
  });
}

/**
 * Get completed quizzes for a user
 */
export function useCompletedQuizzes(userId: string | null) {
  return useQuery({
    queryKey: ['completed-quizzes', userId],
    queryFn: () => (userId ? getCompletedQuizzesForUser(userId) : []),
    enabled: !!userId,
  });
}

/**
 * Get quiz statistics for a user
 */
export function useUserQuizStats(userId: string | null) {
  return useQuery({
    queryKey: ['user-quiz-stats', userId],
    queryFn: () => (userId ? getUserQuizStats(userId) : null),
    enabled: !!userId,
  });
}
