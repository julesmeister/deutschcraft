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
  assignees?: string[]; // array of member IDs
}

export interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}

export interface TaskBoardProps {
  title?: string;
  groups: TaskGroup[];
  members?: TaskMember[];
  onAddTask?: (groupId: string, task: Omit<Task, 'id'>) => void;
  onToggleTask?: (groupId: string, taskId: string) => void;
  onDeleteTask?: (groupId: string, taskId: string) => void;
  onUpdateTask?: (groupId: string, taskId: string, updates: Partial<Task>) => void;
  onAddMember?: () => void;
  showMembers?: boolean;
  showAddTask?: boolean;
  maxVisibleMembers?: number;
  className?: string;
}
