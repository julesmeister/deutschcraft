/**
 * Grammar Exercise Hooks
 * Hooks for grammar rules, sentences, and progress tracking
 * Uses grammarService for database abstraction
 */

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cacheTimes } from '../queryClient';
import {
  GrammarRule,
  GrammarSentence,
  GrammarReview,
  DifficultyRating,
} from '../models/grammar';
import { CEFRLevel } from '../models/cefr';
import {
  getAllGrammarRules,
  getGrammarRulesByLevel,
  getGrammarRule,
  getSentencesByRule,
  getSentencesByLevel,
  getGrammarReviews,
  getSingleGrammarReview,
  getReviewsByRule,
  getDueGrammarSentences,
  saveGrammarReview,
  saveGrammarReviewHistory,
} from '../services/grammarService';

// ============================================================================
// GRAMMAR RULES HOOKS
// ============================================================================

/**
 * Get all grammar rules
 */
export function useGrammarRules() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['grammar-rules'],
    queryFn: getAllGrammarRules,
    staleTime: cacheTimes.static,
    gcTime: cacheTimes.static * 2,
  });

  return {
    rules: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Get grammar rules by level
 */
export function useGrammarRulesByLevel(level?: CEFRLevel) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['grammar-rules', level],
    queryFn: () => (level ? getGrammarRulesByLevel(level) : Promise.resolve([])),
    enabled: !!level,
    staleTime: cacheTimes.static,
    gcTime: cacheTimes.static * 2,
  });

  return {
    rules: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Get single grammar rule
 */
export function useGrammarRule(ruleId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['grammar-rule', ruleId],
    queryFn: () => (ruleId ? getGrammarRule(ruleId) : Promise.resolve(null)),
    enabled: !!ruleId,
    staleTime: cacheTimes.static,
    gcTime: cacheTimes.static * 2,
  });

  return {
    rule: data || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// ============================================================================
// GRAMMAR SENTENCES HOOKS
// ============================================================================

/**
 * Get sentences for a grammar rule
 */
export function useSentencesByRule(ruleId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['grammar-sentences', 'rule', ruleId],
    queryFn: () => (ruleId ? getSentencesByRule(ruleId) : Promise.resolve([])),
    enabled: !!ruleId,
    staleTime: cacheTimes.static,
    gcTime: cacheTimes.static * 2,
  });

  return {
    sentences: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Get sentences by level
 */
export function useSentencesByLevel(level?: CEFRLevel) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['grammar-sentences', 'level', level],
    queryFn: () => (level ? getSentencesByLevel(level) : Promise.resolve([])),
    enabled: !!level,
    staleTime: cacheTimes.static,
    gcTime: cacheTimes.static * 2,
  });

  return {
    sentences: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// ============================================================================
// GRAMMAR REVIEWS (PROGRESS) HOOKS
// ============================================================================

/**
 * Get all grammar reviews for a user
 */
export function useGrammarReviews(userId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['grammar-reviews', userId],
    queryFn: () => (userId ? getGrammarReviews(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: cacheTimes.progress,
    gcTime: cacheTimes.progress * 2.5,
  });

  return {
    reviews: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Get single grammar review
 */
export function useSingleGrammarReview(userId?: string, sentenceId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['grammar-review', userId, sentenceId],
    queryFn: () =>
      userId && sentenceId
        ? getSingleGrammarReview(userId, sentenceId)
        : Promise.resolve(null),
    enabled: !!userId && !!sentenceId,
    staleTime: cacheTimes.progress,
    gcTime: cacheTimes.progress * 2.5,
  });

  return {
    review: data || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Get reviews for a specific rule
 */
export function useReviewsByRule(userId?: string, ruleId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['grammar-reviews', 'rule', userId, ruleId],
    queryFn: () =>
      userId && ruleId ? getReviewsByRule(userId, ruleId) : Promise.resolve([]),
    enabled: !!userId && !!ruleId,
    staleTime: cacheTimes.progress,
    gcTime: cacheTimes.progress * 2.5,
  });

  return {
    reviews: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Get due grammar sentences for review
 */
export function useDueGrammarSentences(userId?: string, limit = 20) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['grammar-reviews', 'due', userId, limit],
    queryFn: () =>
      userId ? getDueGrammarSentences(userId, limit) : Promise.resolve([]),
    enabled: !!userId,
    staleTime: cacheTimes.progress,
    gcTime: cacheTimes.progress * 2.5,
  });

  return {
    dueReviews: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

// ============================================================================
// MUTATIONS - Save Grammar Review
// ============================================================================

/**
 * Save or update grammar review (progress)
 */
export function useSaveGrammarReview() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      reviewId,
      reviewData,
    }: {
      reviewId: string;
      reviewData: Partial<GrammarReview>;
    }) => {
      await saveGrammarReview(reviewId, reviewData);
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['grammar-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['grammar-review'] });
    },
  });

  return {
    saveReview: mutation.mutate,
    saveReviewAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error as Error | null,
  };
}

/**
 * Save grammar review history
 */
export function useSaveGrammarReviewHistory() {
  const mutation = useMutation({
    mutationFn: saveGrammarReviewHistory,
  });

  return {
    saveHistory: mutation.mutate,
    saveHistoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error as Error | null,
  };
}

// ============================================================================
// COMBINED HOOKS - For easier usage
// ============================================================================

/**
 * Combined hook for grammar practice
 * Gets rules, sentences, and user progress
 */
export function useGrammarPractice(userId?: string, level?: CEFRLevel) {
  const { rules, isLoading: rulesLoading } = useGrammarRulesByLevel(level);
  const { reviews, isLoading: reviewsLoading } = useGrammarReviews(userId);
  const { dueReviews, isLoading: dueLoading } = useDueGrammarSentences(userId);

  return {
    rules,
    reviews,
    dueReviews,
    isLoading: rulesLoading || reviewsLoading || dueLoading,
  };
}

/**
 * Combined hook for a specific rule practice
 * Gets rule, its sentences, and user progress on those sentences
 */
export function useRulePractice(userId?: string, ruleId?: string) {
  const { rule, isLoading: ruleLoading } = useGrammarRule(ruleId);
  const { sentences, isLoading: sentencesLoading } = useSentencesByRule(ruleId);
  const { reviews, isLoading: reviewsLoading } = useReviewsByRule(userId, ruleId);

  return {
    rule,
    sentences,
    reviews,
    isLoading: ruleLoading || sentencesLoading || reviewsLoading,
  };
}
