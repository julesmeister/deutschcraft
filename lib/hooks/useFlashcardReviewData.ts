import { useMemo } from "react";
import { useFlashcardReviews } from "@/lib/hooks/useFlashcards";
import { useFlashcardSettings } from "@/lib/hooks/useFlashcardSettings";
import { useVocabularyLevel } from "@/lib/hooks/useVocabulary";
import { CEFRLevel } from "@/lib/models/cefr";

export type FilterType =
  | "due-today"
  | "struggling"
  | "new"
  | "learning"
  | "review"
  | "lapsed"
  | "all-reviewed";

interface FlashcardData {
  id?: string;
  german: string;
  english: string;
  category: string;
  examples?: string[];
}

export function useFlashcardReviewData(
  userEmail: string | undefined | null,
  selectedLevel: CEFRLevel,
  filterType: FilterType
) {
  // Fetch all flashcard reviews for current user
  const {
    data: reviews = [],
    isLoading,
    refetch,
  } = useFlashcardReviews(userEmail ?? undefined);

  // Fetch vocabulary data
  const { data: levelData, isLoading: isVocabularyLoading } =
    useVocabularyLevel(selectedLevel);

  // Get flashcard settings (for limiting cards per session)
  const { settings } = useFlashcardSettings();

  // Apply flashcard settings to limit cards per session
  const applySessionLimits = (flashcards: any[]) => {
    let processedCards = [...flashcards];

    // Apply randomize order if enabled
    if (settings.randomizeOrder) {
      processedCards = processedCards.sort(() => Math.random() - 0.5);
    }

    // Apply cards per session limit (-1 means unlimited)
    if (settings.cardsPerSession !== -1 && settings.cardsPerSession > 0) {
      processedCards = processedCards.slice(0, settings.cardsPerSession);
    }

    return processedCards;
  };

  // Get all flashcards from the selected level
  const allFlashcards = useMemo(() => {
    if (!levelData || !levelData.flashcards) return [];

    return levelData.flashcards.map((card: FlashcardData) => ({
      id: card.id || card.german,
      german: card.german,
      english: card.english,
      category: card.category,
      level: selectedLevel,
      examples: card.examples || [],
      wordId: card.id || card.german,
    }));
  }, [levelData, selectedLevel]);

  // Filter flashcards based on review data and add mastery levels
  const filteredFlashcards = useMemo(() => {
    const now = Date.now();

    const cardsWithReview = allFlashcards
      .map((card) => {
        const review = reviews.find(
          (r) => r.flashcardId === card.id || r.wordId === card.wordId
        );
        // Add masteryLevel and review data
        return {
          ...card,
          masteryLevel: review?.masteryLevel ?? 0,
          nextReviewDate: review?.nextReviewDate ?? now,
          review,
        };
      })
      .filter((card) => {
        const review = card.review;

        if (!review) return false; // Only show reviewed cards

        switch (filterType) {
          case "due-today":
            // Cards due for review today or overdue (spaced repetition)
            return review.nextReviewDate <= now;

          case "struggling":
            // Enhanced struggling detection
            return (
              review.masteryLevel < 40 ||
              review.consecutiveIncorrect >= 2 ||
              review.lapseCount >= 3 ||
              review.state === "lapsed" ||
              review.state === "relearning"
            );

          case "new":
            return review.state === "new";

          case "learning":
            return review.state === "learning";

          case "review":
            return review.state === "review";

          case "lapsed":
            return review.state === "lapsed" || review.state === "relearning";

          case "all-reviewed":
            // All cards that have been reviewed at least once
            return true;

          default:
            return false;
        }
      })
      .sort((a, b) => {
        // Priority 1: Struggling cards first (lapsed/relearning state)
        const aIsStruggling =
          a.review?.state === "lapsed" || a.review?.state === "relearning";
        const bIsStruggling =
          b.review?.state === "lapsed" || b.review?.state === "relearning";
        if (aIsStruggling && !bIsStruggling) return -1;
        if (!aIsStruggling && bIsStruggling) return 1;

        // Priority 2: Lowest mastery first (most in need of practice)
        const masteryDiff = a.masteryLevel - b.masteryLevel;
        if (masteryDiff !== 0) return masteryDiff;

        // Priority 3: Most overdue first (earliest nextReviewDate)
        const dateDiff = a.nextReviewDate - b.nextReviewDate;
        if (dateDiff !== 0) return dateDiff;

        // Priority 4: State priority (new > learning > review)
        const statePriority: Record<string, number> = {
          new: 1,
          learning: 2,
          relearning: 3,
          review: 4,
          lapsed: 5,
        };
        const aStatePriority =
          statePriority[a.review?.state || "review"] || 999;
        const bStatePriority =
          statePriority[b.review?.state || "review"] || 999;
        return aStatePriority - bStatePriority;
      });

    // Log filtering results for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔍 [Filter] Type: ${filterType} | Total cards: ${allFlashcards.length} | Reviews: ${reviews.length} | Filtered: ${cardsWithReview.length}`
      );
      if (filterType === "due-today" && cardsWithReview.length > 0) {
        const now = Date.now();
        cardsWithReview.slice(0, 3).forEach((card) => {
          const daysOverdue = Math.round(
            (now - (card.nextReviewDate || now)) / (24 * 60 * 60 * 1000)
          );
          console.log(
            `  📌 ${card.german}: ${card.masteryLevel}% | ${
              daysOverdue > 0
                ? `Overdue ${daysOverdue}d`
                : `Due ${Math.abs(daysOverdue)}d`
            }`
          );
        });
      }
    }

    return cardsWithReview;
  }, [allFlashcards, reviews, filterType]);

  // Calculate due counts by level to show notifications
  const dueCountsByLevel = useMemo(() => {
    const now = Date.now();
    const counts: Record<string, number> = {};

    reviews.forEach((r) => {
      // Check if due today
      if (r.nextReviewDate <= now) {
        // Use level from review if available, otherwise unknown
        // Normalize level to uppercase to match CEFRLevel enum keys
        const level = r.level ? r.level.toUpperCase() : "UNKNOWN";
        counts[level] = (counts[level] || 0) + 1;
      }
    });

    return counts;
  }, [reviews]);

  // Apply session limits to filtered flashcards for practice
  const cardsForPractice = useMemo(() => {
    return applySessionLimits(filteredFlashcards);
  }, [filteredFlashcards, settings.cardsPerSession, settings.randomizeOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = Date.now();
    const reviewedCards = reviews.filter((r) => {
      return allFlashcards.some(
        (card) => card.id === r.flashcardId || card.wordId === r.wordId
      );
    });

    const dueToday = reviewedCards.filter(
      (r) => r.nextReviewDate <= now
    ).length;
    const struggling = reviewedCards.filter(
      (r) =>
        r.masteryLevel < 40 ||
        r.consecutiveIncorrect >= 2 ||
        r.lapseCount >= 3 ||
        r.state === "lapsed" ||
        r.state === "relearning"
    ).length;
    const newCards = reviewedCards.filter((r) => r.state === "new").length;
    const learning = reviewedCards.filter((r) => r.state === "learning").length;
    const review = reviewedCards.filter((r) => r.state === "review").length;
    const lapsed = reviewedCards.filter(
      (r) => r.state === "lapsed" || r.state === "relearning"
    ).length;
    const total = reviewedCards.length;

    return { dueToday, struggling, newCards, learning, review, lapsed, total };
  }, [reviews, allFlashcards]);

  return {
    reviews,
    isLoading: isLoading || isVocabularyLoading,
    refetch,
    filteredFlashcards,
    dueCountsByLevel,
    cardsForPractice,
    stats,
  };
}
