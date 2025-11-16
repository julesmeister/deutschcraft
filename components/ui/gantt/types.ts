export interface GanttChartTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  color?: string;
  children?: GanttChartTask[];
  dependencies?: string[]; // IDs of tasks this depends on
}

export interface GanttChartProps {
  title?: string;
  tasks: GanttChartTask[];
  viewStart?: Date;
  viewEnd?: Date;
  dayWidth?: number; // pixels per day
  rowHeight?: number;
  showWeekends?: boolean;
  onTaskClick?: (task: GanttChartTask) => void;
  className?: string;
}

export interface FlatTask extends GanttChartTask {
  level: number;
  parentId?: string;
}

export interface DragState {
  x: number;
  taskStartDate: Date;
  taskEndDate: Date;
}

export interface ResizeState {
  id: string;
  side: 'left' | 'right';
}
