import { GanttChartTask } from '@/components/ui/GanttChart';
import { Batch } from '@/lib/models';

export const getTaskLevel = (
  taskId: string,
  tasks: GanttChartTask[],
  batches: Batch[]
): string | null => {
  for (const task of tasks) {
    if (task.children?.some(child => child.id === taskId)) {
      const parentBatch = batches.find(b => b.batchId === task.id);
      return parentBatch?.currentLevel || null;
    }
  }
  return null;
};

export const parseTimeString = (timeString: string): [number, number] => {
  return timeString.split(':').map(Number) as [number, number];
};

export const updateDateTime = (
  currentDate: Date,
  hours: number,
  minutes: number
): Date => {
  const newDate = new Date(currentDate);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};
