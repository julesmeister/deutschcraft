'use client';

import { Button } from '@/components/ui/Button';
import { SessionSummary } from './SessionSummary';
import { MasteryStats } from './MasteryStats';
import { FlashcardCard } from './FlashcardCard';
import { DifficultyButtons } from './DifficultyButtons';
import { KeyboardShortcutsLegend } from './KeyboardShortcutsLegend';
import { useFlashcardSession } from '@/lib/hooks/useFlashcardSession';

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
  onBack: () => void;
  showExamples?: boolean;
}

export function FlashcardPractice({
  flashcards,
  categoryName,
  level,
  onBack,
  showExamples = true,
}: FlashcardPracticeProps) {
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
  } = useFlashcardSession(flashcards);

  // Empty state
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No flashcards found</h3>
        <p className="text-gray-600 mb-6">
          This category doesn&apos;t have any flashcards yet.
        </p>
        <Button onClick={onBack} variant="primary">
          Back to Categories
        </Button>
      </div>
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
        onFinish={onBack}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 truncate">{categoryName}</h2>
          <p className="text-sm sm:text-base text-gray-600">
            {level} • Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        <Button onClick={onBack} variant="ghost" size="sm" className="shrink-0 self-start sm:self-auto">
          <span className="hidden sm:inline">← Back to Categories</span>
          <span className="sm:hidden">← Back</span>
        </Button>
      </div>

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
      />

      {/* Combined: Navigation + Difficulty/Show Answer Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Previous Button */}
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="secondary"
          size="sm"
          className="shrink-0 order-2 sm:order-1"
        >
          <span className="hidden sm:inline">← Previous</span>
          <span className="sm:hidden">← Prev</span>
        </Button>

        {/* Difficulty Buttons or Show Answer - Center Area */}
        <div className="flex-1 order-1 sm:order-2">
          <DifficultyButtons
            isFlipped={isFlipped}
            onDifficulty={handleDifficulty}
            onShowAnswer={handleFlip}
          />
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          variant="secondary"
          size="sm"
          className="shrink-0 order-3"
        >
          <span className="hidden sm:inline">Next →</span>
          <span className="sm:hidden">Next →</span>
        </Button>
      </div>

      {/* Keyboard Shortcuts Legend */}
      <KeyboardShortcutsLegend />
    </div>
  );
}
