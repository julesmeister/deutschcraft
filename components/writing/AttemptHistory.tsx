/**
 * AttemptHistory Component
 * Displays all attempts for a specific exercise by a student using ActivityTimeline
 */

'use client';

import { WritingSubmission } from '@/lib/models/writing';
import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';

interface AttemptHistoryProps {
  attempts: WritingSubmission[];
  onViewAttempt: (submissionId: string) => void;
  onViewContent?: (attempt: WritingSubmission) => void; // NEW: View content in left pane
  currentAttemptId?: string;
}

export function AttemptHistory({
  attempts,
  onViewAttempt,
  onViewContent,
  currentAttemptId,
}: AttemptHistoryProps) {
  if (attempts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-sm">No previous attempts for this exercise.</p>
        <p className="text-xs mt-1">This will be your first attempt!</p>
      </div>
    );
  }

  // Sort attempts by attempt number (latest first)
  const sortedAttempts = [...attempts].sort((a, b) => b.attemptNumber - a.attemptNumber);

  const attemptItems: ActivityItem[] = sortedAttempts.map((attempt) => {
    const isCurrent = attempt.submissionId === currentAttemptId;

    // Handle teacherScore - could be a number or an object with scores
    const teacherScore = typeof attempt.teacherScore === 'number'
      ? attempt.teacherScore
      : typeof attempt.teacherScore === 'object' && attempt.teacherScore !== null
      ? (attempt.teacherScore as any).overallScore
      : null;

    return {
      id: attempt.submissionId,
      icon: <span className="text-white text-xs">{attempt.attemptNumber}</span>,
      iconColor: isCurrent ? 'bg-blue-500' :
                  attempt.status === 'reviewed' ? 'bg-green-500' :
                  attempt.status === 'submitted' ? 'bg-amber-500' : 'bg-gray-400',
      title: `Attempt #${attempt.attemptNumber}${isCurrent ? ' (Current)' : ''}`,
      description: `${attempt.wordCount} words${teacherScore ? ` • Score: ${teacherScore}/100` : ''}`,
      timestamp: attempt.submittedAt
        ? new Date(attempt.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Draft',
      tags: [
        ...(isCurrent ? [{ label: 'Current', color: 'blue' as const }] : []),
        {
          label: attempt.status === 'draft' ? 'Draft' :
                 attempt.status === 'submitted' ? 'Awaiting Review' : 'Reviewed',
          color: attempt.status === 'draft' ? 'gray' as const :
                 attempt.status === 'submitted' ? 'amber' as const : 'green' as const,
        },
        ...(teacherScore && teacherScore >= 80
          ? [{ label: 'Excellent', color: 'green' as const }]
          : teacherScore && teacherScore >= 60
          ? [{ label: 'Good', color: 'blue' as const }]
          : []),
      ],
      metadata: (
        <div className="mt-2">
          {attempt.teacherFeedback && (
            <p className="text-xs text-gray-600 italic line-clamp-2 mb-2 text-left">
              "{attempt.teacherFeedback}"
            </p>
          )}
          <div className="flex items-start gap-3">
            {onViewContent && (
              <button
                onClick={() => onViewContent(attempt)}
                className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors text-left"
              >
                View Content
              </button>
            )}
            <button
              onClick={() => onViewAttempt(attempt.submissionId)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors text-left"
            >
              View Details →
            </button>
          </div>
        </div>
      ),
    };
  });

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Previous Attempts ({attempts.length} total)
      </h3>
      <ActivityTimeline
        items={attemptItems}
        showConnector={true}
        showPagination={false}
      />
    </div>
  );
}
