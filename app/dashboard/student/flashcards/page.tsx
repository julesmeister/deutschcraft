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
    isRefreshingData,
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
                disabled={isPageLoading || isPending || isLoadingData}
              >
                Start Practice
              </ActionButton>
            )
          }
        />

        {/* Data refresh indicator (after completing practice session) */}
        {isRefreshingData && (
          <div
            data-refreshing="true"
            className="fixed top-20 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-down"
          >
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              <span className="font-medium">Updating progress...</span>
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

              {/* Content - show when loaded */}
              {!isPageLoading && (
                <div className="animate-fade-in-up">
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
                      <div>
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
                      </div>

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
                              disabled={isPageLoading || isPending || isLoadingData}
                            >
                              Start Practice Session
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
