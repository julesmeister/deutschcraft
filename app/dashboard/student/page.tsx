'use client';

import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { useWeeklyProgress } from '@/lib/hooks/useWeeklyProgress';
import { usePracticeStats } from '@/lib/hooks/usePracticeStats';
import { useStudentTasks } from '@/lib/hooks/useWritingTasks';
import { useBatch } from '@/lib/hooks/useBatches';
import { useStudentDashboardStats } from '@/lib/hooks/useStudentDashboardStats';
import { SAMPLE_STUDENT } from '@/lib/models';
import { StudentStatsCard } from '@/components/dashboard/StudentStatsCard';
import { WeeklyProgressChart } from '@/components/dashboard/WeeklyProgressChart';
import { StudentQuickActions } from '@/components/dashboard/StudentQuickActions';
import { DailyGoalCard } from '@/components/dashboard/DailyGoalCard';
import { StudentRecentTasksCard } from '@/components/dashboard/StudentRecentTasksCard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MiniBlankExercise } from '@/components/dashboard/MiniBlankExercise';
import { useEffect, useState } from 'react';
import { getTodayProgress } from '@/lib/services/progressService';
import { CatLoader } from '@/components/ui/CatLoader';
import { useMiniExercise } from '@/lib/hooks/useMiniExercise';
export default function StudentDashboard() {
  const { session, isFirebaseReady } = useFirebaseAuth();
  const { student: fetchedStudent, isLoading: isLoadingStudent } = useCurrentStudent(session?.user?.email || null, isFirebaseReady);
  const { weeklyData, totalWords } = useWeeklyProgress(session?.user?.email || null);
  const { cardsReady, wordsToReview } = usePracticeStats(session?.user?.email || null);
  const { tasks: allTasks, isLoading: isLoadingTasks } = useStudentTasks(session?.user?.email || undefined);

  // Get today's progress for daily goal
  const [todayProgress, setTodayProgress] = useState(0);

  // Get recent tasks (last 5)
  const recentTasks = allTasks.slice(0, 5);

  // Get random mini exercise
  const { exercise: miniExercise, isLoading: isMiniExerciseLoading, refresh: refreshMiniExercise } = useMiniExercise(session?.user?.email || undefined);

  // Fetch batch information
  const { batch } = useBatch(fetchedStudent?.batchId || undefined);

  // Use fetched student data if available, otherwise fall back to sample data
  const student = fetchedStudent || SAMPLE_STUDENT;
  const userName = session?.user?.name || 'Student';

  // Format the Current Level display with batch name
  const currentLevelDisplay = () => {
    const studentData = (fetchedStudent as any) || SAMPLE_STUDENT;
    const level = studentData.currentLevel || 'A1';
    if (batch && batch.name) {
      return `${level} • ${batch.name}`;
    }
    return level;
  };

  // Get consolidated dashboard stats (MUST be called before any conditional returns)
  const { stats, writingStats } = useStudentDashboardStats({
    userEmail: session?.user?.email,
    currentLevelDisplay: currentLevelDisplay(),
  });

  // Fetch today's progress for daily goal
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchTodayProgressData = async () => {
      try {
        const progress = await getTodayProgress(session.user!.email!);
        setTodayProgress(progress.cardsReviewed);
      } catch (error) {
        console.error('Error fetching today progress:', error);
        setTodayProgress(0);
      }
    };

    fetchTodayProgressData();
  }, [session?.user?.email]);

  // Show loading state while fetching data or authenticating
  if (!isFirebaseReady || isLoadingStudent || !session) {
    return <CatLoader message="Loading your dashboard..." size="lg" fullScreen />;
  }

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => {
              const isLastInRow = (index + 1) % 3 === 0; // Every 3rd item in lg view
              const isFirstRow = index < 3; // Items 0, 1, 2
              const isSecondRow = index >= 3 && index < 6; // Items 3, 4, 5
              const isLastItem = index === stats.length - 1; // Last item overall
              const isRightColInTwoCol = index % 2 === 1; // Right column in 2-col layout

              return (
                <div
                  key={index}
                  className={`
                    ${!isLastItem ? 'border-b sm:border-b-0' : ''}
                    ${!isRightColInTwoCol ? 'sm:border-r' : ''}
                    ${!isLastInRow ? 'lg:border-r' : ''}
                    ${isFirstRow || isSecondRow ? 'lg:border-b' : ''}
                    border-gray-200
                  `}
                >
                  <StudentStatsCard {...stat} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <WeeklyProgressChart weeklyData={weeklyData} totalWords={totalWords} />
            <StudentQuickActions
              cardsReady={cardsReady}
              wordsToReview={wordsToReview}
              writingExercises={writingStats?.totalExercisesCompleted || 0}
            />

            {/* Mini Blank Exercise */}
            <MiniBlankExercise
              sentence={miniExercise?.sentence || ''}
              blanks={miniExercise?.blanks || []}
              onRefresh={refreshMiniExercise}
              userId={session?.user?.email || undefined}
              isLoading={isMiniExerciseLoading}
              exerciseType={miniExercise?.exerciseType}
              submittedAt={miniExercise?.submittedAt}
              sentenceId={miniExercise?.sentenceId}
              onComplete={async (points, correctAnswers, totalBlanks, sentenceId) => {
                // Record attempt
                if (miniExercise && session?.user?.email) {
                  const { saveMiniQuizResult } = await import('@/lib/services/writing/miniQuizService');
                  try {
                    // Build answers object from blanks
                    const answers: Record<number, string> = {};
                    miniExercise.blanks.forEach(blank => {
                      answers[blank.index] = blank.correctAnswer;
                    });

                    // If we have a sentenceId, use smart tracking
                    if (sentenceId) {
                      const { recordMiniExerciseAttempt } = await import('@/lib/services/writing/smartMiniExercise');
                      await recordMiniExerciseAttempt(
                        sentenceId,
                        session.user.email,
                        answers,
                        correctAnswers,
                        totalBlanks,
                        points
                      );
                    }

                    // Always save to quiz system for stats
                    await saveMiniQuizResult(
                      session.user.email,
                      miniExercise.submissionId,
                      miniExercise.sentence,
                      miniExercise.blanks,
                      answers,
                      points,
                      correctAnswers
                    );
                  } catch (error) {
                    console.error('Failed to save mini quiz result:', error);
                  }
                }
              }}
            />
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
