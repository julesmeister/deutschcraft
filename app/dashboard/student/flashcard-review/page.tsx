"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CatLoader } from "@/components/ui/CatLoader";
import { TabBar } from "@/components/ui/TabBar";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { FlashcardPractice } from "@/components/flashcards/FlashcardPractice";
import { ReviewEmptyState } from "@/components/flashcards/ReviewEmptyState";
import { ReviewCardPreview } from "@/components/flashcards/ReviewCardPreview";
import { CEFRLevel, CEFRLevelInfo } from "@/lib/models/cefr";
import {
  useFlashcardReviewData,
  FilterType,
} from "@/lib/hooks/useFlashcardReviewData";
import { ReviewLevelSelector } from "@/components/flashcards/ReviewLevelSelector";

export default function FlashcardReviewPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [filterType, setFilterType] = useState<FilterType>("due-today");
  const [isPracticing, setIsPracticing] = useState(false);

  // Use custom hook for data logic
  const {
    reviews,
    isLoading,
    refetch,
    filteredFlashcards,
    dueCountsByLevel,
    cardsForPractice,
    stats,
  } = useFlashcardReviewData(session?.user?.email, selectedLevel, filterType);

  // Handle returning from practice mode
  const handleExitPractice = () => {
    setIsPracticing(false);
    // Refetch reviews to update the dashboard with latest progress
    refetch();
  };

  if (!session) {
    return <CatLoader message="Loading..." size="lg" fullScreen />;
  }

  if (isLoading) {
    return (
      <CatLoader message="Loading your review cards..." size="lg" fullScreen />
    );
  }

  // Practice mode
  if (isPracticing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Flashcard Review"
          subtitle={`${CEFRLevelInfo[selectedLevel].displayName} • ${
            filterType === "due-today"
              ? "Due Today"
              : filterType === "struggling"
              ? "Struggling Cards"
              : filterType === "new"
              ? "New Cards"
              : filterType === "learning"
              ? "Learning"
              : filterType === "review"
              ? "Review"
              : filterType === "lapsed"
              ? "Lapsed Cards"
              : "All Reviewed"
          }`}
          backButton={{
            label: "Back to Review Dashboard",
            onClick: handleExitPractice,
          }}
        />
        <div className="container mx-auto px-6 py-8">
          <FlashcardPractice
            flashcards={cardsForPractice}
            categoryName={
              filterType === "due-today"
                ? "Due Today"
                : filterType === "struggling"
                ? "Struggling Cards"
                : filterType === "new"
                ? "New Cards"
                : filterType === "learning"
                ? "Learning"
                : filterType === "review"
                ? "Review"
                : filterType === "lapsed"
                ? "Lapsed Cards"
                : "All Reviewed Cards"
            }
            level={selectedLevel}
            onBack={handleExitPractice}
            showExamples={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Flashcard Review 🔄"
        subtitle="Review cards you've practiced before"
        backButton={{
          label: "Back to Flashcards",
          onClick: () => router.push("/dashboard/student/flashcards"),
        }}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Level Selector & Due Counts */}
        <div className="mb-8">
          <ReviewLevelSelector
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            dueCountsByLevel={dueCountsByLevel}
            currentLevelDueCount={stats.dueToday}
          />
        </div>

        {/* Stats Tabs - Compact Filters */}
        <div className="mb-8">
          <TabBar
            tabs={[
              {
                id: "due-today",
                label: "Due Today",
                icon: "📅",
                value: stats.dueToday,
              },
              {
                id: "struggling",
                label: "Struggling",
                icon: "💪",
                value: stats.struggling,
              },
              { id: "new", label: "New", icon: "🆕", value: stats.newCards },
              {
                id: "learning",
                label: "Learning",
                icon: "📖",
                value: stats.learning,
              },
              {
                id: "review",
                label: "Review",
                icon: "🔄",
                value: stats.review,
              },
              {
                id: "lapsed",
                label: "Lapsed",
                icon: "⚠️",
                value: stats.lapsed,
              },
              {
                id: "all-reviewed",
                label: "All",
                icon: "✅",
                value: stats.total,
              },
            ]}
            activeTabId={filterType}
            onTabChange={(tabId) => setFilterType(tabId as FilterType)}
            variant="tabs"
            size="compact"
          />
        </div>

        {/* Cards Section */}
        {filteredFlashcards.length === 0 ? (
          <ReviewEmptyState filterType={filterType} />
        ) : (
          <>
            {/* Review CTA */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {cardsForPractice.length} Card
                    {cardsForPractice.length !== 1 ? "s" : ""} Ready for Review
                    {filteredFlashcards.length > cardsForPractice.length && (
                      <span className="text-sm font-normal text-neutral-600 ml-2">
                        ({filteredFlashcards.length} total)
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {filterType === "due-today" &&
                      "These cards are due for review based on spaced repetition"}
                    {filterType === "struggling" &&
                      "Focus on these cards to improve your mastery level"}
                    {filterType === "new" &&
                      "Brand new cards you haven't started yet"}
                    {filterType === "learning" &&
                      "Cards in the initial learning phase"}
                    {filterType === "review" &&
                      "Cards you've mastered and are maintaining"}
                    {filterType === "lapsed" &&
                      "Cards that need relearning after being forgotten"}
                    {filterType === "all-reviewed" &&
                      "All cards you've practiced before are available"}
                  </p>
                </div>
                <div className="md:w-64">
                  <ActionButton
                    onClick={() => setIsPracticing(true)}
                    variant="purple"
                    icon={<ActionButtonIcons.ArrowRight />}
                  >
                    Start Review Session
                  </ActionButton>
                </div>
              </div>
            </div>

            {/* Card Preview */}
            <ReviewCardPreview
              cards={cardsForPractice}
              reviews={reviews}
              onCardClick={() => setIsPracticing(true)}
            />
          </>
        )}
      </div>
    </div>
  );
}
