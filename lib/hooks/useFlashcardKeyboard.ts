/**
 * Flashcard Keyboard Shortcuts Hook
 * Handles keyboard navigation and shortcuts for flashcard practice
 */

import { useEffect } from "react";

type DifficultyLevel = "again" | "hard" | "good" | "easy" | "expert";

interface UseFlashcardKeyboardProps {
  isFlipped: boolean;
  currentIndex: number;
  onFlip: () => void;
  onDifficulty: (difficulty: DifficultyLevel) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function useFlashcardKeyboard({
  isFlipped,
  currentIndex,
  onFlip,
  onDifficulty,
  onNext,
  onPrevious,
}: UseFlashcardKeyboardProps) {
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
          onFlip();
          break;
        case "1":
          e.preventDefault();
          if (isFlipped) onDifficulty("again");
          break;
        case "2":
          e.preventDefault();
          if (isFlipped) onDifficulty("hard");
          break;
        case "3":
          e.preventDefault();
          if (isFlipped) onDifficulty("good");
          break;
        case "4":
          e.preventDefault();
          if (isFlipped) onDifficulty("easy");
          break;
        case "5":
          e.preventDefault();
          if (isFlipped) onDifficulty("expert");
          break;
        case "ArrowLeft":
          e.preventDefault();
          onPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, currentIndex, onFlip, onDifficulty, onNext, onPrevious]);
}
