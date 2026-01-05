import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { fetchVocabularyCategory } from "@/lib/hooks/useVocabulary";
import { applyFlashcardSettings } from "@/lib/utils/flashcardSelection";
import { queryKeys } from "@/lib/queryClient";

interface UseFlashcardSessionManagerProps {
  selectedLevel: string;
  categoryIndex: any;
  reviewsMap: any;
  flashcardReviews: any[];
  settings: any;
  userEmail: string | null | undefined;
  onSessionComplete: (
    reviewedCards?: Record<string, { difficulty: string; timestamp: number }>
  ) => void;
}

export function useFlashcardSessionManager({
  selectedLevel,
  categoryIndex,
  reviewsMap,
  flashcardReviews,
  settings,
  userEmail,
  onSessionComplete,
}: UseFlashcardSessionManagerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [practiceFlashcards, setPracticeFlashcards] = useState<any[]>([]);
  const [nextDueInfo, setNextDueInfo] = useState<
    { count: number; nextDueDate: number } | undefined
  >();
  const [upcomingCards, setUpcomingCards] = useState<any[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [isPending, startTransition] = useTransition();

  /**
   * Helper: Enrich flashcards with progress data (mastery level, next review date)
   * Extracted to avoid duplication across multiple handlers
   */
  const enrichFlashcardsWithProgress = (flashcards: any[]) => {
    return flashcards.map((card: any) => {
      const progress = reviewsMap.get(card.id);
      return {
        ...card,
        wordId: card.id,
        masteryLevel: progress?.masteryLevel ?? 0,
        nextReviewDate: progress?.nextReviewDate,
      };
    });
  };

  const handleCategoryClick = async (
    categoryId: string,
    categoryName: string
  ) => {
    if (!categoryIndex) return;

    // Find category info
    const catInfo = categoryIndex.categories.find(
      (c: any) => c.id === categoryId
    );

    if (!catInfo) return;

    setIsLoadingData(true);

    try {
      // Fetch the specific category file
      const data = await fetchVocabularyCategory(selectedLevel, catInfo.file);

      // Enrich flashcards with progress data
      let categoryFlashcards = enrichFlashcardsWithProgress(data.flashcards);

      // Apply settings (potentially heavy operation)
      const { cards, nextDueInfo, upcomingCards } = applyFlashcardSettings(
        categoryFlashcards,
        flashcardReviews,
        settings
      );

      startTransition(() => {
        setPracticeFlashcards(cards);
        setSelectedCategory(categoryName);
        setNextDueInfo(nextDueInfo);
        setUpcomingCards(upcomingCards);
        setIsReviewMode(false); // Reset to practice mode when selecting category
      });
    } catch (error) {
      console.error("Failed to load category:", error);
      // Could show toast here
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleBackToCategories = async (reviewedCards?: Record<string, string>) => {
    setSelectedCategory(null);
    setPracticeFlashcards([]);
    setIsReviewMode(false); // Reset review mode

    // Prepare timestamped reviews
    const timestampedReviews: Record<
      string,
      { difficulty: string; timestamp: number }
    > = {};
    if (reviewedCards) {
      const now = Date.now();
      Object.entries(reviewedCards).forEach(([id, diff]) => {
        timestampedReviews[id] = { difficulty: diff, timestamp: now };
      });
    }

    // MULTI-LAYERED CACHE INVALIDATION SYSTEM
    // Layer 1: Force immediate refetch (not just invalidate)
    // Layer 2: Bypass cache with parallel queries
    // Layer 3: Loading state management
    // Layer 4: Deduplication prevention via data-refreshing attribute
    // Layer 5: Optimistic UI updates via recentReviews state
    // Layer 6: Automatic due count recalculation via useMemo dependencies
    if (userEmail) {
      setIsRefreshingData(true);

      if (process.env.NODE_ENV === 'development') {
        console.log('[SessionManager] 🔄 Starting cache refresh after session complete');
      }

      try {
        // Use refetchQueries to FORCE immediate data fetch (not just mark as stale)
        await Promise.all([
          queryClient.refetchQueries({
            queryKey: queryKeys.flashcardProgress(userEmail),
            type: 'active',
          }),
          queryClient.refetchQueries({
            queryKey: queryKeys.weeklyProgress(userEmail),
            type: 'active',
          }),
          queryClient.refetchQueries({
            queryKey: ["todayProgress", userEmail],
            type: 'active',
          }),
        ]);

        if (process.env.NODE_ENV === 'development') {
          console.log('[SessionManager] ✅ Cache refresh complete - fresh data loaded');
        }
      } catch (error) {
        console.error('[SessionManager] ❌ Cache refresh failed:', error);
      } finally {
        setIsRefreshingData(false);
      }

      // Signal that session is complete (triggers stats refresh with fresh data)
      onSessionComplete(
        Object.keys(timestampedReviews).length > 0
          ? timestampedReviews
          : undefined
      );
    } else {
      onSessionComplete(
        Object.keys(timestampedReviews).length > 0
          ? timestampedReviews
          : undefined
      );
    }
  };

  const handleStartPractice = async () => {
    if (!categoryIndex) return;

    setIsLoadingData(true);

    try {
      // 1. Identify categories with due cards or new cards
      const categoriesToFetch = new Set<string>();
      const now = Date.now();

      // Simple strategy: fetch categories that have due cards
      categoryIndex.categories.forEach((cat: any) => {
        const hasDue = cat.ids?.some((id: string) => {
          const progress = reviewsMap.get(id);
          return progress && (progress.nextReviewDate || 0) <= now;
        });
        if (hasDue) categoriesToFetch.add(cat.file);
      });

      // If we have very few due cards, maybe fetch some new cards?
      // For now, let's ensure we fetch at least one category if nothing is due,
      // so the user isn't stuck.
      if (categoriesToFetch.size === 0) {
        // Find categories with unattempted cards
        const unattemptedCat = categoryIndex.categories.find((cat: any) => {
          // Check if we have unattempted cards
          return cat.ids?.some((id: string) => !reviewsMap.has(id));
        });

        if (unattemptedCat) {
          categoriesToFetch.add(unattemptedCat.file);
        } else if (categoryIndex.categories.length > 0) {
          // Fallback to first category
          categoriesToFetch.add(categoryIndex.categories[0].file);
        }
      }

      // Limit to reasonable number of files to prevent massive fetching
      // e.g., max 5 categories at once? Or just fetch all needed?
      // Given we are optimized, let's fetch all identified (might be 5-10 files).

      const filesToFetch = Array.from(categoriesToFetch);
      const promises = filesToFetch.map((file) =>
        fetchVocabularyCategory(selectedLevel, file)
      );

      const results = await Promise.all(promises);
      const allFetchedCards = results.flatMap((r) => r.flashcards);

      // Enrich all flashcards with progress data
      let flashcardsWithWordId = enrichFlashcardsWithProgress(allFetchedCards);

      // Apply settings (potentially heavy operation)
      const { cards, nextDueInfo, upcomingCards } = applyFlashcardSettings(
        flashcardsWithWordId,
        flashcardReviews,
        settings
      );

      // Use transition to keep UI responsive during state updates
      startTransition(() => {
        setPracticeFlashcards(cards);
        setSelectedCategory("All Categories");
        setNextDueInfo(nextDueInfo);
        setUpcomingCards(upcomingCards);
        setIsReviewMode(false); // Reset to practice mode
      });
    } catch (error) {
      console.error("Error starting practice:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleToggleReviewMode = async () => {
    if (!selectedCategory || !categoryIndex) return;

    const newReviewMode = !isReviewMode;

    // If switching to review mode for "All Categories", we might need ALL cards
    // which we might not have fetched yet.

    let flashcardsToUse = practiceFlashcards; // Default to what we have

    if (selectedCategory === "All Categories" && newReviewMode) {
      // "Review All" with pagination: Load categories incrementally until we have enough cards
      // This prevents loading 667KB of data at once (B1 level has 1554 cards!)
      const MAX_CARDS_TO_LOAD = 200; // Reasonable limit for memory/performance

      setIsLoadingData(true);
      try {
        const loadedCards: any[] = [];
        let categoriesProcessed = 0;

        // Load categories one by one until we reach the card limit
        for (const cat of categoryIndex.categories) {
          if (loadedCards.length >= MAX_CARDS_TO_LOAD) {
            break; // Stop loading once we have enough cards
          }

          try {
            const data = await fetchVocabularyCategory(selectedLevel, cat.file);
            loadedCards.push(...data.flashcards);
            categoriesProcessed++;
          } catch (e) {
            console.error(`Failed to load category ${cat.name}:`, e);
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[Review All] Loaded ${loadedCards.length} cards from ${categoriesProcessed}/${categoryIndex.categories.length} categories`
          );
        }

        flashcardsToUse = enrichFlashcardsWithProgress(loadedCards);
      } catch (error) {
        console.error("Error fetching all cards:", error);
        setIsLoadingData(false);
        return;
      } finally {
        setIsLoadingData(false);
      }
    } else if (selectedCategory !== "All Categories" && newReviewMode) {
      // For single category, we should already have the cards from handleCategoryClick
      // But we might need to reset filters.
      // Re-fetch to be safe/simple? Or just use what we have?
      // practiceFlashcards might be filtered. We need the full set for that category.

      // We can refetch the category to get the full set again.
      const catInfo = categoryIndex.categories.find(
        (c: any) => c.name === selectedCategory
      );
      if (catInfo) {
        setIsLoadingData(true);
        try {
          const data = await fetchVocabularyCategory(
            selectedLevel,
            catInfo.file
          );
          flashcardsToUse = enrichFlashcardsWithProgress(data.flashcards);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingData(false);
        }
      }
    }

    let finalCards: any[];
    let finalNextDueInfo: { count: number; nextDueDate: number } | undefined;
    let finalUpcomingCards: any[];

    if (newReviewMode) {
      // Review mode: Show ALL cards, no filtering
      finalCards = flashcardsToUse;
      finalNextDueInfo = undefined;
      finalUpcomingCards = [];
    } else {
      // Practice mode: Apply settings (only due cards)
      const result = applyFlashcardSettings(
        flashcardsToUse,
        flashcardReviews,
        settings
      );
      finalCards = result.cards;
      finalNextDueInfo = result.nextDueInfo;
      finalUpcomingCards = result.upcomingCards;
    }

    startTransition(() => {
      setPracticeFlashcards(finalCards);
      setNextDueInfo(finalNextDueInfo);
      setUpcomingCards(finalUpcomingCards);
      setIsReviewMode(newReviewMode);
    });
  };

  return {
    selectedCategory,
    practiceFlashcards,
    nextDueInfo,
    upcomingCards,
    isReviewMode,
    isLoadingData,
    isRefreshingData,
    isPending,
    handleCategoryClick,
    handleBackToCategories,
    handleStartPractice,
    handleToggleReviewMode,
  };
}
