/**
 * Batch-Filtered Comments Hook
 * Filters comments to only show those from batch-mates (privacy layer)
 */

import { useMemo } from 'react';
import { useComments } from '@/lib/hooks/useSocial';
import { useBatchStudents } from '@/lib/hooks/useUserQueries';
import { Comment } from '@/lib/models/social';

/**
 * Hook: Load comments for an exercise, filtered by batch
 *
 * Privacy Guarantee:
 * - Students only see comments from their batch-mates
 * - Students without a batch see NO comments
 * - Batch filtering happens client-side
 *
 * @param exerciseId - The exercise ID (used as postId in comments table)
 * @param currentUserBatchId - Current user's batch ID from session
 */
export function useBatchFilteredComments(
  exerciseId: string,
  currentUserBatchId: string | null | undefined
) {
  // Load all comments for this exercise
  const {
    comments: allComments,
    loading: commentsLoading,
    error: commentsError,
    addComment,
    refresh
  } = useComments(exerciseId);

  // Load batch students (only if user has a batch)
  const {
    students,
    isLoading: studentsLoading
  } = useBatchStudents(currentUserBatchId || undefined);

  // Filter comments to only batch-mates
  const batchFilteredComments = useMemo(() => {
    // No batch = no comments (privacy rule)
    if (!currentUserBatchId) {
      console.log('[useBatchFilteredComments] No batch ID - showing 0 comments');
      return [];
    }

    // Still loading students
    if (studentsLoading || students.length === 0) {
      console.log('[useBatchFilteredComments] Loading students or empty batch');
      return [];
    }

    // Create set of batch-mate emails for O(1) lookup
    const batchEmails = new Set(students.map(s => s.userId || s.email));

    console.log('[useBatchFilteredComments] Batch has', batchEmails.size, 'students');
    console.log('[useBatchFilteredComments] Total comments:', allComments.length);

    // Filter: only show comments from batch-mates
    const filtered = allComments.filter(comment => {
      const isInBatch = batchEmails.has(comment.userId);
      if (!isInBatch) {
        console.log('[useBatchFilteredComments] Filtered out comment from:', comment.userId);
      }
      return isInBatch;
    });

    console.log('[useBatchFilteredComments] Showing', filtered.length, 'batch-filtered comments');
    return filtered;
  }, [allComments, students, studentsLoading, currentUserBatchId]);

  // Loading state: true if either comments or students are loading
  const isLoading = commentsLoading || (currentUserBatchId ? studentsLoading : false);

  // Helper: Check if user can comment (must have a batch)
  const canComment = !!currentUserBatchId && students.length > 0;

  return {
    comments: batchFilteredComments,
    allCommentsCount: allComments.length,  // Total comments (before filtering)
    loading: isLoading,
    error: commentsError,
    addComment,
    refresh,

    // Batch info
    batchMatesCount: students.length,
    canComment,
    hasBatch: !!currentUserBatchId,
  };
}

/**
 * Helper: Get comment statistics for an exercise
 */
export function useCommentStats(
  exerciseId: string,
  currentUserBatchId: string | null | undefined
) {
  const {
    comments,
    allCommentsCount,
    batchMatesCount,
    loading
  } = useBatchFilteredComments(exerciseId, currentUserBatchId);

  return useMemo(() => ({
    visibleComments: comments.length,
    totalComments: allCommentsCount,
    batchMates: batchMatesCount,
    hasDiscussion: comments.length > 0,
    loading,
  }), [comments.length, allCommentsCount, batchMatesCount, loading]);
}
