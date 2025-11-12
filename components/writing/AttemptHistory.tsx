/**
 * AttemptHistory Component
 * Displays all attempts for a specific exercise by a student
 */

'use client';

import { WritingSubmission } from '@/lib/models/writing';
import { ActivityCard } from '@/components/ui/activity/ActivityCard';

interface AttemptHistoryProps {
  attempts: WritingSubmission[];
  onViewAttempt: (submissionId: string) => void;
  currentAttemptId?: string;
}

export function AttemptHistory({
  attempts,
  onViewAttempt,
  currentAttemptId,
}: AttemptHistoryProps) {
  if (attempts.length === 0) {
    return (
      <ActivityCard title="Attempt History">
        <div className="text-center py-8 text-neutral-500">
          <p>No previous attempts for this exercise.</p>
          <p className="text-sm mt-2">This will be your first attempt!</p>
        </div>
      </ActivityCard>
    );
  }

  // Sort attempts by attempt number (latest first)
  const sortedAttempts = [...attempts].sort((a, b) => b.attemptNumber - a.attemptNumber);

  return (
    <ActivityCard title={`Attempt History (${attempts.length} total)`}>
      <div className="space-y-3">
        {sortedAttempts.map((attempt) => (
          <AttemptCard
            key={attempt.submissionId}
            attempt={attempt}
            isCurrent={attempt.submissionId === currentAttemptId}
            onView={() => onViewAttempt(attempt.submissionId)}
          />
        ))}
      </div>
    </ActivityCard>
  );
}

interface AttemptCardProps {
  attempt: WritingSubmission;
  isCurrent: boolean;
  onView: () => void;
}

function AttemptCard({ attempt, isCurrent, onView }: AttemptCardProps) {
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    submitted: { label: 'Awaiting Review', color: 'bg-yellow-100 text-yellow-800' },
    reviewed: { label: 'Reviewed', color: 'bg-green-100 text-green-800' },
  };

  const status = statusConfig[attempt.status];

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        isCurrent ? 'border-blue-500 bg-blue-50' : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-bold text-neutral-900">
              Attempt #{attempt.attemptNumber}
              {isCurrent && <span className="ml-2 text-sm text-blue-600">(Current)</span>}
            </h4>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span>{attempt.wordCount} words</span>
            {attempt.submittedAt && (
              <>
                <span>•</span>
                <span>Submitted {new Date(attempt.submittedAt).toLocaleDateString()}</span>
              </>
            )}
            {attempt.teacherScore !== undefined && attempt.teacherScore > 0 && (
              <>
                <span>•</span>
                <span className="font-semibold text-green-600">Score: {attempt.teacherScore}/100</span>
              </>
            )}
          </div>

          {attempt.status === 'reviewed' && attempt.teacherFeedback && (
            <p className="mt-2 text-sm text-neutral-700 italic line-clamp-2">
              "{attempt.teacherFeedback}"
            </p>
          )}
        </div>

        <button
          onClick={onView}
          className="cursor-pointer whitespace-nowrap content-center font-medium transition-all duration-150 ease-in-out h-10 rounded-xl bg-neutral-100 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-200"
        >
          View
        </button>
      </div>
    </div>
  );
}
