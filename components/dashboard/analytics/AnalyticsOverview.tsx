'use client';

import { StatGrid, StatItem } from '@/components/ui/StatGrid';

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
      <StatItem
        label="Total Students"
        value={totalStudents}
        unit={`${engagementRate}% active`}
      />
      <StatItem
        label="Active Students"
        value={activeStudents}
        unit="with streaks"
      />
      <StatItem
        label="Avg. Words Learned"
        value={Math.round(averageProgress)}
        unit="per student"
      />
      <StatItem
        label="Words Mastered"
        value={totalCardsMastered}
        unit="total"
      />
    </StatGrid>
  );
}
