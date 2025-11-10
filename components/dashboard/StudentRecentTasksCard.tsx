import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';

interface Task {
  taskId: string;
  title: string;
  status: string;
  category: string;
  level: string;
  dueDate: number;
  createdAt?: number;
}

interface StudentRecentTasksCardProps {
  tasks: Task[];
  isLoading: boolean;
}

export function StudentRecentTasksCard({ tasks, isLoading }: StudentRecentTasksCardProps) {
  // Helper function to format timestamp
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Helper function to get status icon and color
  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: <span className="text-white text-xs">✓</span>, color: 'bg-emerald-500' };
      case 'assigned':
        return { icon: <span className="text-white text-xs">📝</span>, color: 'bg-amber-500' };
      case 'draft':
        return { icon: <span className="text-white text-xs">📖</span>, color: 'bg-violet-500' };
      default:
        return { icon: <span className="text-white text-xs">📄</span>, color: 'bg-gray-500' };
    }
  };

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      essay: 'blue',
      letter: 'green',
      email: 'green',
      story: 'pink',
      article: 'pink',
      report: 'amber',
      review: 'amber',
      other: 'gray',
    };
    return categoryColors[category] || 'gray';
  };

  // Helper function to format due date
  const getDueInfo = (dueDate: number, status: string) => {
    if (status === 'completed') return 'Completed';

    const now = Date.now();
    const diff = dueDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  // Convert tasks to ActivityItem format
  const activities: ActivityItem[] = tasks.map(task => {
    const { icon, color } = getTaskIcon(task.status);
    return {
      id: task.taskId,
      icon,
      iconColor: color,
      title: task.title,
      description: getDueInfo(task.dueDate, task.status),
      timestamp: formatTimeAgo(task.createdAt || Date.now()),
      tags: [
        { label: task.category.charAt(0).toUpperCase() + task.category.slice(1), color: getCategoryColor(task.category) },
        { label: task.level, color: 'purple' },
      ],
    };
  });

  return (
    <div className="bg-white border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <p className="text-violet-600 text-lg font-bold uppercase">Recent Tasks</p>
        <p className="text-sm text-gray-500 mt-1">Your latest writing assignments</p>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
          </div>
        ) : activities.length > 0 ? (
          <ActivityTimeline items={activities} showConnector={true} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No tasks assigned yet</p>
            <p className="text-gray-400 text-xs mt-1">Check back later for new assignments</p>
          </div>
        )}
      </div>
      <div className="px-6 pb-6">
        <button
          onClick={() => window.location.href = '/dashboard/tasks'}
          className="w-full border border-gray-900 py-2 text-sm font-bold uppercase hover:bg-gray-900 hover:text-white transition"
        >
          View All Tasks →
        </button>
      </div>
    </div>
  );
}
