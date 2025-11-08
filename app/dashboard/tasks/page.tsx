'use client';

import { TaskBoard, TaskGroup, TaskMember } from '@/components/ui/TaskBoard';

export default function TasksPage() {
  const members: TaskMember[] = [
    {
      id: '1',
      name: 'Max Mustermann',
      avatar: 'https://ui-avatars.com/api/?name=Max+Mustermann&background=667eea&color=fff',
    },
    {
      id: '2',
      name: 'Anna Schmidt',
      avatar: 'https://ui-avatars.com/api/?name=Anna+Schmidt&background=06b6d4&color=fff',
    },
    {
      id: '3',
      name: 'Thomas Weber',
      avatar: 'https://ui-avatars.com/api/?name=Thomas+Weber&background=10b981&color=fff',
    },
    {
      id: '4',
      name: 'Sarah Fischer',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Fischer&background=f59e0b&color=fff',
    },
    {
      id: '5',
      name: 'Michael Becker',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Becker&background=8b5cf6&color=fff',
    },
    {
      id: '6',
      name: 'Laura Hoffmann',
      avatar: 'https://ui-avatars.com/api/?name=Laura+Hoffmann&background=ec4899&color=fff',
    },
    {
      id: '7',
      name: 'Felix Schneider',
      avatar: 'https://ui-avatars.com/api/?name=Felix+Schneider&background=14b8a6&color=fff',
    },
  ];

  const taskGroups: TaskGroup[] = [
    {
      id: 'bug-fix',
      title: 'Bug fix',
      tasks: [
        {
          id: '1',
          title: 'Unable to upload file',
          status: 'in-progress',
          priority: 'high',
          dueDate: 'August 05',
          completed: false,
        },
        {
          id: '2',
          title: 'Error in database query',
          status: 'completed',
          priority: 'medium',
          dueDate: 'July 15',
          completed: true,
        },
        {
          id: '3',
          title: 'Authentication problem',
          status: 'in-progress',
          priority: 'high',
          dueDate: 'September 20',
          completed: false,
        },
        {
          id: '4',
          title: 'Bug in search functionality',
          status: 'in-progress',
          priority: 'high',
          dueDate: 'September 05',
          completed: false,
        },
        {
          id: '5',
          title: 'Compatibility issue with Firefox',
          status: 'completed',
          priority: 'medium',
          dueDate: 'July 25',
          completed: true,
        },
      ],
    },
    {
      id: 'development',
      title: 'Development',
      tasks: [
        {
          id: '6',
          title: 'Performance optimization',
          status: 'pending',
          priority: 'medium',
          dueDate: 'August 30',
          completed: false,
        },
        {
          id: '7',
          title: 'Payment gateway integration',
          status: 'pending',
          priority: 'low',
          dueDate: 'October 15',
          completed: false,
        },
        {
          id: '8',
          title: 'Update user profile page layout',
          status: 'in-progress',
          priority: 'high',
          dueDate: 'August 10',
          completed: false,
        },
        {
          id: '9',
          title: 'Enhance security measures',
          status: 'pending',
          priority: 'medium',
          dueDate: 'August 20',
          completed: false,
        },
      ],
    },
    {
      id: 'ui-ux',
      title: 'UI/UX',
      tasks: [
        {
          id: '10',
          title: 'UI Layout Adjustment for Dashboard',
          status: 'in-progress',
          priority: 'high',
          dueDate: 'September 25',
          completed: false,
        },
        {
          id: '11',
          title: 'UX Improvement for Onboarding Process',
          status: 'pending',
          priority: 'medium',
          dueDate: 'August 15',
          completed: false,
        },
        {
          id: '12',
          title: 'UI Element Styling for Product Page',
          status: 'pending',
          priority: 'low',
          dueDate: 'October 05',
          completed: false,
        },
      ],
    },
    {
      id: 'planning',
      title: 'Planning',
      tasks: [
        {
          id: '13',
          title: 'Strategic Project Roadmap Planning',
          status: 'in-progress',
          priority: 'high',
          dueDate: 'September 30',
          completed: false,
        },
        {
          id: '14',
          title: 'Quarterly Resource Allocation Plan',
          status: 'pending',
          priority: 'medium',
          dueDate: 'August 20',
          completed: false,
        },
        {
          id: '15',
          title: 'Strategic Business Planning Session',
          status: 'pending',
          priority: 'low',
          dueDate: 'October 10',
          completed: false,
        },
      ],
    },
  ];

  const handleToggleTask = (groupId: string, taskId: string) => {
    console.log('Toggle task:', groupId, taskId);
  };

  const handleAddMember = () => {
    console.log('Add member clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-black text-gray-900">Tasks Board 📋</h1>
          <p className="text-gray-600 mt-1">Manage and track all your tasks</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <TaskBoard
          title="Tasks"
          groups={taskGroups}
          members={members}
          onToggleTask={handleToggleTask}
          onAddMember={handleAddMember}
          showMembers={true}
          showAddTask={true}
          maxVisibleMembers={4}
        />
      </div>
    </div>
  );
}
