'use client';

import React, { useState } from 'react';
import { ConfirmDialog } from '../Dialog';
import { TaskRow } from './TaskRow';
import { TaskDetailsRow } from './TaskDetailsRow';
import { NewTaskForm } from './NewTaskForm';
import { Task, TaskBoardProps } from './types';

export function TaskBoard({
  title = 'Tasks',
  groups,
  members = [],
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddMember,
  showMembers = true,
  showAddTask = true,
  showDelete = true,
  showExpandArrow = true,
  showStatus = true,
  showPriority = true,
  showDueDate = true,
  maxVisibleMembers = 4,
  className = '',
}: TaskBoardProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, boolean>>({});
  const [showDetailsForm, setShowDetailsForm] = useState<Record<string, boolean>>({});
  const [expandedTaskDetails, setExpandedTaskDetails] = useState<Record<string, boolean>>({});
  const [newTaskData, setNewTaskData] = useState<Record<string, {
    title: string;
    status: Task['status'];
    priority: Task['priority'];
    dueDate: string;
    assignees: string[];
    // Optional details
    instructions?: string;
    minWords?: number;
    maxWords?: number;
    minParagraphs?: number;
    maxParagraphs?: number;
    totalPoints?: number;
    tone?: 'formell' | 'informell' | 'sachlich' | 'persönlich' | 'offiziell';
    perspective?: 'first-person' | 'second-person' | 'third-person';
    requireIntroduction?: boolean;
    requireConclusion?: boolean;
    requireExamples?: boolean;
  }>>({});
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ groupId: string; taskId: string; taskTitle: string } | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const showNewTaskInput = (groupId: string) => {
    setNewTaskInputs(prev => ({ ...prev, [groupId]: true }));
    setNewTaskData(prev => ({
      ...prev,
      [groupId]: {
        title: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        assignees: [],
      }
    }));
  };

  const hideNewTaskInput = (groupId: string) => {
    setNewTaskInputs(prev => ({ ...prev, [groupId]: false }));
    setNewTaskData(prev => {
      const newData = { ...prev };
      delete newData[groupId];
      return newData;
    });
  };

  const updateNewTaskField = <K extends keyof typeof newTaskData[string]>(
    groupId: string,
    field: K,
    value: typeof newTaskData[string][K]
  ) => {
    setNewTaskData(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [field]: value,
      }
    }));
  };

  const handleCreateTask = (groupId: string) => {
    const taskData = newTaskData[groupId];
    if (taskData && taskData.title.trim()) {
      onAddTask?.(groupId, {
        ...taskData,
        completed: false,
      } as any);
      hideNewTaskInput(groupId);
    }
  };

  const handleDeleteClick = (groupId: string, taskId: string, taskTitle: string) => {
    setDeleteConfirm({ groupId, taskId, taskTitle });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      onDeleteTask?.(deleteConfirm.groupId, deleteConfirm.taskId);
      setDeleteConfirm(null);
    }
  };

  const handleTitleClick = (groupId: string, taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditingTitle(currentTitle);
  };

  const handleTitleBlur = (groupId: string, taskId: string) => {
    if (editingTitle.trim() && editingTitle !== '') {
      onUpdateTask?.(groupId, taskId, { title: editingTitle });
    }
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent, groupId: string, taskId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur(groupId, taskId);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
      setEditingTitle('');
    }
  };

  const visibleMembers = members.slice(0, maxVisibleMembers);
  const extraMembersCount = Math.max(0, members.length - maxVisibleMembers);

  return (
    <div className={`bg-white border border-gray-200 ${className}`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>

          {showMembers && members.length > 0 && (
            <div className="flex items-center gap-2">
              {/* Avatar Group */}
              <div className="flex items-center">
                {visibleMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="inline-block"
                    style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                    title={member.name}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform"
                    />
                  </div>
                ))}

                {extraMembersCount > 0 && (
                  <div
                    className="inline-block w-8 h-8 rounded-full border-2 border-white bg-gray-400 text-white flex items-center justify-center text-xs font-semibold cursor-pointer hover:scale-110 transition-transform"
                    style={{ marginLeft: '-8px' }}
                    title={`${extraMembersCount} more members`}
                  >
                    +{extraMembersCount}
                  </div>
                )}
              </div>

              {onAddMember && (
                <button
                  onClick={onAddMember}
                  className="inline-flex items-center gap-1 bg-white border border-gray-300 hover:border-piku-purple-dark hover:ring-1 hover:ring-piku-purple-dark hover:text-piku-purple-dark text-gray-600 h-10 rounded-xl px-3 py-2 text-sm font-bold transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                  Add members
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Groups */}
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <div key={group.id} id={group.id} className="scroll-mt-32">
              {/* Group Header */}
              <div className="flex items-center gap-2 mb-4">
                {showExpandArrow && (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="text-lg cursor-pointer text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                )}
                {group.color && (
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                )}
                <h4 className="text-xl font-bold text-gray-900">{group.title}</h4>
              </div>

              {/* Tasks Table */}
              {!expandedGroups[group.id] && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <tbody className="divide-y divide-gray-200">
                      {group.tasks.map((task) => (
                        <React.Fragment key={task.id}>
                          <TaskRow
                            task={task}
                            groupId={group.id}
                            isHovered={hoveredTaskId === task.id}
                            isEditing={editingTaskId === task.id}
                            editingTitle={editingTitle}
                            isExpanded={expandedTaskDetails[task.id]}
                            showDelete={showDelete}
                            showExpandArrow={showExpandArrow}
                            showStatus={showStatus}
                            showPriority={showPriority}
                            showDueDate={showDueDate}
                            onMouseEnter={() => setHoveredTaskId(task.id)}
                            onMouseLeave={() => setHoveredTaskId(null)}
                            onToggleExpand={() => setExpandedTaskDetails(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                            onToggleTask={() => onToggleTask?.(group.id, task.id)}
                            onTitleClick={() => handleTitleClick(group.id, task.id, task.title)}
                            onTitleChange={setEditingTitle}
                            onTitleBlur={() => handleTitleBlur(group.id, task.id)}
                            onTitleKeyDown={(e) => handleTitleKeyDown(e, group.id, task.id)}
                            onDelete={() => handleDeleteClick(group.id, task.id, task.title)}
                          />
                          {expandedTaskDetails[task.id] && <TaskDetailsRow task={task as any} />}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add Task Button */}
              {showAddTask && !newTaskInputs[group.id] && (
                <div className="mt-4">
                  <button
                    onClick={() => showNewTaskInput(group.id)}
                    className="w-full inline-flex items-center justify-center gap-1 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-piku-purple-dark hover:ring-1 hover:ring-transparent hover:text-piku-purple-dark text-gray-600 h-12 rounded-xl px-5 py-2 font-bold transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                    Add task
                  </button>
                </div>
              )}

              {/* New Task Input Form */}
              {newTaskInputs[group.id] && newTaskData[group.id] && (
                <NewTaskForm
                  groupId={group.id}
                  taskData={newTaskData[group.id]}
                  showDetailsForm={showDetailsForm[group.id] || false}
                  onUpdateField={(field, value) => updateNewTaskField(group.id, field as any, value)}
                  onToggleDetails={() => setShowDetailsForm(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                  onCancel={() => hideNewTaskInput(group.id)}
                  onCreate={() => handleCreateTask(group.id)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirm?.taskTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
