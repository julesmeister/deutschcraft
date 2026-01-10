"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { SessionSummary } from "./SessionSummary";
import { MasteryStats } from "./MasteryStats";
import { FlashcardCard } from "./FlashcardCard";
import { DifficultyButtons } from "./DifficultyButtons";
import { KeyboardShortcutsLegend } from "./KeyboardShortcutsLegend";
import { useFlashcardSession } from "@/lib/hooks/useFlashcardSession";
import {
  useSavedVocabulary,
  useSaveVocabularyMutation,
  useRemoveSavedVocabularyMutation,
} from "@/lib/hooks/useSavedVocabulary";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { CEFRLevel } from "@/lib/models/cefr";
import { useToast } from "@/lib/hooks/useToast";
import { FlashcardEmptyState } from "./FlashcardEmptyState";

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  examples?: string[];
  masteryLevel?: number;
  lastReviewed?: Date;
  wordId?: string;
}

interface FlashcardPracticeProps {
  flashcards: Flashcard[];
  categoryName: string;
  level: string;
  onBack: (reviewedCards?: Record<string, string>) => void;
  showExamples?: boolean;
  nextDueInfo?: {
    count: number;
    nextDueDate: number;
  };
  upcomingCards?: Flashcard[];
  hideHeader?: boolean;
  showEnglishFirst?: boolean;
  onToggleLanguage?: () => void;
}

const SHOW_ENGLISH_FIRST_KEY = "flashcard-show-english-first";

