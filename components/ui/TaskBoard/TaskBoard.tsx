'use client';

import { useState } from 'react';
import { ConfirmDialog } from '../Dialog';
import { Dropdown } from './Dropdown';
import { DatePicker } from './DatePicker';
import { AssigneeSelector } from './AssigneeSelector';
import { Select } from '../Select';
import { Task, TaskBoardProps } from './types';
import { statusColors, statusLabels, priorityColors, priorityLabels, statusOptions, priorityOptions } from './constants';

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
  maxVisibleMembers = 4,
  className = '',
}: TaskBoardProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, boolean>>({});
  const [showDetailsForm, setShowDetailsForm] = useState<Record<string, boolean>>({});
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
        title: taskData.title,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        assignees: taskData.assignees,
        completed: false,
      });
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
            <div key={group.id}>
              {/* Group Header */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="text-lg cursor-pointer text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
                <h4 className="text-xl font-bold text-gray-900">{group.title}</h4>
              </div>

              {/* Tasks Table */}
              {!expandedGroups[group.id] && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <tbody className="divide-y divide-gray-200">
                      {group.tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="hover:bg-gray-50/30 transition-colors group"
                          onMouseEnter={() => setHoveredTaskId(task.id)}
                          onMouseLeave={() => setHoveredTaskId(null)}
                        >
                          {/* Drag Handle */}
                          <td className="w-[40px] px-6 py-4 text-lg text-gray-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M0 0h24v24H0V0z" fill="none" />
                              <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </td>

                          {/* Checkbox */}
                          <td className="w-[40px] px-6 py-4">
                            <button
                              onClick={() => onToggleTask?.(group.id, task.id)}
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
                            {editingTaskId === task.id ? (
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={() => handleTitleBlur(group.id, task.id)}
                                onKeyDown={(e) => handleTitleKeyDown(e, group.id, task.id)}
                                className="font-bold text-gray-900 w-full bg-transparent outline-none border-0 p-0"
                                autoFocus
                              />
                            ) : (
                              <span
                                onClick={() => handleTitleClick(group.id, task.id, task.title)}
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
                              onClick={() => handleDeleteClick(group.id, task.id, task.title)}
                              className={`inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white h-10 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                                hoveredTaskId === task.id ? 'opacity-100' : 'opacity-0'
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
                <div className="mt-4 border border-gray-200 rounded-lg transition-shadow duration-150">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        {/* Drag Handle Space */}
                        <td className="w-[40px] px-6 py-4"></td>

                        {/* Checkbox Space */}
                        <td className="w-[40px] px-6 py-4 text-2xl text-gray-400 overflow-visible">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" />
                          </svg>
                        </td>

                        {/* Title */}
                        <td className="w-[500px] px-6 py-4 overflow-visible">
                          <input
                            type="text"
                            className="outline-0 font-semibold w-full bg-transparent text-gray-900 placeholder-gray-400"
                            placeholder="Enter task name"
                            value={newTaskData[group.id].title}
                            onChange={(e) => updateNewTaskField(group.id, 'title', e.target.value)}
                            autoFocus
                          />
                        </td>

                        {/* Status */}
                        <td className="w-[150px] px-6 py-4 overflow-visible relative">
                          <Dropdown
                            value={newTaskData[group.id].status}
                            options={statusOptions}
                            onChange={(value) => updateNewTaskField(group.id, 'status', value as Task['status'])}
                            placeholder="Status"
                          />
                        </td>

                        {/* Priority */}
                        <td className="w-[150px] px-6 py-4 overflow-visible relative">
                          <Dropdown
                            value={newTaskData[group.id].priority}
                            options={priorityOptions}
                            onChange={(value) => updateNewTaskField(group.id, 'priority', value as Task['priority'])}
                            placeholder="Priority"
                          />
                        </td>

                        {/* Due Date */}
                        <td className="w-[200px] px-6 py-4 overflow-visible relative">
                          <DatePicker
                            value={newTaskData[group.id].dueDate}
                            onChange={(date) => updateNewTaskField(group.id, 'dueDate', date)}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 overflow-visible relative">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setShowDetailsForm(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                              className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 rounded-xl px-3 py-2 text-sm font-bold transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                              </svg>
                              Details
                            </button>
                            <button
                              onClick={() => hideNewTaskInput(group.id)}
                              className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 rounded-xl px-3 py-2 text-sm font-bold transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleCreateTask(group.id)}
                              className="inline-flex items-center bg-piku-purple-dark hover:bg-piku-purple-dark/90 text-white h-10 rounded-xl px-3 py-2 text-sm font-bold transition-colors"
                            >
                              Create
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Expandable Details Section */}
                  {showDetailsForm[group.id] && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <h4 className="font-bold text-gray-900 mb-4">Writing Criteria (Optional)</h4>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {/* Instructions */}
                        <div className="col-span-3">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Instructions</label>
                          <textarea
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-piku-purple-dark focus:ring-1 focus:ring-piku-purple-dark"
                            placeholder="Detailed instructions for the student..."
                            rows={3}
                            value={newTaskData[group.id].instructions || ''}
                            onChange={(e) => updateNewTaskField(group.id, 'instructions', e.target.value)}
                          />
                        </div>

                        {/* Word Count */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Min Words</label>
                          <input
                            type="number"
                            className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-piku-purple-dark focus:ring-2 focus:ring-piku-purple-dark focus:bg-white transition-all"
                            placeholder="e.g. 100"
                            value={newTaskData[group.id].minWords || ''}
                            onChange={(e) => updateNewTaskField(group.id, 'minWords', parseInt(e.target.value) || undefined)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Max Words</label>
                          <input
                            type="number"
                            className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-piku-purple-dark focus:ring-2 focus:ring-piku-purple-dark focus:bg-white transition-all"
                            placeholder="e.g. 500"
                            value={newTaskData[group.id].maxWords || ''}
                            onChange={(e) => updateNewTaskField(group.id, 'maxWords', parseInt(e.target.value) || undefined)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Total Points</label>
                          <input
                            type="number"
                            className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-piku-purple-dark focus:ring-2 focus:ring-piku-purple-dark focus:bg-white transition-all"
                            placeholder="e.g. 100"
                            value={newTaskData[group.id].totalPoints || ''}
                            onChange={(e) => updateNewTaskField(group.id, 'totalPoints', parseInt(e.target.value) || undefined)}
                          />
                        </div>

                        {/* Paragraph Count */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Min Paragraphs</label>
                          <input
                            type="number"
                            className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-piku-purple-dark focus:ring-2 focus:ring-piku-purple-dark focus:bg-white transition-all"
                            placeholder="e.g. 3"
                            value={newTaskData[group.id].minParagraphs || ''}
                            onChange={(e) => updateNewTaskField(group.id, 'minParagraphs', parseInt(e.target.value) || undefined)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Max Paragraphs</label>
                          <input
                            type="number"
                            className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-piku-purple-dark focus:ring-2 focus:ring-piku-purple-dark focus:bg-white transition-all"
                            placeholder="e.g. 5"
                            value={newTaskData[group.id].maxParagraphs || ''}
                            onChange={(e) => updateNewTaskField(group.id, 'maxParagraphs', parseInt(e.target.value) || undefined)}
                          />
                        </div>

                        {/* Tone */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Schreibstil (Tone)</label>
                          <Select
                            options={[
                              { value: '', label: 'Any' },
                              { value: 'formell', label: 'Formell (Formal - Sie)' },
                              { value: 'informell', label: 'Informell (Informal - du)' },
                              { value: 'sachlich', label: 'Sachlich (Objective)' },
                              { value: 'persönlich', label: 'Persönlich (Personal)' },
                              { value: 'offiziell', label: 'Offiziell (Official)' },
                            ]}
                            value={newTaskData[group.id].tone || ''}
                            onChange={(value) => updateNewTaskField(group.id, 'tone', value as any)}
                            placeholder="Select tone..."
                          />
                        </div>

                        {/* Perspective */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Perspective</label>
                          <Select
                            options={[
                              { value: '', label: 'Any' },
                              { value: 'first-person', label: 'First Person (I/We - Ich/Wir)' },
                              { value: 'second-person', label: 'Second Person (You - Du/Sie)' },
                              { value: 'third-person', label: 'Third Person (He/She - Er/Sie)' },
                            ]}
                            value={newTaskData[group.id].perspective || ''}
                            onChange={(value) => updateNewTaskField(group.id, 'perspective', value as any)}
                            placeholder="Select perspective..."
                          />
                        </div>
                      </div>

                      {/* Checkboxes for structure requirements */}
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-piku-purple-dark focus:ring-piku-purple-dark"
                            checked={newTaskData[group.id].requireIntroduction || false}
                            onChange={(e) => updateNewTaskField(group.id, 'requireIntroduction', e.target.checked)}
                          />
                          <span className="text-sm font-medium text-gray-700">Require Introduction</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-piku-purple-dark focus:ring-piku-purple-dark"
                            checked={newTaskData[group.id].requireConclusion || false}
                            onChange={(e) => updateNewTaskField(group.id, 'requireConclusion', e.target.checked)}
                          />
                          <span className="text-sm font-medium text-gray-700">Require Conclusion</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-piku-purple-dark focus:ring-piku-purple-dark"
                            checked={newTaskData[group.id].requireExamples || false}
                            onChange={(e) => updateNewTaskField(group.id, 'requireExamples', e.target.checked)}
                          />
                          <span className="text-sm font-medium text-gray-700">Require Examples</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
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
