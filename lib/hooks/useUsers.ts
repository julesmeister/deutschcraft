/**
 * React Query hooks for User management
 * NEW STRUCTURE: users/{email} - Top-level collection
 * Email IS the document ID
 *
 * NOTE: This file is a backwards compatibility wrapper.
 * All hooks have been refactored into:
 * - useUserQueries.ts (query hooks for fetching data)
 * - useUserMutations.ts (mutation hooks for modifying data)
 */

// Re-export all query hooks
export {
  useCurrentUser,
  useCurrentStudent,
  useTeacherStudents,
  useBatchStudents,
  useAllStudents,
  useAllStudentsNested,
  useStudentsWithoutTeacher,
  useUsersPaginated,
  usePendingEnrollmentsPaginated,
} from './useUserQueries';

// Re-export all mutation hooks
export {
  useUpsertUser,
  useUpdateUser,
  useAssignStudentToBatch,
} from './useUserMutations';
