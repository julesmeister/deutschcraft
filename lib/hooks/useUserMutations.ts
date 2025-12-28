/**
 * React Query mutation hooks for User management
 * NEW STRUCTURE: users/{email} - Top-level collection
 * Email IS the document ID
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertUser, updateUser, assignStudentToBatch } from '../services/user';
import { User } from '../models';

/**
 * Create or update user
 * Document ID is the email
 */
export function useUpsertUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Partial<User> & { email: string }) => {
      await upsertUser(user);
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
      await updateUser(email, updates);
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
      await assignStudentToBatch(studentEmail, batchId, teacherId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.studentEmail] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', 'batch', variables.batchId] });
    },
  });
}
