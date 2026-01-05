import { useMemo, useEffect } from "react";
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
  statsRefreshKey: number,
  recentReviews?: Record<string, { difficulty: string; timestamp: number }>
) {
  // Fetch real data from Firestore (with 1-hour cache for flashcards page)
  const { stats, isLoading: statsLoading } = useStudyStats(
    userEmail || undefined,
    statsRefreshKey,
    cacheTimes.flashcardStats // 1 hour cache
  );

  // Get weekly progress data
  const { weeklyData, totalWords } = useWeeklyProgress(userEmail || null);

  // Get RemNote categories for selected level
  const { categories: remNoteCategories, isLoading: categoriesLoading } =
    useRemNoteCategories(selectedLevel);
  const totalRemNoteCards = useRemNoteTotalCards(selectedLevel);

  // Get flashcard settings
  const { settings } = useFlashcardSettings();

  // Fetch user's flashcard progress to identify attempted categories
  const { data: flashcardReviews = [], refetch: refetchReviews } =
    useFlashcardReviews(userEmail);

  // OPTIMIZATION: Refetch is now handled directly in handleBackToCategories
  // with explicit loading states and parallel queries. This effect is kept
  // as a fallback for manual refresh triggers outside the session flow.
  useEffect(() => {
    if (statsRefreshKey > 0) {
      // Only refetch if we're not already in a refetching state
      // (prevents double refetch when session manager already triggered one)
      const isAlreadyRefreshing = document.querySelector('[data-refreshing="true"]');
      if (!isAlreadyRefreshing) {
        refetchReviews({ cancelRefetch: true });
      }
    }
  }, [statsRefreshKey, refetchReviews]);

  // Optimization: Create a memoized map for O(1) lookups
  const reviewsMap = useMemo(() => {
    const map = new Map();
    flashcardReviews.forEach((r) => {
      // Use ID directly (Semantic IDs)
      if (r.flashcardId) map.set(r.flashcardId, r);
      if (r.wordId) map.set(r.wordId, r);
    });
    return map;
  }, [flashcardReviews]);

  // Fetch vocabulary categories (lightweight, only IDs)
  const {
    data: rawCategoryIndex,
    isLoading: isVocabularyLoading,
    isError: isVocabularyError,
  } = useVocabularyCategories(selectedLevel);

  // Enhance category index and prepare display categories (combined for efficiency)
  const { categoryIndex, displayCategories } = useMemo(() => {
    if (!rawCategoryIndex) {
      return { categoryIndex: null, displayCategories: [] };
    }

    const enhancedCategories = rawCategoryIndex.categories.map((cat) => ({
      ...cat,
      // Use existing ID or generate one from name (consistent with categoryDueCounts logic)
      id:
        (cat as any).id ||
        cat.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      icon: (cat as any).icon || "📝", // Default icon if missing
    }));

    const index = {
      ...rawCategoryIndex,
      categories: enhancedCategories,
    };

    // Also prepare display categories in same pass
    const display = enhancedCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || categoryIcons[cat.name] || "📚",
      cardCount: cat.count,
    }));

    return { categoryIndex: index, displayCategories: display };
  }, [rawCategoryIndex]);

  // Calculate category progress and due counts (combined for efficiency)
  // This useMemo will automatically recalculate when flashcardReviews changes
  // (which happens after the refetch in handleBackToCategories completes)
  const {
    categoryAttemptCounts,
    categoryCompletionStatus,
    categoryDueCounts,
  } = useMemo(() => {
    if (!categoryIndex) {
      return {
        attemptedCategories: new Set(),
        categoryAttemptCounts: new Map(),
        categoryTotalCounts: new Map(),
        categoryCompletionStatus: new Map(),
        categoryDueCounts: new Map(),
      };
    }

    // Calculate progress stats
    const progressData = calculateCategoryProgressFromIds(
      categoryIndex,
      flashcardReviews
    );

    // Calculate due counts in same pass
    const dueCounts = new Map<string, number>();
    const now = Date.now();

    categoryIndex.categories.forEach((cat) => {
      const categoryId = cat.id;
      let dueCount = 0;

      if (cat.ids) {
        cat.ids.forEach((id) => {
          const progress = reviewsMap.get(id);
          const recentReview = recentReviews ? recentReviews[id] : undefined;

          let isDue = false;

          // Priority 1: Check recent local reviews (Optimistic UI)
          if (recentReview && now - recentReview.timestamp < 60 * 60 * 1000) {
            isDue = recentReview.difficulty === "again";
          }
          // Priority 2: Check server data
          else {
            isDue = progress && (progress.nextReviewDate || 0) <= now;
          }

          if (isDue) dueCount++;
        });
      }

      if (dueCount > 0) {
        dueCounts.set(categoryId, dueCount);
      }
    });

    if (process.env.NODE_ENV === 'development') {
      const totalDue = Array.from(dueCounts.values()).reduce((sum, count) => sum + count, 0);
      console.log(`[FlashcardData] 📊 Due counts recalculated: ${totalDue} cards across ${dueCounts.size} categories`);
    }

    return {
      ...progressData,
      categoryDueCounts: dueCounts,
    };
  }, [categoryIndex, flashcardReviews, reviewsMap, recentReviews]);

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
    displayCategories,
  };
}
