'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  curriculumSuggestions?: string[];
  getTaskLevel?: (taskId: string) => string | null; // Function to get the level of a task's parent
}

export function GanttTaskList({
  tasks,
  expandedTasks,
  rowHeight,
  onToggleExpand,
  onAddTask,
  onDeleteTask,
  onRenameTask,
  curriculumSuggestions = [],
  getTaskLevel,
}: GanttTaskListProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRename, setPendingRename] = useState<{ taskId: string; newName: string } | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0, width: 0 });
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [columnWidth, setColumnWidth] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(200);

  // Filter suggestions based on input and task level
  const filteredSuggestions = useMemo(() => {
    if (editingValue && curriculumSuggestions.length > 0 && editingTaskId) {
      // Get the parent task's level if available
      const taskLevel = getTaskLevel ? getTaskLevel(editingTaskId) : null;

      return curriculumSuggestions.filter(suggestion => {
        // Match by search input
        const matchesSearch = suggestion.toLowerCase().includes(editingValue.toLowerCase());

        // If we have a task level, only show suggestions for that level
        if (taskLevel && matchesSearch) {
          return suggestion.startsWith(taskLevel);
        }

        return matchesSearch;
      });
    }
    return [];
  }, [editingValue, curriculumSuggestions, editingTaskId, getTaskLevel]);

  // Update autocomplete visibility and position when filtered suggestions change
  useEffect(() => {
    if (filteredSuggestions.length > 0 && editingValue.length > 0 && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setAutocompletePosition({
        top: rect.bottom + 4, // 4px gap below the input
        left: rect.left,
        width: Math.max(rect.width, 300), // Minimum width of 300px
      });
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
    setSelectedSuggestionIndex(0);
  }, [filteredSuggestions, editingValue]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    if (showAutocomplete) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAutocomplete]);

  const handleStartEdit = (taskId: string, currentName: string) => {
    setEditingTaskId(taskId);
    setEditingValue(currentName);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingValue('');
    setShowAutocomplete(false);
  };

  const handleSaveEdit = (taskId: string) => {
    if (!editingValue.trim()) {
      handleCancelEdit();
      return;
    }

    // Show confirm dialog
    setPendingRename({ taskId, newName: editingValue.trim() });
    setShowConfirmDialog(true);
    setShowAutocomplete(false);
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

  const handleSelectSuggestion = (suggestion: string) => {
    setEditingValue(suggestion);
    setShowAutocomplete(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, taskId: string) => {
    if (showAutocomplete && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
        return;
      } else if (e.key === 'Escape') {
        setShowAutocomplete(false);
        return;
      }
    } else {
      if (e.key === 'Enter') {
        handleSaveEdit(taskId);
      } else if (e.key === 'Escape') {
        handleCancelEdit();
      }
    }
  };

  // Handle column resize
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidth;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX.current;
      const newWidth = Math.max(150, Math.min(600, resizeStartWidth.current + delta));
      setColumnWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="flex-shrink-0 border-r border-gray-200 relative" style={{ width: `${columnWidth}px` }}>
      {/* Header */}
      <div className="h-[50px] bg-slate-100 px-3 flex items-center text-sm font-medium text-gray-700">
        Name
      </div>

      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400 transition-colors z-10"
        onMouseDown={handleResizeStart}
        style={{ backgroundColor: isResizing ? 'rgb(96, 165, 250)' : 'transparent' }}
      />

      {/* Task rows */}
      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="h-[50px] px-3 flex items-center justify-between border-b border-t border-gray-200 overflow-hidden group hover:bg-gray-50"
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
                className={`flex items-center flex-1 min-w-0 relative`}
                style={{ paddingLeft: `${task.level * 12}px` }}
              >
                {editingTaskId === task.id ? (
                  <div className="flex items-center flex-1 min-w-0 gap-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, task.id)}
                      className={`flex-1 min-w-0 bg-transparent border-none outline-none ${task.children && task.children.length > 0 ? 'font-bold text-gray-900' : 'text-gray-900'}`}
                      autoFocus
                    />
                    <button
                      onClick={() => handleCancelEdit()}
                      className="p-0.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      title="Cancel"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="p-0.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors flex-shrink-0"
                      title="Save changes"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    className={`truncate cursor-text ${task.children && task.children.length > 0 ? 'font-bold text-gray-900' : ''}`}
                    onClick={() => onRenameTask && handleStartEdit(task.id, task.name)}
                  >
                    {task.name}
                  </div>
                )}
              </div>
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

      {/* Autocomplete dropdown - rendered as portal to avoid clipping */}
      {showAutocomplete && filteredSuggestions.length > 0 && typeof window !== 'undefined' && createPortal(
        <div
          ref={autocompleteRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto"
          style={{
            top: `${autocompletePosition.top}px`,
            left: `${autocompletePosition.left}px`,
            width: `${autocompletePosition.width}px`,
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                index === selectedSuggestionIndex ? 'bg-piku-cyan bg-opacity-20' : ''
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>,
        document.body
      )}

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