export function FlashcardPractice({
  flashcards,
  categoryName,
  level,
  onBack,
  showExamples = true,
  nextDueInfo,
  upcomingCards = [],
  hideHeader = false,
  showEnglishFirst: externalShowEnglishFirst,
  onToggleLanguage: externalOnToggleLanguage,
}: FlashcardPracticeProps) {
  const [internalShowEnglishFirst, setInternalShowEnglishFirst] = useState(false);

  const isControlled = typeof externalShowEnglishFirst !== "undefined";
  const showEnglishFirst = isControlled
    ? externalShowEnglishFirst
    : internalShowEnglishFirst;

  // Load preference from localStorage on mount (only if not controlled)
  useEffect(() => {
    if (!isControlled) {
      const saved = localStorage.getItem(SHOW_ENGLISH_FIRST_KEY);
      if (saved !== null) {
        setInternalShowEnglishFirst(saved === "true");
      }
    }
  }, [isControlled]);

  // Save preference to localStorage when changed
  const handleToggleLanguage = () => {
    if (externalOnToggleLanguage) {
      externalOnToggleLanguage();
    } else {
      const newValue = !internalShowEnglishFirst;
      setInternalShowEnglishFirst(newValue);
      localStorage.setItem(SHOW_ENGLISH_FIRST_KEY, String(newValue));
    }
  };

  const {
    currentCard,
    currentIndex,
    isFlipped,
    masteryStats,
    progress,
    showSummary,
    sessionStartTime,
    handleDifficulty,
    handleFlip,
    handleNext,
    handlePrevious,
    handleReviewAgainCards,
    reviewedCards,
  } = useFlashcardSession(flashcards);

  // Saved vocabulary hooks
  const { session } = useFirebaseAuth();
  const toast = useToast();
  const { data: savedVocabulary = [] } = useSavedVocabulary(
    session?.user?.email
  );
  const saveMutation = useSaveVocabularyMutation();
  const removeMutation = useRemoveSavedVocabularyMutation();

  // Find saved status for current card
  const currentSaved = currentCard
    ? savedVocabulary.find((sv) => sv.wordId === currentCard.id)
    : undefined;
  const isSaved = !!currentSaved;
  const isCompleted = currentSaved?.completed || false;
  const timesUsed = currentSaved?.timesUsed || 0;
  const targetUses = currentSaved?.targetUses || 5;

  // Handle save/unsave
  const handleToggleSave = async () => {
    if (!session?.user?.email || !currentCard) return;

    try {
      if (isSaved) {
        await removeMutation.mutateAsync({
          userId: session.user.email,
          wordId: currentCard.id,
        });
        toast.success("Removed from saved vocabulary");
      } else {
        await saveMutation.mutateAsync({
          userId: session.user.email,
          wordData: {
            wordId: currentCard.id,
            flashcardId: currentCard.id,
            german: currentCard.german,
            english: currentCard.english,
            level: level as CEFRLevel,
            category: currentCard.category,
            examples: currentCard.examples,
          },
        });
        toast.success("Saved! Track progress in writing exercises.");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      toast.error("Failed to save word. Please try again.");
    }
  };

  // Empty state - No cards due for review
  if (flashcards.length === 0) {
    return (
      <FlashcardEmptyState
        flashcards={flashcards}
        nextDueInfo={nextDueInfo}
        upcomingCards={upcomingCards}
        onBack={onBack}
      />
    );
  }

  // Show summary if session is complete
  if (showSummary) {
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
    return (
      <SessionSummary
        stats={masteryStats}
        totalCards={flashcards.length}
        timeSpent={timeSpent}
        onReview={handleReviewAgainCards}
        onFinish={() => onBack(reviewedCards)}
      />
    );
  }

  // Safety check - no cards to review
  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          All cards mastered!
        </h3>
        <p className="text-gray-600 mb-6">
          You've marked all cards as expert. Great job!
        </p>
        <Button onClick={() => onBack(reviewedCards)} variant="primary">
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 truncate">
              {categoryName}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {level} • Card {currentIndex + 1} of {flashcards.length}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {/* Language Toggle */}
            <button
              onClick={handleToggleLanguage}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
              title={
                showEnglishFirst
                  ? "Showing English first"
                  : "Showing German first"
              }
            >
              {showEnglishFirst ? "🇬🇧 → 🇩🇪" : "🇩🇪 → 🇬🇧"}
            </button>
            <Button
              onClick={() => onBack(reviewedCards)}
              variant="ghost"
              size="sm"
            >
              <span className="hidden sm:inline">← Back to Categories</span>
              <span className="sm:hidden">← Back</span>
            </Button>
          </div>
        </div>
      )}

      {/* Mastery Stats */}
      <MasteryStats stats={masteryStats} />

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
        <div
          className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard */}
      <FlashcardCard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        showExamples={showExamples}
        showEnglishFirst={showEnglishFirst}
        isSaved={isSaved}
        isCompleted={isCompleted}
        timesUsed={timesUsed}
        targetUses={targetUses}
        onToggleSave={handleToggleSave}
      />

      {/* Button Layout: Changes based on whether card is flipped */}
      {!isFlipped ? (
        // When card is NOT flipped: Previous, Show Answer, Next all in one line
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 border border-gray-300 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
          >
            <span className="hidden sm:inline">← Previous</span>
            <span className="sm:hidden">← Prev</span>
          </button>

          <button
            onClick={handleFlip}
            className="flex-[2] bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 border border-gray-300 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all hover:border-gray-400"
          >
            Show Answer{" "}
            <span className="text-xs opacity-60 ml-2 hidden sm:inline">
              (Space/Enter)
            </span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 border border-gray-300 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
          >
            <span className="hidden sm:inline">Next →</span>
            <span className="sm:hidden">Next →</span>
          </button>
        </div>
      ) : (
        // When card IS flipped: Difficulty buttons on top, navigation below
        <>
          <div>
            <DifficultyButtons
              isFlipped={isFlipped}
              onDifficulty={handleDifficulty}
              onShowAnswer={handleFlip}
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              <span className="hidden sm:inline">← Previous</span>
              <span className="sm:hidden">← Prev</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              <span className="hidden sm:inline">Next →</span>
              <span className="sm:hidden">Next →</span>
            </Button>
          </div>
        </>
      )}

      {/* Keyboard Shortcuts Legend */}
      <KeyboardShortcutsLegend />
    </div>
  );
}
