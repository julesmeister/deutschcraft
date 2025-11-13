/**
 * Teacher Writing Dashboard
 * View all student submissions and navigate to grading
 */

'use client';

import { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { useAllWritingSubmissions, useUpdateWritingSubmission } from '@/lib/hooks/useWritingExercises';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { WritingSubmission, WritingExerciseType } from '@/lib/models/writing';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useAllStudents } from '@/lib/hooks/useSimpleUsers';
import { CatLoader } from '@/components/ui/CatLoader';
import { StatsOverview } from '@/components/teacher/writing/StatsOverview';
import { FilterControls } from '@/components/teacher/writing/FilterControls';
import { SubmissionsTable } from '@/components/teacher/writing/SubmissionsTable';
import { getExerciseTitle, getStudentName } from '@/components/teacher/writing/utils';

type StatusFilter = 'all' | 'submitted' | 'reviewed';
type ExerciseTypeFilter = WritingExerciseType | 'all';

export default function TeacherWritingDashboard() {
  const { session } = useFirebaseAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('submitted');
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<ExerciseTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch submissions based on status filter
  const { data: submissions = [], isLoading } = useAllWritingSubmissions(statusFilter);

  // Fetch students for name mapping
  const { students: allStudents } = useAllStudents();

  // Mutation for updating submission status
  const updateSubmissionMutation = useUpdateWritingSubmission();

  // Calculate stats
  const stats = useMemo(() => {
    const pending = submissions.filter((s) => s.status === 'submitted').length;
    const reviewed = submissions.filter((s) => s.status === 'reviewed').length;
    const total = submissions.length;

    // Calculate this week's reviews
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const reviewedThisWeek = submissions.filter(
      (s) => s.status === 'reviewed' && s.updatedAt > oneWeekAgo
    ).length;

    // Calculate average response time (for reviewed submissions)
    const reviewedWithTimes = submissions.filter(
      (s) => s.status === 'reviewed' && s.submittedAt
    );
    const avgResponseTime =
      reviewedWithTimes.length > 0
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
    return submissions.filter((submission) => {
      // Filter by exercise type
      if (exerciseTypeFilter !== 'all' && submission.exerciseType !== exerciseTypeFilter) {
        return false;
      }

      // Filter by search query (student name, email, or exercise title)
      if (deferredQuery.trim()) {
        const query = deferredQuery.toLowerCase();
        const matchesUser = submission.userId.toLowerCase().includes(query);
        const studentName = getStudentName(submission.userId, allStudents).toLowerCase();
        const matchesName = studentName.includes(query);
        const exerciseTitle = getExerciseTitle(submission.exerciseId, submission.exerciseType);
        const matchesTitle = exerciseTitle.toLowerCase().includes(query);
        return matchesUser || matchesName || matchesTitle;
      }

      return true;
    });
  }, [submissions, exerciseTypeFilter, deferredQuery, allStudents]);

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + pageSize);
  const isStale = searchQuery !== deferredQuery;

  // Reset to page 1 when filters change
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Transform submissions to table rows
  const tableData = paginatedSubmissions.map((submission) => ({
    id: submission.submissionId,
    exerciseType: submission.exerciseType,
    exerciseTitle: getExerciseTitle(submission.exerciseId, submission.exerciseType),
    userId: submission.userId,
    studentName: getStudentName(submission.userId, allStudents),
    wordCount: submission.wordCount,
    level: submission.level,
    submittedAt: submission.submittedAt,
    status: submission.status,
    attemptNumber: submission.attemptNumber,
    teacherScore: submission.teacherScore,
    teacherFeedback: submission.teacherFeedback,
  }));

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      await updateSubmissionMutation.mutateAsync({
        submissionId,
        updates: {
          status: newStatus as 'draft' | 'submitted' | 'reviewed',
        },
      });
    } catch (error) {
      console.error('[handleStatusChange] Error:', error);
    }
  };

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="text-center max-w-md">
          <EmptyState
            icon="🔒"
            title="Authentication Required"
            description="Please sign in to view student submissions."
          />
        </Card>
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
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Submissions List */}
        <div className="bg-white border border-gray-200">
          {/* Filters and Search */}
          <FilterControls
            statusFilter={statusFilter}
            exerciseTypeFilter={exerciseTypeFilter}
            searchQuery={searchQuery}
            isStale={isStale}
            filteredCount={filteredSubmissions.length}
            onStatusFilterChange={setStatusFilter}
            onExerciseTypeFilterChange={setExerciseTypeFilter}
            onSearchQueryChange={setSearchQuery}
          />

          {isLoading ? (
            <div className="p-12">
              <CatLoader message="Loading submissions..." size="lg" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={statusFilter === 'submitted' ? '🎉' : '📝'}
                title={statusFilter === 'submitted' ? 'All caught up!' : 'No submissions found'}
                description={
                  statusFilter === 'submitted'
                    ? "You've reviewed all pending submissions."
                    : 'Try adjusting your filters or check back later.'
                }
              />
            </div>
          ) : (
            <SubmissionsTable
              data={tableData}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredSubmissions.length}
              onPageChange={setCurrentPage}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
