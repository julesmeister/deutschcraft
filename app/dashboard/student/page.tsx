'use client';

import dynamic from 'next/dynamic';
import { useAnimatedCounter } from '@/lib/hooks/useAnimatedCounter';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { useWeeklyProgress } from '@/lib/hooks/useWeeklyProgress';
import { usePracticeStats } from '@/lib/hooks/usePracticeStats';
import { useStudentTasks } from '@/lib/hooks/useWritingTasks';
import { useBatch } from '@/lib/hooks/useBatches';
import { SAMPLE_STUDENT, CEFRLevelInfo, getStudentSuccessRate } from '@/lib/models';
import { ActivityCard } from '@/components/ui/activity/ActivityCard';
import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function StudentDashboard() {
  const { session, isFirebaseReady } = useFirebaseAuth();
  const { student: fetchedStudent, isLoading: isLoadingStudent } = useCurrentStudent(session?.user?.email || null);
  const { weeklyData, totalWords, isLoading: isLoadingWeekly } = useWeeklyProgress(session?.user?.email || null);
  const { cardsReady, wordsToReview } = usePracticeStats(session?.user?.email || null);
  const { tasks: allTasks, isLoading: isLoadingTasks } = useStudentTasks(session?.user?.email || undefined);

  // Get recent tasks (last 5)
  const recentTasks = allTasks.slice(0, 5);

  // Fetch batch information
  const { batch, isLoading: isLoadingBatch } = useBatch(fetchedStudent?.batchId || undefined);

  // Use fetched student data if available, otherwise fall back to sample data
  const student = fetchedStudent || SAMPLE_STUDENT;
  const userName = session?.user?.name || 'Student';

  // Show loading state while fetching data
  if (!isFirebaseReady || isLoadingStudent) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent mb-4"></div>
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Format the Current Level display with batch name
  const currentLevelDisplay = () => {
    const level = session?.user?.cefrLevel || student.currentLevel || 'A1';
    if (batch && batch.name) {
      return `${level} • ${batch.name}`;
    }
    return level;
  };

  const stats = [
    { label: 'Words Learned', value: student.wordsLearned || 0, icon: '📚', color: 'text-violet-600' },
    { label: 'Words Mastered', value: student.wordsMastered || 0, icon: '✨', color: 'text-emerald-600' },
    { label: 'Current Streak', value: student.currentStreak || 0, icon: '🔥', color: 'text-orange-600', suffix: ' days' },
    { label: 'Current Level', value: 0, displayValue: currentLevelDisplay(), icon: '🎯', color: 'text-amber-600', isText: true },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-1">
          Welcome back, {userName.split(' ')[0]}!
        </h1>
        <p className="text-gray-500">Continue your German learning journey</p>
      </div>

      {/* Stats Grid - Slim Style (NO rounded corners) */}
      <div className="bg-white overflow-hidden border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-200">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyChart weeklyData={weeklyData} totalWords={totalWords} />
          <QuickActions cardsReady={cardsReady} wordsToReview={wordsToReview} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentTasksCard tasks={recentTasks} isLoading={isLoadingTasks} />
          <DailyGoalCard current={20} target={student.dailyGoal || 25} />
        </div>
      </div>
    </div>
  );
}

