'use client';

import { useQuery } from '@tanstack/react-query';
import { cacheTimes } from '../queryClient';
import { getCategoryProgress, type CategoryStats } from '../services/turso/flashcards';

export type { CategoryStats };

/**
 * Hook to fetch flashcard progress grouped by category for a student
 * TURSO MIGRATION: Now uses Turso database with SQL joins for better performance
 * Progress is joined with vocabulary table to get category information
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
