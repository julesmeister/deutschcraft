/**
 * React Query hooks for Writing Submissions
 * Query hooks for fetching and managing writing submissions
 * Uses writingService for database abstraction
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TranslationExercise,
  CreativeWritingExercise,
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
  createWritingSubmission,
  updateWritingSubmission,
  submitWriting,
  deleteWritingSubmission,
} from '@/lib/services/writingService';

// ============================================================================
// QUERY HOOKS - Fetch Submissions
// ============================================================================

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
 */
export function useAllWritingSubmissions(statusFilter?: 'submitted' | 'reviewed' | 'all') {
  return useQuery({
    queryKey: ['all-writing-submissions', statusFilter],
    queryFn: async () => {
      return await getAllWritingSubmissions(statusFilter);
    },
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
  });
}

// ============================================================================
// MUTATION HOOKS - Modify Submissions
// ============================================================================

/**
 * Create a new writing submission
 */
export function useCreateWritingSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<WritingSubmission, 'submissionId' | 'createdAt' | 'updatedAt' | 'version'>) => {
      return await createWritingSubmission(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-submissions', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['writing-stats', data.userId] });
    },
  });
}

/**
 * Update an existing writing submission
 */
export function useUpdateWritingSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      updates,
    }: {
      submissionId: string;
      updates: Partial<WritingSubmission>;
    }) => {
      await updateWritingSubmission(submissionId, updates);
      return { submissionId, updates };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['writing-submission', data.submissionId] });
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
    },
  });
}

/**
 * Submit a writing exercise (change status from draft to submitted)
 */
export function useSubmitWriting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      await submitWriting(submissionId);
      return submissionId;
    },
    onSuccess: (submissionId) => {
      queryClient.invalidateQueries({ queryKey: ['writing-submission', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
    },
  });
}

/**
 * Delete a writing submission
 */
export function useDeleteWritingSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      await deleteWritingSubmission(submissionId);
      return submissionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
    },
  });
}
