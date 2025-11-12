/**
 * RecentActivityTimeline Component
 * Displays recent flashcard sessions or writing submissions in a timeline
 */

import { useState, useEffect } from 'react';
import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { Pagination } from '@/components/ui/Pagination';
import { WritingSubmission } from '@/lib/models/writing';

interface RecentSession {
  date: string;
  cardsReviewed: number;
  accuracy: number;
  timeSpent: number;
}

interface RecentActivityTimelineProps {
  activeTab: 'flashcards' | 'writing';
  recentSessions: RecentSession[];
  writingSubmissions: WritingSubmission[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  itemsPerPage?: number;
}

export function RecentActivityTimeline({
  activeTab,
  recentSessions,
  writingSubmissions,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  isLoading = false,
  hasMore = true,
  itemsPerPage = 8,
}: RecentActivityTimelineProps) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  // Use external pagination if provided, otherwise use internal
  const currentPage = externalCurrentPage || internalCurrentPage;
  const onPageChange = externalOnPageChange || setInternalCurrentPage;

  // Reset to page 1 when switching tabs
  useEffect(() => {
    onPageChange(1);
  }, [activeTab]);
  if (activeTab === 'flashcards') {
    if (isLoading && recentSessions.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-piku-purple"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading sessions...</p>
        </div>
      );
    }

    if (!isLoading && recentSessions.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg font-semibold">No recent sessions</p>
          <p className="text-sm mt-2">This student hasn't practiced flashcards yet</p>
        </div>
      );
    }

    return (
      <>
        <ActivityTimeline
          items={recentSessions.map((session, index) => {
          const accuracyColor = session.accuracy >= 80 ? 'green' : session.accuracy >= 60 ? 'amber' : 'red';

          // Parse date - handle both YYYY-MM-DD and YYYYMMDD formats
          let dateStr = session.date;
          if (dateStr.length === 8 && !dateStr.includes('-')) {
            // YYYYMMDD format
            dateStr = dateStr.slice(0, 4) + '-' + dateStr.slice(4, 6) + '-' + dateStr.slice(6, 8);
          }

          return {
            id: `session-${index}`,
            icon: <span className="text-white text-sm">📚</span>,
            iconColor: 'bg-piku-purple',
            title: new Date(dateStr).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            description: `Reviewed ${session.cardsReviewed} cards in ${session.timeSpent} minutes`,
            tags: [
              {
                label: `${session.accuracy}% Accuracy`,
                color: accuracyColor,
                icon: session.accuracy >= 80 ? '✓' : undefined,
              },
              {
                label: `${session.cardsReviewed} cards`,
                color: 'blue',
              },
              {
                label: `${session.timeSpent} min`,
                color: 'gray',
              },
            ],
          } as ActivityItem;
        })}
        showConnector={true}
        showPagination={false}
      />

      {/* Pagination - For server-side, show many pages assuming more data */}
      <Pagination
        currentPage={currentPage}
        totalPages={hasMore ? currentPage + 5 : currentPage}
        onPageChange={onPageChange}
      />
      </>
    );
  }

  // Writing tab
  if (writingSubmissions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-lg font-semibold">No writing submissions</p>
        <p className="text-sm mt-2">This student hasn't completed any writing exercises yet</p>
      </div>
    );
  }

  // Calculate pagination for writing
  const totalPagesWriting = Math.ceil(writingSubmissions.length / itemsPerPage);
  const startIndexWriting = (currentPage - 1) * itemsPerPage;
  const endIndexWriting = startIndexWriting + itemsPerPage;
  const paginatedSubmissions = writingSubmissions.slice(startIndexWriting, endIndexWriting);

  return (
    <>
      <ActivityTimeline
        items={paginatedSubmissions.map((submission) => {
        const statusColor =
          submission.status === 'submitted' ? 'blue' :
          submission.status === 'reviewed' ? 'green' :
          submission.status === 'draft' ? 'gray' : 'gray';

        const exerciseIcon =
          submission.exerciseType === 'creative' ? '✨' :
          submission.exerciseType === 'translation' ? '🔄' :
          submission.exerciseType === 'email' ? '✉️' : '📨';

        return {
          id: submission.submissionId,
          icon: <span className="text-white text-sm">{exerciseIcon}</span>,
          iconColor: 'bg-purple-500',
          title: (submission as any).exerciseTitle || `${submission.exerciseType} exercise`,
          description: `${submission.wordCount} words • ${submission.status}`,
          timestamp: new Date(submission.submittedAt || submission.updatedAt).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          tags: [
            {
              label: submission.exerciseType,
              color: 'purple',
            },
            {
              label: submission.level || 'N/A',
              color: 'blue',
            },
            {
              label: submission.status,
              color: statusColor,
              icon: submission.status === 'reviewed' ? '✓' : undefined,
            },
          ],
          metadata: submission.teacherScore ? `Score: ${submission.teacherScore}%` : undefined,
        } as ActivityItem;
      })}
      showConnector={true}
      showPagination={false}
    />

    {/* Pagination */}
    <Pagination
      currentPage={currentPage}
      totalPages={totalPagesWriting}
      onPageChange={onPageChange}
    />
    </>
  );
}
