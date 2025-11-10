/**
 * React Query hooks for Writing Task management
 * NEW STRUCTURE: tasks/{taskId} - Top-level collection
 *
 * NOTE: This file is a backwards compatibility wrapper.
 * All hooks have been refactored into:
 * - useTaskQueries.ts (query hooks for fetching data)
 * - useTaskMutations.ts (mutation hooks for modifying data)
 */

// Re-export all query hooks
export {
  useBatchWritingTasks,
  useTeacherBatchTasks,
  useStudentTasks,
  useTask,
} from './useTaskQueries';

// Re-export all mutation hooks
export {
  useCreateWritingTask,
  useUpdateWritingTask,
  useAssignTask,
  useDeleteWritingTask,
} from './useTaskMutations';
