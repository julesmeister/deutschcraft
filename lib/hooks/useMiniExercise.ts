/**
 * Hook for Mini Blank Exercise
 * Fetches smart sentence selection with spaced repetition
 * Falls back to random selection if no indexed sentences available
 */

import { useState, useCallback, useRef } from "react";
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
  // Track recently answered sentences to exclude from next fetch (prevents duplicates)
  const recentlyAnsweredRef = useRef<Set<string>>(new Set());
  // Track the current sentence ID to mark as answered on refresh
  const currentSentenceIdRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: ["mini-exercise", userId, refreshKey],
    queryFn: async () => {
      if (!userId) {
        console.log("[useMiniExercise] No userId provided");
        return null;
      }

      const excludeIds = recentlyAnsweredRef.current;

      // 1. Check for due Marked Words (SRS)
      try {
        const { items, stats } = await getOptimizedSRSData(userId);

        // Filter out recently answered items
        const availableItems = items.filter(
          (item) => !excludeIds.has(item.sentenceId)
        );

        // If we have items due now, prioritize them
        if (stats.dueNow > 0 && availableItems.length > 0) {
          console.log(
            "[useMiniExercise] Found due marked words:",
            availableItems.length,
            "(excluded:",
            items.length - availableItems.length,
            ")"
          );
          const topItem = availableItems[0];
          // Store current sentence ID for marking as answered later
          currentSentenceIdRef.current = topItem.sentenceId;
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
        // Store current sentence ID for marking as answered later
        currentSentenceIdRef.current = smartResult.sentenceId || null;
        return smartResult;
      }

      // 3. Fall back to random selection
      console.log(
        "[useMiniExercise] No indexed sentences, falling back to random selection"
      );
      const randomResult = await getRandomMiniExercise(userId);

      if (randomResult) {
        console.log("[useMiniExercise] Random result:", randomResult);
        // Store current sentence ID for marking as answered later
        currentSentenceIdRef.current = randomResult.sentenceId || null;
        // Convert to expected format
        return {
          sentence: randomResult.sentence,
          blanks: randomResult.blanks,
          submissionId: randomResult.submissionId,
          sentenceId: randomResult.sentenceId,
          sourceType: randomResult.sourceType,
          exerciseId: randomResult.exerciseId,
          exerciseTitle: randomResult.exerciseTitle,
          exerciseType: randomResult.exerciseType || "translation",
          submittedAt: randomResult.submittedAt || Date.now(),
        };
      }

      console.log("[useMiniExercise] No exercises available");
      currentSentenceIdRef.current = null;
      return null;
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  const refresh = useCallback(() => {
    console.log("[useMiniExercise] Refreshing exercise");
    // Mark the current sentence as answered to prevent it from appearing again
    if (currentSentenceIdRef.current) {
      recentlyAnsweredRef.current.add(currentSentenceIdRef.current);
      console.log(
        "[useMiniExercise] Marked as answered:",
        currentSentenceIdRef.current
      );
      // Keep only the last 10 answered sentences to prevent memory bloat
      if (recentlyAnsweredRef.current.size > 10) {
        const iterator = recentlyAnsweredRef.current.values();
        recentlyAnsweredRef.current.delete(iterator.next().value);
      }
    }
    setRefreshKey((prev) => prev + 1);
  }, []);

  return {
    exercise: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refresh,
  };
}
