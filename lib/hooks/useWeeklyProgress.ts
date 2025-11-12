'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys, cacheTimes } from '../queryClient';
import { getWeeklyProgress } from '@/lib/services/progressService';

/**
 * Fetches study progress for the last 7 days
 * Returns an array of daily card counts for the weekly chart
 *
 * Optimized with:
 * - Centralized progress service
 * - Date helper utilities
 * - Better error handling
 * - Consistent data aggregation
 */
export function useWeeklyProgress(userId: string | null | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.studyProgress(userId || '', 7),
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const weeklyData = await getWeeklyProgress(userId);

      return {
        dailyData: weeklyData.dailyData,
        dayLabels: weeklyData.dayLabels,
        totalWords: weeklyData.totalCards, // Using cards as "words" for display
        dates: weeklyData.dates,
      };
    },
    staleTime: cacheTimes.studyProgress, // 30 seconds
    gcTime: cacheTimes.studyProgress * 2,
    enabled: !!userId,
  });

  return {
    weeklyData: data?.dailyData || [0, 0, 0, 0, 0, 0, 0],
    dayLabels: data?.dayLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    totalWords: data?.totalWords || 0,
    dates: data?.dates || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}
