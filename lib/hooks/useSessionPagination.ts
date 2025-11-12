/**
 * useSessionPagination Hook
 * Handles server-side pagination for flashcard sessions
 * Fetches 8 records at a time - database agnostic
 */

import { useState, useCallback, useEffect } from 'react';
import { fetchSessions, RecentSession } from '@/lib/services/sessionService';

interface PageCache {
  sessions: RecentSession[];
  cursor: any;
}

export function useSessionPagination(userId: string | undefined, itemsPerPage: number = 8) {
  const [sessions, setSessions] = useState<RecentSession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCache, setPageCache] = useState<Map<number, PageCache>>(new Map());
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (pageNumber: number) => {
    if (!userId) return;

    // Check cache first
    const cached = pageCache.get(pageNumber);
    if (cached) {
      setSessions(cached.sessions);
      setCurrentPage(pageNumber);
      return;
    }

    setIsLoading(true);

    try {
      let cursor = null;

      // Get cursor from previous page if not first page
      if (pageNumber > 1) {
        const prevPage = pageCache.get(pageNumber - 1);
        if (!prevPage) {
          console.error('Previous page not in cache');
          setIsLoading(false);
          return;
        }
        cursor = prevPage.cursor;
      }

      // Fetch from service (database agnostic)
      const result = await fetchSessions(userId, itemsPerPage, cursor);

      setSessions(result.sessions);
      setCurrentPage(pageNumber);
      setHasMore(result.hasMore);

      // Update cache
      const newCache = new Map(pageCache);
      newCache.set(pageNumber, {
        sessions: result.sessions,
        cursor: result.cursor,
      });
      setPageCache(newCache);
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, itemsPerPage, pageCache]);

  const goToPage = useCallback((pageNumber: number) => {
    fetchPage(pageNumber);
  }, [fetchPage]);

  const reset = useCallback(() => {
    setSessions([]);
    setCurrentPage(1);
    setPageCache(new Map());
    setHasMore(true);
  }, []);

  return {
    sessions,
    currentPage,
    isLoading,
    hasMore,
    goToPage,
    fetchPage,
    reset,
  };
}
