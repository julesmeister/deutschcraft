"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryButtonGrid } from "@/components/flashcards/CategoryButtonGrid";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ToastProvider } from "@/components/ui/toast";
import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { ActionButtonDropdown, DropdownIcons } from "@/components/ui/ActionButtonDropdown";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { usePersistedLevel } from "@/lib/hooks/usePersistedLevel";
import { FlashcardProgressChart } from "@/components/flashcards/FlashcardProgressChart";
import { useFlashcardData } from "./hooks/useFlashcardData";
import { CatLoader } from "@/components/ui/CatLoader";

function FlashcardsLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = usePersistedLevel(
    "flashcards-last-level"
  );
  
  // Handle refresh logic
  const shouldRefresh = searchParams.get("refreshed") === "true";
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  useEffect(() => {
    if (shouldRefresh) {
       setStatsRefreshKey(prev => prev + 1);
       router.replace('/dashboard/student/flashcards');
    }
  }, [shouldRefresh, router]);

  // Fetch data
  const {
    stats,
    weeklyData,
    totalWords,
    totalRemNoteCards,
    categoriesLoading,
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
    {} // We don't have recentReviews local state anymore, updates come from server refetch
  );

  const isPageLoading = isVocabularyLoading || categoriesLoading;

  const handleStartPractice = () => {
    router.push("/dashboard/student/flashcards/practice?mode=practice&category=all");
  };

  const handleStartPacman = () => {
    router.push("/dashboard/student/flashcards/pacman?category=all");
  };

  const handleStartDerDieDas = () => {
    router.push("/dashboard/student/flashcards/derdiedas?category=all");
  };

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    // We pass the ID. The practice page hook handles looking it up.
    router.push(`/dashboard/student/flashcards/practice?mode=practice&category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Flashcards 📚"
          subtitle="Master German vocabulary with spaced repetition"
          backButton={{
             label: "Back to Dashboard",
             onClick: () => router.push("/dashboard/student"),
          }}
          actions={
              <ActionButtonDropdown
                label="Practice"
                variant="purple"
                disabled={isPageLoading}
                items={[
                  {
                    label: "Start Practice",
                    onClick: handleStartPractice,
                    icon: <DropdownIcons.ArrowRight />,
                  },
                  {
                    label: "Prefix Chomper",
                    onClick: handleStartPacman,
                    icon: <DropdownIcons.Game />,
                  },
                  {
                    label: "Der Die Das",
                    onClick: handleStartDerDieDas,
                    icon: <DropdownIcons.Game />,
                  },
                ]}
              />
          }
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
              {/* Level Selector */}
              <div className="mb-8">
                <CEFRLevelSelector
                  selectedLevel={selectedLevel}
                  onLevelChange={setSelectedLevel}
                  colorScheme="default"
                  showDescription={true}
                  size="sm"
                />
              </div>

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
                      {/* Stats */}
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

                      {/* Categories */}
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
                              Start a flashcard session or play Prefix Chomper to master German verb prefixes!
                            </p>
                          </div>
                          <div className="flex gap-3 md:w-auto">
                            <ActionButton
                              onClick={handleStartPractice}
                              variant="purple"
                              icon={<ActionButtonIcons.ArrowRight />}
                              disabled={isPageLoading}
                            >
                              Practice
                            </ActionButton>
                            <ActionButton
                              onClick={handleStartPacman}
                              variant="cyan"
                              icon={<ActionButtonIcons.Play />}
                              disabled={isPageLoading}
                            >
                              Play Game
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
        </div>
      </div>
  );
}

export default function FlashcardsLandingPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<CatLoader fullScreen message="Loading..." />}>
        <FlashcardsLandingContent />
      </Suspense>
    </ToastProvider>
  );
}
