/**
 * React Query hooks for Writing Progress and Stats
 * Handles progress tracking, statistics, and daily metrics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  WritingProgress,
  WritingStats,
} from '@/lib/models/writing';
import { CEFRLevel } from '@/lib/models/cefr';

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

      const progressRef = collection(db, 'writing-progress');
      const q = query(
        progressRef,
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(30)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as WritingProgress);
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

      const statsRef = doc(db, 'writing-stats', userId);
      const statsSnap = await getDoc(statsRef);

      if (!statsSnap.exists()) {
        // Return default stats if none exist
        return {
          userId,
          totalExercisesCompleted: 0,
          totalTranslations: 0,
          totalCreativeWritings: 0,
          totalWordsWritten: 0,
          totalTimeSpent: 0,
          averageGrammarScore: 0,
          averageVocabularyScore: 0,
          averageCoherenceScore: 0,
          averageOverallScore: 0,
          exercisesByLevel: {} as Record<CEFRLevel, number>,
          currentStreak: 0,
          longestStreak: 0,
          recentScores: [],
          updatedAt: Date.now(),
        } as WritingStats;
      }

      return statsSnap.data() as WritingStats;
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
      const statsRef = doc(db, 'writing-stats', userId);

      await updateDoc(statsRef, {
        ...updates,
        updatedAt: Date.now(),
      });

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
      const progressRef = doc(db, 'writing-progress', data.progressId);

      await updateDoc(progressRef, {
        ...data,
        updatedAt: Date.now(),
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['writing-progress', data.userId] });
    },
  });
}
