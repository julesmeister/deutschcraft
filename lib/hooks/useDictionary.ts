/**
 * useDictionary Hook
 * React Query hook for German-English dictionary lookups
 */

import { useQuery } from '@tanstack/react-query';

export interface DictionaryEntry {
  id: number;
  german: string;
  english: string;
  created_at: number;
}

interface DictionarySearchParams {
  query: string;
  type?: 'german' | 'english' | 'both';
  exact?: boolean;
  limit?: number;
  enabled?: boolean;
}

/**
 * Search dictionary using the API
 */
export function useDictionarySearch({
  query,
  type = 'both',
  exact = false,
  limit = 50,
  enabled = true,
}: DictionarySearchParams) {
  return useQuery({
    queryKey: ['dictionary-search', query, type, exact, limit],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return { query: '', type, exact, count: 0, results: [] };
      }

      const params = new URLSearchParams({
        q: query,
        type,
        exact: exact.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/dictionary/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to search dictionary');
      }

      const data = await response.json();
      return data as {
        query: string;
        type: string;
        exact: boolean;
        count: number;
        results: DictionaryEntry[];
      };
    },
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
