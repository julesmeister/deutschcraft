import { Task } from './types';

export const statusColors = {
  'pending': 'bg-amber-200 text-gray-900',
  'in-progress': 'bg-sky-200 text-gray-900',
  'completed': 'bg-emerald-200 text-gray-900',
};

export const priorityColors = {
  'low': 'bg-purple-200 text-gray-900',
  'medium': 'bg-orange-200 text-gray-900',
  'high': 'bg-red-200 text-gray-900',
};

export const statusLabels = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
};

export const priorityLabels = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
};

export const statusOptions = [
  { value: 'pending', label: 'Pending', color: statusColors['pending'] },
  { value: 'in-progress', label: 'In Progress', color: statusColors['in-progress'] },
  { value: 'completed', label: 'Completed', color: statusColors['completed'] },
];

export const priorityOptions = [
  { value: 'low', label: 'Low', color: priorityColors['low'] },
  { value: 'medium', label: 'Medium', color: priorityColors['medium'] },
  { value: 'high', label: 'High', color: priorityColors['high'] },
];
