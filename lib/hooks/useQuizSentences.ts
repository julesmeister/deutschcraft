/**
 * Hook for fetching multiple quiz sentences
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuizSentences, QuizSentence } from '@/lib/services/writing/quizService';

export function useQuizSentences(userId?: string, count: number = 10) {
  const [refreshKey, setRefreshKey] = useState(0);

  const query = useQuery({
    queryKey: ['quiz-sentences', userId, count, refreshKey],
    queryFn: async () => {
      if (!userId) {
        console.log('[useQuizSentences] No userId provided');
        return [];
      }

      return await getQuizSentences(userId, count);
    },
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
  });

  const refresh = useCallback(() => {
    console.log('[useQuizSentences] Refreshing quiz sentences');
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    sentences: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refresh,
  };
}
