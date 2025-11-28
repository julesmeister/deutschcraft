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

  // SAFETY: Normalize teacherScore in case it wasn't done upstream
  const safeSubmissions = paginatedSubmissions.map(sub => {
    console.log('[RecentActivityTimeline] Full submission object:', sub);
    console.log('[RecentActivityTimeline] All keys:', Object.keys(sub));

    const safe: any = { ...sub };

    // Check all fields for objects
    Object.keys(safe).forEach(key => {
      const value = safe[key];
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        console.log(`[RecentActivityTimeline] Found object in field "${key}":`, value);

        // If it has score-like fields, extract overallScore
        if ('overallScore' in value) {
          console.log(`[RecentActivityTimeline] Extracting overallScore from ${key}`);
          safe[key] = value.overallScore;
        }
      }
    });

    return safe;
  });

  return (
    <>
      <ActivityTimeline
        items={safeSubmissions.map((submission) => {
        const statusColor =
          submission.status === 'submitted' ? 'blue' :
          submission.status === 'reviewed' ? 'green' :
          submission.status === 'draft' ? 'gray' : 'gray';

        const isQuiz = (submission as any).isQuiz;
        const exerciseIcon = isQuiz ? '📝' :
          submission.exerciseType === 'creative' ? '✨' :
          submission.exerciseType === 'translation' ? '🔄' :
          submission.exerciseType === 'email' ? '✉️' : '📨';

        // Handle teacherScore - could be number or object
        const teacherScore = typeof submission.teacherScore === 'number'
          ? submission.teacherScore
          : typeof submission.teacherScore === 'object' && submission.teacherScore !== null
          ? (submission.teacherScore as any).overallScore
          : null;

        // Ensure teacherScore is a number, not an object
        const numericScore = typeof teacherScore === 'number' ? teacherScore : null;

        const quizScore = isQuiz ? (submission as any).score : null;

        return {
          id: submission.submissionId,
          icon: <span className="text-white text-sm">{exerciseIcon}</span>,
          iconColor: isQuiz ? 'bg-blue-500' : 'bg-purple-500',
          title: isQuiz
            ? `Review Quiz - ${(submission as any).sourceType === 'ai' ? 'AI' : (submission as any).sourceType === 'teacher' ? 'Teacher' : 'Reference'} Correction`
            : ((submission as any).exerciseTitle || `${submission.exerciseType} exercise`),
          description: isQuiz
            ? `${submission.wordCount} blanks${quizScore !== null ? ` • Score: ${quizScore}%` : ''}`
            : `${submission.wordCount} words${numericScore ? ` • Score: ${numericScore}/100` : ''}`,
          timestamp: new Date(submission.submittedAt || submission.updatedAt).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          tags: isQuiz ? [
            {
              label: 'Review Quiz',
              color: 'blue',
            },
            {
              label: (submission as any).sourceType || 'quiz',
              color: 'purple',
            },
            {
              label: submission.status === 'submitted' ? 'In Progress' : 'Completed',
              color: statusColor,
              icon: submission.status === 'reviewed' ? '✓' : undefined,
            },
            ...(quizScore && quizScore >= 80
              ? [{ label: 'Excellent', color: 'green' as const }]
              : quizScore && quizScore >= 60
              ? [{ label: 'Good', color: 'blue' as const }]
              : []),
          ] : [
            {
              label: submission.exerciseType,
              color: 'purple',
            },
            {
              label: submission.level || 'N/A',
              color: 'blue',
            },
            {
              label: submission.status === 'draft' ? 'Draft' :
                     submission.status === 'submitted' ? 'Awaiting Review' : 'Reviewed',
              color: statusColor,
              icon: submission.status === 'reviewed' ? '✓' : undefined,
            },
            ...(numericScore && numericScore >= 80
              ? [{ label: 'Excellent', color: 'green' as const }]
              : numericScore && numericScore >= 60
              ? [{ label: 'Good', color: 'blue' as const }]
              : []),
          ],
          metadata: (
            <div className="mt-2">
              {submission.teacherFeedback && (
                <p className="text-xs text-gray-600 italic line-clamp-2 mb-2">
                  "{submission.teacherFeedback}"
                </p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.open(`/dashboard/student/writing/feedback/${submission.submissionId}`, '_blank')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View Feedback →
                </button>
              </div>
            </div>
          ),
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
