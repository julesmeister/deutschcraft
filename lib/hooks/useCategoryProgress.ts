'use client';

import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FlashcardProgress } from '../models';
import { cacheTimes } from '../queryClient';
import { CEFRLevel } from '../models/cefr';

// Import level data
import a1Data from '../data/vocabulary/levels/a1.json';
import a2Data from '../data/vocabulary/levels/a2.json';
import b1Data from '../data/vocabulary/levels/b1.json';
import b2Data from '../data/vocabulary/levels/b2.json';
import c1Data from '../data/vocabulary/levels/c1.json';
import c2Data from '../data/vocabulary/levels/c2.json';

const levelData: Record<CEFRLevel, any> = {
  [CEFRLevel.A1]: a1Data,
  [CEFRLevel.A2]: a2Data,
  [CEFRLevel.B1]: b1Data,
  [CEFRLevel.B2]: b2Data,
  [CEFRLevel.C1]: c1Data,
  [CEFRLevel.C2]: c2Data,
};

export interface CategoryStats {
  category: string;
  total: number;
  learned: number; // repetitions > 0
  mastered: number; // masteryLevel >= 70
  percentage: number;
}

/**
 * Hook to fetch flashcard progress grouped by category for a student
 * Data is fetched once and cached, then paginated on the client side
 */
export function useCategoryProgress(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['category-progress', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      // Fetch user's flashcard progress
      const progressRef = collection(db, 'flashcard-progress');
      const progressQuery = query(progressRef, where('userId', '==', userId));
      const progressSnapshot = await getDocs(progressQuery);

      // Build a map of all flashcards from JSON files by wordId
      const flashcardMap = new Map<string, { category: string; level: string }>();
      Object.entries(levelData).forEach(([level, data]) => {
        (data.flashcards || []).forEach((card: any) => {
          const wordId = card.id || card.german;
          flashcardMap.set(wordId, {
            category: card.category || 'Uncategorized',
            level: level,
          });
        });
      });

      // Group by category
      const categoryMap = new Map<string, { total: number; learned: number; mastered: number }>();

      progressSnapshot.docs.forEach((doc) => {
        const progress = doc.data() as FlashcardProgress;
        const wordId = progress.wordId || progress.flashcardId;

        // Look up the category from the flashcard data
        const flashcard = flashcardMap.get(wordId);
        const category = flashcard?.category || 'Uncategorized';

        if (!categoryMap.has(category)) {
          categoryMap.set(category, { total: 0, learned: 0, mastered: 0 });
        }

        const stats = categoryMap.get(category)!;
        stats.total++;

        // Count as learned if reviewed at least once
        if ((progress.repetitions || 0) > 0) {
          stats.learned++;
        }

        // Count as mastered if masteryLevel >= 70
        if (progress.masteryLevel >= 70) {
          stats.mastered++;
        }
      });

      // Convert to array and calculate percentages
      const categoryStats: CategoryStats[] = Array.from(categoryMap.entries())
        .map(([category, stats]) => ({
          category,
          total: stats.total,
          learned: stats.learned,
          mastered: stats.mastered,
          percentage: stats.total > 0 ? Math.round((stats.learned / stats.total) * 100) : 0,
        }))
        .sort((a, b) => b.learned - a.learned); // Sort by most learned

      return categoryStats;
    },
    enabled: !!userId,
    staleTime: cacheTimes.dashboardStats,
    gcTime: cacheTimes.dashboardStats * 2,
  });
}