// Stats Card - Exactly like Slim
function StatCard({ label, value, icon, color, suffix = '', displayValue, isText = false }: any) {
  const count = useAnimatedCounter({ target: value, interval: 10 });

  return (
    <div className="p-6 flex items-center gap-4">
      <div className={`text-5xl ${color} flex-shrink-0`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className={`${color} text-sm font-bold uppercase tracking-wide`}>{label}</p>
        <p className={`${isText ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 break-words`}>
          {isText ? displayValue : `${count.toLocaleString()}${suffix}`}
        </p>
      </div>
    </div>
  );
}

// Weekly Progress - Bitcoin Earnings Style (ApexCharts area chart like Slim)
function WeeklyChart({ weeklyData, totalWords }: { weeklyData: number[], totalWords: number }) {
  // Generate a slightly varied secondary series for visual interest
  // (could represent different types of practice in the future)
  const secondarySeries = weeklyData.map(value => Math.floor(value * 0.6));

  // Exact Bitcoin Earnings config from Slim Dashboard 01
  const chartConfig = {
    options: {
      colors: ['#17A3F1', '#E219D7', '#1560BD'], // Slim cuaternary, tertiary, primary
      chart: {
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        parentHeightOffset: 0,
      },
      stroke: {
        width: 2,
      },
      markers: {
        size: 5,
      },
      grid: {
        show: false,
      },
      xaxis: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      yaxis: {
        show: false,
      },
    },
    series: [
      {
        name: 'Words Studied',
        data: weeklyData,
      },
      {
        name: 'Words Reviewed',
        data: secondarySeries,
      },
    ],
  };

  return (
    <div className="bg-white border border-gray-200 relative overflow-hidden" style={{ minHeight: '280px' }}>
      {/* ApexCharts Area Background */}
      <div className="absolute top-0 bottom-0 left-0 right-0">
        <Chart
          options={chartConfig.options}
          series={chartConfig.series}
          type="area"
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '-10px',
            right: '-10px',
          }}
          width="100%"
          height="70%"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative p-6 w-full md:w-2/3">
        <p className="text-5xl font-bold text-gray-900 mb-1">
          {totalWords}{' '}
          <span className="text-base text-gray-600">WORDS</span>
        </p>
        <p className="text-sm font-bold uppercase text-gray-900 mb-2">WEEKLY PROGRESS</p>
        <p className="text-sm text-gray-500 mb-4">
          You've learned {totalWords} words this week. Keep up the excellent work!
        </p>
        <button className="border border-gray-900 px-4 py-2 text-sm font-bold uppercase hover:bg-gray-900 hover:text-white transition">
          View Details →
        </button>
      </div>
    </div>
  );
}

// Quick Actions - Simple bordered cards like Slim
function QuickActions({ cardsReady, wordsToReview }: { cardsReady: number, wordsToReview: number }) {
  const actions = [
    { icon: '📚', label: 'Practice', count: cardsReady > 0 ? `${cardsReady} cards ready` : 'No cards ready' },
    { icon: '✍️', label: 'Write', count: 'AI-powered' },
    { icon: '🔄', label: 'Review', count: wordsToReview > 0 ? `${wordsToReview} words` : 'All caught up!' },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {actions.map((action, i) => (
        <div key={i} className="bg-white border border-gray-200 p-6 text-center">
          <div className="text-4xl mb-3">{action.icon}</div>
          <p className="text-sm font-bold uppercase text-gray-900 mb-1">{action.label}</p>
          <p className="text-xs text-gray-500 mb-4">{action.count}</p>
          <button className="w-full border border-gray-900 py-2 text-xs font-bold uppercase hover:bg-gray-900 hover:text-white transition">
            Start
          </button>
        </div>
      ))}
    </div>
  );
}

// Recent Tasks Card - Using Activity Components with Real Data
function RecentTasksCard({ tasks, isLoading }: { tasks: any[], isLoading: boolean }) {
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

// Daily Goal Card - Impressions Style
function DailyGoalCard({ current, target }: { current: number; target: number }) {
  const percentage = (current / target) * 100;

  return (
    <div className="bg-white border border-gray-200 p-6">
      <p className="text-violet-600 text-lg font-bold uppercase mb-2">Daily Goal</p>
      <p className="text-3xl font-bold text-gray-900 mb-3">{current} / {target}</p>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-emerald-100 flex items-center justify-center">
          <span className="text-emerald-600 text-sm font-bold">↑</span>
        </div>
        <span className="text-emerald-600 font-bold text-sm">{percentage.toFixed(0)}%</span>
        <span className="text-gray-500 text-sm">of daily goal</span>
      </div>

      <div className="bg-gray-200 h-2 mb-3">
        <div
          className="bg-violet-600 h-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <p className="text-sm text-gray-500">
        {percentage >= 100 ? 'Excellent work! Goal completed.' : 'Keep going to reach your daily target.'}
      </p>
    </div>
  );
}
