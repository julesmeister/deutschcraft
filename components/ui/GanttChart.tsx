'use client';

import { useState } from 'react';

export interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  color?: string;
  children?: GanttTask[];
  dependencies?: string[]; // IDs of tasks this depends on
}

interface GanttChartProps {
  title?: string;
  tasks: GanttTask[];
  viewStart?: Date;
  viewEnd?: Date;
  dayWidth?: number; // pixels per day
  rowHeight?: number;
  showWeekends?: boolean;
  onTaskClick?: (task: GanttTask) => void;
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
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Calculate date range
  const allDates = tasks.flatMap(t => [t.startDate, t.endDate]);
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

  // Flatten tasks for rendering
  const flattenTasks = (taskList: GanttTask[], level = 0): Array<GanttTask & { level: number; parentId?: string }> => {
    const result: Array<GanttTask & { level: number; parentId?: string }> = [];
    taskList.forEach((task, index) => {
      result.push({ ...task, level, color: task.color || defaultColors[index % defaultColors.length] });
      if (task.children && task.children.length > 0 && expandedTasks.has(task.id)) {
        result.push(...flattenTasks(task.children, level + 1));
      }
    });
    return result;
  };

  const flatTasks = flattenTasks(tasks);
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

  const getTaskWidth = (task: GanttTask): number => {
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

  return (
    <div className={`bg-white border border-gray-200 ${className}`}>
      {title && (
        <div className="px-5 py-4">
          <h4 className="text-xl font-bold text-gray-900">{title}</h4>
        </div>
      )}

      <div className="mt-4 min-h-[470px] overflow-auto">
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
                    <div className="min-w-4">
                      {task.children && task.children.length > 0 && (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="text-lg cursor-pointer"
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
                      className={`truncate ${task.children && task.children.length > 0 ? 'font-bold text-gray-900' : ''}`}
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
            <svg width={totalWidth} height={totalHeight}>
              {/* Grid rows */}
              <g>
                {flatTasks.map((_, index) => (
                  <rect
                    key={index}
                    x="0"
                    y={index * rowHeight}
                    width={totalWidth}
                    height={rowHeight}
                    className="fill-transparent stroke-gray-200"
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
                    className="stroke-gray-200"
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

                  return (
                    <g
                      key={task.id}
                      onClick={() => onTaskClick?.(task)}
                      className="cursor-pointer"
                    >
                      {/* Background bar */}
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={barHeight}
                        rx="6"
                        ry="6"
                        fill={task.color}
                        opacity="0.6"
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
                      />
                      {/* Task name */}
                      <text
                        x={x + width / 2}
                        y={y + barHeight / 2}
                        className="fill-white text-sm"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {task.name}
                      </text>
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
