/**
 * Stats Overview Component
 * Displays statistics for writing submissions in TabBar format
 */

import { TabBar } from '@/components/ui/TabBar';

interface StatsOverviewProps {
  stats: {
    total: number;
    pending: number;
    reviewedThisWeek: number;
    avgResponseDays: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="mb-8">
      <TabBar
        variant="stats"
        tabs={[
          {
            id: 'total',
            label: 'Total Submissions',
            value: stats.total,
            icon: undefined,
          },
          {
            id: 'pending',
            label: 'Pending Review',
            value: stats.pending,
            icon: undefined,
          },
          {
            id: 'reviewed',
            label: 'Reviewed This Week',
            value: stats.reviewedThisWeek,
            icon: undefined,
          },
          {
            id: 'response',
            label: 'Avg. Response Time',
            value: stats.avgResponseDays > 0 ? `${stats.avgResponseDays}d` : '—',
            icon: undefined,
          },
        ]}
      />
    </div>
  );
}
