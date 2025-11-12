/**
 * React Query hooks for Batch management
 * NEW STRUCTURE: batches/{batchId} - Top-level collection
 * Uses batchService for database abstraction
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Batch, CEFRLevel } from '../models';
import { cacheTimes } from '../queryClient';
import { getBatchesByTeacher, getBatch, getBatchStudentCount, createBatch, updateBatch, updateBatchLevel, archiveBatch } from '../services/batchService';

/**
 * Fetch all batches for a teacher
 * Query: batches.where('teacherId', '==', teacherEmail)
 */
export function useTeacherBatches(teacherEmail: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['batches', 'teacher', teacherEmail],
    queryFn: async () => {
      if (!teacherEmail) return [];
      return await getBatchesByTeacher(teacherEmail);
    },
    enabled: !!teacherEmail,
    staleTime: cacheTimes.batches,
    gcTime: cacheTimes.batches * 2.5,
  });

  return {
    batches: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch active batches for a teacher
 */
export function useActiveBatches(teacherEmail: string | undefined) {
  const { batches, isLoading, isError, error } = useTeacherBatches(teacherEmail);

  return {
    batches: batches.filter(batch => batch.isActive),
    isLoading,
    isError,
    error,
  };
}

/**
 * Fetch a single batch by batchId
 * Direct document access: batches/{batchId}
 */
export function useBatch(batchId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      if (!batchId) return null;
      return await getBatch(batchId);
    },
    enabled: !!batchId,
    staleTime: cacheTimes.batches,
    gcTime: cacheTimes.batches * 2.5,
  });

  return {
    batch: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Create a new batch
 * Creates document at: batches/{batchId}
 */
export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teacherId,
      name,
      description,
      currentLevel,
      startDate,
      endDate,
    }: {
      teacherId: string; // Teacher's email
      name: string;
      description?: string;
      currentLevel: CEFRLevel;
      startDate: number;
      endDate: number | null;
    }) => {
      return await createBatch({
        teacherId,
        name,
        description,
        currentLevel,
        startDate,
        endDate,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batches', 'teacher', variables.teacherId] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

/**
 * Update batch details
 */
export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      batchId,
      updates,
    }: {
      batchId: string;
      updates: Partial<Batch>;
    }) => {
      await updateBatch(batchId, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

/**
 * Update batch level (adds to level history)
 */
export function useUpdateBatchLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      batchId,
      newLevel,
      modifiedBy,
      notes,
    }: {
      batchId: string;
      newLevel: CEFRLevel;
      modifiedBy: string; // Teacher's email
      notes?: string;
    }) => {
      await updateBatchLevel(batchId, newLevel, modifiedBy, notes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

/**
 * Delete/archive a batch
 * Marks as inactive instead of deleting
 */
export function useDeleteBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ batchId }: { batchId: string }) => {
      await archiveBatch(batchId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

/**
 * Get batch student count
 * Queries users collection: users.where('batchId', '==', batchId).where('role', '==', 'STUDENT')
 */
export function useBatchStudentCount(batchId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['batch-student-count', batchId],
    queryFn: async () => {
      if (!batchId) return 0;
      return await getBatchStudentCount(batchId);
    },
    enabled: !!batchId,
    staleTime: 30000, // 30 seconds
  });

  return {
    count: data || 0,
    isLoading,
  };
}
