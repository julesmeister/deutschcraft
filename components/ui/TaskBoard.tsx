'use client';

import { useState } from 'react';

export interface TaskMember {
  id: string;
  name: string;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed?: boolean;
}

export interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}

interface TaskBoardProps {
  title?: string;
  groups: TaskGroup[];
  members?: TaskMember[];
  onAddTask?: (groupId: string, task: Omit<Task, 'id'>) => void;
  onToggleTask?: (groupId: string, taskId: string) => void;
  onAddMember?: () => void;
  showMembers?: boolean;
  showAddTask?: boolean;
  maxVisibleMembers?: number;
  className?: string;
}

const statusColors = {
  'pending': 'bg-amber-200 text-gray-900',
  'in-progress': 'bg-sky-200 text-gray-900',
  'completed': 'bg-emerald-200 text-gray-900',
};

const priorityColors = {
  'low': 'bg-purple-200 text-gray-900',
  'medium': 'bg-orange-200 text-gray-900',
  'high': 'bg-red-200 text-gray-900',
};

const statusLabels = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
};

const priorityLabels = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
};

export function TaskBoard({
  title = 'Tasks',
  groups,
  members = [],
  onAddTask,
  onToggleTask,
  onAddMember,
  showMembers = true,
  showAddTask = true,
  maxVisibleMembers = 4,
  className = '',
}: TaskBoardProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const showNewTaskInput = (groupId: string) => {
    setNewTaskInputs(prev => ({ ...prev, [groupId]: true }));
  };

  const hideNewTaskInput = (groupId: string) => {
    setNewTaskInputs(prev => ({ ...prev, [groupId]: false }));
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
                          className="hover:bg-gray-50/30 transition-colors"
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
                            <span className={`font-bold text-gray-900 ${task.completed ? 'line-through opacity-50' : ''}`}>
                              {task.title}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="w-[150px] px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-100 ${statusColors[task.status]}`}>
                              {statusLabels[task.status]}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="w-[150px] px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-100 ${priorityColors[task.priority]}`}>
                              {priorityLabels[task.priority]}
                            </span>
                          </td>

                          {/* Due Date */}
                          <td className="w-[150px] px-6 py-4">
                            <span className="font-semibold text-gray-900 text-sm">
                              {task.dueDate}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-gray-400">-</td>
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
              {newTaskInputs[group.id] && (
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden transition-shadow duration-150">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="w-[66px]"></td>
                        <td className="w-[40px] px-6 py-4 text-2xl text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" />
                          </svg>
                        </td>
                        <td className="w-[500px] px-6 py-4">
                          <input
                            type="text"
                            className="outline-0 font-semibold w-full bg-transparent text-gray-900 placeholder-gray-400"
                            placeholder="Enter task name"
                            autoFocus
                          />
                        </td>
                        <td className="w-[150px] px-6 py-4">
                          <div className="flex items-center gap-1 cursor-pointer font-semibold text-gray-600 hover:text-gray-900">
                            <span>Status</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6l6 -6" />
                            </svg>
                          </div>
                        </td>
                        <td className="w-[150px] px-6 py-4">
                          <div className="flex items-center gap-1 cursor-pointer font-semibold text-gray-600 hover:text-gray-900">
                            <span>Priority</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6l6 -6" />
                            </svg>
                          </div>
                        </td>
                        <td className="w-[150px] px-6 py-4">
                          <div className="flex items-center gap-2 cursor-pointer relative font-semibold text-gray-600 hover:text-gray-900">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4M4 11h16M11 15h1M12 15v3" />
                            </svg>
                            <span>Due date</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 cursor-pointer font-semibold text-gray-600 hover:text-gray-900">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                              </svg>
                              <span>Assignee</span>
                            </div>
                            <button
                              onClick={() => hideNewTaskInput(group.id)}
                              className="inline-flex items-center bg-piku-purple-dark hover:bg-piku-purple-dark/90 text-white h-10 rounded-xl px-3 py-2 text-sm font-bold transition-colors"
                            >
                              Create
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
