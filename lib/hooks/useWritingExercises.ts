/**
 * React Query hooks for Writing Exercise management
 *
 * This file re-exports all writing-related hooks from their specialized modules.
 *
 * Modules:
 * - useWritingSubmissions.ts - Submission queries and mutations
 * - useWritingProgress.ts - Progress tracking and statistics
 * - useWritingReviews.ts - Peer and teacher reviews
 */

// Re-export submission hooks
export {
  useWritingExercises,
  useWritingExercise,
  useStudentSubmissions,
  useWritingSubmission,
  useExerciseSubmissions,
  useAllWritingSubmissions,
  usePendingWritingCount,
  useCreateWritingSubmission,
  useUpdateWritingSubmission,
  useSubmitWriting,
  useDeleteWritingSubmission,
} from './useWritingSubmissions';

// Re-export progress and stats hooks
export {
  useWritingProgress,
  useWritingStats,
  useUpdateWritingStats,
  useUpdateWritingProgress,
  useUpdateProgressForQuiz,
} from './useWritingProgress';

// Re-export review hooks
export {
  usePeerReviews,
  useAssignedPeerReviews,
  useCreatePeerReview,
  useUpdatePeerReview,
  useTeacherReview,
  useTeacherReviews,
  useCreateTeacherReview,
  useUpdateTeacherReview,
} from './useWritingReviews';
