/**
 * React Query hooks for Writing Submissions - Main Entry Point
 * Re-exports all writing submission hooks
 *
 * This file maintains backward compatibility while organizing
 * code into smaller, focused modules
 */

// Re-export query hooks
export {
  useWritingExercises,
  useWritingExercise,
  useStudentSubmissions,
  useWritingSubmission,
  useExerciseSubmissions,
  useAllWritingSubmissions,
  usePendingWritingCount,
  useWritingSubmissionsPaginated,
} from './useWritingQueries';

// Re-export mutation hooks
export {
  useCreateWritingSubmission,
  useUpdateWritingSubmission,
  useSubmitWriting,
  useDeleteWritingSubmission,
} from './useWritingMutations';
