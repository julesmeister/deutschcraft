/**
 * Flashcard Mutation Hooks
 * Hooks for saving flashcard reviews and updating progress
 */

import { useState } from 'react';
import { FlashcardProgress } from '@/lib/models';
import { useToast } from '@/components/ui/toast';
import {
  getSingleFlashcardProgress,
  saveFlashcardProgress,
  saveDailyProgress,
} from '@/lib/services/flashcardService';

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
  const toast = useToast();

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
        toast.error('Error: User not logged in');
        throw new Error(errorMsg);
      }
      if (!flashcardId) {
        const errorMsg = 'Cannot save review: flashcardId is undefined';
        console.error(errorMsg);
        toast.error('Error: Invalid flashcard');
        throw new Error(errorMsg);
      }

      // Generate progress ID
      const progressId = `${userId}_${flashcardId}`;

      // Get existing progress using service layer
      const currentProgress = await getSingleFlashcardProgress(userId, flashcardId);

      // Calculate new SRS data
      const srsData = calculateSRSData(currentProgress, difficulty);

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

      // Save using service layer
      await saveFlashcardProgress(progressId, updateData);

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
      toast.error(`Failed to save review: ${errorMessage}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Save daily study progress
   */
  const saveDailyProgressLocal = async (
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
        toast.error('Error: User not logged in');
        throw new Error(errorMsg);
      }

      // Save using service layer
      await saveDailyProgress(userId, stats);

      // Success - no toast needed, handled by session complete
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save progress';
      console.error('❌ [saveDailyProgress] Error:', {
        error: err,
        message: errorMessage,
        userId,
        stats,
      });
      setError(errorMessage);
      // Don't throw - let the session complete handle errors
    }
  };

  return {
    saveReview,
    saveDailyProgress: saveDailyProgressLocal,
    isSaving,
    error,
  };
}
