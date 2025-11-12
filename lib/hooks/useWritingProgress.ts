/**
 * React Query hooks for Writing Progress and Stats
 * Handles progress tracking, statistics, and daily metrics
 * Uses writingService for database abstraction
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  WritingProgress,
  WritingStats,
} from '@/lib/models/writing';
import { CEFRLevel } from '@/lib/models/cefr';
import {
  getWritingProgress,
  getWritingStats,
  updateWritingStats,
  updateWritingProgress,
} from '@/lib/services/writingService';

// ============================================================================
// QUERY HOOKS - Progress and Stats
// ============================================================================

/**
 * Get student's writing progress
 */
export function useWritingProgress(userId?: string) {
  return useQuery({
    queryKey: ['writing-progress', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getWritingProgress(userId, 30);
    },
    enabled: !!userId,
  });
}

/**
 * Get student's writing statistics
 */
export function useWritingStats(userId?: string) {
  return useQuery({
    queryKey: ['writing-stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await getWritingStats(userId);
    },
    enabled: !!userId,
  });
}

// ============================================================================
// MUTATION HOOKS - Update Progress
// ============================================================================

/**
 * Update writing statistics (typically called after submission)
 */
export function useUpdateWritingStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<WritingStats>;
    }) => {
      await updateWritingStats(userId, updates);
      return { userId, updates };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['writing-stats', data.userId] });
    },
  });
}

/**
 * Create or update daily writing progress
 */
export function useUpdateWritingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WritingProgress) => {
      await updateWritingProgress(data.progressId, data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['writing-progress', data.userId] });
    },
  });
}
