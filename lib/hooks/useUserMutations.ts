/**
 * React Query mutation hooks for User management
 * NEW STRUCTURE: users/{email} - Top-level collection
 * Email IS the document ID
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { User } from '../models';

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
