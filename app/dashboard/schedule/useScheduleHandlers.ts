import { useState } from 'react';
import { useCreateBatch } from '@/lib/hooks/useBatches';
import { useCreateGanttTask, useUpdateGanttTask, useDeleteGanttTask } from '@/lib/hooks/useGanttTasks';
import { useToast } from '@/components/ui/toast';
import { Batch } from '@/lib/models';
import { GanttChartTask } from '@/components/ui/GanttChart';
import { parseTimeString, updateDateTime } from './scheduleHandlers';

interface UseScheduleHandlersProps {
  isTeacher: boolean;
  currentUserId: string | null;
  hasEditPermission: boolean;
  selectedBatch: Batch | null;
  batches: Batch[];
  tasks: GanttChartTask[];
  ganttTasks: any[];
  setExpandedBatches: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useScheduleHandlers({
  isTeacher,
  currentUserId,
  hasEditPermission,
  selectedBatch,
  batches,
  tasks,
  ganttTasks,
  setExpandedBatches,
}: UseScheduleHandlersProps) {
  const toast = useToast();
  const createBatchMutation = useCreateBatch();
  const createGanttTaskMutation = useCreateGanttTask();
  const updateGanttTaskMutation = useUpdateGanttTask();
  const deleteGanttTaskMutation = useDeleteGanttTask();

  const handleCreateBatch = async (data: {
    name: string;
    description?: string;
    currentLevel: any;
    startDate: number;
    endDate: number | null;
  }) => {
    if (!isTeacher || !currentUserId) {
      toast.error('Only teachers can create batches');
      return;
    }

    try {
      await createBatchMutation.mutateAsync({
        teacherId: currentUserId,
        ...data,
      });

      toast.success('Batch created successfully!');
      return true;
    } catch (error) {
      console.error('[Create Batch] Error creating batch:', error);
      toast.error('Failed to create batch. Please try again.');
      return false;
    }
  };

  const handleAddTask = () => {
    if (!hasEditPermission) {
      toast.error('You do not have permission to edit the schedule');
      return;
    }
    if (!selectedBatch) {
      toast.info('Select a batch first to add curriculum items');
      return;
    }
    setExpandedBatches(prev => new Set([...prev, selectedBatch.batchId]));
    handleAddSubTask(selectedBatch.batchId);
  };

  const handleAddSubTask = async (parentTaskId: string) => {
    if (!currentUserId) return;
    if (!hasEditPermission) {
      toast.error('You do not have permission to edit the schedule');
      return;
    }

    try {
      const batch = batches.find(b => b.batchId === parentTaskId);
      const parentTask = tasks.find(t => t.id === parentTaskId);
      if (!batch || !parentTask) return;

      const defaultStartDate = new Date(parentTask.startDate);
      const defaultEndDate = new Date(defaultStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      const siblings = ganttTasks.filter(t => t.parentTaskId === parentTaskId);
      const orderIndex = siblings.length;

      await createGanttTaskMutation.mutateAsync({
        name: 'New Curriculum Item',
        startDate: defaultStartDate.getTime(),
        endDate: defaultEndDate.getTime(),
        progress: 0,
        status: 'not-started',
        color: parentTask.color,
        parentTaskId,
        orderIndex,
        createdBy: currentUserId,
      });

      toast.success('Curriculum item added');
    } catch (error) {
      console.error('[Add Curriculum] Error:', error);
      toast.error('Failed to add curriculum item');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!hasEditPermission) {
      toast.error('You do not have permission to edit the schedule');
      return;
    }

    const isParent = tasks.some(t => t.id === taskId);
    if (isParent) {
      toast.error('Cannot delete batches from here. Use the batch selector.');
      return;
    }

    try {
      await deleteGanttTaskMutation.mutateAsync({ taskId, deleteChildren: true });
      toast.success('Curriculum item deleted');
    } catch (error) {
      console.error('[Delete Task] Error:', error);
      toast.error('Failed to delete curriculum item');
    }
  };

  const handleRenameTask = async (taskId: string, newName: string) => {
    if (!hasEditPermission) {
      toast.error('You do not have permission to edit the schedule');
      return;
    }

    const isParent = tasks.some(t => t.id === taskId);
    if (isParent) {
      toast.error('Cannot rename batches from here. Use the batch selector.');
      return;
    }

    try {
      await updateGanttTaskMutation.mutateAsync({
        taskId,
        updates: { name: newName },
      });
      toast.success('Curriculum item renamed');
    } catch (error) {
      console.error('[Rename Task] Error:', error);
      toast.error('Failed to rename curriculum item');
    }
  };

  const handleEventTimeUpdate = async (eventId: string, newStartTime: string, newEndTime: string) => {
    if (!hasEditPermission) {
      toast.error('You do not have permission to edit the schedule');
      return;
    }

    try {
      const ganttTask = ganttTasks.find(t => t.taskId === eventId);
      if (!ganttTask) return;

      const currentStart = new Date(ganttTask.startDate);
      const currentEnd = new Date(ganttTask.endDate);

      const [startHours, startMinutes] = parseTimeString(newStartTime);
      const [endHours, endMinutes] = parseTimeString(newEndTime);

      const newStart = updateDateTime(currentStart, startHours, startMinutes);
      const newEnd = updateDateTime(currentEnd, endHours, endMinutes);

      await updateGanttTaskMutation.mutateAsync({
        taskId: eventId,
        updates: {
          startDate: newStart.getTime(),
          endDate: newEnd.getTime(),
        },
      });

      toast.success('Event time updated');
    } catch (error) {
      console.error('[Update Event Time] Error:', error);
      toast.error('Failed to update event time');
    }
  };

  return {
    handleCreateBatch,
    handleAddTask,
    handleAddSubTask,
    handleDeleteTask,
    handleRenameTask,
    handleEventTimeUpdate,
    createBatchMutation,
  };
}
