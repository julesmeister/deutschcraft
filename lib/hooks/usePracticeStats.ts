'use client';

import { useQuery } from '@tanstack/react-query';
import { cacheTimes } from '../queryClient';
import { getPracticeStats } from '../services/flashcardService';

/**
 * Fetches practice statistics for Quick Actions
 * - Cards ready for practice (next review date is today or earlier)
 * - Words to review (cards reviewed but need another look)
 * Uses flashcardService for database abstraction
 */
export function usePracticeStats(userId: string | null | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['practiceStats', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      return await getPracticeStats(userId);
    },
    staleTime: cacheTimes.dashboardStats, // 1 minute
    gcTime: cacheTimes.dashboardStats * 2,
    enabled: !!userId,
  });

  return {
    cardsReady: data?.cardsReady || 0,
    wordsToReview: data?.wordsToReview || 0,
    totalCards: data?.totalCards || 0,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
