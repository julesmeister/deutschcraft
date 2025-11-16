'use client';

import { useState, useRef, useEffect } from 'react';

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

interface GanttChartProps {
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

const defaultColors = [
  'rgb(251, 191, 36)', // yellow
  'rgb(253, 186, 116)', // orange
  'rgb(110, 231, 183)', // mint
  'rgb(125, 211, 252)', // cyan
  'rgb(167, 139, 250)', // purple
  'rgb(251, 113, 133)', // pink
];

// Helper function to get all task IDs that have children (for default expansion)
const getAllParentIds = (tasks: GanttChartTask[]): Set<string> => {
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

export function GanttChart({
  title = 'Schedule',
  tasks,
  viewStart,
  viewEnd,
  dayWidth = 65,
  rowHeight = 50,
  showWeekends = true,
  onTaskClick,
  className = '',
}: GanttChartProps) {
  // Expand all tasks by default
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(() => getAllParentIds(tasks));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [resizingTask, setResizingTask] = useState<{ id: string; side: 'left' | 'right' } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; taskStartDate: Date; taskEndDate: Date } | null>(null);
  const [temporaryTasks, setTemporaryTasks] = useState<GanttChartTask[]>(tasks);

  // Update temporary tasks when props change
  useEffect(() => {
    setTemporaryTasks(tasks);
  }, [tasks]);

  // Calculate date range using temporary tasks
  const allDates = temporaryTasks.flatMap(t => [t.startDate, t.endDate]);
  const minDate = viewStart || new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = viewEnd || new Date(Math.max(...allDates.map(d => d.getTime())));

  // Generate days array
  const days: Date[] = [];
  const currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    if (showWeekends || (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)) {
      days.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalWidth = days.length * dayWidth;

  // Flatten tasks for rendering using temporary tasks
  const flattenTasks = (taskList: GanttChartTask[], level = 0): Array<GanttChartTask & { level: number; parentId?: string }> => {
    const result: Array<GanttChartTask & { level: number; parentId?: string }> = [];
    taskList.forEach((task, index) => {
      result.push({ ...task, level, color: task.color || defaultColors[index % defaultColors.length] });
      if (task.children && task.children.length > 0 && expandedTasks.has(task.id)) {
        result.push(...flattenTasks(task.children, level + 1));
      }
    });
    return result;
  };

  const flatTasks = flattenTasks(temporaryTasks);
  const totalHeight = flatTasks.length * rowHeight;

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const dateToX = (date: Date): number => {
    const dayIndex = days.findIndex(d => d.toDateString() === date.toDateString());
    return dayIndex >= 0 ? dayIndex * dayWidth : 0;
  };

  const getTaskWidth = (task: GanttChartTask): number => {
    const start = dateToX(task.startDate);
    const end = dateToX(task.endDate);
    return Math.max(end - start + dayWidth, dayWidth);
  };

  const formatDate = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]}, ${date.getDate()}`;
  };

  const getMonthLabel = (date: Date): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()];
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

    const updateTaskDates = (taskList: GanttChartTask[]): GanttChartTask[] => {
      return taskList.map(task => {
        if (task.id === (draggingTask || resizingTask?.id)) {
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
              // Don't allow start date to be after end date
              if (newStartDate < task.endDate) {
                newTask.startDate = newStartDate;
              }
            } else {
              const newEndDate = new Date(dragStart.taskEndDate);
              newEndDate.setDate(newEndDate.getDate() + deltaDays);
              // Don't allow end date to be before start date
              if (newEndDate > task.startDate) {
                newTask.endDate = newEndDate;
              }
            }
          }

          return newTask;
        }

        if (task.children) {
          return { ...task, children: updateTaskDates(task.children) };
        }

        return task;
      });
    };

    setTemporaryTasks(updateTaskDates(temporaryTasks));
  };

  const handleMouseUp = () => {
    setDraggingTask(null);
    setResizingTask(null);
    setDragStart(null);
  };

  return (
    <div className={`bg-white border border-gray-200 ${className}`}>
      {title && (
        <div className="px-5 py-4 flex items-center justify-between">
          <h4 className="text-xl font-bold text-gray-900">{title}</h4>
          <div className="flex gap-2">
            <button
              onClick={handleScrollLeft}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleScrollRight}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div ref={scrollContainerRef} className="mt-4 min-h-[470px] overflow-auto custom-scrollbar">
        <div className="flex">
          {/* Task names column */}
          <div className="flex-shrink-0 border-r border-gray-200">
            <div className="h-[50px] bg-slate-100 px-3 flex items-center text-sm font-medium text-gray-700 min-w-[200px]">
              Name
            </div>
            <div>
              {flatTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="h-[50px] px-3 flex items-center border-b border-gray-200 min-w-[200px] max-w-[200px] overflow-hidden"
                >
                  <div className="flex items-center gap-1 w-full">
                    <div className="min-w-4 flex items-center">
                      {task.children && task.children.length > 0 && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="text-lg cursor-pointer flex items-center justify-center"
                        >
                          <svg
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            height="1em"
                            width="1em"
                            className={`transition-transform ${expandedTasks.has(task.id) ? 'rotate-0' : '-rotate-90'}`}
                          >
                            <path d="M6 9l6 6l6 -6"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                    <div
                      className={`truncate flex items-center ${task.children && task.children.length > 0 ? 'font-bold text-gray-900' : ''}`}
                      style={{ paddingLeft: `${task.level * 12}px` }}
                    >
                      {task.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline area */}
          <div className="overflow-x-auto flex-1">
            <svg
              width={totalWidth}
              height={50}
              className="border-b border-gray-200"
            >
              <rect x="0" y="0" width={totalWidth} height="50" className="fill-slate-100" />
              {days.map((day, index) => {
                const x = index * dayWidth;
                const isFirstOfMonth = day.getDate() === 1;
                return (
                  <g key={day.toISOString()}>
                    {isFirstOfMonth && (
                      <>
                        <line x1={x} y1="0" x2={x} y2="25" className="stroke-gray-200" strokeWidth="1" />
                        <text
                          y="22.5"
                          x={x + (dayWidth / 2)}
                          className="fill-gray-400 text-[10px] font-bold"
                          textAnchor="middle"
                        >
                          {getMonthLabel(day)}
                        </text>
                      </>
                    )}
                    <text
                      y="40"
                      x={x + (dayWidth / 2)}
                      className="fill-gray-500 text-sm font-semibold"
                      textAnchor="middle"
                    >
                      {formatDate(day)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Grid and bars */}
            <svg
              width={totalWidth}
              height={totalHeight}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid rows */}
              <g>
                {flatTasks.map((_, index) => (
                  <rect
                    key={index}
                    x="0"
                    y={index * rowHeight}
                    width={totalWidth}
                    height={rowHeight}
                    className="fill-transparent stroke-gray-100"
                    strokeWidth="1"
                  />
                ))}
              </g>

              {/* Vertical grid lines */}
              <g>
                {days.map((_, index) => (
                  <line
                    key={index}
                    x1={index * dayWidth}
                    y1="0"
                    x2={index * dayWidth}
                    y2={totalHeight}
                    className="stroke-gray-100"
                    strokeWidth="1"
                  />
                ))}
              </g>

              {/* Task bars */}
              <g>
                {flatTasks.map((task, index) => {
                  const x = dateToX(task.startDate);
                  const width = getTaskWidth(task);
                  const y = index * rowHeight + 10;
                  const barHeight = 30;
                  const progressWidth = (width * task.progress) / 100;

                  // Convert RGB color to darker version for text
                  const getDarkerColor = (rgbColor: string | undefined) => {
                    if (!rgbColor) return 'rgb(50, 50, 50)';
                    const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    if (!match) return 'rgb(50, 50, 50)';
                    const r = Math.floor(parseInt(match[1]) * 0.7);
                    const g = Math.floor(parseInt(match[2]) * 0.7);
                    const b = Math.floor(parseInt(match[3]) * 0.7);
                    return `rgb(${r}, ${g}, ${b})`;
                  };

                  const textColor = getDarkerColor(task.color);

                  const isDragging = draggingTask === task.id;
                  const isResizing = resizingTask?.id === task.id;

                  return (
                    <g key={task.id}>
                      {/* Background bar */}
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={barHeight}
                        rx="6"
                        ry="6"
                        fill={task.color}
                        opacity="0.85"
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        onMouseDown={(e) => handleMouseDown(e as any, task.id, task)}
                      />
                      {/* Progress bar */}
                      <rect
                        x={x}
                        y={y}
                        width={progressWidth}
                        height={barHeight}
                        rx="6"
                        ry="6"
                        fill="rgba(255, 255, 255, 0.3)"
                        style={{ pointerEvents: 'none' }}
                      />
                      {/* Task name */}
                      <text
                        x={x + width / 2}
                        y={y + barHeight / 2}
                        fill={textColor}
                        className="text-sm font-medium"
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{ pointerEvents: 'none' }}
                      >
                        {task.name}
                      </text>

                      {/* Left resize handle */}
                      <rect
                        x={x}
                        y={y}
                        width={8}
                        height={barHeight}
                        rx="6"
                        fill={textColor}
                        opacity="0.7"
                        style={{ cursor: 'ew-resize' }}
                        onMouseDown={(e) => handleMouseDown(e as any, task.id, task, 'left')}
                      />

                      {/* Right resize handle */}
                      <rect
                        x={x + width - 8}
                        y={y}
                        width={8}
                        height={barHeight}
                        rx="6"
                        fill={textColor}
                        opacity="0.7"
                        style={{ cursor: 'ew-resize' }}
                        onMouseDown={(e) => handleMouseDown(e as any, task.id, task, 'right')}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
