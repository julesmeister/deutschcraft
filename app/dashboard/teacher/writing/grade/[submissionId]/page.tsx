/**
 * Teacher Writing Grading Page
 * View and grade individual student writing submissions
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useWritingSubmission, useTeacherReview, useCreateTeacherReview, useUpdateTeacherReview } from '@/lib/hooks/useWritingExercises';
import { TeacherGradingPanel } from '@/components/writing/TeacherGradingPanel';
import { RevisionHistory } from '@/components/writing/RevisionHistory';
import { TeacherReview } from '@/lib/models/writing';
import { CatLoader } from '@/components/ui/CatLoader';

export default function TeacherGradingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const submissionId = params.submissionId as string;

  const [activeTab, setActiveTab] = useState<'grading' | 'history'>('grading');

  // Fetch submission and existing review
  const { data: submission, isLoading: submissionLoading } = useWritingSubmission(submissionId);
  const { data: existingReview, isLoading: reviewLoading } = useTeacherReview(submissionId);

  // Mutations
  const createReview = useCreateTeacherReview();
  const updateReview = useUpdateTeacherReview();

  const handleSubmitReview = async (reviewData: Omit<TeacherReview, 'reviewId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (existingReview) {
        // Update existing review
        await updateReview.mutateAsync({
          reviewId: existingReview.reviewId,
          updates: reviewData,
        });
        alert('Review updated successfully!');
      } else {
        // Create new review
        await createReview.mutateAsync(reviewData);
        alert('Review submitted successfully!');
      }

      // Redirect back to teacher writing dashboard
      router.push('/dashboard/teacher/writing');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  // Show loading while authentication or data is loading
  const isLoading = !session || submissionLoading || reviewLoading;

  if (isLoading) {
    return <CatLoader message="Loading submission..." size="lg" fullScreen />;
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-30">📝</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Submission Not Found</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            The submission you're looking for does not exist or may have been removed.
          </p>
          <button
            onClick={() => router.push('/dashboard/teacher/writing')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Writing Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-30">🔐</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Please sign in to grade submissions.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Grade Submission"
        subtitle={`${submission.exerciseType.charAt(0).toUpperCase() + submission.exerciseType.slice(1)} Exercise${submission.level ? ` • ${submission.level}` : ''}`}
        backButton={{
          label: 'Back to Writing Dashboard',
          onClick: () => router.push('/dashboard/teacher/writing')
        }}
        actions={
          existingReview && (
            <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold">
              ✓ Already Reviewed
            </div>
          )
        }
      />

      <div className="container mx-auto px-6 py-8">
        {/* 2-Column Workspace Layout */}
        <div className="bg-white min-h-[600px] flex rounded-lg shadow-sm border border-gray-200">
          {/* LEFT: Student's Submission */}
          <div className="flex-1 flex flex-col">
            {/* Student Info Header */}
            <div className="px-8 py-4 border-b border-gray-200 bg-gray-50/50">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Student</div>
                  <div className="font-medium text-gray-900">
                    {session?.user?.name || submission.userId}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Submitted</div>
                  <div className="font-medium text-gray-900">
                    {submission.submittedAt
                      ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Not submitted yet'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Words</div>
                  <div className="font-medium text-gray-900">{submission.wordCount}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Version</div>
                  <div className="font-medium text-gray-900">v{submission.version}</div>
                </div>
              </div>
            </div>

            {/* Student's Writing Content */}
            <div className="flex-1 p-8">
              <div className="prose max-w-none">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-lg">
                  {submission.content}
                </p>
              </div>
            </div>
          </div>

          {/* SEPARATOR */}
          <div className="w-px bg-gray-200" />

          {/* RIGHT: Grading/History Panel with Tabs */}
          <div className="w-[480px] flex flex-col">
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('grading')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'grading'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Grading
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>History</span>
                {submission.previousVersions && submission.previousVersions.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                    {submission.previousVersions.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'grading' && (
                <div className="p-6">
                  <TeacherGradingPanel
                    submissionId={submissionId}
                    submissionContent={submission.content}
                    studentId={submission.userId}
                    teacherId={session.user.email}
                    onSubmitReview={handleSubmitReview}
                    existingReview={existingReview || undefined}
                  />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="p-6">
                  {submission.previousVersions && submission.previousVersions.length > 0 ? (
                    <RevisionHistory
                      versions={submission.previousVersions}
                      currentVersion={submission.version}
                      onRestoreVersion={(version) => {
                        alert('Restore version feature coming soon!');
                      }}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-3">📝</div>
                      <p className="text-sm">No revision history available yet.</p>
                      <p className="text-xs mt-1">This is the first version of the submission.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
