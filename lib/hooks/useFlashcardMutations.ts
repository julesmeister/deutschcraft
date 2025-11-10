/**
 * Flashcard Mutation Hooks
 * Hooks for saving flashcard reviews and updating progress
 */

import { useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FlashcardProgress } from '@/lib/models';
import { useToast } from '@/components/ui/toast';

type DifficultyLevel = 'again' | 'hard' | 'good' | 'easy';

/**
 * SuperMemo 2 Algorithm
 * Calculate next review interval based on difficulty
 */
function calculateSRSData(
  currentProgress: FlashcardProgress | null,
  difficulty: DifficultyLevel
) {
  // Default values for new cards
  let repetitions = currentProgress?.repetitions || 0;
  let easeFactor = currentProgress?.easeFactor || 2.5;
  let interval = currentProgress?.interval || 0;

  // SuperMemo 2 algorithm
  switch (difficulty) {
    case 'again':
      // Forgot - reset progress
      repetitions = 0;
      interval = 1; // Review again tomorrow
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;

    case 'hard':
      // Difficult - small increase
      repetitions += 1;
      interval = interval === 0 ? 1 : Math.round(interval * 1.2);
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      break;

    case 'good':
      // Correct - normal increase
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      break;

    case 'easy':
      // Very easy - large increase
      repetitions += 1;
      if (repetitions === 1) {
        interval = 4;
      } else if (repetitions === 2) {
        interval = 10;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      easeFactor = Math.min(2.5, easeFactor + 0.15);
      break;
  }

  // Calculate next review date
  const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

  // Calculate mastery level (0-100)
  let masteryLevel = 0;
  if (repetitions === 0) {
    masteryLevel = 0;
  } else if (repetitions === 1) {
    masteryLevel = 20;
  } else if (repetitions === 2) {
    masteryLevel = 40;
  } else if (repetitions <= 5) {
    masteryLevel = 40 + (repetitions - 2) * 15;
  } else {
    masteryLevel = Math.min(100, 85 + (repetitions - 5) * 3);
  }

  // Adjust based on ease factor
  masteryLevel = Math.min(100, Math.round(masteryLevel * (easeFactor / 2.5)));

  return {
    repetitions,
    easeFactor,
    interval,
    nextReviewDate,
    masteryLevel,
  };
}

/**
 * Hook for saving flashcard reviews
 */
export function useFlashcardMutations() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  /**
   * Save a flashcard review
   */
  const saveReview = async (
    userId: string,
    flashcardId: string,
    wordId: string,
    difficulty: DifficultyLevel
  ) => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate inputs
      if (!userId) {
        const errorMsg = 'Cannot save review: userId is undefined';
        console.error(errorMsg);
        showToast('Error: User not logged in', 'error');
        throw new Error(errorMsg);
      }
      if (!flashcardId) {
        const errorMsg = 'Cannot save review: flashcardId is undefined';
        console.error(errorMsg);
        showToast('Error: Invalid flashcard', 'error');
        throw new Error(errorMsg);
      }

      console.log('🔵 [saveReview] Starting save:', {
        userId,
        flashcardId,
        wordId,
        difficulty,
        timestamp: new Date().toISOString(),
      });

      // Generate progress ID
      const progressId = `${userId}_${flashcardId}`;
      const progressRef = doc(db, 'flashcard-progress', progressId);

      console.log('🔵 [saveReview] Progress ID:', progressId);

      // Get existing progress
      const progressDoc = await getDoc(progressRef);
      const currentProgress = progressDoc.exists()
        ? (progressDoc.data() as FlashcardProgress)
        : null;

      console.log('🔵 [saveReview] Existing progress:', {
        exists: progressDoc.exists(),
        currentProgress: currentProgress
          ? {
              repetitions: currentProgress.repetitions,
              masteryLevel: currentProgress.masteryLevel,
              interval: currentProgress.interval,
            }
          : null,
      });

      // Calculate new SRS data
      const srsData = calculateSRSData(currentProgress, difficulty);

      console.log('🔵 [saveReview] New SRS data:', srsData);

      // Prepare update data
      const updateData: Partial<FlashcardProgress> = {
        flashcardId,
        userId,
        wordId,
        repetitions: srsData.repetitions,
        easeFactor: srsData.easeFactor,
        interval: srsData.interval,
        nextReviewDate: srsData.nextReviewDate,
        masteryLevel: srsData.masteryLevel,
        lastReviewDate: Date.now(),
        updatedAt: Date.now(),
      };

      // Update correct/incorrect counts
      if (difficulty === 'again') {
        updateData.incorrectCount = (currentProgress?.incorrectCount || 0) + 1;
        updateData.correctCount = currentProgress?.correctCount || 0;
      } else {
        updateData.correctCount = (currentProgress?.correctCount || 0) + 1;
        updateData.incorrectCount = currentProgress?.incorrectCount || 0;
      }

      // Create or update document
      if (progressDoc.exists()) {
        console.log('🔵 [saveReview] Updating existing document');
        await updateDoc(progressRef, updateData as any);
      } else {
        console.log('🔵 [saveReview] Creating new document');
        await setDoc(progressRef, {
          ...updateData,
          createdAt: Date.now(),
        });
      }

      console.log('✅ [saveReview] Save successful!');
      return srsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save review';
      console.error('❌ [saveReview] Error:', {
        error: err,
        message: errorMessage,
        userId,
        flashcardId,
      });
      setError(errorMessage);
      showToast(`Failed to save review: ${errorMessage}`, 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Save daily study progress
   */
  const saveDailyProgress = async (
    userId: string,
    stats: {
      cardsReviewed: number;
      timeSpent: number;
      correctCount: number;
      incorrectCount: number;
    }
  ) => {
    try {
      // Validate inputs
      if (!userId) {
        const errorMsg = 'Cannot save daily progress: userId is undefined';
        console.error(errorMsg);
        showToast('Error: User not logged in', 'error');
        throw new Error(errorMsg);
      }

      console.log('🟢 [saveDailyProgress] Starting save:', {
        userId,
        stats,
        timestamp: new Date().toISOString(),
      });

      // Format: PROG_YYYYMMDD_email
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const progressId = `PROG_${today}_${userId}`;
      const progressRef = doc(db, 'progress', progressId);

      console.log('🟢 [saveDailyProgress] Progress ID:', progressId);
      console.log('🟢 [saveDailyProgress] Collection path:', 'progress');

      // Get existing progress for today
      const progressDoc = await getDoc(progressRef);

      console.log('🟢 [saveDailyProgress] Existing document:', {
        exists: progressDoc.exists(),
        data: progressDoc.exists() ? progressDoc.data() : null,
      });

      if (progressDoc.exists()) {
        // Update existing progress
        console.log('🟢 [saveDailyProgress] Updating existing document with increments');
        await updateDoc(progressRef, {
          cardsReviewed: increment(stats.cardsReviewed),
          timeSpent: increment(stats.timeSpent),
          wordsCorrect: increment(stats.correctCount),
          wordsIncorrect: increment(stats.incorrectCount),
          sessionsCompleted: increment(1),
        });
        console.log('✅ [saveDailyProgress] Update successful!');
      } else {
        // Create new progress entry
        console.log('🟢 [saveDailyProgress] Creating new document with data:', {
          progressId,
          userId,
          date: new Date().toISOString().split('T')[0],
          wordsStudied: stats.cardsReviewed,
          wordsCorrect: stats.correctCount,
          wordsIncorrect: stats.incorrectCount,
          timeSpent: stats.timeSpent,
          sessionsCompleted: 1,
          cardsReviewed: stats.cardsReviewed,
          sentencesCreated: 0,
        });

        await setDoc(progressRef, {
          progressId,
          userId,
          date: new Date().toISOString().split('T')[0],
          wordsStudied: stats.cardsReviewed,
          wordsCorrect: stats.correctCount,
          wordsIncorrect: stats.incorrectCount,
          timeSpent: stats.timeSpent,
          sessionsCompleted: 1,
          cardsReviewed: stats.cardsReviewed,
          sentencesCreated: 0,
          createdAt: Date.now(),
        });
        console.log('✅ [saveDailyProgress] Create successful!');
      }

      showToast('Progress saved successfully!', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save progress';
      console.error('❌ [saveDailyProgress] Error:', {
        error: err,
        message: errorMessage,
        userId,
        stats,
      });
      setError(errorMessage);
      showToast(`Failed to save progress: ${errorMessage}`, 'error');
      throw err;
    }
  };

  return {
    saveReview,
    saveDailyProgress,
    isSaving,
    error,
  };
}
