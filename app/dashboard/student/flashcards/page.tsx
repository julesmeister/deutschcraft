"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryButtonGrid } from "@/components/flashcards/CategoryButtonGrid";
import { FlashcardPractice } from "@/components/flashcards/FlashcardPractice";
import { FlashcardReviewList } from "@/components/flashcards/FlashcardReviewList";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ToastProvider } from "@/components/ui/toast";
import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useStudyStats, useFlashcardReviews } from "@/lib/hooks/useFlashcards";
import {
  useRemNoteCategories,
  useRemNoteTotalCards,
  categoryIcons,
} from "@/lib/hooks/useRemNoteCategories";
import { useFlashcardSettings } from "@/lib/hooks/useFlashcardSettings";
import { usePersistedLevel } from "@/lib/hooks/usePersistedLevel";
import { applyFlashcardSettings } from "@/lib/utils/flashcardSelection";
import { calculateCategoryProgressFromIds } from "@/lib/utils/categoryProgressFromIds";
import {
  useVocabularyCategories,
  fetchVocabularyCategory,
} from "@/lib/hooks/useVocabulary";
import { useWeeklyProgress } from "@/lib/hooks/useWeeklyProgress";
import { FlashcardProgressChart } from "@/components/flashcards/FlashcardProgressChart";
import { cacheTimes } from "@/lib/queryClient";

