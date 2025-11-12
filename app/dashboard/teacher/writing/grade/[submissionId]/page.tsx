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
import { ActivityCard } from '@/components/ui/activity/ActivityCard';
import { TeacherReview } from '@/lib/models/writing';

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

  if (submissionLoading || reviewLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <ActivityCard title="Submission Not Found">
            <p className="text-neutral-600">The submission you're looking for does not exist.</p>
            <button
              onClick={() => router.push('/dashboard/teacher/writing')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Back to Dashboard
            </button>
          </ActivityCard>
        </div>
      </div>
    );
  }

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <ActivityCard title="Authentication Required">
            <p className="text-neutral-600">Please sign in to grade submissions.</p>
          </ActivityCard>
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

      <div className="container mx-auto px-6 py-8 max-w-6xl space-y-6">

        {/* Student Info */}
        <ActivityCard title="Student Information">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-neutral-500 uppercase font-semibold">Student</div>
              <div className="text-sm font-medium text-neutral-900 mt-1">{submission.userId}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 uppercase font-semibold">Submitted</div>
              <div className="text-sm font-medium text-neutral-900 mt-1">
                {submission.submittedAt
                  ? new Date(submission.submittedAt).toLocaleDateString()
                  : 'Not submitted yet'}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 uppercase font-semibold">Word Count</div>
              <div className="text-sm font-medium text-neutral-900 mt-1">{submission.wordCount} words</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500 uppercase font-semibold">Version</div>
              <div className="text-sm font-medium text-neutral-900 mt-1">v{submission.version}</div>
            </div>
          </div>
        </ActivityCard>

        {/* Student's Writing */}
        <ActivityCard title="Student's Submission">
          <div className="bg-white rounded-lg p-6 border border-neutral-200 min-h-[200px]">
            <p className="text-neutral-800 whitespace-pre-wrap leading-relaxed">
              {submission.content}
            </p>
          </div>
          {(submission as any).exerciseTitle && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs font-semibold text-blue-700 uppercase">Exercise Prompt</div>
              <div className="text-sm text-neutral-700 mt-1">{(submission as any).exerciseTitle}</div>
            </div>
          )}
        </ActivityCard>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('grading')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'grading'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Grading
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Revision History ({submission.previousVersions?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'grading' && (
          <TeacherGradingPanel
            submissionId={submissionId}
            submissionContent={submission.content}
            studentId={submission.userId}
            teacherId={session.user.email}
            onSubmitReview={handleSubmitReview}
            existingReview={existingReview || undefined}
          />
        )}

        {activeTab === 'history' && (
          <ActivityCard title="Revision History">
            {submission.previousVersions && submission.previousVersions.length > 0 ? (
              <RevisionHistory
                versions={submission.previousVersions}
                currentVersion={submission.version}
                onRestoreVersion={(version) => {
                  console.log('Restore version:', version);
                  alert('Restore version feature coming soon!');
                }}
              />
            ) : (
              <div className="text-center py-12 text-neutral-500">
                <p>No revision history available yet.</p>
                <p className="text-sm mt-2">This is the first version of the submission.</p>
              </div>
            )}
          </ActivityCard>
        )}
      </div>
    </div>
  );
}
