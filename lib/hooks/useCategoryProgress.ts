'use client';

import { useQuery } from '@tanstack/react-query';
import { cacheTimes } from '../queryClient';
import { getCategoryProgress } from '../services/flashcardService';
import { CategoryStats } from '@/lib/models';

export type { CategoryStats };

/**
 * Hook to fetch flashcard progress grouped by category for a student
 * Uses the service abstraction layer to support both Turso and Firebase
 * Progress is joined with vocabulary table (or fetched) to get category information
 */
export function useCategoryProgress(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['category-progress', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return await getCategoryProgress(userId);
    },
    enabled: !!userId,
    staleTime: cacheTimes.dashboardStats,
    gcTime: cacheTimes.dashboardStats * 2,
  });
}
