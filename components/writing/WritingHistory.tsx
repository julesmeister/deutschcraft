/**
 * WritingHistory Component
 * Displays a list of past writing submissions with status and scores
 */

import { WritingSubmission } from '@/lib/models/writing';
import { CEFRLevelInfo } from '@/lib/models/cefr';
import { formatDistanceToNow } from 'date-fns';

interface WritingHistoryProps {
  submissions: WritingSubmission[];
  onViewSubmission: (submissionId: string) => void;
  isLoading?: boolean;
}

export function WritingHistory({
  submissions,
  onViewSubmission,
  isLoading = false,
}: WritingHistoryProps) {
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
        <p className="text-gray-600">
          Complete your first writing exercise to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <SubmissionCard
          key={submission.submissionId}
          submission={submission}
          onClick={() => onViewSubmission(submission.submissionId)}
        />
      ))}
    </div>
  );
}

interface SubmissionCardProps {
  submission: WritingSubmission;
  onClick: () => void;
}

function SubmissionCard({ submission, onClick }: SubmissionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      case 'reviewed':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'translation':
        return '🔄';
      case 'creative':
        return '✨';
      case 'descriptive':
        return '📸';
      case 'dialogue':
        return '💬';
      case 'email':
        return '📧';
      case 'formal-letter':
      case 'informal-letter':
        return '💼';
      case 'essay':
        return '📚';
      default:
        return '📝';
    }
  };

  const levelInfo = CEFRLevelInfo[submission.level];
  const timeAgo = submission.updatedAt
    ? formatDistanceToNow(new Date(submission.updatedAt), { addSuffix: true })
    : 'Unknown';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getExerciseIcon(submission.exerciseType)}</div>
          <div>
            <h3 className="font-bold text-neutral-900">
              {submission.exerciseType.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')} Exercise
            </h3>
            <p className="text-sm text-neutral-600">
              {levelInfo.displayName} • {submission.wordCount} words
            </p>
          </div>
        </div>

        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(submission.status)}`}>
          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
        </span>
      </div>

      {/* Content Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
        <p className="text-sm text-neutral-700 line-clamp-2">
          {submission.content.substring(0, 150)}
          {submission.content.length > 150 && '...'}
        </p>
      </div>

      {/* Scores */}
      {submission.aiFeedback && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <div className="text-xs text-blue-600 font-medium mb-1">Overall</div>
            <div className="text-lg font-bold text-blue-700">
              {submission.aiFeedback.overallScore}%
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-2 text-center">
            <div className="text-xs text-emerald-600 font-medium mb-1">Grammar</div>
            <div className="text-lg font-bold text-emerald-700">
              {submission.aiFeedback.grammarScore}%
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <div className="text-xs text-purple-600 font-medium mb-1">Vocabulary</div>
            <div className="text-lg font-bold text-purple-700">
              {submission.aiFeedback.vocabularyScore}%
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-center">
            <div className="text-xs text-amber-600 font-medium mb-1">Coherence</div>
            <div className="text-lg font-bold text-amber-700">
              {submission.aiFeedback.coherenceScore}%
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>Updated {timeAgo}</span>
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          View Details →
        </button>
      </div>
    </div>
  );
}
