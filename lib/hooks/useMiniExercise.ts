/**
 * Hook for Mini Blank Exercise
 * Fetches smart sentence selection with spaced repetition
 * Falls back to random selection if no indexed sentences available
 */

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSmartMiniExercise } from "@/lib/services/writing/smartMiniExercise";
import { getRandomMiniExercise } from "@/lib/services/writing/miniExercise";
import { getOptimizedSRSData } from "@/lib/services/writing/markedWordQuizService";
import { QuizBlank } from "@/lib/models/writing";

export interface MiniExerciseData {
  sentence: string;
  originalSentence?: string;
  blanks: QuizBlank[];
  sentenceId?: string;
  submissionId: string;
  sourceType: "ai" | "teacher" | "reference" | "marked_word";
  exerciseId?: string;
  exerciseTitle?: string;
  exerciseType: string;
  submittedAt: number;
  itemNumber?: string;
  wordStartIndex?: number;
}

export function useMiniExercise(userId?: string) {
  const [refreshKey, setRefreshKey] = useState(0);

  const query = useQuery({
    queryKey: ["mini-exercise", userId, refreshKey],
    queryFn: async () => {
      if (!userId) {
        console.log("[useMiniExercise] No userId provided");
        return null;
      }

      // 1. Check for due Marked Words (SRS)
      try {
        const { items, stats } = await getOptimizedSRSData(userId);

        // If we have items due now, prioritize them
        if (stats.dueNow > 0 && items.length > 0) {
          console.log(
            "[useMiniExercise] Found due marked words:",
            stats.dueNow
          );
          const topItem = items[0];
          return {
            sentence: topItem.sentence,
            blanks: [topItem.blank],
            submissionId: topItem.sentenceId, // Use sentenceId as submissionId
            sentenceId: topItem.sentenceId,
            sourceType: "marked_word" as const,
            exerciseId: topItem.exerciseId,
            exerciseTitle: "Marked Word Practice",
            exerciseType: "marked-word-practice",
            submittedAt: Date.now(),
            itemNumber: topItem.itemNumber,
            wordStartIndex: topItem.blank.position,
          };
        }
      } catch (error) {
        console.error(
          "[useMiniExercise] Error fetching marked words SRS:",
          error
        );
        // Continue to smart/random fallback
      }

      // 2. Try smart selection (Sentence Corrections)
      console.log(
        "[useMiniExercise] Attempting smart mini exercise for user:",
        userId
      );
      const smartResult = await getSmartMiniExercise(userId);

      if (smartResult) {
        console.log("[useMiniExercise] Smart result:", smartResult);
        return smartResult;
      }

      // 3. Fall back to random selection
      console.log(
        "[useMiniExercise] No indexed sentences, falling back to random selection"
      );
      const randomResult = await getRandomMiniExercise(userId);

      if (randomResult) {
        console.log("[useMiniExercise] Random result:", randomResult);
        // Convert to expected format
        return {
          sentence: randomResult.sentence,
          blanks: randomResult.blanks,
          submissionId: randomResult.submissionId,
          sourceType: randomResult.sourceType,
          exerciseId: randomResult.exerciseId,
          exerciseTitle: randomResult.exerciseTitle,
          exerciseType: randomResult.exerciseType || "translation",
          submittedAt: randomResult.submittedAt || Date.now(),
        };
      }

      console.log("[useMiniExercise] No exercises available");
      return null;
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  const refresh = useCallback(() => {
    console.log("[useMiniExercise] Refreshing exercise");
    setRefreshKey((prev) => prev + 1);
  }, []);

  return {
    exercise: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refresh,
  };
}
