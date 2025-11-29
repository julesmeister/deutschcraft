/**
 * React Query hooks for Writing Progress and Stats
 * Handles progress tracking, statistics, and daily metrics
 * Uses writingService for database abstraction
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
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
  updateDailyProgressForQuiz,
} from '@/lib/services/writingService';
import { getStudentSubmissions } from '@/lib/services/writing/submissions-queries';

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
 * Auto-recalculates if stats show 0% but student has graded submissions
 */
export function useWritingStats(userId?: string) {
  const queryClient = useQueryClient();
  const hasRecalculated = useRef(false);

  const query = useQuery({
    queryKey: ['writing-stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await getWritingStats(userId);
    },
    enabled: !!userId,
  });

  // Auto-recalculate if stats show 0% but student has graded submissions
  useEffect(() => {
    async function checkAndRecalculate() {
      if (!userId || !query.data || hasRecalculated.current) return;

      // If average score is 0%, check if there are graded submissions
      if (query.data.averageOverallScore === 0) {
        try {
          const submissions = await getStudentSubmissions(userId);
          const gradedCount = submissions.filter(s => s.teacherScore && s.teacherScore > 0).length;

          // If there are graded submissions, trigger recalculation
          if (gradedCount > 0) {
            console.log(`[useWritingStats] Found ${gradedCount} graded submissions with 0% average. Triggering recalculation...`);
            hasRecalculated.current = true;

            // Call the recalculate API
            await fetch('/api/writing/recalculate-stats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId }),
            });

            // Invalidate and refetch stats
            queryClient.invalidateQueries({ queryKey: ['writing-stats', userId] });
          }
        } catch (error) {
          console.error('[useWritingStats] Error checking for recalculation:', error);
        }
      }
    }

    checkAndRecalculate();
  }, [userId, query.data, queryClient]);

  return query;
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

/**
 * Update daily writing progress for quiz completion
 * Used to track daily activity when students complete review quizzes
 */
export function useUpdateProgressForQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      quiz,
    }: {
      userId: string;
      quiz: any;
    }) => {
      await updateDailyProgressForQuiz(userId, quiz);
      return { userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['writing-progress', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['writing-stats', data.userId] });
    },
  });
}
