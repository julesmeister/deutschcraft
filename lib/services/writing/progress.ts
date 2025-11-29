/**
 * Writing Progress & Stats Service
 * Handles progress tracking, statistics, and daily metrics
 */

import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  WritingProgress,
  WritingStats,
} from '../../models/writing';
import { CEFRLevel } from '../../models/cefr';

// ============================================================================
// WRITING PROGRESS & STATS
// ============================================================================

/**
 * Get student's writing progress (daily metrics)
 * @param userId - Student's user ID
 * @param limitCount - Number of days to fetch (default 30)
 * @returns Array of progress entries
 */
export async function getWritingProgress(
  userId: string,
  limitCount: number = 30
): Promise<WritingProgress[]> {
  try {
    const progressRef = collection(db, 'writing-progress');
    const q = query(
      progressRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as WritingProgress);
  } catch (error) {
    console.error('[progress] Error fetching writing progress:', error);
    throw error;
  }
}

/**
 * Get student's writing statistics
 * @param userId - Student's user ID
 * @returns WritingStats object or default stats if none exist
 */
export async function getWritingStats(userId: string): Promise<WritingStats> {
  try {
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
      };
    }

    const stats = statsSnap.data() as WritingStats;
    return stats;
  } catch (error) {
    console.error('[progress] Error fetching writing stats:', error);
    throw error;
  }
}

/**
 * Update writing statistics
 * @param userId - Student's user ID
 * @param updates - Partial stats data to update
 */
export async function updateWritingStats(
  userId: string,
  updates: Partial<WritingStats>
): Promise<void> {
  try {
    const statsRef = doc(db, 'writing-stats', userId);
    await updateDoc(statsRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[progress] Error updating writing stats:', error);
    throw error;
  }
}

/**
 * Update daily writing progress
 * @param progressId - Progress ID
 * @param progressData - Progress data to update
 */
export async function updateWritingProgress(
  progressId: string,
  progressData: WritingProgress
): Promise<void> {
  try {
    const progressRef = doc(db, 'writing-progress', progressId);
    await updateDoc(progressRef, {
      ...progressData,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[progress] Error updating writing progress:', error);
    throw error;
  }
}

/**
 * Update daily writing progress after completing a review quiz
 * @param userId - Student's user ID
 * @param quiz - Review quiz data
 */
export async function updateDailyProgressForQuiz(
  userId: string,
  quiz: any
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const progressId = `WPROG_${today.replace(/-/g, '')}_${userId}`;
    const progressRef = doc(db, 'writing-progress', progressId);

    // Get current progress or create default
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      // Update existing progress - increment exercises completed
      const currentProgress = progressSnap.data() as WritingProgress;
      await updateDoc(progressRef, {
        exercisesCompleted: currentProgress.exercisesCompleted + 1,
        updatedAt: Date.now(),
      });
    } else {
      // Create new progress entry for today
      const newProgress: WritingProgress = {
        progressId,
        userId,
        date: today,
        exercisesCompleted: 1, // Quiz counts as 1 exercise
        translationsCompleted: 0,
        creativeWritingsCompleted: 0,
        totalWordsWritten: 0,
        timeSpent: 0,
        averageGrammarScore: 0,
        averageVocabularyScore: 0,
        averageOverallScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(progressRef, newProgress);
    }
  } catch (error) {
    console.error('[progress] Error updating daily progress for quiz:', error);
    // Don't throw - this is not critical, just log the error
  }
}
