"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryButtonGrid } from "@/components/flashcards/CategoryButtonGrid";
import { FlashcardPractice } from "@/components/flashcards/FlashcardPractice";
import { FlashcardReviewList } from "@/components/flashcards/FlashcardReviewList";
import { FlashcardEmptyState } from "@/components/flashcards/FlashcardEmptyState";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ToastProvider } from "@/components/ui/toast";
import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useStudyStats, useFlashcardReviews } from "@/lib/hooks/useFlashcards";
import {
  useRemNoteCategories,
  useRemNoteTotalCards,
} from "@/lib/hooks/useRemNoteCategories";
import { useFlashcardSettings } from "@/lib/hooks/useFlashcardSettings";
import { usePersistedLevel } from "@/lib/hooks/usePersistedLevel";
import { CEFRLevel, CEFRLevelInfo } from "@/lib/models/cefr";
import { CatLoader } from "@/components/ui/CatLoader";
import { applyFlashcardSettings } from "@/lib/utils/flashcardSelection";
import { calculateCategoryProgress } from "@/lib/utils/categoryProgress";
import { useVocabularyLevel } from "@/lib/hooks/useVocabulary";
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
  const [isPending, startTransition] = useTransition();
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
  const { categories, isLoading: categoriesLoading } =
    useRemNoteCategories(selectedLevel);
  const totalRemNoteCards = useRemNoteTotalCards(selectedLevel);

  // Get flashcard settings
  const { settings } = useFlashcardSettings();

  // Fetch user's flashcard progress to identify attempted categories
  const { data: flashcardReviews = [], refetch: refetchReviews } =
    useFlashcardReviews(session?.user?.email);

  // Fetch vocabulary data
  const {
    data: levelData,
    isLoading: isVocabularyLoading,
    isError: isVocabularyError,
  } = useVocabularyLevel(selectedLevel);

  // Calculate category progress
  const { categoryAttemptCounts, categoryCompletionStatus } = levelData
    ? calculateCategoryProgress(levelData.flashcards, flashcardReviews)
    : { categoryAttemptCounts: {}, categoryCompletionStatus: {} };

  // Calculate due cards per category
  const categoryDueCounts = new Map<string, number>();
  const now = Date.now();

  if (levelData) {
    levelData.flashcards.forEach((card: any) => {
      const categoryId = card.category
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const progress = flashcardReviews.find(
        (r) => r.flashcardId === card.id || r.wordId === card.id
      );

      // Count if card is new (never seen) OR due for review now
      const isDue = !progress || (progress.nextReviewDate || 0) <= now;

      if (isDue) {
        categoryDueCounts.set(
          categoryId,
          (categoryDueCounts.get(categoryId) || 0) + 1
        );
      }
    });
  }

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    if (!levelData) return;

    // Get flashcards for this category and level
    let categoryFlashcards = levelData.flashcards
      .filter(
        (card: any) =>
          card.category
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") === categoryId
      )
      .map((card: any) => {
        // Find progress for this card
        const progress = flashcardReviews.find(
          (r) => r.flashcardId === card.id || r.wordId === card.id
        );
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

    // Use transition to keep UI responsive during state updates
    startTransition(() => {
      setPracticeFlashcards(cards);
      setSelectedCategory(categoryName);
      setNextDueInfo(nextDueInfo);
      setUpcomingCards(upcomingCards);
      setIsReviewMode(false); // Reset to practice mode when selecting category
    });
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

  const handleStartPractice = () => {
    if (!levelData) return;

    // Get all flashcards for the selected level
    let flashcardsWithWordId = levelData.flashcards.map((card: any) => {
      // Find progress for this card
      const progress = flashcardReviews.find(
        (r) => r.flashcardId === card.id || r.wordId === card.id
      );
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
  };

  const handleToggleReviewMode = () => {
    if (!selectedCategory || !levelData) return;

    const newReviewMode = !isReviewMode;

    // Get the current category flashcards
    let categoryFlashcards: any[];

    if (selectedCategory === "All Categories") {
      categoryFlashcards = levelData.flashcards;
    } else {
      const categoryId = selectedCategory
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      categoryFlashcards = levelData.flashcards.filter(
        (card: any) =>
          card.category
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") === categoryId
      );
    }

    // Map with progress data
    let flashcardsWithWordId = categoryFlashcards.map((card: any) => {
      const progress = flashcardReviews.find(
        (r) => r.flashcardId === card.id || r.wordId === card.id
      );
      return {
        ...card,
        wordId: card.id,
        masteryLevel: progress?.masteryLevel ?? 0,
        nextReviewDate: progress?.nextReviewDate,
      };
    });

    let finalCards: any[];
    let finalNextDueInfo: { count: number; nextDueDate: number } | undefined;
    let finalUpcomingCards: any[];

    if (newReviewMode) {
      // Review mode: Show ALL cards, no filtering
      finalCards = flashcardsWithWordId;
      finalNextDueInfo = undefined;
      finalUpcomingCards = [];
    } else {
      // Practice mode: Apply settings (only due cards)
      const result = applyFlashcardSettings(
        flashcardsWithWordId,
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
                disabled={isPending}
              >
                {isReviewMode ? "Start Practice" : "Review All"}
              </ActionButton>
            ) : (
              <ActionButton
                onClick={handleStartPractice}
                variant="purple"
                icon={<ActionButtonIcons.ArrowRight />}
                disabled={isPending || isVocabularyLoading}
              >
                {isPending || isVocabularyLoading
                  ? "Loading..."
                  : "Start Practice"}
              </ActionButton>
            )
          }
        />

        {/* Loading indicator for transitions */}
        {isPending && (
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
              {statsLoading || isVocabularyLoading ? (
                <CatLoader
                  message="Loading your stats and vocabulary..."
                  size="md"
                />
              ) : isVocabularyError ? (
                <div className="text-center py-12 bg-white border border-red-200 rounded-2xl">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Unable to load vocabulary
                  </h3>
                  <p className="text-gray-600 mb-4">
                    There was a problem loading the vocabulary data. Please try
                    again.
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

                {categoriesLoading ? (
                  <CatLoader message="Loading categories..." size="md" />
                ) : categories.length === 0 ? (
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
                    categories={categories}
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
                      Start a flashcard session with all vocabulary or choose a
                      specific category
                    </p>
                  </div>
                  <div className="md:w-64">
                    <ActionButton
                      onClick={handleStartPractice}
                      variant="purple"
                      icon={<ActionButtonIcons.ArrowRight />}
                      disabled={isPending || isVocabularyLoading}
                    >
                      {isVocabularyLoading
                        ? "Loading Data..."
                        : "Start Practice Session"}
                    </ActionButton>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
