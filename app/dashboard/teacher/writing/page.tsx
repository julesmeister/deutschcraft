/**
 * Teacher Writing Dashboard
 * View all student submissions and navigate to grading
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { useAllWritingSubmissions, useUpdateWritingSubmission } from '@/lib/hooks/useWritingExercises';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TabBar } from '@/components/ui/TabBar';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SlimTable, SlimTableRenderers } from '@/components/ui/SlimTable';
import { CompactButtonDropdown, DropdownOption } from '@/components/ui/CompactButtonDropdown';
import { WritingSubmission, WritingExerciseType } from '@/lib/models/writing';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useAllStudents } from '@/lib/hooks/useSimpleUsers';
import { TRANSLATION_EXERCISES } from '@/lib/data/translations';
import { CREATIVE_EXERCISES } from '@/lib/data/creativeExercises';
import { EMAIL_TEMPLATES } from '@/lib/data/emailTemplates';
import { LETTER_TEMPLATES } from '@/lib/data/letterTemplates';
import { CatLoader } from '@/components/ui/CatLoader';

type StatusFilter = 'all' | 'submitted' | 'reviewed';
type ExerciseTypeFilter = WritingExerciseType | 'all';

export default function TeacherWritingDashboard() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('submitted');
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<ExerciseTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch submissions based on status filter
  const { data: submissions = [], isLoading } = useAllWritingSubmissions(statusFilter);

  // Fetch students for name mapping (use the nested version that includes all fields)
  const { students: allStudents } = useAllStudents();

  // Mutation for updating submission status
  const updateSubmissionMutation = useUpdateWritingSubmission();

  // Helper function to get student name from userId
  const getStudentName = (userId: string): string => {
    // Try to match by id first
    let student = allStudents.find(s => s.id === userId);

    // If not found, try to match by email
    if (!student) {
      student = allStudents.find(s => s.email === userId);
    }

    if (student) {
      // Handle both formats: {name: "Full Name"} OR {firstName: "First", lastName: "Last"}
      const displayName = (student as any).name ||
                          `${student.firstName || ''} ${student.lastName || ''}`.trim();
      return displayName || student.email;
    }

    // Fallback to userId if student not found
    return userId;
  };

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

      // Filter by search query (student name, email, or exercise title)
      if (deferredQuery.trim()) {
        const query = deferredQuery.toLowerCase();
        const matchesUser = submission.userId.toLowerCase().includes(query);
        const studentName = getStudentName(submission.userId).toLowerCase();
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

  // Helper function to get exercise title from exerciseId
  const getExerciseTitle = (exerciseId: string, exerciseType: WritingExerciseType): string => {
    try {
      switch (exerciseType) {
        case 'translation': {
          const exercise = TRANSLATION_EXERCISES.find(ex => ex.exerciseId === exerciseId);
          return exercise?.title || 'Translation Exercise';
        }
        case 'creative': {
          const exercise = CREATIVE_EXERCISES.find(ex => ex.exerciseId === exerciseId);
          return exercise?.title || 'Creative Writing';
        }
        case 'email': {
          const template = EMAIL_TEMPLATES.find(t => t.id === exerciseId);
          return template?.title || 'Email Exercise';
        }
        case 'formal-letter':
        case 'informal-letter': {
          const template = LETTER_TEMPLATES.find(t => t.id === exerciseId);
          return template?.title || 'Letter Exercise';
        }
        default:
          return 'Writing Exercise';
      }
    } catch (error) {
      console.error('[getExerciseTitle] Error:', error);
      return 'Writing Exercise';
    }
  };

  // Helper functions
  const getExerciseIcon = (exerciseType: WritingExerciseType) => {
    switch (exerciseType) {
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeSince = (timestamp: number) => {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Transform submissions to table rows
  const tableData = paginatedSubmissions.map(submission => ({
    id: submission.submissionId,
    exerciseType: submission.exerciseType,
    exerciseTitle: getExerciseTitle(submission.exerciseId, submission.exerciseType),
    userId: submission.userId,
    studentName: getStudentName(submission.userId),
    wordCount: submission.wordCount,
    level: submission.level,
    submittedAt: submission.submittedAt,
    status: submission.status,
    attemptNumber: submission.attemptNumber,
    teacherScore: submission.teacherScore,
    teacherFeedback: submission.teacherFeedback,
  }));

  const handleRowClick = (row: any) => {
    router.push(`/dashboard/teacher/writing/grade/${row.id}`);
  };

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

        {/* Submissions List */}
        <div className="bg-white border border-gray-200">
          {/* Filters and Search - Compact Header */}
          <div className="m-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
                Student Submissions ({filteredSubmissions.length})
              </h5>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 gap-3 [&_>_div_>_div]:!bg-gray-50 [&_>_div_>_div]:!border-none [&_>_div_>_div]:!rounded-none [&_>_div_>_div:hover]:!bg-gray-100 [&_>_div_>_div[class*='ring']]:!bg-gray-100 [&_>_div_>_div[class*='ring']]:!ring-0">
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                options={[
                  { value: 'submitted', label: 'Pending Review' },
                  { value: 'reviewed', label: 'Already Graded' },
                  { value: 'all', label: 'All Submissions' },
                ]}
              />
              <Select
                value={exerciseTypeFilter}
                onChange={(value) => setExerciseTypeFilter(value as ExerciseTypeFilter)}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'creative', label: 'Creative Writing' },
                  { value: 'translation', label: 'Translation' },
                  { value: 'email', label: 'Email' },
                  { value: 'letter', label: 'Letter' },
                ]}
              />
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search students or exercises..."
                className="w-full px-4 py-2 pl-10 bg-gray-50 border-none focus:outline-none focus:bg-gray-100 transition-colors"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {isStale && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          </div>

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
            <SlimTable
              title=""
              columns={[
                {
                  key: 'exerciseType',
                  label: ' ',
                  width: '60px',
                  render: (value) => (
                    <span className="text-2xl">{getExerciseIcon(value)}</span>
                  ),
                },
                {
                  key: 'exerciseTitle',
                  label: 'Exercise',
                  render: (value, row) => (
                    <div>
                      <div className="font-bold text-gray-900 truncate hover:text-blue-600 transition">
                        {value}
                      </div>
                      <div className="text-sm text-gray-600">{row.studentName}</div>
                    </div>
                  ),
                },
                {
                  key: 'wordCount',
                  label: 'Words',
                  align: 'center',
                  render: (value) => <p className="text-gray-500 text-xs text-center">{value}</p>,
                },
                {
                  key: 'level',
                  label: 'Level',
                  align: 'center',
                  render: (value) => (
                    <span className="uppercase text-xs font-bold text-gray-600">{value}</span>
                  ),
                },
                {
                  key: 'submittedAt',
                  label: 'Submitted',
                  render: (value) => (
                    <div className="text-sm text-gray-600">
                      <div>{value ? formatDate(value) : 'Draft'}</div>
                      {value && (
                        <div className="text-amber-600 font-medium text-xs">
                          {getTimeSince(value)}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'status',
                  label: 'Status',
                  align: 'center',
                  width: '220px',
                  render: (value, row) => {
                    const statusOptions: DropdownOption[] = [
                      {
                        value: 'submitted',
                        label: 'Pending Review',
                        icon: <span className="text-sm">⏳</span>,
                      },
                      {
                        value: 'reviewed',
                        label: 'Graded',
                        icon: <span className="text-sm">✓</span>,
                      },
                      {
                        value: 'view',
                        label: 'View Submission',
                        icon: (
                          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ),
                      },
                    ];

                    return (
                      <div
                        className="flex items-center justify-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Status Dropdown */}
                        <CompactButtonDropdown
                          label={
                            value === 'reviewed'
                              ? `Graded${row.teacherScore ? ` ${row.teacherScore}` : ''}`
                              : 'Pending'
                          }
                          icon={<span className="text-sm">{value === 'reviewed' ? '✓' : '⏳'}</span>}
                          options={statusOptions}
                          value={value}
                          onChange={(selectedValue) => {
                            if (selectedValue === 'view') {
                              router.push(`/dashboard/teacher/writing/grade/${row.id}`);
                            } else {
                              handleStatusChange(row.id, selectedValue as string);
                            }
                          }}
                          buttonClassName={`
                            !text-xs !py-1 !px-2.5
                            ${value === 'reviewed'
                              ? '!bg-green-100 !text-green-700 hover:!bg-green-200'
                              : '!bg-yellow-100 !text-yellow-700 hover:!bg-yellow-200'
                            }
                          `}
                          usePortal={true}
                        />

                        {/* Attempt Badge */}
                        {row.attemptNumber && row.attemptNumber > 1 && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-cyan-100 text-cyan-700 rounded">
                            <span>🔄</span>
                            <span>#{row.attemptNumber}</span>
                          </div>
                        )}
                      </div>
                    );
                  },
                },
              ]}
              data={tableData}
              onRowClick={handleRowClick}
              pagination={{
                currentPage,
                totalPages,
                pageSize,
                totalItems: filteredSubmissions.length,
                onPageChange: setCurrentPage,
              }}
              showViewAll={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
