'use client';

import { StatGrid } from '@/components/ui/StatGrid';
import { StatCard } from '@/components/ui/StatCard';

interface AnalyticsOverviewProps {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  totalCardsMastered: number;
}

export function AnalyticsOverview({
  totalStudents,
  activeStudents,
  averageProgress,
  totalCardsMastered,
}: AnalyticsOverviewProps) {
  const engagementRate = totalStudents > 0
    ? Math.round((activeStudents / totalStudents) * 100)
    : 0;

  return (
    <StatGrid title="Overview">
      <StatCard
        icon="👥"
        iconBgColor="bg-blue-200"
        label="Total Students"
        value={totalStudents}
        change={`${engagementRate}%`}
        comparisonText="engagement rate"
        isPositive={engagementRate > 50}
      />
      <StatCard
        icon="🔥"
        iconBgColor="bg-orange-200"
        label="Active Students"
        value={activeStudents}
        comparisonText="with current streaks"
      />
      <StatCard
        icon="📚"
        iconBgColor="bg-purple-200"
        label="Avg. Words Learned"
        value={Math.round(averageProgress)}
        comparisonText="per student"
      />
      <StatCard
        icon="🎴"
        iconBgColor="bg-pink-200"
        label="Words Mastered"
        value={totalCardsMastered}
        comparisonText="across all students"
      />
    </StatGrid>
  );
}
