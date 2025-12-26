/**
 * React Query hooks for Saved Vocabulary management
 *
 * Provides hooks for:
 * - Query hooks: Fetching saved vocabulary data
 * - Mutation hooks: Creating, updating, and deleting saved words
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSavedVocabulary,
  getSavedVocabularyEntry,
  isWordSaved,
  detectSavedWordsInText,
  saveVocabularyForLater,
  incrementVocabularyUsage,
  bulkIncrementVocabularyUsage,
  removeSavedVocabulary,
} from '../services/flashcardService';
import { SavedVocabulary, SavedVocabularyInput, IncrementResult } from '../models/savedVocabulary';
import { cacheTimes } from '../queryClient';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all saved vocabulary for a user
 * @param userId - User's email
 * @param includeCompleted - Whether to include completed words
 */
export function useSavedVocabulary(userId: string | undefined, includeCompleted: boolean = false) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['saved-vocabulary', userId, includeCompleted],
    queryFn: async () => {
      if (!userId) return [];
      return await getSavedVocabulary(userId, includeCompleted);
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
 * Get a single saved vocabulary entry
 * @param userId - User's email
 * @param wordId - Word ID
 */
export function useSavedVocabularyEntry(userId: string | undefined, wordId: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['saved-vocabulary-entry', userId, wordId],
    queryFn: async () => {
      if (!userId || !wordId) return null;
      return await getSavedVocabularyEntry(userId, wordId);
    },
    enabled: !!userId && !!wordId,
    staleTime: cacheTimes.progress,
    gcTime: cacheTimes.progress * 2.5,
  });

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Check if a word is saved
 * @param userId - User's email
 * @param wordId - Word ID
 */
export function useIsWordSaved(userId: string | undefined, wordId: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['saved-vocabulary-check', userId, wordId],
    queryFn: async () => {
      if (!userId || !wordId) return false;
      return await isWordSaved(userId, wordId);
    },
    enabled: !!userId && !!wordId,
    staleTime: cacheTimes.progress,
    gcTime: cacheTimes.progress * 2.5,
  });

  return {
    isSaved: data || false,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Save vocabulary for later practice
 */
export function useSaveVocabularyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      wordData,
    }: {
      userId: string;
      wordData: SavedVocabularyInput;
    }) => {
      await saveVocabularyForLater(userId, wordData);
    },
    onSuccess: (_, variables) => {
      // Invalidate saved vocabulary queries for this user
      queryClient.invalidateQueries({
        queryKey: ['saved-vocabulary', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['saved-vocabulary-check', variables.userId, variables.wordData.wordId],
      });
      queryClient.invalidateQueries({
        queryKey: ['saved-vocabulary-entry', variables.userId, variables.wordData.wordId],
      });
    },
  });
}

/**
 * Remove saved vocabulary
 */
export function useRemoveSavedVocabularyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      wordId,
    }: {
      userId: string;
      wordId: string;
    }) => {
      await removeSavedVocabulary(userId, wordId);
    },
    onSuccess: (_, variables) => {
      // Invalidate saved vocabulary queries for this user
      queryClient.invalidateQueries({
        queryKey: ['saved-vocabulary', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['saved-vocabulary-check', variables.userId, variables.wordId],
      });
      queryClient.invalidateQueries({
        queryKey: ['saved-vocabulary-entry', variables.userId, variables.wordId],
      });
    },
  });
}

/**
 * Increment vocabulary usage counter
 */
export function useIncrementVocabularyUsageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      wordId,
    }: {
      userId: string;
      wordId: string;
    }): Promise<IncrementResult> => {
      return await incrementVocabularyUsage(userId, wordId);
    },
    onSuccess: (_, variables) => {
      // Invalidate saved vocabulary queries for this user
      queryClient.invalidateQueries({
        queryKey: ['saved-vocabulary', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['saved-vocabulary-entry', variables.userId, variables.wordId],
      });
    },
  });
}

/**
 * Bulk increment vocabulary usage for multiple words
 */
export function useBulkIncrementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      wordIds,
    }: {
      userId: string;
      wordIds: string[];
    }): Promise<IncrementResult[]> => {
      return await bulkIncrementVocabularyUsage(userId, wordIds);
    },
    onSuccess: (_, variables) => {
      // Invalidate all saved vocabulary queries for this user
      queryClient.invalidateQueries({
        queryKey: ['saved-vocabulary', variables.userId],
      });
      // Invalidate individual entries
      variables.wordIds.forEach(wordId => {
        queryClient.invalidateQueries({
          queryKey: ['saved-vocabulary-entry', variables.userId, wordId],
        });
      });
    },
  });
}
