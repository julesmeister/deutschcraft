/**
 * React Query mutation hooks for Writing Task management
 * NEW STRUCTURE: tasks/{taskId} - Top-level collection
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { WritingTask, CEFRLevel } from '../models';

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

      // Build task object and remove undefined values (Firestore doesn't accept undefined)
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
        minParagraphs: minParagraphs ?? undefined,
        maxParagraphs: maxParagraphs ?? undefined,
        requiredVocabulary: [],
        totalPoints: totalPoints || 0,
        tone: tone ?? undefined,
        perspective: perspective ?? undefined,
        requireIntroduction: requireIntroduction ?? false,
        requireConclusion: requireConclusion ?? false,
        requireExamples: requireExamples ?? false,
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
