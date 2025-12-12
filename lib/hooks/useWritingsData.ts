/**
 * useWritingsData Hook
 * Manages writings page data fetching, filtering, and pagination
 *
 * This hook orchestrates the writings page data flow:
 * 1. Fetches all submissions for current user
 * 2. Filters to only show submissions with corrections
 * 3. Sorts by date
 * 4. Handles pagination
 * 5. Fetches teacher reviews for visible submissions
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WritingSubmission, TeacherReview } from '@/lib/models/writing';
import { useStudentSubmissions } from '@/lib/hooks/useWritingExercises';
import {
  processSubmissions,
  paginateSubmissions,
  hasMorePages,
} from '@/lib/services/writingsService';

const ITEMS_PER_PAGE = 5; // Show 5 at a time for smooth infinite scroll

export function useWritingsData(userEmail: string | null) {
  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch all submissions for current user
  const { data: allSubmissions = [], isLoading } = useStudentSubmissions(userEmail);

  // Process submissions: filter and sort
  const processedSubmissions = useMemo(
    () => processSubmissions(allSubmissions),
    [allSubmissions]
  );

  // Paginate in memory
  const paginatedSubmissions = useMemo(
    () => paginateSubmissions(processedSubmissions, currentPage, ITEMS_PER_PAGE),
    [processedSubmissions, currentPage]
  );

  // Check if more pages available
  const hasMore = hasMorePages(
    processedSubmissions.length,
    currentPage,
    ITEMS_PER_PAGE
  );

  // Extract submission IDs for teacher review fetching
  const submissionIds = useMemo(
    () => paginatedSubmissions.map(s => s.submissionId),
    [paginatedSubmissions]
  );

  // Fetch teacher reviews for paginated submissions
  const { data: teacherReviews } = useQuery({
    queryKey: ['teacher-reviews-batch', submissionIds],
    queryFn: async () => {
      if (submissionIds.length === 0) return {};

      const reviewsRef = collection(db, 'writing-teacher-reviews');
      const reviewsMap: Record<string, TeacherReview> = {};

      // Fetch reviews for each submission
      for (const submissionId of submissionIds) {
        const q = query(reviewsRef, where('submissionId', '==', submissionId));
        const snapshot = await getDocs(q);

        if (snapshot.docs.length > 0) {
          reviewsMap[submissionId] = {
            ...snapshot.docs[0].data(),
            reviewId: snapshot.docs[0].id,
          } as TeacherReview;
        }
      }

      return reviewsMap;
    },
    enabled: submissionIds.length > 0,
  });

  // Load more function
  const loadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Trigger 200px before reaching the element
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, currentPage]);

  return {
    // Data
    submissions: paginatedSubmissions,
    allSubmissionsCount: processedSubmissions.length,
    teacherReviews,

    // Loading state
    isLoading,

    // Pagination
    hasMore,
    loadMoreRef,

    // Stats
    totalWithCorrections: processedSubmissions.length,
  };
}
