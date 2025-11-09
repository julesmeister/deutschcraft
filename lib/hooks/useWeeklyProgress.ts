'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { StudyProgress } from '../models';
import { queryKeys, cacheTimes } from '../queryClient';

/**
 * Fetches study progress for the last 7 days
 * Returns an array of daily word counts for the weekly chart
 */
export function useWeeklyProgress(userId: string | null | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.studyProgress(userId || '', 7),
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Calculate timestamp for 7 days ago
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

      // Query study progress for the last 7 days
      // NEW STRUCTURE: progress/{progressId} - Top-level collection
      const progressRef = collection(db, 'progress');
      const q = query(
        progressRef,
        where('userId', '==', userId),
        where('createdAt', '>=', sevenDaysAgo),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);

      // Create a map of date -> words studied
      const progressByDate = new Map<string, number>();

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as StudyProgress;
        // Use date string field or convert from createdAt timestamp
        const dateStr = data.date || new Date(data.createdAt).toISOString().split('T')[0];
        const dateKey = new Date(dateStr).toLocaleDateString();
        const existingCount = progressByDate.get(dateKey) || 0;
        progressByDate.set(dateKey, existingCount + data.wordsStudied);
      });

      // Create array for last 7 days (today is index 6)
      const weeklyData: number[] = [];
      const dayLabels: string[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toLocaleDateString();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        weeklyData.push(progressByDate.get(dateKey) || 0);
        dayLabels.push(dayName);
      }

      // Calculate total words this week
      const totalWords = weeklyData.reduce((sum, count) => sum + count, 0);

      return {
        dailyData: weeklyData,
        dayLabels,
        totalWords,
      };
    },
    staleTime: cacheTimes.studyProgress, // 30 seconds
    gcTime: cacheTimes.studyProgress * 2,
    enabled: !!userId,
  });

  return {
    weeklyData: data?.dailyData || [0, 0, 0, 0, 0, 0, 0],
    dayLabels: data?.dayLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    totalWords: data?.totalWords || 0,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
