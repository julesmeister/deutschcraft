/**
 * GanttViewSection Component
 * Gantt chart view for schedule page
 */

'use client';

import { GanttChart, GanttChartTask } from '@/components/ui/GanttChart';

interface GanttViewSectionProps {
  tasks: GanttChartTask[];
  curriculumSuggestions: string[];
  hasEditPermission: boolean;
  isTeacher: boolean;
  expandedBatches: Set<string>;
  onExpandedChange: (expanded: Set<string>) => void;
  onAddTask?: () => void;
  onAddSubTask?: (parentTaskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onRenameTask?: (taskId: string, newName: string) => void;
  onOpenPermissions?: () => void;
  getTaskLevel: (taskId: string) => string | null;
}

export function GanttViewSection({
  tasks,
  curriculumSuggestions,
  hasEditPermission,
  isTeacher,
  expandedBatches,
  onExpandedChange,
  onAddTask,
  onAddSubTask,
  onDeleteTask,
  onRenameTask,
  onOpenPermissions,
  getTaskLevel,
}: GanttViewSectionProps) {
  return (
    <GanttChart
      title="Schedule"
      tasks={tasks}
      onTaskClick={(task) => console.log('Task clicked:', task)}
      onAddTask={onAddTask}
      onAddSubTask={onAddSubTask}
      onDeleteTask={onDeleteTask}
      onRenameTask={onRenameTask}
      curriculumSuggestions={curriculumSuggestions}
      getTaskLevel={getTaskLevel}
      expandedTasks={expandedBatches}
      onExpandedChange={onExpandedChange}
      onOpenPermissions={onOpenPermissions}
      showPermissions={isTeacher}
    />
  );
}
