'use client';

import React from 'react';
import { Task } from './types';
import { statusColors, statusLabels, priorityColors, priorityLabels } from './constants';

interface TaskRowProps {
  task: Task;
  groupId: string;
  isHovered: boolean;
  isEditing: boolean;
  editingTitle: string;
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggleExpand: () => void;
  onToggleTask: () => void;
  onTitleClick: () => void;
  onTitleChange: (value: string) => void;
  onTitleBlur: () => void;
  onTitleKeyDown: (e: React.KeyboardEvent) => void;
  onDelete: () => void;
}

export function TaskRow({
  task,
  groupId,
  isHovered,
  isEditing,
  editingTitle,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onToggleExpand,
  onToggleTask,
  onTitleClick,
  onTitleChange,
  onTitleBlur,
  onTitleKeyDown,
  onDelete,
}: TaskRowProps) {
  return (
    <tr
      className="hover:bg-gray-50/30 transition-colors group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Expand Button */}
      <td className="w-[40px] px-6 py-4">
        <button
          onClick={onToggleExpand}
          className="text-gray-400 hover:text-gray-600 cursor-pointer pt-1 transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </td>

      {/* Checkbox */}
      <td className="w-[40px] px-6 py-4">
        <button
          onClick={onToggleTask}
          className="text-2xl cursor-pointer pt-1 hover:text-piku-purple-dark transition-colors"
        >
          {task.completed ? (
            <svg className="w-6 h-6 text-piku-purple-dark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" />
            </svg>
          )}
        </button>
      </td>

      {/* Title */}
      <td className="w-[500px] px-6 py-4">
        {isEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={onTitleBlur}
            onKeyDown={onTitleKeyDown}
            className="font-bold text-gray-900 w-full bg-transparent outline-none border-0 p-0"
            autoFocus
          />
        ) : (
          <span
            onClick={onTitleClick}
            className={`font-bold text-gray-900 cursor-text ${task.completed ? 'line-through opacity-50' : ''}`}
          >
            {task.title}
          </span>
        )}
      </td>

      {/* Status */}
      <td className="w-[150px] px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-100 whitespace-nowrap ${statusColors[task.status]}`}>
          {statusLabels[task.status]}
        </span>
      </td>

      {/* Priority */}
      <td className="w-[150px] px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-100 whitespace-nowrap ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
      </td>

      {/* Due Date */}
      <td className="w-[200px] px-6 py-4">
        <span className="font-semibold text-gray-900 text-sm">
          {task.dueDate}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <button
          onClick={onDelete}
          className={`inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white h-10 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          title="Delete task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete</span>
        </button>
      </td>
    </tr>
  );
}
