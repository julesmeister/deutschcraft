/**
 * React Query hooks for Writing Reviews
 * Handles peer reviews and teacher reviews
 * Uses writingService for database abstraction
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPeerReviews,
  getAssignedPeerReviews,
  createPeerReview,
  updatePeerReview,
  getTeacherReview,
  getTeacherReviews,
  createTeacherReview,
  updateTeacherReview,
} from '@/lib/services/writingService';

// ============================================================================
// PEER REVIEW HOOKS
// ============================================================================

/**
 * Get peer reviews for a submission
 */
export function usePeerReviews(submissionId?: string) {
  return useQuery({
    queryKey: ['peer-reviews', submissionId],
    queryFn: async () => {
      if (!submissionId) return [];
      return await getPeerReviews(submissionId);
    },
    enabled: !!submissionId,
  });
}

/**
 * Get reviews assigned to a student (to do)
 */
export function useAssignedPeerReviews(reviewerId?: string) {
  return useQuery({
    queryKey: ['assigned-peer-reviews', reviewerId],
    queryFn: async () => {
      if (!reviewerId) return [];
      return await getAssignedPeerReviews(reviewerId);
    },
    enabled: !!reviewerId,
  });
}

/**
 * Create a peer review
 */
export function useCreatePeerReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await createPeerReview(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['peer-reviews', data.submissionId] });
      queryClient.invalidateQueries({ queryKey: ['assigned-peer-reviews', data.reviewerId] });
    },
  });
}

/**
 * Update a peer review
 */
export function useUpdatePeerReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, updates }: { reviewId: string; updates: any }) => {
      await updatePeerReview(reviewId, updates);
      return { reviewId, updates };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['peer-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-peer-reviews'] });
    },
  });
}

// ============================================================================
// TEACHER REVIEW HOOKS
// ============================================================================

/**
 * Get teacher review for a submission
 */
export function useTeacherReview(submissionId?: string) {
  return useQuery({
    queryKey: ['teacher-review', submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      return await getTeacherReview(submissionId);
    },
    enabled: !!submissionId,
  });
}

/**
 * Get all reviews by a teacher
 */
export function useTeacherReviews(teacherId?: string) {
  return useQuery({
    queryKey: ['teacher-reviews-by-teacher', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      return await getTeacherReviews(teacherId);
    },
    enabled: !!teacherId,
  });
}

/**
 * Create a teacher review
 */
export function useCreateTeacherReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await createTeacherReview(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-review', data.submissionId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-reviews-by-teacher', data.teacherId] });
      queryClient.invalidateQueries({ queryKey: ['writing-submission', data.submissionId] });
      queryClient.invalidateQueries({ queryKey: ['all-writing-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['writing-submissions-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['writing-submissions-count'] });
      queryClient.invalidateQueries({ queryKey: ['pending-writing-count'] });
      queryClient.invalidateQueries({ queryKey: ['writing-stats', data.studentId] });
    },
  });
}

/**
 * Update a teacher review
 */
export function useUpdateTeacherReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, updates }: { reviewId: string; updates: any }) => {
      await updateTeacherReview(reviewId, updates);
      return { reviewId, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-review'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-reviews-by-teacher'] });
      queryClient.invalidateQueries({ queryKey: ['writing-submissions-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['writing-submissions-count'] });
      queryClient.invalidateQueries({ queryKey: ['all-writing-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-writing-count'] });
    },
  });
}
