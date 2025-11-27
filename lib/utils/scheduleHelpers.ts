/**
 * Schedule Helper Functions
 * Utilities for schedule page operations
 */

import { GanttChartTask } from '@/components/ui/GanttChart';
import { GanttTask } from '@/lib/models/gantt';
import { Batch } from '@/lib/models';

// Define color palette for batches
export const BATCH_COLORS = [
  'rgb(251, 191, 36)', // yellow
  'rgb(110, 231, 183)', // mint
  'rgb(167, 139, 250)', // purple
  'rgb(251, 113, 133)', // pink
  'rgb(125, 211, 252)', // cyan
  'rgb(253, 186, 116)', // orange
];

/**
 * Calculate parent dates based on children tasks
 */
export function calculateParentDates(children: GanttChartTask[]) {
  if (!children || children.length === 0) {
    return null;
  }

  let earliestStart = children[0].startDate;
  let latestEnd = children[0].endDate;

  children.forEach(child => {
    if (child.startDate < earliestStart) {
      earliestStart = child.startDate;
    }
    if (child.endDate > latestEnd) {
      latestEnd = child.endDate;
    }
  });

  return { startDate: earliestStart, endDate: latestEnd };
}

/**
 * Recalculate parent dates based on children
 */
export function recalculateParentDates(taskList: GanttChartTask[]): GanttChartTask[] {
  return taskList.map(task => {
    if (task.children && task.children.length > 0) {
      const childrenDates = calculateParentDates(task.children);
      return {
        ...task,
        startDate: childrenDates?.startDate || task.startDate,
        endDate: childrenDates?.endDate || task.endDate,
        children: recalculateParentDates(task.children),
      };
    }
    return task;
  });
}

/**
 * Convert batches and gantt tasks to hierarchical structure
 */
export function buildHierarchyTasks(batches: Batch[], ganttTasks: GanttTask[]): GanttChartTask[] {
  const parentTasks = ganttTasks.filter(t => !t.parentTaskId);
  const childTasks = ganttTasks.filter(t => t.parentTaskId);

  const childrenMap = new Map<string, GanttTask[]>();
  childTasks.forEach(child => {
    if (!child.parentTaskId) return;
    if (!childrenMap.has(child.parentTaskId)) {
      childrenMap.set(child.parentTaskId, []);
    }
    childrenMap.get(child.parentTaskId)!.push(child);
  });

  return batches.map((batch, index) => {
    const batchColor = BATCH_COLORS[index % BATCH_COLORS.length];

    const batchChildren = childrenMap.get(batch.batchId) || [];
    const children: GanttChartTask[] = batchChildren.map(child => ({
      id: child.taskId,
      name: child.name,
      startDate: new Date(child.startDate),
      endDate: new Date(child.endDate),
      progress: child.progress,
      color: batchColor,
    }));

    const childrenDates = calculateParentDates(children);
    const startDate = childrenDates?.startDate || new Date(batch.startDate);
    const endDate = childrenDates?.endDate || (batch.endDate ? new Date(batch.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000));

    return {
      id: batch.batchId,
      name: batch.name,
      startDate,
      endDate,
      progress: 0,
      color: batchColor,
      children,
    };
  });
}

/**
 * Convert gantt tasks to day view events
 */
export function convertTasksToDayViewEvents(
  tasks: GanttChartTask[],
  selectedDate: Date
): Array<{
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: 'blue' | 'pink' | 'indigo' | 'gray';
}> {
  const events: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    color: 'blue' | 'pink' | 'indigo' | 'gray';
  }> = [];

  const selectedDateStart = new Date(selectedDate);
  selectedDateStart.setHours(0, 0, 0, 0);
  const selectedDateEnd = new Date(selectedDate);
  selectedDateEnd.setHours(23, 59, 59, 999);

  tasks.forEach((task) => {
    task.children?.forEach((child) => {
      const childStart = new Date(child.startDate);
      const childEnd = new Date(child.endDate);

      if (
        (childStart >= selectedDateStart && childStart <= selectedDateEnd) ||
        (childEnd >= selectedDateStart && childEnd <= selectedDateEnd) ||
        (childStart < selectedDateStart && childEnd > selectedDateEnd)
      ) {
        const startTime = childStart.getHours() + ':' + String(childStart.getMinutes()).padStart(2, '0');
        const endTime = childEnd.getHours() + ':' + String(childEnd.getMinutes()).padStart(2, '0');

        const displayStartTime = startTime === '0:00' ? '09:00' : startTime;
        const displayEndTime = endTime === '0:00' ? '17:00' : endTime;

        events.push({
          id: child.id,
          title: child.name,
          startTime: displayStartTime,
          endTime: displayEndTime,
          color: 'blue',
        });
      }
    });
  });

  return events;
}
