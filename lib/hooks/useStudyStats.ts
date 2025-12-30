'use client';

import { useQuery } from '@tanstack/react-query';
import { cacheTimes } from '../queryClient';
import { getStudyStats } from '../services/flashcardService';

/**
 * Fetches comprehensive study statistics for a user
 * - Total cards, cards learned, cards mastered
 * - Current study streak
 * - Overall accuracy percentage
 *
 * Uses flashcardService for database abstraction
 * Previously used real-time onSnapshot listeners, now uses React Query with configurable stale time
 * @param cacheTime - Optional cache time in milliseconds (defaults to 1 minute for dashboard, 1 hour for flashcards page)
 */
export function useStudyStats(userId: string | null | undefined, refreshKey: number = 0, cacheTime?: number) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['studyStats', userId, refreshKey],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      return await getStudyStats(userId);
    },
    staleTime: cacheTime || cacheTimes.dashboardStats, // Use custom cache time or default to 1 minute
    gcTime: (cacheTime || cacheTimes.dashboardStats) * 2,
    enabled: !!userId,
  });

  return {
    stats: data || {
      totalCards: 0,
      cardsLearned: 0,
      cardsMastered: 0,
      streak: 0,
      accuracy: 0,
    },
    isLoading,
    isError,
    error: error as Error | null,
  };
}
