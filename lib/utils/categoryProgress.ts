/**
 * Category Progress Tracking Utility
 * Calculates completion status for vocabulary categories
 */

import { FlashcardReview } from "@/lib/models/progress";

export type CompletionStatus = "completed" | "in-progress" | "not-started";

export interface CategoryProgressData {
  attemptedCategories: Set<string>;
  categoryAttemptCounts: Map<string, number>;
  categoryTotalCounts: Map<string, number>;
  categoryCompletionStatus: Map<string, CompletionStatus>;
}

/**
 * Calculate category progress based on flashcard reviews
 * Returns completion status, attempt counts, and total counts for each category
 */
export function calculateCategoryProgress(
  levelFlashcards: any[],
  flashcardReviews: FlashcardReview[]
): CategoryProgressData {
  const attemptedCategories = new Set<string>();
  const categoryAttemptCounts = new Map<string, number>();
  const categoryTotalCounts = new Map<string, number>();

  // Count total cards per category
  levelFlashcards.forEach((card: any) => {
    const categoryId = card.category
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    categoryTotalCounts.set(
      categoryId,
      (categoryTotalCounts.get(categoryId) || 0) + 1
    );
  });

  // Count attempted cards per category
  // Track unique cards attempted per category to avoid double counting
  const categoryAttemptedCards = new Map<string, Set<string>>();

  flashcardReviews.forEach((review) => {
    // Remove -dupN suffix from review IDs if present
    const cleanWordId = review.wordId?.replace(/-dup\d+$/, "");
    const cleanFlashcardId = review.flashcardId?.replace(/-dup\d+$/, "");

    // Try multiple ID matching strategies
    let flashcard = levelFlashcards.find(
      (card: any) =>
        // Exact match
        card.id === review.wordId ||
        card.id === review.flashcardId ||
        // String conversion
        review.wordId?.toString() === card.id?.toString() ||
        review.flashcardId?.toString() === card.id?.toString() ||
        // Match with cleaned IDs (without -dupN suffix)
        card.id === cleanWordId ||
        card.id === cleanFlashcardId
    );

    // Fuzzy match for legacy IDs (e.g., "a1-geld-044822" -> matches "das Geld")
    if (!flashcard && review.wordId) {
      flashcard = levelFlashcards.find((card: any) => {
        const german = card.german.toLowerCase();
        // Remove articles for matching (der/die/das)
        const simpleGerman = german.replace(/^(der|die|das)\s+/i, "").trim();

        // Check if ID contains the word and matches level
        // ID format often: level-word-hash
        if (
          simpleGerman.length > 2 &&
          review.wordId!.includes(simpleGerman) &&
          review.wordId!.startsWith(card.level.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
    }

    // Category slug match for legacy IDs (e.g., "a2-action-verbs-hash")
    // If we can't match the word, at least match the category so progress shows up
    let matchedCategorySlug = "";
    if (!flashcard && review.wordId) {
      // Find a card whose category slug appears in the review ID
      const matchingCard = levelFlashcards.find((card: any) => {
        if (!card.category) return false;
        const categoryId = card.category
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        // Ensure the category slug is substantial to avoid false positives
        if (categoryId.length > 3 && review.wordId!.includes(categoryId)) {
          matchedCategorySlug = categoryId;
          return true;
        }
        return false;
      });

      // If we found a category match, we use it.
      // We don't assign 'flashcard' because we don't know WHICH card it is,
      // but we can still count it towards the category.
      if (matchingCard) {
        // Use the legacy ID itself to count unique attempts
        attemptedCategories.add(matchedCategorySlug);
        if (!categoryAttemptedCards.has(matchedCategorySlug)) {
          categoryAttemptedCards.set(matchedCategorySlug, new Set());
        }
        categoryAttemptedCards.get(matchedCategorySlug)?.add(review.wordId);
      }
    }

    if (flashcard) {
      const categoryId = flashcard.category
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      attemptedCategories.add(categoryId);

      // Add card ID to set for this category
      if (!categoryAttemptedCards.has(categoryId)) {
        categoryAttemptedCards.set(categoryId, new Set());
      }
      categoryAttemptedCards.get(categoryId)?.add(flashcard.id);
    }
  });

  // Convert sets to counts
  categoryAttemptedCards.forEach((cards, categoryId) => {
    categoryAttemptCounts.set(categoryId, cards.size);
  });

  // Determine completion status for each category
  const categoryCompletionStatus = new Map<string, CompletionStatus>();
  categoryTotalCounts.forEach((total, categoryId) => {
    const attempted = categoryAttemptCounts.get(categoryId) || 0;

    let status: CompletionStatus;
    if (attempted >= total && total > 0) {
      status = "completed";
    } else if (attempted > 0) {
      status = "in-progress";
    } else {
      status = "not-started";
    }

    categoryCompletionStatus.set(categoryId, status);
  });

  return {
    attemptedCategories,
    categoryAttemptCounts,
    categoryTotalCounts,
    categoryCompletionStatus,
  };
}
