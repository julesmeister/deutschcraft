/**
 * React Query hooks for Writing Submissions - Mutation Operations
 * Write hooks for creating, updating, and deleting writing submissions
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WritingSubmission } from '@/lib/models/writing';
import {
  createWritingSubmission,
  updateWritingSubmission,
  submitWriting,
  deleteWritingSubmission,
} from '@/lib/services/writingService';

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
