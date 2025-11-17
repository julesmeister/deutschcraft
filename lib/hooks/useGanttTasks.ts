/**
 * React hooks for Gantt Task operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllGanttTasks,
  getChildGanttTasks,
  createGanttTask,
  updateGanttTask,
  deleteGanttTask,
  updateGanttTaskDates,
  hasGanttEditPermission,
} from '../services/ganttService';
import { GanttTask, GanttTaskCreateInput, GanttTaskUpdateInput } from '../models/gantt';

/**
 * Fetch all gantt tasks for a user
 */
export function useGanttTasks(createdBy?: string) {
  return useQuery({
    queryKey: ['gantt-tasks', createdBy],
    queryFn: () => getAllGanttTasks(createdBy),
    enabled: !!createdBy,
  });
}

/**
 * Fetch child tasks of a parent task
 */
export function useChildGanttTasks(parentTaskId: string) {
  return useQuery({
    queryKey: ['gantt-tasks', 'children', parentTaskId],
    queryFn: () => getChildGanttTasks(parentTaskId),
    enabled: !!parentTaskId,
  });
}

/**
 * Create a new gantt task
 */
export function useCreateGanttTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GanttTaskCreateInput) => createGanttTask(input),
    onSuccess: (newTask) => {
      // Invalidate all gantt tasks queries
      queryClient.invalidateQueries({ queryKey: ['gantt-tasks'] });

      // If it has a parent, invalidate the parent's children
      if (newTask.parentTaskId) {
        queryClient.invalidateQueries({
          queryKey: ['gantt-tasks', 'children', newTask.parentTaskId]
        });
      }
    },
  });
}

/**
 * Update a gantt task
 */
export function useUpdateGanttTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: GanttTaskUpdateInput }) =>
      updateGanttTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-tasks'] });
    },
  });
}

/**
 * Delete a gantt task
 */
export function useDeleteGanttTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, deleteChildren = true }: { taskId: string; deleteChildren?: boolean }) =>
      deleteGanttTask(taskId, deleteChildren),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-tasks'] });
    },
  });
}

/**
 * Update task dates (for drag/resize operations)
 */
export function useUpdateGanttTaskDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, startDate, endDate }: { taskId: string; startDate: number; endDate: number }) =>
      updateGanttTaskDates(taskId, startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-tasks'] });
    },
  });
}

/**
 * Check if user has edit permission
 */
export function useGanttEditPermission(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['gantt-edit-permission', userId],
    queryFn: () => hasGanttEditPermission(userId!),
    enabled: !!userId,
  });
}
