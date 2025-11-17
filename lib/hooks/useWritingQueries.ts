/**
 * React Query hooks for Writing Submissions - Query Operations
 * Read-only hooks for fetching writing submissions and exercises
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import {
  WritingSubmission,
  WritingExerciseType,
} from '@/lib/models/writing';
import { CEFRLevel } from '@/lib/models/cefr';
import {
  getWritingExercises,
  getWritingExercise,
  getStudentSubmissions,
  getWritingSubmission,
  getExerciseSubmissions,
  getAllWritingSubmissions,
  getPendingWritingCount,
  getWritingSubmissionsPaginated,
  getWritingSubmissionsCount,
} from '@/lib/services/writingService';

/**
 * Get all writing exercises by level and type
 */
export function useWritingExercises(level: CEFRLevel, exerciseType?: WritingExerciseType) {
  return useQuery({
    queryKey: ['writing-exercises', level, exerciseType],
    queryFn: async () => {
      return await getWritingExercises(level, exerciseType);
    },
  });
}

/**
 * Get single exercise by ID
 */
export function useWritingExercise(exerciseId?: string) {
  return useQuery({
    queryKey: ['writing-exercise', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return null;
      return await getWritingExercise(exerciseId);
    },
    enabled: !!exerciseId,
  });
}

/**
 * Get student's submissions
 */
export function useStudentSubmissions(userId?: string, exerciseType?: WritingExerciseType) {
  return useQuery({
    queryKey: ['student-submissions', userId, exerciseType],
    queryFn: async () => {
      if (!userId) return [];
      return await getStudentSubmissions(userId, exerciseType);
    },
    enabled: !!userId,
  });
}

/**
 * Get single submission by ID
 */
export function useWritingSubmission(submissionId?: string) {
  return useQuery({
    queryKey: ['writing-submission', submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      return await getWritingSubmission(submissionId);
    },
    enabled: !!submissionId,
  });
}

/**
 * Get teacher's view of all student submissions for a specific exercise
 */
export function useExerciseSubmissions(exerciseId?: string) {
  return useQuery({
    queryKey: ['exercise-submissions', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return [];
      return await getExerciseSubmissions(exerciseId);
    },
    enabled: !!exerciseId,
  });
}

/**
 * Get ALL writing submissions for teacher review
 * Optionally filter by status (submitted/reviewed)
 *
 * NOTE: This fetches all submissions - consider adding pagination for large datasets
 */
export function useAllWritingSubmissions(statusFilter?: 'submitted' | 'reviewed' | 'all') {
  return useQuery({
    queryKey: ['all-writing-submissions', statusFilter],
    queryFn: async () => {
      return await getAllWritingSubmissions(statusFilter);
    },
    staleTime: 30000, // 30 seconds - refresh frequently for teacher reviews
    gcTime: 120000, // 2 minutes - keep in cache for quick switching
  });
}

/**
 * Get count of pending writing submissions (for teacher dashboard stat)
 */
export function usePendingWritingCount() {
  return useQuery({
    queryKey: ['pending-writing-count'],
    queryFn: async () => {
      return await getPendingWritingCount();
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
}

/**
 * Get writing submissions with server-side pagination
 * Optimized for teacher writing dashboard with large submission counts
 *
 * @param options - Pagination and filter options
 * @returns Hook with submissions, pagination state, and navigation functions
 */
export function useWritingSubmissionsPaginated(options: {
  statusFilter?: 'submitted' | 'reviewed' | 'all';
  batchId?: string | null;
  studentIds?: string[];
  pageSize?: number;
} = {}) {
  const { statusFilter = 'all', batchId = null, studentIds = [], pageSize = 10 } = options;
  const [page, setPage] = useState(1);
  const [lastDocs, setLastDocs] = useState<(QueryDocumentSnapshot | null)[]>([null]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setLastDocs([null]);
  }, [statusFilter, batchId, studentIds.length]); // Also reset when studentIds change

  // Fetch current page
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['writing-submissions-paginated', page, statusFilter, batchId, studentIds, pageSize],
    queryFn: async () => {
      const lastDoc = lastDocs[page - 1] || null;
      return await getWritingSubmissionsPaginated({
        pageSize,
        lastDoc,
        statusFilter,
        batchId,
        studentIds,
      });
    },
    staleTime: 30000, // 30 seconds
    gcTime: 120000, // 2 minutes
  });

  // Fetch total count (cached separately)
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['writing-submissions-count', statusFilter, batchId, studentIds],
    queryFn: async () => {
      // OPTIMIZATION: Pass undefined instead of empty array when no batch selected
      return await getWritingSubmissionsCount(
        statusFilter,
        batchId ? studentIds : undefined
      );
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  const submissions = data?.submissions || [];
  const hasMore = data?.hasMore || false;
  const totalPages = Math.ceil(totalCount / pageSize);

  const goToNextPage = () => {
    if (hasMore && data?.lastDoc) {
      setPage((prev) => prev + 1);
      setLastDocs((prev) => [...prev, data.lastDoc]);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // Reset pagination if going to page 1
      if (newPage === 1) {
        setLastDocs([null]);
      }
      setPage(newPage);
    }
  };

  return {
    submissions,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    // Pagination
    page,
    pageSize,
    totalPages,
    totalCount,
    hasMore,
    goToNextPage,
    goToPrevPage,
    goToPage,
  };
}
