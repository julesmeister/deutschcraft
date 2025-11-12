/**
 * React Query hooks for Testmanship Firestore structure
 * Uses users collection + students collection (like Android app)
 */

import { useQuery } from '@tanstack/react-query';
import { getAllStudents, getAllTeachers, getUser } from '../services/userService';
import { queryKeys, cacheTimes } from '../queryClient';

export interface SimpleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER';
  cefrLevel?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SimpleStudent {
  studentId: string;
  userId: string;
  teacherId?: string | null;
  targetLanguage: string;
  wordsLearned: number;
  wordsMastered: number;
  currentStreak: number;
  cefrLevel?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Fetch all students (users with role STUDENT)
 */
export function useAllStudents() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: async () => {
      const users = await getAllStudents();

      // Map to SimpleUser format
      return users.map(user => {
        // Handle both formats: single 'name' field or 'firstName'/'lastName'
        const fullName = (user as any).name || '';
        const [firstName = '', lastName = ''] = fullName ? fullName.split(' ') : [user.firstName || '', user.lastName || ''];

        return {
          id: user.userId,
          email: user.email,
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
          role: user.role,
          cefrLevel: user.cefrLevel,
          createdAt: user.createdAt || Date.now(),
          updatedAt: user.updatedAt || Date.now(),
        };
      }) as SimpleUser[];
    },
    staleTime: cacheTimes.studentList,
    gcTime: cacheTimes.studentList * 2.5,
  });

  return {
    students: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch all teachers (users with role TEACHER)
 */
export function useAllTeachers() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', 'teachers'],
    queryFn: async () => {
      const users = await getAllTeachers();
      // Map to SimpleUser format
      return users.map(user => {
        // Handle both formats: single 'name' field or 'firstName'/'lastName'
        const fullName = (user as any).name || '';
        const [firstName = '', lastName = ''] = fullName ? fullName.split(' ') : [user.firstName || '', user.lastName || ''];

        return {
          id: user.userId,
          email: user.email,
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
          role: user.role,
          cefrLevel: user.cefrLevel,
          createdAt: user.createdAt || Date.now(),
          updatedAt: user.updatedAt || Date.now(),
        };
      }) as SimpleUser[];
    },
    staleTime: cacheTimes.teacherProfile,
    gcTime: cacheTimes.teacherProfile * 2.5,
  });

  return {
    teachers: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch current user by ID
 */
export function useUser(userId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.user(userId || ''),
    queryFn: async () => {
      if (!userId) return null;

      const userData = await getUser(userId);
      if (!userData) return null;

      // Handle both formats: single 'name' field or 'firstName'/'lastName'
      const fullName = (userData as any).name || '';
      const [firstName = '', lastName = ''] = fullName ? fullName.split(' ') : [userData.firstName || '', userData.lastName || ''];

      // Map to SimpleUser format
      return {
        id: userData.userId,
        email: userData.email,
        firstName: userData.firstName || firstName,
        lastName: userData.lastName || lastName,
        role: userData.role,
        cefrLevel: userData.cefrLevel,
        createdAt: userData.createdAt || Date.now(),
        updatedAt: userData.updatedAt || Date.now(),
      } as SimpleUser;
    },
    staleTime: cacheTimes.user,
    gcTime: cacheTimes.user * 2.5,
    enabled: !!userId,
  });

  return {
    user: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
