/**
 * React Query hooks for fetching User data
 * Uses hybrid service that switches between Firebase and Turso
 */

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  getUser,
  getTeacherStudents,
  getBatchStudents,
  getAllStudents,
  getAllNonTeachers,
  getStudentsWithoutTeacher,
  getUsers,
  getUsersPaginated,
  getUserCount,
  getPendingEnrollmentsPaginated,
  getPendingEnrollmentsCount,
} from '../services/user';
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
 * Fetch all non-teacher users (students and pending users)
 * Useful for transaction management where you need to assign transactions to any user
 */
export function useAllNonTeachers() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', 'non-teachers'],
    queryFn: async () => {
      const users = await getAllNonTeachers();
      return users;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for user list
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  return {
    users: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch ALL users (students, teachers, and pending)
 * Useful for transaction user lookup where transaction could be from any user type
 */
export function useAllUsers() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const users = await getUsers();
      return users;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for user list
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  return {
    users: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
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

/**
 * Fetch users with server-side pagination
 * Optimized for role management page with large user counts
 *
 * @param options - Pagination options
 * @param options.pageSize - Number of users per page (default: 50)
 * @param options.roleFilter - Optional role filter ('STUDENT' | 'TEACHER' | 'all')
 * @returns Hook with users, pagination state, and navigation functions
 */
export function useUsersPaginated(options: {
  pageSize?: number;
  roleFilter?: 'STUDENT' | 'TEACHER' | 'all';
} = {}) {
  const { pageSize = 50, roleFilter = 'all' } = options;
  const [page, setPage] = useState(1);
  const [lastDocs, setLastDocs] = useState<(User | null)[]>([null]);

  // Fetch current page
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users', 'paginated', page, roleFilter, pageSize],
    queryFn: async () => {
      const lastDoc = lastDocs[page - 1] || null;
      return await getUsersPaginated({
        pageSize,
        lastDoc,
        roleFilter,
        orderByField: 'userId',
      });
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  // Fetch total count (cached separately)
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['users', 'count', roleFilter],
    queryFn: async () => {
      return await getUserCount(roleFilter);
    },
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  const users = data?.users || [];
  const hasMore = data?.hasMore || false;
  const totalPages = Math.ceil(totalCount / pageSize);

  const goToNextPage = () => {
    if (hasMore && data?.lastDoc) {
      setPage((prev) => prev + 1);
      setLastDocs((prev) => [...prev, data.lastDoc]);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // Reset pagination if going to page 1
      if (newPage === 1) {
        setLastDocs([null]);
      }
      setPage(newPage);
    }
  };

  return {
    users,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    // Pagination
    page,
    pageSize,
    totalPages,
    totalCount,
    hasMore,
    goToNextPage,
    goToPrevPage,
    goToPage,
  };
}

/**
 * Get pending enrollment requests with server-side pagination
 * Optimized for enrollment approvals page
 *
 * @param options - Pagination options
 * @returns Hook with pending enrollments, pagination state, and navigation functions
 */
export function usePendingEnrollmentsPaginated(options: {
  pageSize?: number;
} = {}) {
  const { pageSize = 10 } = options;
  const [page, setPage] = useState(1);
  const [lastDocs, setLastDocs] = useState<(User | null)[]>([null]);

  // Fetch current page
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['pending-enrollments-paginated', page, pageSize],
    queryFn: async () => {
      const lastDoc = lastDocs[page - 1] || null;
      return await getPendingEnrollmentsPaginated({
        pageSize,
        lastDoc,
      });
    },
    staleTime: 10000, // 10 seconds - refresh frequently for approvals
    gcTime: 60000, // 1 minute
  });

  // Fetch total count (cached separately)
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['pending-enrollments-count'],
    queryFn: async () => {
      return await getPendingEnrollmentsCount();
    },
    staleTime: 30000, // 30 seconds
    gcTime: 120000, // 2 minutes
  });

  const users = data?.users || [];
  const hasMore = data?.hasMore || false;
  const totalPages = Math.ceil(totalCount / pageSize);

  const goToNextPage = () => {
    if (hasMore && data?.lastDoc) {
      setPage((prev) => prev + 1);
      setLastDocs((prev) => [...prev, data.lastDoc]);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      if (newPage === 1) {
        setLastDocs([null]);
      }
      setPage(newPage);
    }
  };

  return {
    users,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    // Pagination
    page,
    pageSize,
    totalPages,
    totalCount,
    hasMore,
    goToNextPage,
    goToPrevPage,
    goToPage,
  };
}
