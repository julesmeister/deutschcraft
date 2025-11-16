'use client';

import { useState } from 'react';
import { FlatTask } from './types';

interface GanttTaskListProps {
  tasks: FlatTask[];
  expandedTasks: Set<string>;
  rowHeight: number;
  onToggleExpand: (taskId: string) => void;
  onAddTask?: (parentTaskId?: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function GanttTaskList({
  tasks,
  expandedTasks,
  rowHeight,
  onToggleExpand,
  onAddTask,
  onDeleteTask,
}: GanttTaskListProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  return (
    <div className="flex-shrink-0 border-r border-gray-200">
      {/* Header */}
      <div className="h-[50px] bg-slate-100 px-3 flex items-center text-sm font-medium text-gray-700 min-w-[200px]">
        Name
      </div>

      {/* Task rows */}
      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="h-[50px] px-3 flex items-center justify-between border-b border-gray-200 min-w-[200px] max-w-[200px] overflow-hidden group hover:bg-gray-50 transition-colors"
            style={{ height: `${rowHeight}px` }}
            onMouseEnter={() => setHoveredTaskId(task.id)}
            onMouseLeave={() => setHoveredTaskId(null)}
          >
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className="min-w-4 flex items-center">
                {task.children && task.children.length > 0 && (
                  <button
                    onClick={() => onToggleExpand(task.id)}
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

            {/* Hover actions */}
            {hoveredTaskId === task.id && (onAddTask || onDeleteTask) && (
              <div className="flex items-center gap-0.5 ml-1">
                {onAddTask && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddTask(task.id);
                    }}
                    className="p-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Add subtask"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
                {onDeleteTask && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="p-0.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete task"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
