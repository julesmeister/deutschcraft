/**
 * React Query hooks for Batch management
 * NEW STRUCTURE: batches/{batchId} - Top-level collection
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Batch, CEFRLevel, BatchLevelHistory } from '../models';
import { queryKeys, cacheTimes } from '../queryClient';

/**
 * Fetch all batches for a teacher
 * Query: batches.where('teacherId', '==', teacherEmail)
 */
export function useTeacherBatches(teacherEmail: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['batches', 'teacher', teacherEmail],
    queryFn: async () => {
      if (!teacherEmail) return [];

      const batchesRef = collection(db, 'batches');
      const q = query(batchesRef, where('teacherId', '==', teacherEmail));
      const snapshot = await getDocs(q);

      const batches: Batch[] = snapshot.docs.map(doc => ({
        batchId: doc.id,
        ...doc.data(),
      } as Batch));

      return batches;
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

      const batchRef = doc(db, 'batches', batchId);
      const batchDoc = await getDoc(batchRef);

      if (!batchDoc.exists()) return null;

      return {
        batchId: batchDoc.id,
        ...batchDoc.data(),
      } as Batch;
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
      const batchId = `BATCH_${Date.now()}`;
      const batchRef = doc(db, 'batches', batchId);

      const batch: Batch = {
        batchId,
        teacherId,
        name,
        description,
        currentLevel,
        startDate,
        endDate,
        isActive: true,
        studentCount: 0,
        levelHistory: [
          {
            level: currentLevel,
            startDate,
            endDate: null,
            modifiedBy: teacherId,
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(batchRef, batch);
      return batch;
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
      const batchRef = doc(db, 'batches', batchId);
      await updateDoc(batchRef, {
        ...updates,
        updatedAt: Date.now(),
      });
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
      const batchRef = doc(db, 'batches', batchId);
      const batchDoc = await getDoc(batchRef);

      if (!batchDoc.exists()) throw new Error('Batch not found');

      const currentBatch = batchDoc.data() as Batch;
      const now = Date.now();
      const updatedLevelHistory = [...currentBatch.levelHistory];

      // Close the current level period
      if (updatedLevelHistory.length > 0) {
        const lastIndex = updatedLevelHistory.length - 1;
        updatedLevelHistory[lastIndex] = {
          ...updatedLevelHistory[lastIndex],
          endDate: now,
        };
      }

      // Add new level to history
      const newLevelEntry: BatchLevelHistory = {
        level: newLevel,
        startDate: now,
        endDate: null,
        modifiedBy,
        notes,
      };
      updatedLevelHistory.push(newLevelEntry);

      await updateDoc(batchRef, {
        currentLevel: newLevel,
        levelHistory: updatedLevelHistory,
        updatedAt: now,
      });
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
      const batchRef = doc(db, 'batches', batchId);
      await updateDoc(batchRef, {
        isActive: false,
        endDate: Date.now(),
        updatedAt: Date.now(),
      });
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

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('batchId', '==', batchId),
        where('role', '==', 'STUDENT')
      );
      const snapshot = await getDocs(q);

      return snapshot.size;
    },
    enabled: !!batchId,
    staleTime: 30000, // 30 seconds
  });

  return {
    count: data || 0,
    isLoading,
  };
}
