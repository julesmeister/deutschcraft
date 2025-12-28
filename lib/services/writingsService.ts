/**
 * Writings Service
 * Pure functions for writing submissions filtering, sorting, and pagination
 * Also provides database-agnostic data fetching for teacher reviews
 *
 * This service has no React dependencies and can be tested independently.
 */

import { WritingSubmission, TeacherReview } from '@/lib/models/writing';
import { getTeacherReviewsBatch as fetchTeacherReviewsBatch } from '@/lib/services/writingService';

/**
 * Filter submissions to only include those with corrections
 * (either AI or teacher feedback)
 *
 * @param submissions - All submissions
 * @returns Filtered submissions with corrections only
 */
export function filterSubmissionsWithCorrections(
  submissions: WritingSubmission[]
): WritingSubmission[] {
  return submissions.filter(submission => {
    // Exclude drafts, show everything else (submitted, reviewed)
    return submission.status !== 'draft';
  });
}

/**
 * Sort submissions by submission date (most recent first)
 *
 * @param submissions - Submissions to sort
 * @returns Sorted submissions
 */
export function sortSubmissionsByDate(
  submissions: WritingSubmission[]
): WritingSubmission[] {
  return [...submissions].sort((a, b) => {
    const timeA = a.submittedAt || 0;
    const timeB = b.submittedAt || 0;
    return timeB - timeA; // Descending order
  });
}

/**
 * Paginate submissions in memory
 *
 * @param submissions - All submissions
 * @param page - Current page number (1-indexed)
 * @param itemsPerPage - Number of items per page
 * @returns Paginated submissions for current page
 */
export function paginateSubmissions(
  submissions: WritingSubmission[],
  page: number,
  itemsPerPage: number
): WritingSubmission[] {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return submissions.slice(startIndex, endIndex);
}

/**
 * Check if there are more pages available
 *
 * @param totalCount - Total number of submissions
 * @param currentPage - Current page number
 * @param itemsPerPage - Number of items per page
 * @returns Whether more pages exist
 */
export function hasMorePages(
  totalCount: number,
  currentPage: number,
  itemsPerPage: number
): boolean {
  return currentPage * itemsPerPage < totalCount;
}

/**
 * Process submissions: filter, sort, and prepare for display
 *
 * This is a convenience function that combines the common operations.
 *
 * @param submissions - Raw submissions from database
 * @returns Processed submissions ready for display
 */
export function processSubmissions(
  submissions: WritingSubmission[]
): WritingSubmission[] {
  const filtered = filterSubmissionsWithCorrections(submissions);
  return sortSubmissionsByDate(filtered);
}

/**
 * Fetch teacher reviews for multiple submissions in batch
 *
 * This is a database-agnostic function that delegates to the configured
 * database service (Firestore or Turso).
 *
 * @param submissionIds - Array of submission IDs
 * @returns Map of submission ID to teacher review
 */
export async function getTeacherReviewsBatch(
  submissionIds: string[]
): Promise<Record<string, TeacherReview>> {
  // Delegate to the database service which now handles batching efficiently
  return await fetchTeacherReviewsBatch(submissionIds);
}
