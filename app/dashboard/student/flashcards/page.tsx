"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryButtonGrid } from "@/components/flashcards/CategoryButtonGrid";
import { FlashcardPractice } from "@/components/flashcards/FlashcardPractice";
import { FlashcardReviewList } from "@/components/flashcards/FlashcardReviewList";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ToastProvider } from "@/components/ui/toast";
import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { usePersistedLevel } from "@/lib/hooks/usePersistedLevel";
import { FlashcardProgressChart } from "@/components/flashcards/FlashcardProgressChart";
import { useFlashcardData } from "./hooks/useFlashcardData";
import { useFlashcardSessionManager } from "./hooks/useFlashcardSessionManager";

export default function FlashcardsLandingPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = usePersistedLevel(
    "flashcards-last-level"
  );
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [recentReviews, setRecentReviews] = useState<
    Record<string, { difficulty: string; timestamp: number }>
  >({});

  // 1. Fetch and process data
  const {
    stats,
    statsLoading,
    weeklyData,
    totalWords,
    totalRemNoteCards,
    categoriesLoading,
    settings,
    flashcardReviews,
    reviewsMap,
    categoryIndex,
    isVocabularyLoading,
    isVocabularyError,
    categoryAttemptCounts,
    categoryCompletionStatus,
    categoryDueCounts,
    displayCategories,
  } = useFlashcardData(
    session?.user?.email,
    selectedLevel,
    statsRefreshKey,
    recentReviews
  );

  // 2. Manage session state and actions
  const {
    selectedCategory,
    practiceFlashcards,
    nextDueInfo,
    upcomingCards,
    isReviewMode,
    isLoadingData,
    isPending,
    handleCategoryClick,
    handleBackToCategories,
    handleStartPractice,
    handleToggleReviewMode,
  } = useFlashcardSessionManager({
    selectedLevel,
    categoryIndex,
    reviewsMap,
    flashcardReviews,
    settings,
    userEmail: session?.user?.email,
    onSessionComplete: (reviewedCards) => {
      if (reviewedCards) {
        setRecentReviews((prev) => ({ ...prev, ...reviewedCards }));
      }
      setStatsRefreshKey((prev) => prev + 1);
    },
  });

  const isPageLoading = isVocabularyLoading || categoriesLoading;

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
                  onClick: () => handleBackToCategories(),
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
                onBack={(reviews) => handleBackToCategories(reviews)}
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
