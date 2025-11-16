'use client';

import { useState } from 'react';
import { FlatTask } from './types';
import { ConfirmDialog } from '@/components/ui/Dialog';

interface GanttTaskListProps {
  tasks: FlatTask[];
  expandedTasks: Set<string>;
  rowHeight: number;
  onToggleExpand: (taskId: string) => void;
  onAddTask?: (parentTaskId?: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onRenameTask?: (taskId: string, newName: string) => void;
}

export function GanttTaskList({
  tasks,
  expandedTasks,
  rowHeight,
  onToggleExpand,
  onAddTask,
  onDeleteTask,
  onRenameTask,
}: GanttTaskListProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRename, setPendingRename] = useState<{ taskId: string; newName: string } | null>(null);

  const handleStartEdit = (taskId: string, currentName: string) => {
    setEditingTaskId(taskId);
    setEditingValue(currentName);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingValue('');
  };

  const handleSaveEdit = (taskId: string) => {
    if (!editingValue.trim()) {
      handleCancelEdit();
      return;
    }

    // Show confirm dialog
    setPendingRename({ taskId, newName: editingValue.trim() });
    setShowConfirmDialog(true);
  };

  const handleConfirmRename = () => {
    if (pendingRename && onRenameTask) {
      onRenameTask(pendingRename.taskId, pendingRename.newName);
    }
    setShowConfirmDialog(false);
    setPendingRename(null);
    setEditingTaskId(null);
    setEditingValue('');
  };

  const handleCancelRename = () => {
    setShowConfirmDialog(false);
    setPendingRename(null);
  };
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
              {editingTaskId === task.id ? (
                <div
                  className="flex items-center gap-1 flex-1"
                  style={{ paddingLeft: `${task.level * 12}px` }}
                >
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(task.id);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    className={`flex-1 bg-transparent border-none outline-none ${task.children && task.children.length > 0 ? 'font-bold text-gray-900' : ''}`}
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(task.id)}
                    className="p-0.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Save changes"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  className={`truncate flex items-center cursor-text ${task.children && task.children.length > 0 ? 'font-bold text-gray-900' : ''}`}
                  style={{ paddingLeft: `${task.level * 12}px` }}
                  onClick={() => onRenameTask && handleStartEdit(task.id, task.name)}
                >
                  {task.name}
                </div>
              )}
            </div>

            {/* Hover actions */}
            {hoveredTaskId === task.id && editingTaskId !== task.id && (onAddTask || onDeleteTask) && (
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

      {/* Confirm rename dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={handleCancelRename}
        onConfirm={handleConfirmRename}
        title="Rename Task"
        message={`Are you sure you want to rename this task to "${pendingRename?.newName}"?`}
        confirmText="Rename"
        cancelText="Cancel"
        variant="primary"
      />
    </div>
  );
}
