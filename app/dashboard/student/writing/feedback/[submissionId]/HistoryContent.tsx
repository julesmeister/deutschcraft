/**
 * HistoryContent Component
 * Displays submission version history timeline
 */

import { WritingSubmission } from '@/lib/models/writing';
import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';

interface HistoryContentProps {
  submission: WritingSubmission;
  authorName: string;
}

export function HistoryContent({ submission, authorName }: HistoryContentProps) {
  return (
    <ActivityTimeline
      items={[
        // Current version
        {
          id: 'current',
          icon: <span className="text-white text-xs">✓</span>,
          iconColor: 'bg-blue-500',
          title: `Version ${submission.version}`,
          description: `${submission.wordCount} words • ${submission.characterCount} characters`,
          timestamp: submission.submittedAt
            ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Draft',
          tags: [
            {
              label: 'Current',
              color: 'blue',
            },
            {
              label: submission.status,
              color: submission.status === 'submitted' ? 'amber' :
                     submission.status === 'reviewed' ? 'green' : 'gray',
            },
          ],
          metadata: (
            <div className="text-xs text-gray-500 mt-1">
              <span>By: {authorName}</span>
            </div>
          ),
        },
        // Previous versions (if any)
        ...(submission.previousVersions || []).map((version: any) => ({
          id: `version-${version.version}`,
          icon: <span className="text-white text-xs">{version.version}</span>,
          iconColor: 'bg-gray-400',
          title: `Version ${version.version}`,
          description: version.wordCount
            ? `${version.wordCount} words`
            : 'Previous version',
          timestamp: version.savedAt
            ? new Date(version.savedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'N/A',
          metadata: (
            <div className="text-xs text-gray-500 mt-1">
              <span>By: {authorName}</span>
            </div>
          ),
        })),
      ] as ActivityItem[]}
      showConnector={true}
      showPagination={false}
    />
  );
}
