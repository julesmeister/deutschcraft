/**
 * Teacher Writing Dashboard
 * View all student submissions and navigate to grading
 */

'use client';

import { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { useWritingSubmissionsPaginated, useUpdateWritingSubmission } from '@/lib/hooks/useWritingSubmissions';
import { useActiveBatches } from '@/lib/hooks/useBatches';
import { useBatchSelection } from '@/lib/hooks/useBatchSelection';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { BatchSelector } from '@/components/ui/BatchSelector';
import { Batch } from '@/lib/models';
import { WritingSubmission, WritingExerciseType } from '@/lib/models/writing';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useTeacherStudents, useCurrentStudent } from '@/lib/hooks/useUsers';
import { CatLoader } from '@/components/ui/CatLoader';
import { StatsOverview } from '@/components/teacher/writing/StatsOverview';
import { FilterControls } from '@/components/teacher/writing/FilterControls';
import { SubmissionsTable } from '@/components/teacher/writing/SubmissionsTable';
import { getExerciseTitle, getStudentName } from '@/components/teacher/writing/utils';

type StatusFilter = 'all' | 'submitted' | 'reviewed';
type ExerciseTypeFilter = WritingExerciseType | 'all';

export default function TeacherWritingDashboard() {
  const { session } = useFirebaseAuth();
  const currentTeacherId = session?.user?.email;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('teacher-writing-status-filter');
      if (saved === 'all' || saved === 'submitted' || saved === 'reviewed') return saved;
    }
    return 'submitted';
  });
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<ExerciseTypeFilter>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('teacher-writing-type-filter') as ExerciseTypeFilter) || 'all';
    }
    return 'all';
  });

  // Persist filter selections to localStorage
  useEffect(() => {
    localStorage.setItem('teacher-writing-status-filter', statusFilter);
  }, [statusFilter]);
  useEffect(() => {
    localStorage.setItem('teacher-writing-type-filter', exerciseTypeFilter);
  }, [exerciseTypeFilter]);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  // Fetch batches and students
  const { batches } = useActiveBatches(currentTeacherId);
  const { students: allStudents } = useTeacherStudents(currentTeacherId);
  
  // Get current user for preferences
  const { student: currentUser } = useCurrentStudent(currentTeacherId);

  // Use standardized batch selection logic (with history and persistence)
  const { selectedBatch, setSelectedBatch, sortedBatches } = useBatchSelection({
    batches,
    user: currentUser,
  });

  // Get student IDs for selected batch
  // OPTIMIZATION: Only calculate when a specific batch is selected
  const batchStudentIds = useMemo(() => {
    if (!selectedBatch) {
      return []; // Empty array = no filter (will show all in service layer)
    }

    // Filter students by selected batch
    return allStudents
      .filter(student => student.batchId === selectedBatch.batchId)
      .map(student => student.userId);
  }, [selectedBatch, allStudents]);

  // Use paginated hook with batch filtering
  const {
    submissions,
    isLoading,
    page: currentPage,
    totalPages,
    pageSize,
    totalCount,
    goToPage,
  } = useWritingSubmissionsPaginated({
    statusFilter,
    batchId: selectedBatch?.batchId || null,
    studentIds: batchStudentIds,
    pageSize: 10,
  });

  // Mutation for updating submission status
  const updateSubmissionMutation = useUpdateWritingSubmission();

  // Calculate stats (from totalCount, not just current page)
  const stats = useMemo(() => ({
    total: totalCount,
    pending: statusFilter === 'submitted' ? totalCount : 0,
    reviewed: statusFilter === 'reviewed' ? totalCount : 0,
    reviewedThisWeek: 0, // Would need separate query for accurate count
    avgResponseDays: 0, // Would need separate query for accurate calculation
  }), [totalCount, statusFilter]);

  // Client-side filter by exercise type and search
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
        const exerciseTitle = getExerciseTitle(submission.exerciseId, submission.exerciseType, submission.exerciseTitle);
        const matchesTitle = exerciseTitle.toLowerCase().includes(query);
        return matchesUser || matchesName || matchesTitle;
      }

      return true;
    });
  }, [submissions, exerciseTypeFilter, deferredQuery, allStudents]);

  const isStale = searchQuery !== deferredQuery;

  // Transform submissions to table rows
  const tableData = filteredSubmissions.map((submission) => ({
    id: submission.submissionId,
    exerciseType: submission.exerciseType,
    exerciseTitle: getExerciseTitle(submission.exerciseId, submission.exerciseType, submission.exerciseTitle),
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
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedBatch(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                !selectedBatch
                  ? 'bg-piku-purple text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Batches
            </button>
            <BatchSelector
              batches={sortedBatches}
              selectedBatch={selectedBatch}
              onSelectBatch={setSelectedBatch}
              onCreateBatch={() => {}} // Not needed on this page
            />
          </div>
        }
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
              onPageChange={goToPage}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
