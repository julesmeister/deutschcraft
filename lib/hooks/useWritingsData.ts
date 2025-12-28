/**
 * useWritingsData Hook
 * DATABASE-AGNOSTIC hook for managing writings page data
 *
 * This hook orchestrates the writings page data flow:
 * 1. Fetches all submissions for current user (via useStudentSubmissions)
 * 2. Filters to only show submissions with corrections
 * 3. Sorts by date
 * 4. Handles pagination
 * 5. Fetches teacher reviews for visible submissions (via database service)
 *
 * Works with Firestore, Turso, or any other data source configured in
 * lib/services/writingService.ts
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeacherReview } from "@/lib/models/writing";
import { useStudentSubmissions } from "@/lib/hooks/useWritingExercises";
import { getTeacherReviewsBatch } from "@/lib/services/writingsService";
import {
  processSubmissions,
  paginateSubmissions,
} from "@/lib/services/writingsService";

const ITEMS_PER_PAGE = 5; // Show 5 items per page

export function useWritingsData(userEmail: string | null) {
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all submissions for current user (database-agnostic via hook)
  const { data: allSubmissions = [], isLoading } =
    useStudentSubmissions(userEmail);

  // Process submissions: filter and sort (pure functions, no database access)
  const processedSubmissions = useMemo(
    () => processSubmissions(allSubmissions),
    [allSubmissions]
  );

  // Paginate in memory (pure function, no database access)
  const totalPages = Math.ceil(processedSubmissions.length / ITEMS_PER_PAGE);
  const paginatedSubmissions = useMemo(
    () =>
      paginateSubmissions(processedSubmissions, currentPage, ITEMS_PER_PAGE),
    [processedSubmissions, currentPage]
  );

  // Extract submission IDs for teacher review fetching
  const submissionIds = useMemo(
    () => paginatedSubmissions.map((s) => s.submissionId),
    [paginatedSubmissions]
  );

  // Fetch teacher reviews for paginated submissions (database-agnostic via service)
  const { data: teacherReviews } = useQuery({
    queryKey: ["teacher-reviews-batch", submissionIds],
    queryFn: async () => {
      if (submissionIds.length === 0) return {};
      return await getTeacherReviewsBatch(submissionIds);
    },
    enabled: submissionIds.length > 0,
  });

  return {
    // Data
    submissions: paginatedSubmissions,
    allSubmissionsCount: processedSubmissions.length,
    teacherReviews,

    // Loading state
    isLoading,

    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,

    // Stats
    totalWithCorrections: processedSubmissions.length,
  };
}
