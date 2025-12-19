/**
 * Teacher Writing Grading Page
 * View and grade individual student writing submissions
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useWritingSubmission, useTeacherReview, useCreateTeacherReview, useUpdateTeacherReview } from '@/lib/hooks/useWritingExercises';
import { TeacherGradingPanel } from '@/components/writing/TeacherGradingPanel';
import { RevisionHistory } from '@/components/writing/RevisionHistory';
import { TeacherReview } from '@/lib/models/writing';
import { CatLoader } from '@/components/ui/CatLoader';
import { getExerciseById } from '@/lib/data/translationExercises';
import { SubmissionDisplay } from './SubmissionDisplay';
import { GradingTabs } from './GradingTabs';
import { useToast } from '@/components/ui/toast';

export default function TeacherGradingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const submissionId = params.submissionId as string;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'grading' | 'history'>('grading');
  const [correctedVersion, setCorrectedVersion] = useState('');
  const [referenceTranslation, setReferenceTranslation] = useState<string | undefined>(undefined);

  // Fetch submission and existing review
  const { data: submission, isLoading: submissionLoading } = useWritingSubmission(submissionId);
  const { data: existingReview, isLoading: reviewLoading } = useTeacherReview(submissionId);

  // Mutations
  const createReview = useCreateTeacherReview();
  const updateReview = useUpdateTeacherReview();

  // Fetch reference translation for translation exercises
  useEffect(() => {
    if (submission?.exerciseType === 'translation' && submission.exerciseId) {
      const exercise = getExerciseById(submission.exerciseId);
      if (exercise) {
        setReferenceTranslation(exercise.correctGermanText);
      }
    }
  }, [submission]);

  // Initialize corrected version from existing review
  useEffect(() => {
    if (existingReview?.correctedVersion) {
      setCorrectedVersion(existingReview.correctedVersion);
    }
  }, [existingReview]);

  const handleSubmitReview = async (reviewData: Omit<TeacherReview, 'reviewId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (existingReview) {
        await updateReview.mutateAsync({
          reviewId: existingReview.reviewId,
          updates: reviewData,
        });
        toast.success('Your review has been updated successfully', {
          title: 'Review Updated',
        });
      } else {
        await createReview.mutateAsync(reviewData);
        toast.success('Your review has been submitted successfully', {
          title: 'Review Submitted',
        });
      }
      router.push('/dashboard/teacher/writing');
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review. Please try again.', {
        title: 'Error',
      });
    }
  };

  // Loading states
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
        <div className="bg-white min-h-[600px] flex rounded-lg shadow-sm border border-gray-200">
          {/* LEFT: Student's Submission */}
          <SubmissionDisplay
            submission={submission}
            userName={session?.user?.name}
            referenceTranslation={referenceTranslation}
            correctedVersion={correctedVersion}
            onCorrectedVersionChange={setCorrectedVersion}
          />

          {/* SEPARATOR */}
          <div className="w-px bg-gray-200" />

          {/* RIGHT: Grading/History Tabs */}
          <GradingTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            historyCount={submission.previousVersions?.length || 0}
            gradingPanel={
              <TeacherGradingPanel
                submissionId={submissionId}
                submissionContent={submission.content}
                studentId={submission.userId}
                teacherId={session.user.email}
                onSubmitReview={handleSubmitReview}
                existingReview={existingReview || undefined}
                correctedVersion={correctedVersion}
              />
            }
            historyPanel={
              submission.previousVersions && submission.previousVersions.length > 0 ? (
                <RevisionHistory
                  versions={submission.previousVersions}
                  currentVersion={submission.version}
                  onRestoreVersion={(version) => {
                    showToast({
                      title: 'Coming Soon',
                      message: 'Restore version feature is coming soon',
                      variant: 'info',
                    });
                  }}
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-sm">No revision history available yet.</p>
                  <p className="text-xs mt-1">This is the first version of the submission.</p>
                </div>
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
