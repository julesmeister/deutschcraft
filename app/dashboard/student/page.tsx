'use client';

import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { useWeeklyProgress } from '@/lib/hooks/useWeeklyProgress';
import { usePracticeStats } from '@/lib/hooks/usePracticeStats';
import { useStudentTasks } from '@/lib/hooks/useWritingTasks';
import { useBatch } from '@/lib/hooks/useBatches';
import { useStudyStats } from '@/lib/hooks/useFlashcards';
import { SAMPLE_STUDENT } from '@/lib/models';
import { StudentStatsCard, StudentStatCardProps } from '@/components/dashboard/StudentStatsCard';
import { WeeklyProgressChart } from '@/components/dashboard/WeeklyProgressChart';
import { StudentQuickActions } from '@/components/dashboard/StudentQuickActions';
import { DailyGoalCard } from '@/components/dashboard/DailyGoalCard';
import { StudentRecentTasksCard } from '@/components/dashboard/StudentRecentTasksCard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function StudentDashboard() {
  const { session, isFirebaseReady } = useFirebaseAuth();
  const { student: fetchedStudent, isLoading: isLoadingStudent } = useCurrentStudent(session?.user?.email || null);
  const { weeklyData, totalWords, isLoading: isLoadingWeekly } = useWeeklyProgress(session?.user?.email || null);
  const { cardsReady, wordsToReview } = usePracticeStats(session?.user?.email || null);
  const { tasks: allTasks, isLoading: isLoadingTasks } = useStudentTasks(session?.user?.email || undefined);

  // Get real-time study stats
  const { stats: studyStats, isLoading: isLoadingStats } = useStudyStats(session?.user?.email || null);

  // Get today's progress for daily goal
  const [todayProgress, setTodayProgress] = useState(0);

  // Get recent tasks (last 5)
  const recentTasks = allTasks.slice(0, 5);

  // Fetch batch information
  const { batch, isLoading: isLoadingBatch } = useBatch(fetchedStudent?.batchId || undefined);

  // Use fetched student data if available, otherwise fall back to sample data
  const student = fetchedStudent || SAMPLE_STUDENT;
  const userName = session?.user?.name || 'Student';

  // Fetch today's progress for daily goal
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchTodayProgress = async () => {
      try {
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const progressId = `PROG_${today}_${session.user.email}`;
        const progressRef = doc(db, 'progress', progressId);
        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
          const data = progressSnap.data();
          setTodayProgress(data.cardsReviewed || 0);
        } else {
          setTodayProgress(0);
        }
      } catch (error) {
        console.error('Error fetching today progress:', error);
        setTodayProgress(0);
      }
    };

    fetchTodayProgress();
  }, [session?.user?.email]);

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

  const stats: StudentStatCardProps[] = [
    { label: 'Words Learned', value: studyStats.cardsLearned, icon: '📚', color: 'text-violet-600' },
    { label: 'Words Mastered', value: studyStats.cardsMastered, icon: '✨', color: 'text-emerald-600' },
    { label: 'Current Streak', value: studyStats.streak, icon: '🔥', color: 'text-orange-600', suffix: ' days' },
    { label: 'Current Level', value: 0, displayValue: currentLevelDisplay(), icon: '🎯', color: 'text-amber-600', isText: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={`Welcome back, ${userName.split(' ')[0]}!`}
        subtitle="Continue your German learning journey"
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats Grid - Slim Style (NO rounded corners) */}
        <div className="bg-white overflow-hidden border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-200">
            {stats.map((stat, index) => (
              <StudentStatsCard key={index} {...stat} />
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <WeeklyProgressChart weeklyData={weeklyData} totalWords={totalWords} />
            <StudentQuickActions cardsReady={cardsReady} wordsToReview={wordsToReview} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StudentRecentTasksCard tasks={recentTasks} isLoading={isLoadingTasks} />
            <DailyGoalCard current={todayProgress} target={student.dailyGoal || 25} />
          </div>
        </div>
      </div>
    </div>
  );
}
