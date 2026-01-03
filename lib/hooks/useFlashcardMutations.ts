/**
 * Flashcard Mutation Hooks (Enhanced)
 * Hooks for saving flashcard reviews and updating progress
 * Now uses improved SRS algorithm with card states and mastery decay
 */

import { useState } from "react";
import { FlashcardProgress } from "@/lib/models";
import { useToast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  getSingleFlashcardProgress,
  saveFlashcardProgress,
  saveDailyProgress,
} from "@/lib/services/flashcardService";
import { calculateSRSData } from "@/lib/utils/srsAlgorithm";

type DifficultyLevel = "again" | "hard" | "good" | "easy" | "expert";

/**
 * Hook for saving flashcard reviews
 */
export function useFlashcardMutations() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  /**
   * Save a flashcard review
   */
  const saveReview = async (
    userId: string,
    flashcardId: string,
    wordId: string,
    difficulty: DifficultyLevel,
    level?: string,
    flashcardData?: any, // Optional flashcard data for syncing to DB
    skipInvalidation: boolean = false
  ) => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate inputs
      if (!userId) {
        const errorMsg = "Cannot save review: userId is undefined";
        console.error(errorMsg);
        toast.error("Error: User not logged in");
        throw new Error(errorMsg);
      }
      if (!flashcardId) {
        const errorMsg = "Cannot save review: flashcardId is undefined";
        console.error(errorMsg);
        toast.error("Error: Invalid flashcard");
        throw new Error(errorMsg);
      }

      // Generate progress ID
      const progressId = `${userId}_${flashcardId}`;

      // Get existing progress using service layer
      const currentProgress = await getSingleFlashcardProgress(
        userId,
        flashcardId
      );

      // Get current level from parameter, existing progress, or undefined
      const currentLevel = level || currentProgress?.level;

      // Calculate new SRS data with enhanced algorithm
      const srsData = calculateSRSData(
        currentProgress,
        difficulty,
        currentLevel
      );

      // Prepare update data with all enhanced fields
      const updateData: Partial<FlashcardProgress> = {
        flashcardId,
        userId,
        wordId,
        level: srsData.level,

        // Card State (NEW!)
        state: srsData.state,

        // SRS data
        repetitions: srsData.repetitions,
        easeFactor: srsData.easeFactor,
        interval: srsData.interval,
        nextReviewDate: srsData.nextReviewDate,
        masteryLevel: srsData.masteryLevel,
        lastReviewDate: Date.now(),

        // Consecutive tracking (NEW!)
        consecutiveCorrect: srsData.consecutiveCorrect,
        consecutiveIncorrect: srsData.consecutiveIncorrect,

        // Lapse tracking (NEW!)
        lapseCount: srsData.lapseCount,
        lastLapseDate: srsData.lastLapseDate,

        // Initialize firstSeenAt if this is a new card
        firstSeenAt: currentProgress?.firstSeenAt || Date.now(),

        updatedAt: Date.now(),
      };

      // Update correct/incorrect counts
      if (difficulty === "again") {
        updateData.incorrectCount = (currentProgress?.incorrectCount || 0) + 1;
        updateData.correctCount = currentProgress?.correctCount || 0;
      } else {
        updateData.correctCount = (currentProgress?.correctCount || 0) + 1;
        updateData.incorrectCount = currentProgress?.incorrectCount || 0;
      }

      // Save using service layer
      await saveFlashcardProgress(progressId, updateData, flashcardData);

      // Update daily progress immediately (so points/goal updates in real-time)
      // We don't track time spent per card here, that's done at session end
      try {
        const isCorrect = difficulty !== "again";
        await saveDailyProgress(userId, {
          cardsReviewed: 1,
          correctCount: isCorrect ? 1 : 0,
          incorrectCount: isCorrect ? 0 : 1,
          timeSpent: 0
        });
      } catch (statsError) {
        console.error("Failed to update daily stats:", statsError);
        // Don't fail the whole review if stats fail
      }

      // Invalidate queries to ensure UI updates (unless skipped)
      if (!skipInvalidation) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.flashcardProgress(userId),
        });
        queryClient.invalidateQueries({ queryKey: ["studyStats", userId] });
        queryClient.invalidateQueries({
          queryKey: ["category-progress", userId],
        });
      }

      // Log save confirmation for debugging
      if (process.env.NODE_ENV === "development") {
        console.log(
          `💾 [Save] Card: ${flashcardId} | Mastery: ${
            srsData.masteryLevel
          }% | Next: ${new Date(srsData.nextReviewDate).toLocaleDateString()}`
        );
      }

      return srsData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save review";
      console.error("❌ [saveReview] Error:", {
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
        const errorMsg = "Cannot save daily progress: userId is undefined";
        console.error(errorMsg);
        toast.error("Error: User not logged in");
        throw new Error(errorMsg);
      }

      // Save using service layer
      await saveDailyProgress(userId, stats);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["study-progress", userId] });

      // Success - no toast needed, handled by session complete
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save progress";
      console.error("❌ [saveDailyProgress] Error:", {
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
