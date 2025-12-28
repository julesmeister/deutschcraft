'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CatLoader } from '@/components/ui/CatLoader';
import { useAllStudents } from '@/lib/hooks/useUserQueries';
import { useRecentActivities } from '@/lib/hooks/useRecentActivities';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { AnalyticsOverview } from '@/components/dashboard/analytics/AnalyticsOverview';
import { LevelDistribution } from '@/components/dashboard/analytics/LevelDistribution';
import { TopPerformers } from '@/components/dashboard/analytics/TopPerformers';
import { RecentActivitySection } from '@/components/dashboard/analytics/RecentActivitySection';
import { StreakByLevel } from '@/components/dashboard/analytics/StreakByLevel';

export default function AnalyticsPage() {
  const { students, isLoading } = useAllStudents();
  const { data: recentActivities = [], isLoading: activitiesLoading } = useRecentActivities(100, students);
  const { analytics } = useAnalytics(students);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Analytics Dashboard 📊"
        subtitle="Comprehensive insights into student performance and progress"
      />

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Key Metrics Overview */}
        <AnalyticsOverview
          totalStudents={analytics.totalStudents}
          activeStudents={analytics.activeStudents}
          averageProgress={analytics.averageProgress}
          totalCardsMastered={analytics.totalCardsMastered}
        />

        {/* Student Distribution by Level */}
        <LevelDistribution levelDistribution={analytics.levelDistribution} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <TopPerformers performers={analytics.topPerformers} />

          {/* Recent Activity */}
          <RecentActivitySection
            activities={recentActivities}
            isLoading={activitiesLoading}
          />
        </div>

        {/* Streak Analytics */}
        <StreakByLevel averageStreakByLevel={analytics.averageStreakByLevel} />
      </div>
    </div>
  );
}
