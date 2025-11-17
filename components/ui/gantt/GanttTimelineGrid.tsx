'use client';

import React from 'react';
import { FlatTask, DragState, ResizeState } from './types';
import { dateToX, getTaskWidth, getDarkerColor } from './utils';

interface GanttTimelineGridProps {
  tasks: FlatTask[];
  days: Date[];
  dayWidth: number;
  rowHeight: number;
  totalWidth: number;
  totalHeight: number;
  draggingTask: string | null;
  resizingTask: ResizeState | null;
  onMouseDown: (e: React.MouseEvent, taskId: string, task: FlatTask, side?: 'left' | 'right') => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

export function GanttTimelineGrid({
  tasks,
  days,
  dayWidth,
  rowHeight,
  totalWidth,
  totalHeight,
  draggingTask,
  resizingTask,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: GanttTimelineGridProps) {
  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Grid rows */}
      <g>
        {tasks.map((_, index) => (
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
        {tasks.map((task, index) => {
          const x = dateToX(task.startDate, days, dayWidth);
          const width = getTaskWidth(task, days, dayWidth);
          const y = index * rowHeight + 10;
          const barHeight = 30;
          const progressWidth = (width * task.progress) / 100;

          const textColor = getDarkerColor(task.color);
          const isDragging = draggingTask === task.id;
          const isResizing = resizingTask?.id === task.id;

          return (
            <g key={task.id}>
              {/* Clip path for text */}
              <defs>
                <clipPath id={`clip-${task.id}`}>
                  <rect x={x + 10} y={y} width={Math.max(0, width - 20)} height={barHeight} rx="6" />
                </clipPath>
              </defs>

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
                onMouseDown={(e) => onMouseDown(e as any, task.id, task)}
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
                clipPath={`url(#clip-${task.id})`}
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
                onMouseDown={(e) => onMouseDown(e as any, task.id, task, 'left')}
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
                onMouseDown={(e) => onMouseDown(e as any, task.id, task, 'right')}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
