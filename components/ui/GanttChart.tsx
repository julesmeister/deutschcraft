'use client';

import { useState, useRef, useEffect } from 'react';
import { GanttChartProps, GanttChartTask, DragState, ResizeState } from './gantt/types';
import { GanttHeader } from './gantt/GanttHeader';
import { GanttTaskList } from './gantt/GanttTaskList';
import { GanttTimelineHeader } from './gantt/GanttTimelineHeader';
import { GanttTimelineGrid } from './gantt/GanttTimelineGrid';
import {
  getAllParentIds,
  flattenTasks,
  generateDaysArray,
  updateTaskDates,
} from './gantt/utils';

// Re-export types for backward compatibility
export type { GanttChartTask };

export function GanttChart({
  title = 'Schedule',
  tasks,
  viewStart,
  viewEnd,
  dayWidth = 65,
  rowHeight = 50,
  showWeekends = true,
  onTaskClick,
  onAddTask,
  onAddSubTask,
  onDeleteTask,
  className = '',
}: GanttChartProps) {
  // State management
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(() => getAllParentIds(tasks));
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [resizingTask, setResizingTask] = useState<ResizeState | null>(null);
  const [dragStart, setDragStart] = useState<DragState | null>(null);
  const [temporaryTasks, setTemporaryTasks] = useState<GanttChartTask[]>(tasks);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update temporary tasks when props change
  useEffect(() => {
    setTemporaryTasks(tasks);
  }, [tasks]);

  // Calculate date range
  const allDates = temporaryTasks.flatMap(t => [t.startDate, t.endDate]);
  const minDate = viewStart || new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = viewEnd || new Date(Math.max(...allDates.map(d => d.getTime())));

  // Generate days and calculate dimensions
  const days = generateDaysArray(minDate, maxDate, showWeekends);
  const totalWidth = days.length * dayWidth;

  // Flatten tasks for rendering
  const flatTasks = flattenTasks(temporaryTasks, expandedTasks);
  const totalHeight = flatTasks.length * rowHeight;

  // Event handlers
  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, taskId: string, task: any, side?: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    if (side) {
      setResizingTask({ id: taskId, side });
    } else {
      setDraggingTask(taskId);
    }
    setDragStart({
      x: e.clientX,
      taskStartDate: task.startDate,
      taskEndDate: task.endDate,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || (!draggingTask && !resizingTask)) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaDays = Math.round(deltaX / dayWidth);

    if (deltaDays === 0) return;

    const updatedTasks = updateTaskDates(
      temporaryTasks,
      draggingTask || resizingTask?.id || '',
      (task) => {
        const newTask = { ...task };

        if (draggingTask) {
          // Move entire task
          const newStartDate = new Date(dragStart.taskStartDate);
          newStartDate.setDate(newStartDate.getDate() + deltaDays);
          const newEndDate = new Date(dragStart.taskEndDate);
          newEndDate.setDate(newEndDate.getDate() + deltaDays);
          newTask.startDate = newStartDate;
          newTask.endDate = newEndDate;
        } else if (resizingTask) {
          // Resize task
          if (resizingTask.side === 'left') {
            const newStartDate = new Date(dragStart.taskStartDate);
            newStartDate.setDate(newStartDate.getDate() + deltaDays);
            if (newStartDate < task.endDate) {
              newTask.startDate = newStartDate;
            }
          } else {
            const newEndDate = new Date(dragStart.taskEndDate);
            newEndDate.setDate(newEndDate.getDate() + deltaDays);
            if (newEndDate > task.startDate) {
              newTask.endDate = newEndDate;
            }
          }
        }

        return newTask;
      }
    );

    setTemporaryTasks(updatedTasks);
  };

  const handleMouseUp = () => {
    setDraggingTask(null);
    setResizingTask(null);
    setDragStart(null);
  };

  // Check if currently dragging or resizing
  const isDraggingOrResizing = draggingTask !== null || resizingTask !== null;

  return (
    <div className={`bg-white border border-gray-200 ${className} ${isDraggingOrResizing ? 'select-none' : ''}`}>
      <GanttHeader
        title={title}
        onScrollLeft={handleScrollLeft}
        onScrollRight={handleScrollRight}
        onAddTask={onAddTask}
      />

      <div ref={scrollContainerRef} className="min-h-[470px] overflow-auto custom-scrollbar">
        <div className="flex">
          {/* Task names column */}
          <GanttTaskList
            tasks={flatTasks}
            expandedTasks={expandedTasks}
            rowHeight={rowHeight}
            onToggleExpand={toggleExpand}
            onAddTask={onAddSubTask}
            onDeleteTask={onDeleteTask}
          />

          {/* Timeline area */}
          <div className="overflow-x-auto flex-1">
            <GanttTimelineHeader
              days={days}
              dayWidth={dayWidth}
              totalWidth={totalWidth}
            />

            <GanttTimelineGrid
              tasks={flatTasks}
              days={days}
              dayWidth={dayWidth}
              rowHeight={rowHeight}
              totalWidth={totalWidth}
              totalHeight={totalHeight}
              draggingTask={draggingTask}
              resizingTask={resizingTask}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
