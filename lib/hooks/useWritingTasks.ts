/**
 * React Query hooks for Writing Task management
 * NEW STRUCTURE: tasks/{taskId} - Top-level collection
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { queryKeys, cacheTimes } from '../queryClient';
import { WritingTask, CEFRLevel } from '../models';

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

/**
 * Create a new writing task
 * Creates document at: tasks/{taskId}
 */
export function useCreateWritingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teacherId,
      batchId,
      title,
      description,
      instructions,
      category,
      level,
      priority,
      dueDate,
      assignedStudents,
      minWords,
      maxWords,
      minParagraphs,
      maxParagraphs,
      totalPoints,
      estimatedDuration,
      tone,
      perspective,
      requireIntroduction,
      requireConclusion,
      requireExamples,
    }: {
      teacherId: string; // Teacher's email
      batchId: string;
      title: string;
      description?: string;
      instructions: string;
      category: WritingTask['category'];
      level: CEFRLevel;
      priority: WritingTask['priority'];
      dueDate: number;
      assignedStudents: string[]; // Array of student emails
      minWords?: number;
      maxWords?: number;
      minParagraphs?: number;
      maxParagraphs?: number;
      totalPoints?: number;
      estimatedDuration?: number;
      tone?: WritingTask['tone'];
      perspective?: WritingTask['perspective'];
      requireIntroduction?: boolean;
      requireConclusion?: boolean;
      requireExamples?: boolean;
    }) => {
      const taskId = `TASK_${Date.now()}`;
      const taskRef = doc(db, 'tasks', taskId);

      const task: WritingTask = {
        taskId,
        batchId,
        teacherId,
        title,
        description: description || '',
        instructions,
        category,
        level,
        status: 'draft',
        priority,
        assignedDate: null,
        dueDate,
        estimatedDuration: estimatedDuration || 30,
        assignedStudents,
        completedStudents: [],
        minWords: minWords || 0,
        maxWords: maxWords || 0,
        minParagraphs,
        maxParagraphs,
        requiredVocabulary: [],
        totalPoints: totalPoints || 0,
        tone,
        perspective,
        requireIntroduction,
        requireConclusion,
        requireExamples,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(taskRef, task);

      return task;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', 'teacher', variables.teacherId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'batch', variables.batchId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Update a writing task
 */
export function useUpdateWritingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<WritingTask>;
    }) => {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Assign task to students (marks as assigned)
 */
export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: 'assigned',
        assignedDate: Date.now(),
        updatedAt: Date.now(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/**
 * Delete a writing task
 */
export function useDeleteWritingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
