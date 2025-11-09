/**
 * React Query hooks for User management
 * NEW STRUCTURE: users/{email} - Top-level collection
 * Email IS the document ID
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { User } from '../models';
import { queryKeys, cacheTimes } from '../queryClient';

/**
 * Fetch current user by email
 * Direct document access: users/{email}
 */
export function useCurrentUser(email: string | null) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', email],
    queryFn: async () => {
      if (!email) {
        console.log('[useCurrentUser] No email provided');
        return null;
      }

      console.log('[useCurrentUser] Fetching user:', email);
      const userRef = doc(db, 'users', email);
      const userDoc = await getDoc(userRef);

      console.log('[useCurrentUser] Document exists:', userDoc.exists());

      if (!userDoc.exists()) {
        console.log('[useCurrentUser] User document not found for:', email);
        return null;
      }

      const userData = {
        userId: userDoc.id,
        ...userDoc.data(),
      } as User;

      console.log('[useCurrentUser] User data:', userData);

      return userData;
    },
    enabled: !!email,
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
export function useCurrentStudent(email: string | null) {
  const result = useCurrentUser(email);
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

      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const students: User[] = snapshot.docs
        .map(doc => ({
          userId: doc.id,
          ...doc.data(),
        } as User))
        .filter(user => {
          const role = (user.role || '').toUpperCase();
          return role === 'STUDENT' && user.teacherId === teacherEmail;
        });

      return students;
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

      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const students: User[] = snapshot.docs
        .map(doc => ({
          userId: doc.id,
          ...doc.data(),
        } as User))
        .filter(user => {
          const role = (user.role || '').toUpperCase();
          return role === 'STUDENT' && user.batchId === batchId;
        });

      return students;
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
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const students: User[] = snapshot.docs
        .map(doc => ({
          userId: doc.id,
          ...doc.data(),
        } as User))
        .filter(user => {
          const role = (user.role || '').toUpperCase();
          return role === 'STUDENT';
        });

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
      console.log('[useStudentsWithoutTeacher] Starting query...');
      const usersRef = collection(db, 'users');

      // Fetch all users and filter client-side to handle case variations
      const snapshot = await getDocs(usersRef);
      console.log('[useStudentsWithoutTeacher] Total users found:', snapshot.size);

      const students: User[] = snapshot.docs
        .map(doc => ({
          userId: doc.id,
          ...doc.data(),
        } as User))
        .filter(user => {
          const role = (user.role || '').toUpperCase();
          const hasNoTeacher = user.teacherId === null || user.teacherId === undefined;

          console.log('[useStudentsWithoutTeacher] Checking user:', {
            email: user.email,
            role: user.role,
            roleUpper: role,
            teacherId: user.teacherId,
            hasNoTeacher,
            matches: role === 'STUDENT' && hasNoTeacher,
          });

          return role === 'STUDENT' && hasNoTeacher;
        });

      console.log('[useStudentsWithoutTeacher] Filtered students:', students.length);
      console.log('[useStudentsWithoutTeacher] Students:', students.map(s => ({
        userId: s.userId,
        email: s.email,
        name: s.name || `${s.firstName || ''} ${s.lastName || ''}`,
        role: s.role,
        teacherId: s.teacherId,
      })));

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
 * Create or update user
 * Document ID is the email
 */
export function useUpsertUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Partial<User> & { email: string }) => {
      const userRef = doc(db, 'users', user.email);
      await setDoc(userRef, {
        userId: user.email,
        email: user.email,
        ...user,
        updatedAt: Date.now(),
      }, { merge: true });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.email] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

/**
 * Update user details
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      updates,
    }: {
      email: string;
      updates: Partial<User>;
    }) => {
      const userRef = doc(db, 'users', email);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.email] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

/**
 * Assign student to batch
 */
export function useAssignStudentToBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentEmail,
      batchId,
      teacherId,
    }: {
      studentEmail: string;
      batchId: string;
      teacherId: string;
    }) => {
      const userRef = doc(db, 'users', studentEmail);
      await updateDoc(userRef, {
        batchId,
        teacherId,
        updatedAt: Date.now(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.studentEmail] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', 'batch', variables.batchId] });
    },
  });
}
