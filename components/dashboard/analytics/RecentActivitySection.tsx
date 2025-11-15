'use client';

import { useState } from 'react';
import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { CatLoader } from '@/components/ui/CatLoader';
import { Pagination } from '@/components/ui/Pagination';
import { AggregatedActivity } from '@/lib/hooks/useRecentActivities';

interface RecentActivitySectionProps {
  activities: AggregatedActivity[];
  isLoading: boolean;
}

export function RecentActivitySection({ activities, isLoading }: RecentActivitySectionProps) {
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 8;

  // Prepare activity timeline data from aggregated activities
  const activityItems: ActivityItem[] = activities.map((activity) => ({
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

  return (
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
      {isLoading ? (
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
  );
}
