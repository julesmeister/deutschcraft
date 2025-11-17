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
  onAddTask?: () => void; // Add top-level task
  onAddSubTask?: (parentTaskId: string) => void; // Add subtask to a parent
  onDeleteTask?: (taskId: string) => void; // Delete a task
  onRenameTask?: (taskId: string, newName: string) => void; // Rename a task
  curriculumSuggestions?: string[]; // Optional autocomplete suggestions for curriculum items
  getTaskLevel?: (taskId: string) => string | null; // Function to get the level of a task's parent
  expandedTasks?: Set<string>; // Controlled expanded state
  onExpandedChange?: (expanded: Set<string>) => void; // Callback when expanded state changes
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
