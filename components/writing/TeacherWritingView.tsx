/**
 * TeacherWritingView Component
 * Shows all student writing submissions for a batch/class
 */

import { WritingSubmission } from '@/lib/models/writing';
import { CEFRLevelInfo } from '@/lib/models/cefr';
import { formatDistanceToNow } from 'date-fns';

interface TeacherWritingViewProps {
  submissions: WritingSubmission[];
  onViewSubmission: (submissionId: string) => void;
  onGradeSubmission: (submissionId: string) => void;
  isLoading?: boolean;
}

export function TeacherWritingView({
  submissions,
  onViewSubmission,
  onGradeSubmission,
  isLoading = false,
}: TeacherWritingViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
        <div className="text-5xl mb-3">📝</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No submissions yet</h3>
        <p className="text-gray-600">Student submissions will appear here</p>
      </div>
    );
  }

  // Group by status
  const submitted = submissions.filter(s => s.status === 'submitted');
  const reviewed = submissions.filter(s => s.status === 'reviewed');
  const drafts = submissions.filter(s => s.status === 'draft');

  return (
    <div className="space-y-6">
      {/* Pending Review */}
      {submitted.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">
            Pending Review ({submitted.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submitted.map((submission) => (
              <SubmissionCard
                key={submission.submissionId}
                submission={submission}
                onView={() => onViewSubmission(submission.submissionId)}
                onGrade={() => onGradeSubmission(submission.submissionId)}
                showGradeButton={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-4">
            Reviewed ({reviewed.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewed.map((submission) => (
              <SubmissionCard
                key={submission.submissionId}
                submission={submission}
                onView={() => onViewSubmission(submission.submissionId)}
                onGrade={() => onGradeSubmission(submission.submissionId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SubmissionCardProps {
  submission: WritingSubmission;
  onView: () => void;
  onGrade?: () => void;
  showGradeButton?: boolean;
}

function SubmissionCard({ submission, onView, onGrade, showGradeButton = false }: SubmissionCardProps) {
  const levelInfo = CEFRLevelInfo[submission.level];
  const timeAgo = submission.submittedAt
    ? formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })
    : 'Not submitted';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-neutral-900">{submission.userId}</h4>
          <p className="text-sm text-neutral-600">
            {submission.exerciseType} • {levelInfo.displayName}
          </p>
        </div>
        {submission.aiFeedback && (
          <div className="text-right">
            <div className="text-2xl font-black text-blue-600">
              {submission.aiFeedback.overallScore}%
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
        <p className="text-sm text-neutral-700 line-clamp-2">
          {submission.content.substring(0, 100)}...
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">{timeAgo}</span>
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View Details
          </button>
          {showGradeButton && onGrade && (
            <button
              onClick={onGrade}
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
            >
              Grade Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
