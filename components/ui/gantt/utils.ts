import { GanttChartTask, FlatTask } from './types';

export const defaultColors = [
  'rgb(251, 191, 36)', // yellow
  'rgb(253, 186, 116)', // orange
  'rgb(110, 231, 183)', // mint
  'rgb(125, 211, 252)', // cyan
  'rgb(167, 139, 250)', // purple
  'rgb(251, 113, 133)', // pink
];

/**
 * Get all task IDs that have children (for default expansion)
 */
export const getAllParentIds = (tasks: GanttChartTask[]): Set<string> => {
  const parentIds = new Set<string>();
  const traverse = (taskList: GanttChartTask[]) => {
    taskList.forEach(task => {
      if (task.children && task.children.length > 0) {
        parentIds.add(task.id);
        traverse(task.children);
      }
    });
  };
  traverse(tasks);
  return parentIds;
};

/**
 * Flatten tasks for rendering
 */
export const flattenTasks = (
  taskList: GanttChartTask[],
  expandedTasks: Set<string>,
  level = 0
): FlatTask[] => {
  const result: FlatTask[] = [];
  taskList.forEach((task, index) => {
    result.push({
      ...task,
      level,
      color: task.color || defaultColors[index % defaultColors.length]
    });
    if (task.children && task.children.length > 0 && expandedTasks.has(task.id)) {
      result.push(...flattenTasks(task.children, expandedTasks, level + 1));
    }
  });
  return result;
};

/**
 * Generate days array between two dates
 */
export const generateDaysArray = (
  minDate: Date,
  maxDate: Date,
  showWeekends: boolean
): Date[] => {
  const days: Date[] = [];
  const currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    if (showWeekends || (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)) {
      days.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return days;
};

/**
 * Convert date to x position
 */
export const dateToX = (date: Date, days: Date[], dayWidth: number): number => {
  const dayIndex = days.findIndex(d => d.toDateString() === date.toDateString());
  return dayIndex >= 0 ? dayIndex * dayWidth : 0;
};

/**
 * Get task width in pixels
 */
export const getTaskWidth = (
  task: GanttChartTask,
  days: Date[],
  dayWidth: number
): number => {
  const start = dateToX(task.startDate, days, dayWidth);
  const end = dateToX(task.endDate, days, dayWidth);
  return Math.max(end - start + dayWidth, dayWidth);
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]}, ${date.getDate()}`;
};

/**
 * Get month label
 */
export const getMonthLabel = (date: Date): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[date.getMonth()];
};

/**
 * Convert RGB color to darker version for text
 */
export const getDarkerColor = (rgbColor: string | undefined): string => {
  if (!rgbColor) return 'rgb(50, 50, 50)';
  const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return 'rgb(50, 50, 50)';
  const r = Math.floor(parseInt(match[1]) * 0.7);
  const g = Math.floor(parseInt(match[2]) * 0.7);
  const b = Math.floor(parseInt(match[3]) * 0.7);
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Update task dates recursively
 */
export const updateTaskDates = (
  taskList: GanttChartTask[],
  targetId: string,
  updateFn: (task: GanttChartTask) => GanttChartTask
): GanttChartTask[] => {
  return taskList.map(task => {
    if (task.id === targetId) {
      return updateFn(task);
    }
    if (task.children) {
      return { ...task, children: updateTaskDates(task.children, targetId, updateFn) };
    }
    return task;
  });
};
