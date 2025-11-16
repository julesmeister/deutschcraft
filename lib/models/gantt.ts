/**
 * Gantt Chart Task Model for Schedule/Project Management
 * Firestore collection: 'gantt_tasks'
 */

export interface GanttTask {
  // Primary Key
  taskId: string; // Auto-generated ID

  // Basic Info
  name: string;
  description?: string;

  // Dates
  startDate: number; // Timestamp
  endDate: number; // Timestamp

  // Progress & Status
  progress: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';

  // Visual
  color?: string; // RGB color string, e.g., 'rgb(251, 191, 36)'

  // Hierarchy
  parentTaskId?: string | null; // Reference to parent task
  orderIndex: number; // For sorting

  // Ownership
  assignedTo?: string[]; // Array of user emails
  createdBy: string; // User email

  // Metadata
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp

  // Dependencies
  dependencies?: string[]; // Array of task IDs this task depends on

  // Additional
  tags?: string[]; // For categorization
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface GanttTaskCreateInput {
  name: string;
  description?: string;
  startDate: number;
  endDate: number;
  progress?: number;
  status?: GanttTask['status'];
  color?: string;
  parentTaskId?: string | null;
  orderIndex: number;
  assignedTo?: string[];
  createdBy: string;
  dependencies?: string[];
  tags?: string[];
  priority?: GanttTask['priority'];
}

export interface GanttTaskUpdateInput {
  name?: string;
  description?: string;
  startDate?: number;
  endDate?: number;
  progress?: number;
  status?: GanttTask['status'];
  color?: string;
  parentTaskId?: string | null;
  orderIndex?: number;
  assignedTo?: string[];
  dependencies?: string[];
  tags?: string[];
  priority?: GanttTask['priority'];
}
