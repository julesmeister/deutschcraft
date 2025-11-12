/**
 * RecentActivityTimeline Component
 * Displays recent flashcard sessions or writing submissions in a timeline
 */

import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
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
}

export function RecentActivityTimeline({
  activeTab,
  recentSessions,
  writingSubmissions,
}: RecentActivityTimelineProps) {
  if (activeTab === 'flashcards') {
    if (recentSessions.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg font-semibold">No recent sessions</p>
          <p className="text-sm mt-2">This student hasn't practiced flashcards yet</p>
        </div>
      );
    }

    return (
      <ActivityTimeline
        items={recentSessions.map((session, index) => {
          const accuracyColor = session.accuracy >= 80 ? 'green' : session.accuracy >= 60 ? 'amber' : 'red';

          return {
            id: `session-${index}`,
            icon: <span className="text-white text-sm">📚</span>,
            iconColor: 'bg-piku-purple',
            title: new Date(
              session.date.slice(0, 4) + '-' +
              session.date.slice(4, 6) + '-' +
              session.date.slice(6, 8)
            ).toLocaleDateString('en-US', {
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
      />
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

  return (
    <ActivityTimeline
      items={writingSubmissions.slice(0, 10).map((submission) => {
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
    />
  );
}
