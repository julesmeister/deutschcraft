/**
 * React Query hooks for fetching Writing Task data
 * NEW STRUCTURE: tasks/{taskId} - Top-level collection
 */

import { useQuery } from '@tanstack/react-query';
import { db } from '../firebase';
import { collection, getDocs, doc, query, where, getDoc } from 'firebase/firestore';
import { cacheTimes } from '../queryClient';
import { WritingTask } from '../models';

/**
 * Fetch all writing tasks for a specific batch
 * Query: tasks.where('batchId', '==', batchId)
 */
export function useBatchWritingTasks(batchId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tasks', 'batch', batchId],
    queryFn: async () => {
      if (!batchId) return [];

      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('batchId', '==', batchId));
      const snapshot = await getDocs(q);

      const tasks: WritingTask[] = snapshot.docs.map(doc => ({
        taskId: doc.id,
        ...doc.data(),
      } as WritingTask));

      return tasks;
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

      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('teacherId', '==', teacherEmail),
        where('batchId', '==', batchId)
      );
      const snapshot = await getDocs(q);

      const tasks: WritingTask[] = snapshot.docs.map(doc => ({
        taskId: doc.id,
        ...doc.data(),
      } as WritingTask));

      return tasks;
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

      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('assignedStudents', 'array-contains', studentEmail));
      const snapshot = await getDocs(q);

      const tasks: WritingTask[] = snapshot.docs.map(doc => ({
        taskId: doc.id,
        ...doc.data(),
      } as WritingTask));

      // Sort by due date (most recent first)
      return tasks.sort((a, b) => b.dueDate - a.dueDate);
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

      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);

      if (!taskDoc.exists()) return null;

      return {
        taskId: taskDoc.id,
        ...taskDoc.data(),
      } as WritingTask;
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
