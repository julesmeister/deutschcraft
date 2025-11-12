/**
 * Teacher Writing Dashboard
 * View all student submissions and navigate to grading
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useAllWritingSubmissions } from '@/lib/hooks/useWritingExercises';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TabBar } from '@/components/ui/TabBar';
import { WritingSubmission, WritingExerciseType } from '@/lib/models/writing';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';

type StatusFilter = 'all' | 'submitted' | 'reviewed';
type ExerciseTypeFilter = WritingExerciseType | 'all';

export default function TeacherWritingDashboard() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('submitted');
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<ExerciseTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch submissions based on status filter
  const { data: submissions = [], isLoading } = useAllWritingSubmissions(statusFilter);

  // Calculate stats
  const stats = useMemo(() => {
    const pending = submissions.filter(s => s.status === 'submitted').length;
    const reviewed = submissions.filter(s => s.status === 'reviewed').length;
    const total = submissions.length;

    // Calculate this week's reviews
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const reviewedThisWeek = submissions.filter(
      s => s.status === 'reviewed' && s.updatedAt > oneWeekAgo
    ).length;

    // Calculate average response time (for reviewed submissions)
    const reviewedWithTimes = submissions.filter(
      s => s.status === 'reviewed' && s.submittedAt
    );
    const avgResponseTime = reviewedWithTimes.length > 0
      ? reviewedWithTimes.reduce((sum, s) => {
          const responseTime = s.updatedAt - (s.submittedAt || s.createdAt);
          return sum + responseTime;
        }, 0) / reviewedWithTimes.length
      : 0;
    const avgResponseDays = Math.round(avgResponseTime / (1000 * 60 * 60 * 24));

    return {
      total,
      pending,
      reviewed,
      reviewedThisWeek,
      avgResponseDays,
    };
  }, [submissions]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      // Filter by exercise type
      if (exerciseTypeFilter !== 'all' && submission.exerciseType !== exerciseTypeFilter) {
        return false;
      }

      // Filter by search query (student email or exercise title)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesUser = submission.userId.toLowerCase().includes(query);
        const matchesTitle = (submission as any).exerciseTitle?.toLowerCase().includes(query);
        return matchesUser || matchesTitle;
      }

      return true;
    });
  }, [submissions, exerciseTypeFilter, searchQuery]);

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white border border-gray-200 rounded-2xl p-8 max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view student submissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Writing Submissions 📝"
        subtitle="Review and grade student writing exercises"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview - TabBar Style */}
        <div className="mb-8">
          <TabBar
            variant="stats"
            tabs={[
              {
                id: 'total',
                label: 'Total Submissions',
                value: stats.total,
                icon: undefined,
              },
              {
                id: 'pending',
                label: 'Pending Review',
                value: stats.pending,
                icon: undefined,
              },
              {
                id: 'reviewed',
                label: 'Reviewed This Week',
                value: stats.reviewedThisWeek,
                icon: undefined,
              },
              {
                id: 'response',
                label: 'Avg. Response Time',
                value: stats.avgResponseDays > 0 ? `${stats.avgResponseDays}d` : '—',
                icon: undefined,
              },
            ]}
          />
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
            Filters
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="submitted">Pending Review</option>
                <option value="reviewed">Already Graded</option>
                <option value="all">All Submissions</option>
              </select>
            </div>

            {/* Exercise Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exercise Type
              </label>
              <select
                value={exerciseTypeFilter}
                onChange={(e) => setExerciseTypeFilter(e.target.value as ExerciseTypeFilter)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="creative">Creative Writing</option>
                <option value="translation">Translation</option>
                <option value="email">Email</option>
                <option value="letter">Letter</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Student email or exercise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
              Student Submissions ({filteredSubmissions.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">Loading submissions...</p>
                </div>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">
                  {statusFilter === 'submitted' ? '🎉' : '📝'}
                </div>
                <p className="font-semibold text-lg">
                  {statusFilter === 'submitted'
                    ? 'All caught up!'
                    : 'No submissions found'}
                </p>
                <p className="text-sm mt-2">
                  {statusFilter === 'submitted'
                    ? "You've reviewed all pending submissions."
                    : 'Try adjusting your filters or check back later.'}
                </p>
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <SubmissionCard
                  key={submission.submissionId}
                  submission={submission}
                  onClick={() =>
                    router.push(
                      `/dashboard/teacher/writing/grade/${submission.submissionId}`
                    )
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Submission Card Component
// ============================================================================

interface SubmissionCardProps {
  submission: WritingSubmission;
  onClick: () => void;
}

function SubmissionCard({ submission, onClick }: SubmissionCardProps) {
  const isReviewed = submission.status === 'reviewed';
  const hasTeacherFeedback = !!submission.teacherFeedback;

  // Format date
  const submissionDate = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';

  // Calculate time since submission
  const getTimeSince = () => {
    if (!submission.submittedAt) return null;
    const hours = Math.floor((Date.now() - submission.submittedAt) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Get exercise type icon
  const getExerciseIcon = () => {
    switch (submission.exerciseType) {
      case 'creative':
        return '✨';
      case 'translation':
        return '🔄';
      case 'email':
        return '✉️';
      case 'formal-letter':
      case 'informal-letter':
        return '📨';
      default:
        return '📝';
    }
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-6 hover:bg-gray-50 transition text-left group"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Side - Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getExerciseIcon()}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition">
                {(submission as any).exerciseTitle || 'Untitled Exercise'}
              </div>
              <div className="text-sm text-gray-600">{submission.userId}</div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">{submission.wordCount} words</span>
            <span>•</span>
            <span className="uppercase text-xs font-bold">{submission.level}</span>
            <span>•</span>
            <span>{submissionDate}</span>
            {getTimeSince() && (
              <>
                <span>•</span>
                <span className="text-amber-600 font-medium">{getTimeSince()}</span>
              </>
            )}
          </div>

          {/* Attempt Info */}
          {submission.attemptNumber && submission.attemptNumber > 1 && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
              🔄 Attempt #{submission.attemptNumber}
            </div>
          )}
        </div>

        {/* Right Side - Status Badge */}
        <div className="flex-shrink-0">
          {isReviewed ? (
            <div className="flex flex-col items-end gap-2">
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                ✓ Graded
              </div>
              {hasTeacherFeedback && submission.teacherScore && (
                <div className="text-sm font-bold text-gray-900">
                  {submission.teacherScore}/100
                </div>
              )}
            </div>
          ) : (
            <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
              ⏳ Pending
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
