/**
 * React Query hooks for writing attempts
 * Fetch and manage multiple attempts per exercise
 */

import { useQuery } from '@tanstack/react-query';
import {
  getUserExerciseAttempts,
  getLatestAttempt,
  getAttemptStats,
} from '@/lib/services/writingAttemptService';

/**
 * Get all attempts for a specific user/exercise combination
 */
export function useExerciseAttempts(userId?: string, exerciseId?: string) {
  return useQuery({
    queryKey: ['exercise-attempts', userId, exerciseId],
    queryFn: async () => {
      if (!userId || !exerciseId) return [];
      return await getUserExerciseAttempts(userId, exerciseId);
    },
    enabled: !!userId && !!exerciseId,
  });
}

/**
 * Get the latest attempt for a user/exercise
 */
export function useLatestAttempt(userId?: string, exerciseId?: string) {
  return useQuery({
    queryKey: ['latest-attempt', userId, exerciseId],
    queryFn: async () => {
      if (!userId || !exerciseId) return null;
      return await getLatestAttempt(userId, exerciseId);
    },
    enabled: !!userId && !!exerciseId,
  });
}

/**
 * Get attempt statistics for a user/exercise
 */
export function useAttemptStats(userId?: string, exerciseId?: string) {
  return useQuery({
    queryKey: ['attempt-stats', userId, exerciseId],
    queryFn: async () => {
      if (!userId || !exerciseId) {
        return {
          totalAttempts: 0,
          reviewedAttempts: 0,
          averageScore: 0,
          bestScore: 0,
          latestScore: 0,
        };
      }
      return await getAttemptStats(userId, exerciseId);
    },
    enabled: !!userId && !!exerciseId,
  });
}
