import { useQuery } from '@tanstack/react-query';
import { db } from '../database';
import { Teacher } from '../models';
import { queryKeys, cacheTimes } from '../queryClient';

interface UseTeacherResult {
  teacher: Teacher | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Fetches teacher profile by teacherId
 * Uses database abstraction layer
 * - Caches for 10 minutes (teacher profile cache time)
 */
export function useTeacher(teacherId: string | undefined): UseTeacherResult {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.teacher(teacherId || ''),
    queryFn: async () => {
      if (!teacherId) {
        throw new Error('Teacher ID is required');
      }

      // Use database abstraction layer
      const teacher = await db.teachers.findById(teacherId);
      return teacher;
    },
    staleTime: cacheTimes.teacherProfile, // 10 minutes per protocol
    gcTime: cacheTimes.teacherProfile * 2.5, // 25 minutes
    enabled: !!teacherId, // Only run if teacherId is provided
  });

  return {
    teacher: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetches teacher profile by userId
 * Useful when you have the authenticated user's ID but need the teacher profile
 * Uses database abstraction layer
 * - Caches for 10 minutes
 */
export function useTeacherByUserId(userId: string | undefined): UseTeacherResult {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['teacher', 'by-user', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Use database abstraction layer
      const teacher = await db.teachers.findByUserId(userId);

      if (!teacher) {
        throw new Error(`No teacher found for user ID ${userId}`);
      }

      return teacher;
    },
    staleTime: cacheTimes.teacherProfile, // 10 minutes per protocol
    gcTime: cacheTimes.teacherProfile * 2.5, // 25 minutes
    enabled: !!userId, // Only run if userId is provided
  });

  return {
    teacher: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
