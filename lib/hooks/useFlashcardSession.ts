/**
 * Flashcard Session Hook
 * Manages flashcard practice session state and logic
 */

import { useState, useEffect } from 'react';
import { useFlashcardMutations } from './useFlashcardMutations';
import { useFirebaseAuth } from './useFirebaseAuth';
import { useToast } from '@/components/ui/toast';

type DifficultyLevel = 'again' | 'hard' | 'good' | 'easy';

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  examples?: string[];
  wordId?: string;
}

export function useFlashcardSession(flashcards: Flashcard[]) {
  const { session } = useFirebaseAuth();
  const { saveReview, saveDailyProgress } = useFlashcardMutations();
  const toast = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Record<string, DifficultyLevel>>({});
  const [masteryStats, setMasteryStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const isLastCard = currentIndex === flashcards.length - 1;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
        case '1':
          e.preventDefault();
          if (isFlipped) handleDifficulty('again');
          break;
        case '2':
          e.preventDefault();
          if (isFlipped) handleDifficulty('hard');
          break;
        case '3':
          e.preventDefault();
          if (isFlipped) handleDifficulty('good');
          break;
        case '4':
          e.preventDefault();
          if (isFlipped) handleDifficulty('easy');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex]);

  const handleDifficulty = async (difficulty: DifficultyLevel) => {
    // Record the review
    setReviewedCards(prev => ({ ...prev, [currentCard.id]: difficulty }));

    // Calculate updated mastery stats (for passing to handleSessionComplete)
    const updatedStats = {
      ...masteryStats,
      [difficulty]: masteryStats[difficulty] + 1,
    };

    // Update mastery stats state
    setMasteryStats(updatedStats);

    // Show toast based on difficulty
    const toastMessages = {
      again: { message: 'Will review again soon', variant: 'error' as const, duration: 1500 },
      hard: { message: 'Keep practicing!', variant: 'warning' as const, duration: 1500 },
      good: { message: 'Good recall! 👍', variant: 'success' as const, duration: 1500 },
      easy: { message: 'Perfect! Mastered! 🌟', variant: 'success' as const, duration: 1500 },
    };

    const toastConfig = toastMessages[difficulty];
    toast.addToast(toastConfig.message, toastConfig.variant, {
      duration: toastConfig.duration,
      showIcon: false
    });

    // Save review to Firestore if user is logged in
    if (session?.user?.email && currentCard.wordId) {
      try {
        await saveReview(
          session.user.email,
          currentCard.id,
          currentCard.wordId,
          difficulty
        );
      } catch (error) {
        console.error('Failed to save review:', error);
        // Continue anyway - don't block user flow
      }
    }

    // Check if this is the last card
    if (isLastCard) {
      // Show summary with updated stats
      await handleSessionComplete(updatedStats);
    } else {
      // Move to next card
      handleNext();
    }
  };

  const handleSessionComplete = async (stats?: typeof masteryStats) => {
    // Use provided stats or current masteryStats
    const finalStats = stats || masteryStats;

    // Calculate session stats
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000); // in seconds
    const totalReviewed = finalStats.again + finalStats.hard + finalStats.good + finalStats.easy;
    const correctCount = finalStats.good + finalStats.easy;
    const incorrectCount = finalStats.again + finalStats.hard;

    // Save daily progress
    if (session?.user?.email) {
      try {
        console.log('Saving daily progress:', {
          userId: session.user.email,
          cardsReviewed: totalReviewed,
          timeSpent: Math.ceil(timeSpent / 60),
          correctCount,
          incorrectCount,
        });

        await saveDailyProgress(session.user.email, {
          cardsReviewed: totalReviewed,
          timeSpent: Math.ceil(timeSpent / 60), // Convert to minutes
          correctCount,
          incorrectCount,
        });

        console.log('Daily progress saved successfully!');
      } catch (error) {
        console.error('Failed to save daily progress:', error);
      }
    } else {
      console.warn('No user session found, cannot save progress');
    }

    // Show summary
    setShowSummary(true);
  };

  const handleReviewAgainCards = () => {
    // Filter cards marked as "again"
    const againCards = flashcards.filter(card => reviewedCards[card.id] === 'again');

    if (againCards.length > 0) {
      // Reset for review session
      setCurrentIndex(0);
      setShowSummary(false);
      setIsFlipped(false);
      // Reset stats for new session
      setMasteryStats({ again: 0, hard: 0, good: 0, easy: 0 });
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return {
    // State
    currentCard,
    currentIndex,
    isFlipped,
    masteryStats,
    progress,
    showSummary,
    sessionStartTime,
    isLastCard,

    // Handlers
    handleDifficulty,
    handleFlip,
    handleNext,
    handlePrevious,
    handleReviewAgainCards,
    handleSessionComplete,
  };
}
