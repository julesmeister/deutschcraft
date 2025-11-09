/**
 * React Query hooks for Testmanship Firestore structure
 * Uses users collection + students collection (like Android app)
 */

import { useQuery } from '@tanstack/react-query';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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
      const usersRef = collection(db, 'users');

      // Fetch all users first (without where clause to avoid index issues)
      const snapshot = await getDocs(usersRef);

      // Filter for students in memory
      const students: SimpleUser[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as SimpleUser))
        .filter((user) => user.role === 'STUDENT');

      return students;
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
      const usersRef = collection(db, 'users');

      // Fetch all users first
      const snapshot = await getDocs(usersRef);

      // Filter for teachers in memory
      const teachers: SimpleUser[] = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as SimpleUser))
        .filter((user) => user.role === 'TEACHER');

      return teachers;
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

      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const userDoc = snapshot.docs.find(doc => doc.id === userId);

      if (!userDoc) return null;

      return {
        id: userDoc.id,
        ...userDoc.data(),
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
