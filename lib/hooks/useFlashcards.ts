/**
 * Flashcard Hooks
 * Hooks for flashcards, vocabulary, and progress tracking
 * Uses flashcardService for database abstraction
 */

import { useEffect, useState } from 'react';
import {
  Flashcard,
  FlashcardProgress,
  VocabularyWord,
} from '@/lib/models';
import { CEFRLevel } from '@/lib/models/cefr';
import { getCategoriesForLevel } from '@/lib/data/vocabulary-categories';
import {
  getFlashcardsByLevel,
  getVocabularyWord,
  getVocabularyByLevel,
  getFlashcardProgress,
} from '@/lib/services/flashcardService';

// Export useStudyStats from separate file (uses React Query pattern)
export { useStudyStats } from './useStudyStats';

import { useQuery } from '@tanstack/react-query';
import { cacheTimes } from '../queryClient';

/**
 * Get all flashcard reviews/progress for a user
 * Used for the flashcard review page
 */
export function useFlashcardReviews(userId: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['flashcard-reviews', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getFlashcardProgress(userId);
    },
    enabled: !!userId,
    staleTime: cacheTimes.progress,
    gcTime: cacheTimes.progress * 2.5,
  });

  return {
    data: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Get flashcards by level and optional category
 */
export function useFlashcards(level?: CEFRLevel, category?: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!level) {
      setFlashcards([]);
      setIsLoading(false);
      return;
    }

    const fetchFlashcards = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // Fetch flashcards using service layer
        const data = await getFlashcardsByLevel(level);

        // Filter by category if provided
        let filtered = data;
        if (category) {
          // We'll need to join with vocabulary to filter by tags
          const vocabPromises = data.map(async (flashcard) => {
            const vocabData = await getVocabularyWord(flashcard.wordId);
            if (vocabData) {
              return vocabData.tags?.includes(category) ? flashcard : null;
            }
            return null;
          });

          const results = await Promise.all(vocabPromises);
          filtered = results.filter(f => f !== null) as Flashcard[];
        }

        setFlashcards(filtered);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [level, category]);

  return { flashcards, isLoading, isError };
}

/**
 * Get student's flashcard progress
 */
export function useFlashcardProgress(userId?: string) {
  const [progress, setProgress] = useState<FlashcardProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setProgress([]);
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // Use flashcardService for database abstraction
        const data = await getFlashcardProgress(userId);
        setProgress(data);
      } catch (error) {
        console.error('Error fetching flashcard progress:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  return { progress, isLoading, isError };
}

/**
 * Get vocabulary categories with card counts
 */
export function useVocabularyCategories(level?: CEFRLevel) {
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    cardCount: number;
    icon: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // If no level specified, return empty
        if (!level) {
          setCategories([]);
          setIsLoading(false);
          return;
        }

        // Get predefined categories for this level
        const predefinedCategories = getCategoriesForLevel(level);

        // Get all vocabulary words using service layer
        const words = await getVocabularyByLevel(level);

        // Count words per category (tag)
        const categoryCountMap = new Map<string, number>();
        words.forEach(word => {
          word.tags?.forEach(tag => {
            categoryCountMap.set(tag, (categoryCountMap.get(tag) || 0) + 1);
          });
        });

        // Merge predefined categories with actual counts
        const categoriesArray = predefinedCategories.map(category => ({
          id: category.id,
          name: category.name,
          cardCount: categoryCountMap.get(category.id) || 0,
          icon: category.icon,
          description: category.description,
          priority: category.priority,
        }));

        // Sort by priority (or card count if you prefer)
        categoriesArray.sort((a, b) => a.priority - b.priority);

        setCategories(categoriesArray);
      } catch (error) {
        console.error('Error fetching vocabulary categories:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [level]);

  return { categories, isLoading, isError };
}
