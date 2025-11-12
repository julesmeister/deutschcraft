/**
 * React Query hooks for fetching Writing Task data
 * NEW STRUCTURE: tasks/{taskId} - Top-level collection
 * Uses taskService for database abstraction
 */

import { useQuery } from '@tanstack/react-query';
import { cacheTimes } from '../queryClient';
import { WritingTask } from '../models';
import { getTasksByBatch, getTasksByTeacherAndBatch, getTasksByStudent, getTask } from '../services/taskService';

/**
 * Fetch all writing tasks for a specific batch
 * Query: tasks.where('batchId', '==', batchId)
 */
export function useBatchWritingTasks(batchId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tasks', 'batch', batchId],
    queryFn: async () => {
      if (!batchId) return [];
      return await getTasksByBatch(batchId);
    },
    enabled: !!batchId,
    staleTime: cacheTimes.writingTasks,
    gcTime: cacheTimes.writingTasks * 2.5,
  });

  return {
    tasks: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch all writing tasks for a teacher (across all batches)
 * Query: tasks.where('teacherId', '==', teacherEmail)
 */
export function useTeacherBatchTasks(teacherEmail: string | undefined, batchId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tasks', 'teacher', teacherEmail, batchId],
    queryFn: async () => {
      if (!teacherEmail || !batchId) return [];
      return await getTasksByTeacherAndBatch(teacherEmail, batchId);
    },
    enabled: !!teacherEmail && !!batchId,
    staleTime: cacheTimes.writingTasks,
    gcTime: cacheTimes.writingTasks * 2.5,
  });

  return {
    tasks: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch all tasks assigned to a specific student
 * Query: tasks.where('assignedStudents', 'array-contains', studentEmail)
 */
export function useStudentTasks(studentEmail: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tasks', 'student', studentEmail],
    queryFn: async () => {
      if (!studentEmail) return [];
      return await getTasksByStudent(studentEmail);
    },
    enabled: !!studentEmail,
    staleTime: cacheTimes.writingTasks,
    gcTime: cacheTimes.writingTasks * 2.5,
  });

  return {
    tasks: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Fetch a single task by taskId
 * Direct document access: tasks/{taskId}
 */
export function useTask(taskId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      return await getTask(taskId);
    },
    enabled: !!taskId,
    staleTime: cacheTimes.writingTasks,
    gcTime: cacheTimes.writingTasks * 2.5,
  });

  return {
    task: data || null,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
