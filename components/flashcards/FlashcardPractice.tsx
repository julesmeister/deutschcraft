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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">{categoryName}</h2>
          <p className="text-gray-600">
            {level} • Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        <Button onClick={onBack} variant="ghost" size="sm">
          ← Back to Categories
        </Button>
      </div>

      {/* Mastery Stats */}
      <MasteryStats stats={masteryStats} />

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
      <div className="flex items-center gap-3">
        {/* Previous Button */}
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="secondary"
          size="sm"
          className="shrink-0"
        >
          ← Previous
        </Button>

        {/* Difficulty Buttons or Show Answer - Center Area */}
        <div className="flex-1">
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
          className="shrink-0"
        >
          Next →
        </Button>
      </div>

      {/* Keyboard Shortcuts Legend */}
      <KeyboardShortcutsLegend />
    </div>
  );
}
