/**
 * WritingHistory Component
 * Displays a list of past writing submissions using ActivityTimeline
 */

import { useState } from 'react';
import { WritingSubmission } from '@/lib/models/writing';
import { CEFRLevelInfo } from '@/lib/models/cefr';
import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { Pagination } from '@/components/ui/Pagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'translation': return '🔄';
      case 'creative': return '✨';
      case 'email': return '📧';
      case 'formal-letter':
      case 'informal-letter': return '💼';
      case 'quiz': return '📝';
      default: return '📝';
    }
  };

  // Convert submissions to ActivityItems
  const activityItems: ActivityItem[] = submissions.map((submission) => {
    const isQuiz = (submission as any).isQuiz;
    const quizScore = isQuiz ? (submission as any).score : null;
    const sourceType = isQuiz ? (submission as any).sourceType : null;

    // For regular submissions
    if (!isQuiz) {
      const levelInfo = CEFRLevelInfo[submission.level];
      const exerciseTypeName = submission.exerciseType.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      return {
        id: submission.submissionId,
        icon: <span className="text-white text-sm">{getExerciseIcon(submission.exerciseType)}</span>,
        iconColor: submission.status === 'reviewed' ? 'bg-green-500' :
                   submission.status === 'submitted' ? 'bg-amber-500' : 'bg-gray-400',
        title: `${exerciseTypeName} Exercise`,
        description: `${levelInfo.displayName} • ${submission.wordCount} words`,
        timestamp: submission.updatedAt
          ? new Date(submission.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : undefined,
        tags: [
          {
            label: submission.status === 'draft' ? 'Draft' :
                   submission.status === 'submitted' ? 'Awaiting Review' : 'Reviewed',
            color: submission.status === 'draft' ? 'gray' as const :
                   submission.status === 'submitted' ? 'amber' as const : 'green' as const,
          },
          // Show score percentage badge
          ...(submission.teacherScore
            ? [{ label: `${submission.teacherScore}%`, color: 'blue' as const }]
            : []),
          // Show quality badge based on score
          ...(submission.teacherScore && submission.teacherScore >= 80
            ? [{ label: 'Excellent', color: 'green' as const }]
            : submission.teacherScore && submission.teacherScore >= 60
            ? [{ label: 'Good', color: 'blue' as const }]
            : []),
        ],
        metadata: (
          <div className="mt-2">
            {/* Content Preview */}
            <p className="text-xs text-gray-600 line-clamp-2 mb-3 text-left">
              {submission.content.substring(0, 150)}
              {submission.content.length > 150 && '...'}
            </p>

            <div className="flex items-start">
              <button
                onClick={() => onViewSubmission(submission.submissionId)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors text-left"
              >
                View Details →
              </button>
            </div>
          </div>
        ),
      };
    }

    // For quiz items
    return {
      id: submission.submissionId,
      icon: <span className="text-white text-sm">📝</span>,
      iconColor: 'bg-blue-500',
      title: `Review Quiz - ${sourceType === 'ai' ? 'AI' : sourceType === 'teacher' ? 'Teacher' : 'Reference'} Correction`,
      description: `${submission.wordCount} blanks${quizScore !== null ? ` • Score: ${quizScore}%` : ''}`,
      timestamp: submission.updatedAt
        ? new Date(submission.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : undefined,
      tags: [
        {
          label: 'Review Quiz',
          color: 'blue' as const,
        },
        {
          label: sourceType || 'quiz',
          color: 'purple' as const,
        },
        {
          label: 'Completed',
          color: 'green' as const,
          icon: '✓',
        },
        ...(quizScore && quizScore >= 80
          ? [{ label: 'Excellent', color: 'green' as const }]
          : quizScore && quizScore >= 60
          ? [{ label: 'Good', color: 'blue' as const }]
          : []),
      ],
      metadata: (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-2 text-left">
            Review quiz completed
          </p>
        </div>
      ),
    };
  });

  // Calculate pagination
  const totalPages = Math.ceil(activityItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = activityItems.slice(startIndex, endIndex);

  return (
    <div>
      <ActivityTimeline
        items={paginatedItems}
        showConnector={true}
        showPagination={false}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
