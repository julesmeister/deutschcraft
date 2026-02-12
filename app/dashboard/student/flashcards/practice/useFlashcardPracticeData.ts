import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { fetchVocabularyCategory } from "@/lib/hooks/useVocabulary";
import { applyFlashcardSettings } from "@/lib/utils/flashcardSelection";
import { useFlashcardData } from "../hooks/useFlashcardData";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { usePersistedLevel } from "@/lib/hooks/usePersistedLevel";

// Helper to enrich flashcards with progress data
const enrichFlashcardsWithProgress = (flashcards: any[], reviewsMap: any) => {
  return flashcards.map((card: any) => {
    const progress = reviewsMap.get(card.id);
    return {
      ...card,
      wordId: card.id,
      masteryLevel: progress?.masteryLevel ?? 0,
      nextReviewDate: progress?.nextReviewDate,
    };
  });
};

interface UseFlashcardPracticeDataOptions {
  /** Maximum number of categories to fetch when loading "all" (default: unlimited) */
  maxCategories?: number;
}

export function useFlashcardPracticeData(options: UseFlashcardPracticeDataOptions = {}) {
  const { maxCategories } = options;
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const mode = searchParams.get("mode"); // 'practice' | 'review'

  const { session } = useFirebaseAuth();
  const [selectedLevel] = usePersistedLevel("flashcards-last-level");

  // Reuse the data hook to get index and reviews
  // We pass 0 for refresh key as we'll handle refreshes via page reload or navigation
  const {
    settings,
    flashcardReviews,
    reviewsMap,
    categoryIndex,
    isVocabularyLoading,
    categoriesLoading,
  } = useFlashcardData(session?.user?.email, selectedLevel, 0, {});

  const [practiceFlashcards, setPracticeFlashcards] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [nextDueInfo, setNextDueInfo] = useState<any>();
  const [upcomingCards, setUpcomingCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create stable keys for arrays to use in dependency array
  const reviewsKey = useMemo(() => flashcardReviews?.length ?? 0, [flashcardReviews]);
  const settingsKey = useMemo(() => JSON.stringify(settings), [settings]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      // Wait for dependencies to load
      if (isVocabularyLoading || categoriesLoading || !categoryIndex) return;

      setIsLoading(true);
      setError(null);

      try {
        let flashcardsToUse: any[] = [];
        let name = "";

        if (categoryId === "all" || !categoryId) {
          name = "All Categories";
          setCategoryName(name);

          // Logic for "Start Practice" (All categories)
          // 1. Identify categories with due cards
          const categoriesToFetch = new Set<string>();
          const now = Date.now();

          categoryIndex.categories.forEach((cat: any) => {
            const hasDue = cat.ids?.some((id: string) => {
              const progress = reviewsMap.get(id);
              return progress && (progress.nextReviewDate || 0) <= now;
            });
            if (hasDue) categoriesToFetch.add(cat.file);
          });

          // If no due cards, find unattempted
          if (categoriesToFetch.size === 0) {
            const unattemptedCat = categoryIndex.categories.find((cat: any) => {
              return cat.ids?.some((id: string) => !reviewsMap.has(id));
            });

            if (unattemptedCat) {
              categoriesToFetch.add(unattemptedCat.file);
            } else if (categoryIndex.categories.length > 0) {
              categoriesToFetch.add(categoryIndex.categories[0].file);
            }
          }

          let filesToFetch = Array.from(categoriesToFetch);

          // Limit categories if maxCategories is set (useful for games)
          if (maxCategories && filesToFetch.length > maxCategories) {
            filesToFetch = filesToFetch.slice(0, maxCategories);
          }

          const promises = filesToFetch.map((file) =>
            fetchVocabularyCategory(selectedLevel, file)
          );

          const results = await Promise.all(promises);
          flashcardsToUse = results.flatMap((r) => r.flashcards);
        } else {
          // Specific category
          // We expect categoryId to be the ID from the index
          const catInfo = categoryIndex.categories.find(
            (c: any) => c.id === categoryId
          );

          if (catInfo) {
            name = catInfo.name;
            const data = await fetchVocabularyCategory(
              selectedLevel,
              catInfo.file
            );
            flashcardsToUse = data.flashcards;
          } else {
            // Fallback: maybe categoryId IS the file name? (legacy support)
            const catInfoByFile = categoryIndex.categories.find(
              (c: any) => c.file === categoryId
            );
            if (catInfoByFile) {
              name = catInfoByFile.name;
              const data = await fetchVocabularyCategory(
                selectedLevel,
                catInfoByFile.file
              );
              flashcardsToUse = data.flashcards;
            } else {
              console.warn("Category not found:", categoryId);
              // Try to proceed? Or error?
              setError("Category not found");
              if (isMounted) setIsLoading(false);
              return;
            }
          }
        }

        if (!isMounted) return;

        setCategoryName(name);

        // Enrich
        flashcardsToUse = enrichFlashcardsWithProgress(
          flashcardsToUse,
          reviewsMap
        );

        // Apply Mode
        if (mode === "review") {
          setPracticeFlashcards(flashcardsToUse);
          setNextDueInfo(undefined);
          setUpcomingCards([]);
        } else {
          // Practice mode
          const result = applyFlashcardSettings(
            flashcardsToUse,
            flashcardReviews,
            settings
          );
          setPracticeFlashcards(result.cards);
          setNextDueInfo(result.nextDueInfo);
          setUpcomingCards(result.upcomingCards);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load flashcards");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [
    categoryId,
    mode,
    categoryIndex,
    isVocabularyLoading,
    categoriesLoading,
    selectedLevel,
    reviewsMap,
    reviewsKey,
    settingsKey,
    maxCategories,
  ]);

  return {
    practiceFlashcards,
    categoryName,
    isLoading: isLoading || isVocabularyLoading || categoriesLoading,
    error,
    selectedLevel,
    nextDueInfo,
    upcomingCards,
    mode: mode || "practice",
  };
}
