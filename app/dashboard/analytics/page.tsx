'use client';

import { useMemo, useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevel } from '@/lib/models/cefr';
import { getUserFullName } from '@/lib/models/user';
import { TabBar, TabItem } from '@/components/ui/TabBar';
import { StatGrid } from '@/components/ui/StatGrid';
import { StatCard } from '@/components/ui/StatCard';
import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { CatLoader } from '@/components/ui/CatLoader';
import { Pagination } from '@/components/ui/Pagination';
import { useAllStudents } from '@/lib/hooks/useUserQueries';
import { useRecentActivities } from '@/lib/hooks/useRecentActivities';
import { getStudyStats } from '@/lib/services/flashcards/stats';

export default function AnalyticsPage() {
  const { students, isLoading } = useAllStudents();
  const { data: recentActivities = [], isLoading: activitiesLoading } = useRecentActivities(100);
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 8;
  const [studentStats, setStudentStats] = useState<Record<string, { cardsLearned: number; streak: number }>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch study stats for all students
  useEffect(() => {
    const fetchAllStats = async () => {
      if (students.length === 0) return;

      setIsLoadingStats(true);
      const statsMap: Record<string, { cardsLearned: number; streak: number }> = {};

      for (const student of students) {
        try {
          const stats = await getStudyStats(student.email);
          statsMap[student.email] = {
            cardsLearned: stats.cardsLearned,
            streak: stats.streak,
          };
          console.log('📚 [Stats] Fetched for', student.email, ':', stats);
        } catch (error) {
          console.error('❌ [Stats] Error fetching for', student.email, error);
          statsMap[student.email] = { cardsLearned: 0, streak: 0 };
        }
      }

      setStudentStats(statsMap);
      setIsLoadingStats(false);
      console.log('✅ [Stats] All student stats fetched:', statsMap);
    };

    fetchAllStats();
  }, [students]);

  // Calculate analytics from real student data
  const analytics = useMemo(() => {
    console.log('📊 [Analytics] All students data:', students);
    console.log('📊 [Analytics] Student stats map:', studentStats);
    const totalStudents = students.length;

    // Use actual streak from study stats
    const activeStudents = students.filter(s => {
      const stats = studentStats[s.email];
      return stats ? stats.streak > 0 : false;
    }).length;

    // Use actual cardsLearned from study stats
    const totalWordsLearned = students.reduce((sum, s) => {
      const stats = studentStats[s.email];
      return sum + (stats ? stats.cardsLearned : 0);
    }, 0);

    const averageProgress = totalStudents > 0 ? totalWordsLearned / totalStudents : 0;

    const totalFlashcardsCreated = students.reduce((sum, s) => sum + (s.wordsMastered || 0), 0);

    console.log('📈 [Analytics] Calculated stats:', {
      totalStudents,
      activeStudents,
      averageProgress,
      totalFlashcardsCreated,
      totalWordsLearned
    });

    // Level distribution
    const levelDistribution: Record<CEFRLevel, number> = {
      [CEFRLevel.A1]: 0,
      [CEFRLevel.A2]: 0,
      [CEFRLevel.B1]: 0,
      [CEFRLevel.B2]: 0,
      [CEFRLevel.C1]: 0,
      [CEFRLevel.C2]: 0,
    };
    students.forEach(s => {
      const rawStudent = s as any;

      // Try multiple field names for compatibility, default to A1 like student detail page
      const level = (s.cefrLevel || rawStudent.currentLevel || rawStudent.level || CEFRLevel.A1) as CEFRLevel;

      console.log('📊 [Level Distribution] Student:', {
        email: s.email,
        resolvedLevel: level,
        cefrLevel: s.cefrLevel,
        currentLevel: rawStudent.currentLevel,
        level: rawStudent.level,
      });

      if (level in levelDistribution) {
        levelDistribution[level]++;
      }
    });

    console.log('📊 [Level Distribution] Final counts:', levelDistribution);

    // Average streak by level
    const averageStreakByLevel: Record<CEFRLevel, number> = {
      [CEFRLevel.A1]: 0,
      [CEFRLevel.A2]: 0,
      [CEFRLevel.B1]: 0,
      [CEFRLevel.B2]: 0,
      [CEFRLevel.C1]: 0,
      [CEFRLevel.C2]: 0,
    };
    Object.keys(levelDistribution).forEach(level => {
      const lvl = level as CEFRLevel;
      const studentsAtLevel = students.filter(s => s.cefrLevel === lvl);
      if (studentsAtLevel.length > 0) {
        averageStreakByLevel[lvl] = studentsAtLevel.reduce((sum, s) => sum + (s.currentStreak || 0), 0) / studentsAtLevel.length;
      }
    });

    // Top performers (by actual cardsLearned from study stats)
    const topPerformers = [...students]
      .map(s => {
        const stats = studentStats[s.email] || { cardsLearned: 0, streak: 0 };
        const rawStudent = s as any;
        return {
          student: s,
          cardsLearned: stats.cardsLearned,
          streak: stats.streak,
          level: (s.cefrLevel || rawStudent.currentLevel || rawStudent.level || CEFRLevel.A1) as CEFRLevel,
        };
      })
      .sort((a, b) => b.cardsLearned - a.cardsLearned)
      .slice(0, 5)
      .map(({ student: s, cardsLearned, streak, level }) => {
        console.log('🏆 [Top Performer]:', {
          name: getUserFullName(s),
          email: s.email,
          cardsLearned,
          streak,
          level,
        });
        return {
          name: getUserFullName(s),
          email: s.email,
          progress: cardsLearned,
          streak: streak,
          level: level,
        };
      });

    // Recent activity
    const recentActivity = [...students]
      .filter(s => s.lastActiveDate)
      .sort((a, b) => {
        const aTime = a.lastActiveDate || 0;
        const bTime = b.lastActiveDate || 0;
        return bTime - aTime;
      })
      .slice(0, 10)
      .map(s => ({
        studentName: getUserFullName(s),
        action: (s.currentStreak || 0) > 0 ? 'Completed daily practice' : 'Logged in',
        timestamp: s.lastActiveDate ? new Date(s.lastActiveDate) : new Date(),
      }));

    return {
      totalStudents,
      activeStudents,
      averageProgress,
      totalFlashcardsCreated,
      levelDistribution,
      averageStreakByLevel,
      topPerformers,
      recentActivity,
    };
  }, [students, studentStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Analytics Dashboard 📊"
          subtitle="Loading analytics data..."
        />
        <div className="container mx-auto px-6 py-8">
          <CatLoader message="Loading analytics data..." size="lg" />
        </div>
      </div>
    );
  }

  // Prepare TabBar data for level distribution
  const levelTabs: TabItem[] = Object.entries(analytics.levelDistribution).map(([level, count]) => ({
    id: level,
    label: level,
    icon: <span>📚</span>,
    value: count,
  }));

  // Prepare activity timeline data from aggregated activities
  const activityItems: ActivityItem[] = recentActivities.map((activity) => ({
    id: activity.id,
    icon: <span className="text-white text-sm">{activity.icon}</span>,
    iconColor: activity.color,
    title: activity.studentName,
    description: activity.description,
    timestamp: activity.timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  // Paginate activities
  const totalActivityPages = Math.ceil(activityItems.length / activitiesPerPage);
  const paginatedActivities = activityItems.slice(
    (activityPage - 1) * activitiesPerPage,
    activityPage * activitiesPerPage
  );

  const engagementRate = analytics.totalStudents > 0
    ? Math.round((analytics.activeStudents / analytics.totalStudents) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Analytics Dashboard 📊"
        subtitle="Comprehensive insights into student performance and progress"
      />

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Key Metrics using StatGrid */}
        <StatGrid title="Overview">
          <StatCard
            icon="👥"
            iconBgColor="bg-blue-200"
            label="Total Students"
            value={analytics.totalStudents}
            change={`${engagementRate}%`}
            comparisonText="engagement rate"
            isPositive={engagementRate > 50}
          />
          <StatCard
            icon="🔥"
            iconBgColor="bg-orange-200"
            label="Active Students"
            value={analytics.activeStudents}
            comparisonText="with current streaks"
          />
          <StatCard
            icon="📚"
            iconBgColor="bg-purple-200"
            label="Avg. Words Learned"
            value={Math.round(analytics.averageProgress)}
            comparisonText="per student"
          />
          <StatCard
            icon="🎴"
            iconBgColor="bg-pink-200"
            label="Flashcards Created"
            value={analytics.totalFlashcardsCreated}
            comparisonText="across all students"
          />
        </StatGrid>

        {/* Student Distribution by Level using TabBar */}
        <div className="bg-white border border-neutral-200 p-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">
            Student Distribution by Level
          </h3>
          <TabBar
            tabs={levelTabs}
            variant="stats"
            size="compact"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white border border-neutral-200 p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <span>🏆</span>
              Top 5 Performers
            </h3>
            {analytics.topPerformers.length > 0 ? (
              <div className="space-y-3">
                {analytics.topPerformers.map((student, index) => (
                  <div
                    key={student.email}
                    className="flex items-center gap-4 p-4 bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-neutral-900">{student.name}</div>
                      <div className="text-xs text-neutral-500">{student.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-neutral-900">
                        {student.progress} words
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1 justify-end">
                        <span className="inline-block px-2 py-0.5 text-xs font-bold bg-blue-500 text-white">
                          {student.level}
                        </span>
                        🔥 {student.streak}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-400">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-sm">No student data available yet</div>
              </div>
            )}
          </div>

          {/* Recent Activity using ActivityTimeline */}
          <div className="bg-white border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <span>⚡</span>
                Recent Activity
              </h3>
              {activityItems.length > 0 && (
                <Pagination
                  currentPage={activityPage}
                  totalPages={totalActivityPages}
                  onPageChange={setActivityPage}
                  showPageNumbers={false}
                  className="!mt-0 !mb-0"
                />
              )}
            </div>
            {activitiesLoading ? (
              <CatLoader message="Loading recent activities..." size="md" />
            ) : paginatedActivities.length > 0 ? (
              <ActivityTimeline
                items={paginatedActivities}
                showPagination={false}
              />
            ) : (
              <div className="text-center py-12 text-neutral-400">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-sm">No recent activity</div>
              </div>
            )}
          </div>
        </div>

        {/* Streak Analytics using TabBar */}
        <div className="bg-white border border-neutral-200 p-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-4">
            Average Streak by Level (days)
          </h3>
          <TabBar
            tabs={Object.entries(analytics.averageStreakByLevel).map(([level, avgStreak]) => ({
              id: level,
              label: level,
              icon: <span>🔥</span>,
              value: avgStreak.toFixed(1),
            }))}
            variant="stats"
            size="compact"
          />
        </div>
      </div>
    </div>
  );
}
