/**
 * Flashcard Session Hook
 * Manages flashcard practice session state and logic
 */

import { useState, useEffect } from "react";
import { useFlashcardMutations } from "./useFlashcardMutations";
import { useFirebaseAuth } from "./useFirebaseAuth";
import { useToast } from "@/components/ui/toast";

type DifficultyLevel = "again" | "hard" | "good" | "easy" | "expert";

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  examples?: string[];
  wordId?: string;
}

export function useFlashcardSession(initialFlashcards: Flashcard[]) {
  const { session } = useFirebaseAuth();
  const { saveReview, saveDailyProgress } = useFlashcardMutations();
  const toast = useToast();

  const [activeFlashcards, setActiveFlashcards] = useState(initialFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<
    Record<string, DifficultyLevel>
  >({});
  const [cardMasteryLevels, setCardMasteryLevels] = useState<
    Record<string, number>
  >({});
  const [masteryStats, setMasteryStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    expert: 0,
  });
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  // Update active flashcards when initial flashcards change
  useEffect(() => {
    setActiveFlashcards(initialFlashcards);
  }, [initialFlashcards]);

  const currentCard = activeFlashcards[currentIndex]
    ? {
        ...activeFlashcards[currentIndex],
        masteryLevel:
          cardMasteryLevels[activeFlashcards[currentIndex]?.id] ??
          activeFlashcards[currentIndex]?.masteryLevel ??
          0,
      }
    : null;
  const progress =
    activeFlashcards.length > 0
      ? ((currentIndex + 1) / activeFlashcards.length) * 100
      : 0;
  const isLastCard = currentIndex === activeFlashcards.length - 1;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          handleFlip();
          break;
        case "1":
          e.preventDefault();
          if (isFlipped) handleDifficulty("again");
          break;
        case "2":
          e.preventDefault();
          if (isFlipped) handleDifficulty("hard");
          break;
        case "3":
          e.preventDefault();
          if (isFlipped) handleDifficulty("good");
          break;
        case "4":
          e.preventDefault();
          if (isFlipped) handleDifficulty("easy");
          break;
        case "5":
          e.preventDefault();
          if (isFlipped) handleDifficulty("expert");
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, currentIndex]);

  const handleDifficulty = async (difficulty: DifficultyLevel) => {
    // Record the review
    setReviewedCards((prev) => ({ ...prev, [currentCard.id]: difficulty }));

    // Calculate updated mastery stats (for passing to handleSessionComplete)
    const updatedStats = {
      ...masteryStats,
      [difficulty]: masteryStats[difficulty] + 1,
    };

    // Update mastery stats state
    setMasteryStats(updatedStats);

    // Show toast based on difficulty
    const toastMessages = {
      again: {
        message: "Will review again soon",
        method: toast.error,
        duration: 800,
      },
      hard: {
        message: "Keep practicing!",
        method: toast.warning,
        duration: 800,
      },
      good: { message: "Good recall!", method: toast.success, duration: 800 },
      easy: {
        message: "Perfect! Mastered!",
        method: toast.success,
        duration: 800,
      },
      expert: {
        message: "Expert! Won't see this for a year!",
        method: toast.success,
        duration: 1000,
      },
    };

    const toastConfig = toastMessages[difficulty];
    toastConfig.method(toastConfig.message, {
      duration: toastConfig.duration,
    });

    // Check if this is the last card
    if (isLastCard) {
      // Show summary with updated stats
      handleSessionComplete(updatedStats);
    } else {
      // Move to next card immediately (optimistic UI)
      handleNext();
    }

    // Save review to Firestore/Turso in background if user is logged in
    if (session?.user?.email && currentCard.wordId) {
      // Non-blocking save
      saveReview(
        session.user.email,
        currentCard.id,
        currentCard.wordId,
        difficulty,
        currentCard.level,
        currentCard, // Pass full card data for DB sync
        true // Skip invalidation for performance during session
      )
        .then((srsResult) => {
          // Update mastery level for this card in state
          if (srsResult) {
            setCardMasteryLevels((prev) => ({
              ...prev,
              [currentCard.id]: srsResult.masteryLevel,
            }));
          }
        })
        .catch((error) => {
          console.error("❌ [handleDifficulty] Failed to save review:", error);
          // Silent fail or maybe show a delayed toast if really critical
          // But preventing the next card from showing is worse.
        });
    } else {
      if (!session?.user?.email) {
        console.warn("⚠️ [handleDifficulty] Cannot save: No user email");
      } else {
        console.warn(
          "⚠️ [handleDifficulty] Cannot save: No wordId on card:",
          currentCard
        );
      }
    }
  };

  const handleSessionComplete = async (stats?: typeof masteryStats) => {
    // Use provided stats or current masteryStats
    const finalStats = stats || masteryStats;

    // Calculate session stats
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000); // in seconds
    const totalReviewed =
      finalStats.again +
      finalStats.hard +
      finalStats.good +
      finalStats.easy +
      finalStats.expert;
    const correctCount =
      finalStats.hard + finalStats.good + finalStats.easy + finalStats.expert; // hard/good/easy/expert all count as correct
    const incorrectCount = finalStats.again; // only "again" is incorrect (forgot the card)

    // Save daily progress (Time only - counts are updated per card now)
    if (!session?.user?.email) {
      console.error(
        "❌ [handleSessionComplete] Cannot save: No user session found"
      );
      toast.addToast("Error: Not logged in. Progress not saved.", "error");
    } else {
      try {
        await saveDailyProgress(session.user.email, {
          cardsReviewed: 0, // Already updated per card
          timeSpent: Math.ceil(timeSpent / 60), // Convert to minutes
          correctCount: 0, // Already updated per card
          incorrectCount: 0, // Already updated per card
        });
      } catch (error) {
        console.error(
          "❌ [handleSessionComplete] Failed to save daily progress:",
          error
        );
        toast.addToast(
          "Failed to save progress. Please check your connection.",
          "error"
        );
      }
    }

    // Show summary
    setShowSummary(true);
  };

  const handleReviewAgainCards = () => {
    // User request: "only flashcards that should appear are those that i forgot or that was hard"
    // Filter to include only cards marked as: again (forgot) or hard
    const cardsToReview = initialFlashcards.filter((card) => {
      const difficulty = reviewedCards[card.id];
      return difficulty === "again" || difficulty === "hard";
    });

    if (cardsToReview.length > 0) {
      // Shuffle the cards to randomize order (Fisher-Yates shuffle)
      const shuffledCards = [...cardsToReview];
      for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[j]] = [
          shuffledCards[j],
          shuffledCards[i],
        ];
      }

      // Update active cards to only cards that need review (shuffled)
      setActiveFlashcards(shuffledCards);
      // Reset for review session
      setCurrentIndex(0);
      setShowSummary(false);
      setIsFlipped(false);
      // Keep reviewed cards record but reset stats for new session
      setMasteryStats({ again: 0, hard: 0, good: 0, easy: 0, expert: 0 });
    } else {
      // If there are no hard/forgotten cards, just finish
      // This shouldn't happen if the button is conditionally shown, but good for safety
      toast.success("No cards to review! Great job!");
    }
  };

  const handleNext = () => {
    if (currentIndex < activeFlashcards.length - 1) {
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
    reviewedCards,

    // Handlers
    handleDifficulty,
    handleFlip,
    handleNext,
    handlePrevious,
    handleReviewAgainCards,
    handleSessionComplete,
  };
}
