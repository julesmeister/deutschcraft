'use client';

import { FlatTask } from './types';

interface GanttTaskListProps {
  tasks: FlatTask[];
  expandedTasks: Set<string>;
  rowHeight: number;
  onToggleExpand: (taskId: string) => void;
}

export function GanttTaskList({
  tasks,
  expandedTasks,
  rowHeight,
  onToggleExpand,
}: GanttTaskListProps) {
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
            className="h-[50px] px-3 flex items-center border-b border-gray-200 min-w-[200px] max-w-[200px] overflow-hidden"
            style={{ height: `${rowHeight}px` }}
          >
            <div className="flex items-center gap-1 w-full">
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
          </div>
        ))}
      </div>
    </div>
  );
}
