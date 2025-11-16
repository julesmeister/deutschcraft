/**
 * React Query hooks for fetching User data
 * NEW STRUCTURE: users/{email} - Top-level collection
 * Email IS the document ID
 */

import { useQuery } from '@tanstack/react-query';
import {
  getUser,
  getTeacherStudents,
  getBatchStudents,
  getAllStudents,
  getStudentsWithoutTeacher,
} from '../services/userService';
import { User } from '../models';
import { cacheTimes } from '../queryClient';

/**
 * Fetch current user by email
 * Direct document access: users/{email}
 */
export function useCurrentUser(email: string | null, isFirebaseReady: boolean = true) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', email],
    queryFn: async () => {
      if (!email) {
        return null;
      }

      return await getUser(email);
    },
    enabled: !!email && isFirebaseReady, // Only run query when Firebase is ready
    staleTime: cacheTimes.student,
    gcTime: cacheTimes.student * 2.5,
  });

  return {
    user: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

// Alias for backwards compatibility with student dashboard
export function useCurrentStudent(email: string | null, isFirebaseReady: boolean = true) {
  const result = useCurrentUser(email, isFirebaseReady);
  return {
    student: result.user,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
  };
}

/**
 * Fetch all students for a teacher
 * Query: Fetch all users and filter for students with matching teacherId
 * Note: Using client-side filtering to handle both 'STUDENT' and 'student' role values
 */
export function useTeacherStudents(teacherEmail: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['students', 'teacher', teacherEmail],
    queryFn: async () => {
      if (!teacherEmail) return [];
      return await getTeacherStudents(teacherEmail);
    },
    enabled: !!teacherEmail,
    staleTime: cacheTimes.students,
    gcTime: cacheTimes.students * 2.5,
  });

  return {
    students: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch all students in a specific batch
 * Query: Fetch all users and filter for students in batch
 * Note: Using client-side filtering to handle both 'STUDENT' and 'student' role values
 */
export function useBatchStudents(batchId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['students', 'batch', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      return await getBatchStudents(batchId);
    },
    enabled: !!batchId,
    staleTime: cacheTimes.students,
    gcTime: cacheTimes.students * 2.5,
  });

  return {
    students: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch all students (admin view)
 * Query: Fetch all users and filter for students
 * Note: Using client-side filtering to handle both 'STUDENT' and 'student' role values
 */
export function useAllStudents() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['students', 'all'],
    queryFn: async () => {
      const students = await getAllStudents();
      return students;
    },
    staleTime: cacheTimes.students,
    gcTime: cacheTimes.students * 2.5,
  });

  return {
    students: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

// Alias for backwards compatibility
export function useAllStudentsNested() {
  return useAllStudents();
}

/**
 * Fetch students without a teacher (unassigned)
 * Query: Fetch all users and filter for students without teacher
 * Note: Using client-side filtering to handle both 'STUDENT' and 'student' role values
 */
export function useStudentsWithoutTeacher() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['students', 'without-teacher'],
    queryFn: async () => {
      const students = await getStudentsWithoutTeacher();

      return students;
    },
    staleTime: cacheTimes.students,
    gcTime: cacheTimes.students * 2.5,
  });

  return {
    students: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}
