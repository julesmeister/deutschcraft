/**
 * Statistics Service Module - Practice and Study Statistics
 *
 * This module handles all statistics calculations for flashcard practice and study progress.
 * Separated from flashcardService.ts to maintain files under 300 lines.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 */

import { db } from '../../../firebase';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { FlashcardProgress } from '../../../models';
import { getFlashcardProgress } from './progress';

// ============================================================================
// STATISTICS OPERATIONS
// ============================================================================

/**
 * Get practice statistics for a user
 * - Cards ready for practice (next review date is today or earlier)
 * - Words to review (cards reviewed but need another look)
 * @param userId - User's email
 * @returns Practice statistics
 */
export async function getPracticeStats(userId: string): Promise<{
  cardsReady: number;
  wordsToReview: number;
  totalCards: number;
}> {
  try {
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
  } catch (error) {
    console.error('[flashcardService] Error getting practice stats:', error);
    throw error;
  }
}

/**
 * Get comprehensive study statistics for a user
 * - Total cards in progress
 * - Cards learned (reviewed at least once)
 * - Cards mastered (70%+ mastery level)
 * - Current study streak
 * - Overall accuracy percentage
 * @param userId - User's email
 * @returns Study statistics
 */
export async function getStudyStats(userId: string): Promise<{
  totalCards: number;
  cardsLearned: number;
  cardsMastered: number;
  streak: number;
  accuracy: number;
}> {
  try {
    // Import progressService for streak calculation
    const { fetchUserProgress, calculateStreak } = await import('../../progressService');

    // Fetch flashcard progress
    const progressData = await getFlashcardProgress(userId);

    // Calculate stats from flashcard progress
    const totalCards = progressData.length;
    // Cards Learned = cards that have been reviewed at least once (repetitions > 0)
    const cardsLearned = progressData.filter(p => (p.repetitions || 0) > 0).length;
    // Cards Mastered = cards with 70%+ mastery
    const cardsMastered = progressData.filter(p => p.masteryLevel >= 70).length;

    const totalCorrect = progressData.reduce((sum, p) => sum + (p.correctCount || 0), 0);
    const totalIncorrect = progressData.reduce((sum, p) => sum + (p.incorrectCount || 0), 0);
    const totalAttempts = totalCorrect + totalIncorrect;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;

    // Fetch study progress for streak calculation
    const studyProgressData = await fetchUserProgress(userId, 30);
    const streak = calculateStreak(studyProgressData);

    return {
      totalCards,
      cardsLearned,
      cardsMastered,
      streak,
      accuracy,
    };
  } catch (error) {
    console.error('[flashcardService] Error getting study stats:', error);
    throw error;
  }
}
