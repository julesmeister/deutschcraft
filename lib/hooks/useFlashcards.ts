/**
 * Flashcard Hooks
 * Hooks for flashcards, vocabulary, and progress tracking
 * Uses flashcardService for database abstraction
 */

import { useEffect, useState } from "react";
import { Flashcard, FlashcardProgress, VocabularyWord } from "@/lib/models";
import { CEFRLevel } from "@/lib/models/cefr";
import { getCategoriesForLevel } from "@/lib/data/vocabulary-categories";
import {
  getFlashcardsByLevel,
  getVocabularyWord,
  getVocabularyByLevel,
  getFlashcardProgress,
} from "@/lib/services/flashcardService";
import {
  useVocabularyCategories,
  useVocabularyCategory,
} from "./useVocabulary";

// Export useStudyStats from separate file (uses React Query pattern)
export { useStudyStats } from "./useStudyStats";

import { useQuery } from "@tanstack/react-query";
import { cacheTimes, queryKeys } from "../queryClient";

/**
 * Get all flashcard reviews/progress for a user
 * Used for the flashcard review page
 */
export function useFlashcardReviews(userId: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.flashcardProgress(userId || ""),
    queryFn: async () => {
      if (!userId) return [];
      return await getFlashcardProgress(userId);
    },
    enabled: !!userId,
    staleTime: cacheTimes.progress,
    gcTime: cacheTimes.progress * 2.5,
  });

  return {
    data: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Get flashcards by level and optional category
 */
export function useFlashcards(level?: CEFRLevel, category?: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // OPTIMIZATION: Use split-fetching when category is provided
  const { data: categoryIndex, isLoading: isIndexLoading } =
    useVocabularyCategories(level);

  // Find filename if category is provided
  const filename =
    category && categoryIndex
      ? categoryIndex.categories.find((c) => c.name === category)?.file
      : null;

  // Fetch specific category if we have a filename
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
  } = useVocabularyCategory(level || "A1", filename || null);

  useEffect(() => {
    if (!level) {
      setFlashcards([]);
      setIsLoading(false);
      return;
    }

    // Optimization: If category is provided, use the split-fetch data
    if (category) {
      // If we are still determining the filename (index loading) or fetching category
      if (isIndexLoading || (filename && isCategoryLoading)) {
        setIsLoading(true);
        return;
      }

      // If we have data
      if (categoryData) {
        setFlashcards(categoryData.flashcards);
        setIsLoading(false);
        setIsError(false);
      } else if (filename) {
        // Filename exists but no data yet (error or loading)
        setIsError(isCategoryError);
      } else if (!isIndexLoading && !filename) {
        // Category not found in index
        console.warn(
          `Category "${category}" not found in index for level ${level}`
        );
        setFlashcards([]);
        setIsLoading(false);
      }
      return;
    }

    // Fallback: Legacy behavior for "All" or if no category specified
    // This still uses the monolithic fetch, but we only hit this if category is undefined
    const fetchFlashcards = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // Fetch flashcards using service layer
        const data = await getFlashcardsByLevel(level);

        setFlashcards(data);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [
    level,
    category,
    categoryData,
    isIndexLoading,
    isCategoryLoading,
    filename,
    isCategoryError,
  ]);

  return { flashcards, isLoading, isError };
}

/**
 * Get student's flashcard progress
 */
export function useFlashcardProgress(userId?: string) {
  const [progress, setProgress] = useState<FlashcardProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setProgress([]);
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // Use flashcardService for database abstraction
        const data = await getFlashcardProgress(userId);
        setProgress(data);
      } catch (error) {
        console.error("Error fetching flashcard progress:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  return { progress, isLoading, isError };
}
