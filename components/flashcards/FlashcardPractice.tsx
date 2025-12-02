'use client';

import { useState, useEffect } from 'react';
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
  nextDueInfo?: {
    count: number;
    nextDueDate: number;
  };
  upcomingCards?: Flashcard[];
}

const SHOW_ENGLISH_FIRST_KEY = 'flashcard-show-english-first';

export function FlashcardPractice({
  flashcards,
  categoryName,
  level,
  onBack,
  showExamples = true,
  nextDueInfo,
  upcomingCards = [],
}: FlashcardPracticeProps) {
  const [showEnglishFirst, setShowEnglishFirst] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SHOW_ENGLISH_FIRST_KEY);
    if (saved !== null) {
      setShowEnglishFirst(saved === 'true');
    }
  }, []);

  // Save preference to localStorage when changed
  const handleToggleLanguage = () => {
    const newValue = !showEnglishFirst;
    setShowEnglishFirst(newValue);
    localStorage.setItem(SHOW_ENGLISH_FIRST_KEY, String(newValue));
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
  } = useFlashcardSession(flashcards);

  // Empty state - No cards due for review
  if (flashcards.length === 0) {
    const formatTimeUntilDue = (dueDate: number) => {
      const now = Date.now();
      const diffMs = dueDate - now;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 60) {
        return `${diffMinutes}m`;
      } else if (diffHours < 24) {
        return `${diffHours}h`;
      } else if (diffDays < 7) {
        return `${diffDays}d`;
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)}w`;
      } else if (diffDays < 365) {
        return `${Math.floor(diffDays / 30)}mo`;
      } else {
        return `${Math.floor(diffDays / 365)}y`;
      }
    };

    const formatDueDate = (dueDate: number) => {
      const date = new Date(dueDate);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = date.toDateString() === tomorrow.toDateString();

      if (isToday) {
        return `today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (isTomorrow) {
        return `tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    };

    return (
      <div className="py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {nextDueInfo ? 'All caught up!' : 'No flashcards found'}
          </h3>
          <p className="text-gray-600 mb-2">
            {nextDueInfo ? (
              <>You&apos;ve reviewed all cards that are due right now.</>
            ) : (
              <>This category doesn&apos;t have any flashcards yet.</>
            )}
          </p>

          {nextDueInfo && nextDueInfo.count > 0 && (
            <>
              <div className="max-w-md mx-auto mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-center gap-2 text-blue-900 mb-2">
                    <span className="text-2xl">⏰</span>
                    <span className="font-bold text-lg">Next Review</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    <span className="font-bold">{nextDueInfo.count}</span> card{nextDueInfo.count !== 1 ? 's' : ''} scheduled
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    Next card due: {formatDueDate(nextDueInfo.nextDueDate)} (in {formatTimeUntilDue(nextDueInfo.nextDueDate)})
                  </p>
                </div>
              </div>

              {/* Upcoming Cards Grid */}
              {upcomingCards.length > 0 && (
                <div className="max-w-5xl mx-auto mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">Upcoming Cards Schedule</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {upcomingCards.map((card, index) => {
                      const dueDate = card.nextReviewDate || Date.now();
                      return (
                        <div
                          key={card.id || index}
                          className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-lg truncate">{card.german}</p>
                                <p className="text-gray-600 text-sm truncate">{card.english}</p>
                              </div>
                              <span className="text-xl shrink-0">🇩🇪</span>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                              <span className="text-xs text-gray-500">Due:</span>
                              <span className="text-xs font-bold text-blue-600">
                                {formatTimeUntilDue(dueDate)}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({formatDueDate(dueDate)})
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <Button onClick={onBack} variant="primary">
            Back to Categories
          </Button>
        </div>
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
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {/* Language Toggle */}
          <button
            onClick={handleToggleLanguage}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
            title={showEnglishFirst ? 'Showing English first' : 'Showing German first'}
          >
            {showEnglishFirst ? '🇬🇧 → 🇩🇪' : '🇩🇪 → 🇬🇧'}
          </button>
          <Button onClick={onBack} variant="ghost" size="sm">
            <span className="hidden sm:inline">← Back to Categories</span>
            <span className="sm:hidden">← Back</span>
          </Button>
        </div>
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
        showEnglishFirst={showEnglishFirst}
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
            Show Answer <span className="text-xs opacity-60 ml-2 hidden sm:inline">(Space/Enter)</span>
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
