'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { FlashcardProgress } from '../models';
import { cacheTimes } from '../queryClient';

/**
 * Fetches practice statistics for Quick Actions
 * - Cards ready for practice (next review date is today or earlier)
 * - Words to review (cards reviewed but need another look)
 */
export function usePracticeStats(userId: string | null | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['practiceStats', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Get all flashcard progress for this user
      // NEW STRUCTURE: flashcards/{flashcardId} - Top-level collection
      const progressRef = collection(db, 'flashcards');
      const q = query(
        progressRef,
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);

      let cardsReady = 0;
      let wordsToReview = 0;
      const now = Date.now();

      snapshot.docs.forEach((doc) => {
        const data = doc.data() as FlashcardProgress;

        // Check if card is due for review
        if (data.nextReviewDate && data.nextReviewDate <= now) {
          cardsReady++;
        }

        // Count words that have been reviewed at least once but aren't mastered
        if (data.correctCount > 0 && data.masteryLevel < 80) {
          wordsToReview++;
        }
      });

      return {
        cardsReady,
        wordsToReview,
        totalCards: snapshot.size,
      };
    },
    staleTime: cacheTimes.dashboardStats, // 1 minute
    gcTime: cacheTimes.dashboardStats * 2,
    enabled: !!userId,
  });

  return {
    cardsReady: data?.cardsReady || 0,
    wordsToReview: data?.wordsToReview || 0,
    totalCards: data?.totalCards || 0,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
