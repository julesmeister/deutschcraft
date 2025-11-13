/**
 * Writing Streak Calculation
 * Functions for calculating current and longest writing streaks
 */

import { formatDateISO } from '@/lib/utils/dateHelpers';
import { fetchUserWritingProgress } from './read';

/**
 * Calculate writing streak from progress documents
 */
export async function calculateWritingStreak(userId: string): Promise<{ current: number; longest: number }> {
  try {
    const progressDocs = await fetchUserWritingProgress(userId, 365);

    if (progressDocs.length === 0) {
      return { current: 0, longest: 0 };
    }

    // Sort by date descending
    const sorted = [...progressDocs].sort((a, b) => b.date.localeCompare(a.date));

    // Calculate current streak
    let currentStreak = 0;
    const today = formatDateISO(new Date());

    for (let i = 0; i < sorted.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = formatDateISO(expectedDate);

      const doc = sorted.find(d => d.date === expectedDateStr);
      if (doc && doc.exercisesCompleted > 0) {
        currentStreak++;
      } else if (i > 0) {
        // If not today and we didn't find it, break
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const doc of sorted.reverse()) {
      if (doc.exercisesCompleted === 0) continue;

      const currentDate = new Date(doc.date);

      if (lastDate === null) {
        tempStreak = 1;
      } else {
        const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  } catch (error) {
    console.error('[writingProgressService:turso] Error calculating writing streak:', error);
    throw error;
  }
}
