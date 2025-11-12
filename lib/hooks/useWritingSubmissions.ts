/**
 * React Query hooks for Writing Submissions
 * Query hooks for fetching and managing writing submissions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  TranslationExercise,
  CreativeWritingExercise,
  WritingSubmission,
  WritingExerciseType,
} from '@/lib/models/writing';
import { CEFRLevel } from '@/lib/models/cefr';

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
      const exercisesRef = collection(db, 'writing-exercises');
      let q = query(
        exercisesRef,
        where('level', '==', level),
        orderBy('createdAt', 'desc')
      );

      if (exerciseType) {
        q = query(
          exercisesRef,
          where('level', '==', level),
          where('type', '==', exerciseType),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        exerciseId: doc.id,
      })) as (TranslationExercise | CreativeWritingExercise)[];
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

      const exerciseRef = doc(db, 'writing-exercises', exerciseId);
      const exerciseSnap = await getDoc(exerciseRef);

      if (!exerciseSnap.exists()) return null;

      return {
        ...exerciseSnap.data(),
        exerciseId: exerciseSnap.id,
      } as TranslationExercise | CreativeWritingExercise;
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

      const submissionsRef = collection(db, 'writing-submissions');
      let q = query(
        submissionsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      if (exerciseType) {
        q = query(
          submissionsRef,
          where('userId', '==', userId),
          where('exerciseType', '==', exerciseType),
          orderBy('updatedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        submissionId: doc.id,
      })) as WritingSubmission[];
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

      const submissionRef = doc(db, 'writing-submissions', submissionId);
      const submissionSnap = await getDoc(submissionRef);

      if (!submissionSnap.exists()) return null;

      return {
        ...submissionSnap.data(),
        submissionId: submissionSnap.id,
      } as WritingSubmission;
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

      const submissionsRef = collection(db, 'writing-submissions');
      const q = query(
        submissionsRef,
        where('exerciseId', '==', exerciseId),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        submissionId: doc.id,
      })) as WritingSubmission[];
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
      const submissionsRef = collection(db, 'writing-submissions');

      let q;
      if (statusFilter === 'submitted') {
        // Only show submissions awaiting review
        q = query(
          submissionsRef,
          where('status', '==', 'submitted'),
          orderBy('submittedAt', 'desc')
        );
      } else if (statusFilter === 'reviewed') {
        // Only show reviewed submissions
        q = query(
          submissionsRef,
          where('status', '==', 'reviewed'),
          orderBy('updatedAt', 'desc')
        );
      } else {
        // Show all submissions (submitted or reviewed, exclude drafts)
        q = query(
          submissionsRef,
          where('status', 'in', ['submitted', 'reviewed']),
          orderBy('updatedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        submissionId: doc.id,
      })) as WritingSubmission[];
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
      const submissionsRef = collection(db, 'writing-submissions');
      const q = query(
        submissionsRef,
        where('status', '==', 'submitted')
      );

      const snapshot = await getDocs(q);
      return snapshot.size; // Just return count
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
      const submissionsRef = collection(db, 'writing-submissions');
      const now = Date.now();

      const submissionData: Omit<WritingSubmission, 'submissionId'> = {
        ...data,
        version: 1,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(submissionsRef, submissionData);
      return { submissionId: docRef.id, ...submissionData };
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
      const submissionRef = doc(db, 'writing-submissions', submissionId);

      await updateDoc(submissionRef, {
        ...updates,
        updatedAt: Date.now(),
      });

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
      const submissionRef = doc(db, 'writing-submissions', submissionId);
      const now = Date.now();

      await updateDoc(submissionRef, {
        status: 'submitted',
        submittedAt: now,
        updatedAt: now,
      });

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
      const submissionRef = doc(db, 'writing-submissions', submissionId);
      await deleteDoc(submissionRef);
      return submissionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-submissions'] });
    },
  });
}
