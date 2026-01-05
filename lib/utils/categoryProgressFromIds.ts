
import { FlashcardReview } from "@/lib/models/progress";
import { CategoryIndex } from "@/lib/hooks/useVocabulary";

export type CompletionStatus = "completed" | "in-progress" | "not-started";

export interface CategoryProgressData {
  attemptedCategories: Set<string>;
  categoryAttemptCounts: Map<string, number>;
  categoryTotalCounts: Map<string, number>;
  categoryCompletionStatus: Map<string, CompletionStatus>;
}

/**
 * Calculate category progress based on flashcard reviews and category index (with IDs)
 * Optimized to avoid loading full flashcard content
 */
export function calculateCategoryProgressFromIds(
  categoryIndex: CategoryIndex,
  flashcardReviews: FlashcardReview[]
): CategoryProgressData {
  const attemptedCategories = new Set<string>();
  const categoryAttemptCounts = new Map<string, number>();
  const categoryTotalCounts = new Map<string, number>();
  const categoryCompletionStatus = new Map<string, CompletionStatus>();

  // Create a set of reviewed IDs for fast lookup
  const reviewedIds = new Set<string>();
  flashcardReviews.forEach(r => {
    // Use ID directly (Semantic IDs)
    if (r.flashcardId) reviewedIds.add(r.flashcardId);
    if (r.wordId) reviewedIds.add(r.wordId);
  });

  categoryIndex.categories.forEach(cat => {
    // Normalize category ID (slug)
    const categoryId = cat.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
      
    const total = cat.count || (cat.ids?.length ?? 0);
    categoryTotalCounts.set(categoryId, total);

    let attempts = 0;
    if (cat.ids) {
        cat.ids.forEach(id => {
            // Check if the ID exists in reviews
            if (reviewedIds.has(id)) {
                attempts++;
            }
        });
    }
    
    categoryAttemptCounts.set(categoryId, attempts);
    
    if (attempts > 0) {
        attemptedCategories.add(categoryId);
    }
    
    if (attempts === 0) {
        categoryCompletionStatus.set(categoryId, "not-started");
    } else if (attempts >= total && total > 0) {
        categoryCompletionStatus.set(categoryId, "completed");
    } else {
        categoryCompletionStatus.set(categoryId, "in-progress");
    }
  });

  return {
    attemptedCategories,
    categoryAttemptCounts,
    categoryTotalCounts,
    categoryCompletionStatus
  };
}
