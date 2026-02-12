"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FlashcardPractice } from "@/components/flashcards/FlashcardPractice";
import { FlashcardReviewList } from "@/components/flashcards/FlashcardReviewList";
import { CatLoader } from "@/components/ui/CatLoader";
import { ToastProvider } from "@/components/ui/toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useFlashcardPracticeData } from "./useFlashcardPracticeData";

const SHOW_ENGLISH_FIRST_KEY = "flashcard-show-english-first";

function FlashcardPracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category") || "";
  const {
    practiceFlashcards,
    categoryName,
    isLoading,
    error,
    selectedLevel,
    nextDueInfo,
    upcomingCards,
    mode,
  } = useFlashcardPracticeData();

  const [showEnglishFirst, setShowEnglishFirst] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SHOW_ENGLISH_FIRST_KEY);
    if (saved !== null) {
      setShowEnglishFirst(saved === "true");
    }
  }, []);

  const handleToggleLanguage = () => {
    const newValue = !showEnglishFirst;
    setShowEnglishFirst(newValue);
    localStorage.setItem(SHOW_ENGLISH_FIRST_KEY, String(newValue));
  };

  const handleBack = () => {
    router.push("/dashboard/student/flashcards?refreshed=true");
  };

  if (isLoading) {
    return <CatLoader fullScreen message="Loading flashcards..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Flashcards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={mode === "review" ? "Review Mode" : categoryName}
        subtitle={
          mode === "review"
            ? `Reviewing ${categoryName}`
            : `${selectedLevel} • Practice Session`
        }
        backButton={{
          label: "Back to Flashcards",
          onClick: handleBack,
        }}
        actions={
          mode !== "review" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/student/flashcards/practice?mode=review&category=${categoryId}`)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors bg-white text-gray-700"
              >
                Review All
              </button>
              <button
                onClick={handleToggleLanguage}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors bg-white text-gray-700"
                title={
                  showEnglishFirst
                    ? "Showing English first"
                    : "Showing German first"
                }
              >
                {showEnglishFirst ? "🇬🇧 → 🇩🇪" : "🇩🇪 → 🇬🇧"}
              </button>
            </div>
          ) : undefined
        }
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {mode === "review" ? (
          <FlashcardReviewList
            flashcards={practiceFlashcards}
            categoryName={categoryName}
            level={selectedLevel}
          />
        ) : (
          <FlashcardPractice
            flashcards={practiceFlashcards}
            categoryName={categoryName}
            level={selectedLevel}
            onBack={handleBack}
            nextDueInfo={nextDueInfo}
            upcomingCards={upcomingCards}
            hideHeader={true}
            showEnglishFirst={showEnglishFirst}
            onToggleLanguage={handleToggleLanguage}
          />
        )}
      </div>
    </div>
  );
}

export default function FlashcardPracticePage() {
  return (
    <ToastProvider>
      <Suspense fallback={<CatLoader fullScreen message="Initializing..." />}>
        <FlashcardPracticeContent />
      </Suspense>
    </ToastProvider>
  );
}