export default function FlashcardsLandingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = usePersistedLevel(
    "flashcards-last-level"
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [practiceFlashcards, setPracticeFlashcards] = useState<any[]>([]);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [isPending, startTransition] = useTransition(); // Used for UI transitions
  const [isLoadingData, setIsLoadingData] = useState(false); // Used for async data fetching
  const [nextDueInfo, setNextDueInfo] = useState<
    { count: number; nextDueDate: number } | undefined
  >();
  const [upcomingCards, setUpcomingCards] = useState<any[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Fetch real data from Firestore (with 1-hour cache for flashcards page)
  const { stats, isLoading: statsLoading } = useStudyStats(
    session?.user?.email || undefined,
    statsRefreshKey,
    cacheTimes.flashcardStats // 1 hour cache
  );

  // Get weekly progress data
  const { weeklyData, totalWords } = useWeeklyProgress(
    session?.user?.email || null
  );

  // Get RemNote categories for selected level
  const { categories: remNoteCategories, isLoading: categoriesLoading } =
    useRemNoteCategories(selectedLevel);
  const totalRemNoteCards = useRemNoteTotalCards(selectedLevel);

  // Get flashcard settings
  const { settings } = useFlashcardSettings();

  // Fetch user's flashcard progress to identify attempted categories
  const { data: flashcardReviews = [], refetch: refetchReviews } =
    useFlashcardReviews(session?.user?.email);

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
    data: categoryIndex,
    isLoading: isVocabularyLoading,
    isError: isVocabularyError,
  } = useVocabularyCategories(selectedLevel);

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
        const categoryId = cat.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        let dueCount = 0;
        if (cat.ids) {
          cat.ids.forEach((id) => {
            const progress = reviewsMap.get(id);
            // Count if card is new (never seen) OR due for review now
            // Note: counting new cards as "due" might be overwhelming if we show badges.
            // Usually "Due" means scheduled for review.
            // But for "Start Practice", we want to know if there's anything to do.
            const isDue = progress && (progress.nextReviewDate || 0) <= now;

            // If we want to include new cards in the badge, uncomment:
            // const isNew = !progress;
            // if (isDue || isNew) ...

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

  const isPageLoading = isVocabularyLoading || categoriesLoading;

  const handleCategoryClick = async (
    categoryId: string,
    categoryName: string
  ) => {
    if (!categoryIndex) return;

    // Find category info
    const catInfo = categoryIndex.categories.find(
      (c) =>
        c.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") === categoryId
    );

    if (!catInfo) return;

    setIsLoadingData(true);

    try {
      // Fetch the specific category file
      const data = await fetchVocabularyCategory(selectedLevel, catInfo.file);

      // Process flashcards
      let categoryFlashcards = data.flashcards.map((card: any) => {
        // Find progress for this card
        const progress = reviewsMap.get(card.id);
        return {
          ...card,
          wordId: card.id, // Use flashcard id as wordId for now
          masteryLevel: progress?.masteryLevel ?? 0, // Add mastery level from progress
          nextReviewDate: progress?.nextReviewDate,
        };
      });

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

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setPracticeFlashcards([]);
    setIsReviewMode(false); // Reset review mode
    // Invalidate queries to force fresh data after completing session
    queryClient.invalidateQueries({
      queryKey: ["flashcard-reviews", session?.user?.email],
    });
    setStatsRefreshKey((prev) => prev + 1);
  };

  const handleStartPractice = async () => {
    if (!categoryIndex) return;

    setIsLoadingData(true);

    try {
      // 1. Identify categories with due cards or new cards
      const categoriesToFetch = new Set<string>();
      const now = Date.now();

      // Simple strategy: fetch categories that have due cards
      categoryIndex.categories.forEach((cat) => {
        const hasDue = cat.ids?.some((id) => {
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
        const unattemptedCat = categoryIndex.categories.find((cat) => {
          // Check if we have unattempted cards
          return cat.ids?.some((id) => !reviewsMap.has(id));
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

      // Get all flashcards for the selected level
      let flashcardsWithWordId = allFetchedCards.map((card: any) => {
        // Find progress for this card
        const progress = reviewsMap.get(card.id);
        return {
          ...card,
          wordId: card.id, // Use flashcard id as wordId for now
          masteryLevel: progress?.masteryLevel ?? 0, // Add mastery level from progress
          nextReviewDate: progress?.nextReviewDate,
        };
      });

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
      // "Review All" in "All Categories" mode means showing ALL cards from ALL categories.
      // This is heavy. We might need to show a warning or load lazily.
      // For optimization, maybe we just show what we have loaded?
      // Or we trigger a full fetch?
      // Let's trigger a full fetch with loading state.

      setIsLoadingData(true);
      try {
        // Fetch all categories
        const promises = categoryIndex.categories.map((cat) =>
          fetchVocabularyCategory(selectedLevel, cat.file)
        );
        const results = await Promise.all(promises);
        const allCards = results.flatMap((r) => r.flashcards);

        flashcardsToUse = allCards.map((card: any) => {
          const progress = reviewsMap.get(card.id);
          return {
            ...card,
            wordId: card.id,
            masteryLevel: progress?.masteryLevel ?? 0,
            nextReviewDate: progress?.nextReviewDate,
          };
        });
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
        (c) => c.name === selectedCategory
      );
      if (catInfo) {
        setIsLoadingData(true);
        try {
          const data = await fetchVocabularyCategory(
            selectedLevel,
            catInfo.file
          );
          flashcardsToUse = data.flashcards.map((card: any) => {
            const progress = reviewsMap.get(card.id);
            return {
              ...card,
              wordId: card.id,
              masteryLevel: progress?.masteryLevel ?? 0,
              nextReviewDate: progress?.nextReviewDate,
            };
          });
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

  // Convert legacy RemNote categories to our CategoryInfo format for the grid
  const displayCategories = useMemo(() => {
    if (!categoryIndex) return [];

    return categoryIndex.categories.map((cat) => {
      const id = cat.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      return {
        id,
        name: cat.name,
        icon: categoryIcons[cat.name] || "📚",
        cardCount: cat.count,
      };
    });
  }, [categoryIndex]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Flashcards 📚"
          subtitle="Master German vocabulary with spaced repetition"
          backButton={
            selectedCategory
              ? {
                  label: "Back to Categories",
                  onClick: handleBackToCategories,
                }
              : {
                  label: "Back to Dashboard",
                  onClick: () => router.push("/dashboard/student"),
                }
          }
          actions={
            selectedCategory ? (
              <ActionButton
                onClick={handleToggleReviewMode}
                variant={isReviewMode ? "purple" : "cyan"}
                icon={
                  isReviewMode ? (
                    <ActionButtonIcons.Check />
                  ) : (
                    <ActionButtonIcons.Eye />
                  )
                }
                disabled={isPending || isLoadingData}
              >
                {isReviewMode ? "Start Practice" : "Review All"}
              </ActionButton>
            ) : (
              <ActionButton
                onClick={handleStartPractice}
                variant="purple"
                icon={<ActionButtonIcons.ArrowRight />}
                disabled={isPending || isVocabularyLoading || isLoadingData}
              >
                {isPending || isVocabularyLoading || isLoadingData
                  ? "Loading..."
                  : "Start Practice"}
              </ActionButton>
            )
          }
        />

        {/* Loading indicator for transitions */}
        {(isPending || isLoadingData) && (
          <div className="fixed top-20 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-down">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              <span className="font-medium">Loading flashcards...</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Show Flashcard Practice/Review if category is selected */}
          {selectedCategory ? (
            isReviewMode ? (
              <FlashcardReviewList
                flashcards={practiceFlashcards}
                categoryName={selectedCategory}
                level={selectedLevel}
              />
            ) : (
              <FlashcardPractice
                flashcards={practiceFlashcards}
                categoryName={selectedCategory}
                level={selectedLevel}
                onBack={handleBackToCategories}
                showExamples={settings.showExamples}
                nextDueInfo={nextDueInfo}
                upcomingCards={upcomingCards}
              />
            )
          ) : (
            <>
              {/* Level Selector - Split Button Style */}
              <div className="mb-8">
                <CEFRLevelSelector
                  selectedLevel={selectedLevel}
                  onLevelChange={setSelectedLevel}
                  colorScheme="default"
                  showDescription={true}
                  size="sm"
                />
              </div>

              {/* Loading State */}
              {isPageLoading ? (
                <div className="space-y-8">
                  {/* Progress Chart Skeleton */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-pulse">
                    <div className="h-24 bg-gray-100 rounded-lg w-full"></div>
                  </div>

                  {/* Categories Grid Skeleton */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className="h-[120px] bg-gray-100 rounded-xl animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {isVocabularyError ? (
                    <div className="text-center py-12 bg-white border border-red-200 rounded-2xl">
                      <div className="text-6xl mb-4">⚠️</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Unable to load vocabulary
                      </h3>
                      <p className="text-gray-600 mb-4">
                        There was a problem loading the vocabulary data. Please
                        try again.
                      </p>
                      <ActionButton
                        onClick={() => window.location.reload()}
                        variant="purple"
                        icon={<ActionButtonIcons.Refresh />}
                      >
                        Retry
                      </ActionButton>
                    </div>
                  ) : (
                    <>
                      {/* Weekly Progress Chart with Stats Button - Collapsible */}
                      <FlashcardProgressChart
                        weeklyData={weeklyData}
                        totalWords={totalWords}
                        totalRemNoteCards={totalRemNoteCards}
                        stats={{
                          cardsLearned: stats.cardsLearned,
                          streak: stats.streak,
                          accuracy: stats.accuracy,
                        }}
                      />
                    </>
                  )}

                  {/* Vocabulary Categories */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedLevel} Vocabulary Categories
                      </h2>
                    </div>

                    {displayCategories.length === 0 ? (
                      <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          No vocabulary yet
                        </h3>
                        <p className="text-gray-600">
                          Vocabulary categories will appear here once you start
                          learning
                        </p>
                      </div>
                    ) : (
                      <CategoryButtonGrid
                        categories={displayCategories}
                        onSelect={handleCategoryClick}
                        categoryCompletionStatus={categoryCompletionStatus}
                        categoryAttemptCounts={categoryAttemptCounts}
                        categoryDueCounts={categoryDueCounts}
                      />
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">
                          Ready to practice?
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Start a flashcard session with all vocabulary or
                          choose a specific category
                        </p>
                      </div>
                      <div className="md:w-64">
                        <ActionButton
                          onClick={handleStartPractice}
                          variant="purple"
                          icon={<ActionButtonIcons.ArrowRight />}
                          disabled={
                            isPending || isVocabularyLoading || isLoadingData
                          }
                        >
                          {isVocabularyLoading || isLoadingData
                            ? "Loading Data..."
                            : "Start Practice Session"}
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
