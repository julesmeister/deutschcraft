import { useMemo } from "react";
import { useStudyStats, useFlashcardReviews } from "@/lib/hooks/useFlashcards";
import {
  useRemNoteCategories,
  useRemNoteTotalCards,
  categoryIcons,
} from "@/lib/hooks/useRemNoteCategories";
import { useFlashcardSettings } from "@/lib/hooks/useFlashcardSettings";
import { calculateCategoryProgressFromIds } from "@/lib/utils/categoryProgressFromIds";
import { useVocabularyCategories } from "@/lib/hooks/useVocabulary";
import { useWeeklyProgress } from "@/lib/hooks/useWeeklyProgress";
import { cacheTimes } from "@/lib/queryClient";

export function useFlashcardData(
  userEmail: string | null | undefined,
  selectedLevel: string,
  statsRefreshKey: number
) {
  // Fetch real data from Firestore (with 1-hour cache for flashcards page)
  const { stats, isLoading: statsLoading } = useStudyStats(
    userEmail || undefined,
    statsRefreshKey,
    cacheTimes.flashcardStats // 1 hour cache
  );

  // Get weekly progress data
  const { weeklyData, totalWords } = useWeeklyProgress(
    userEmail || null
  );

  // Get RemNote categories for selected level
  const { categories: remNoteCategories, isLoading: categoriesLoading } =
    useRemNoteCategories(selectedLevel);
  const totalRemNoteCards = useRemNoteTotalCards(selectedLevel);

  // Get flashcard settings
  const { settings } = useFlashcardSettings();

  // Fetch user's flashcard progress to identify attempted categories
  const { data: flashcardReviews = [], refetch: refetchReviews } =
    useFlashcardReviews(userEmail);

  // Optimization: Create a memoized map for O(1) lookups
  const reviewsMap = useMemo(() => {
    const map = new Map();
    flashcardReviews.forEach((r) => {
      // Clean IDs
      const cleanFlashcardId = r.flashcardId?.replace(/-dup\d+$/, "");
      const cleanWordId = r.wordId?.replace(/-dup\d+$/, "");

      if (r.flashcardId) map.set(r.flashcardId, r);
      if (cleanFlashcardId) map.set(cleanFlashcardId, r);
      if (r.wordId) map.set(r.wordId, r);
      if (cleanWordId) map.set(cleanWordId, r);

      // Also map with FLASH_ prefix if not present, and without if present
      if (cleanFlashcardId && !cleanFlashcardId.startsWith("FLASH_")) {
        map.set(`FLASH_${cleanFlashcardId}`, r);
      }
      if (cleanFlashcardId && cleanFlashcardId.startsWith("FLASH_")) {
        map.set(cleanFlashcardId.replace("FLASH_", ""), r);
      }
    });
    return map;
  }, [flashcardReviews]);

  // Fetch vocabulary categories (lightweight, only IDs)
  const {
    data: rawCategoryIndex,
    isLoading: isVocabularyLoading,
    isError: isVocabularyError,
  } = useVocabularyCategories(selectedLevel);

  // Enhance category index to ensure IDs are present
  const categoryIndex = useMemo(() => {
    if (!rawCategoryIndex) return null;
    return {
      ...rawCategoryIndex,
      categories: rawCategoryIndex.categories.map((cat) => ({
        ...cat,
        // Use existing ID or generate one from name (consistent with categoryDueCounts logic)
        id:
          (cat as any).id ||
          cat.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        icon: (cat as any).icon || "📝", // Default icon if missing
      })),
    };
  }, [rawCategoryIndex]);

  // Calculate category progress using IDs
  const { categoryAttemptCounts, categoryCompletionStatus } = useMemo(() => {
    return categoryIndex
      ? calculateCategoryProgressFromIds(categoryIndex, flashcardReviews)
      : {
          attemptedCategories: new Set(),
          categoryAttemptCounts: new Map(),
          categoryTotalCounts: new Map(),
          categoryCompletionStatus: new Map(),
        };
  }, [categoryIndex, flashcardReviews]);

  // Calculate due cards per category
  const categoryDueCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const now = Date.now();

    if (categoryIndex) {
      categoryIndex.categories.forEach((cat) => {
        // Use the ID from our enhanced index which is guaranteed to be consistent
        const categoryId = cat.id;

        let dueCount = 0;
        if (cat.ids) {
          cat.ids.forEach((id) => {
            const progress = reviewsMap.get(id);
            // Count if card is new (never seen) OR due for review now
            // Note: counting new cards as "due" might be overwhelming if we show badges.
            // Usually "Due" means scheduled for review.
            // But for "Start Practice", we want to know if there's anything to do.
            const isDue = progress && (progress.nextReviewDate || 0) <= now;

            if (isDue) dueCount++;
          });
        }

        if (dueCount > 0) {
          counts.set(categoryId, dueCount);
        }
      });
    }
    return counts;
  }, [categoryIndex, reviewsMap]);

  // Convert legacy RemNote categories to our CategoryInfo format for the grid
  const displayCategories = useMemo(() => {
    if (!categoryIndex) return [];

    return categoryIndex.categories.map((cat) => {
      return {
        id: cat.id,
        name: cat.name,
        icon: (cat as any).icon || categoryIcons[cat.name] || "📚",
        cardCount: cat.count,
      };
    });
  }, [categoryIndex]);

  return {
    stats,
    statsLoading,
    weeklyData,
    totalWords,
    remNoteCategories,
    categoriesLoading,
    totalRemNoteCards,
    settings,
    flashcardReviews,
    refetchReviews,
    reviewsMap,
    categoryIndex,
    isVocabularyLoading,
    isVocabularyError,
    categoryAttemptCounts,
    categoryCompletionStatus,
    categoryDueCounts,
    displayCategories
  };
}
