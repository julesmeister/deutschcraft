'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useWritingSubmission, useTeacherReview } from '@/lib/hooks/useWritingExercises';
import { FeedbackWorkspace } from './FeedbackWorkspace';
import { CatLoader } from '@/components/ui/CatLoader';
import { getExerciseById } from '@/lib/data/translationExercises';
import { TranslationExercise } from '@/lib/models/writing';

export default function WritingFeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.submissionId as string;

  const [activeTab, setActiveTab] = useState<'submission' | 'feedback' | 'history'>('submission');
  const [referenceTranslation, setReferenceTranslation] = useState<string | undefined>(undefined);

  const { data: submission, isLoading } = useWritingSubmission(submissionId);
  const { data: teacherReview, isLoading: teacherReviewLoading } = useTeacherReview(submissionId);

  // Fetch reference translation for translation exercises
  useEffect(() => {
    if (submission && submission.exerciseType === 'translation' && submission.exerciseId) {
      const exercise = getExerciseById(submission.exerciseId) as TranslationExercise | undefined;
      if (exercise && exercise.correctGermanText) {
        setReferenceTranslation(exercise.correctGermanText);
      }
    }
  }, [submission]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Writing Feedback"
          subtitle="Loading your submission..."
          backButton={{
            label: 'Back to Writing Hub',
            onClick: () => router.push('/dashboard/student/writing')
          }}
        />
        <div className="container mx-auto px-6 py-8">
          <CatLoader message="Loading feedback..." size="lg" />
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Writing Feedback"
          subtitle="Submission not found"
          backButton={{
            label: 'Back to Writing Hub',
            onClick: () => router.push('/dashboard/student/writing')
          }}
        />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submission Not Found</h3>
            <p className="text-gray-600 mb-4">This submission could not be found or has been deleted.</p>
            <button
              onClick={() => router.push('/dashboard/student/writing')}
              className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out h-10 rounded-xl bg-blue-500 px-5 py-2 text-sm text-white hover:bg-blue-600"
            >
              Back to Writing Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Writing Feedback"
        subtitle={`${submission.exerciseType.charAt(0).toUpperCase() + submission.exerciseType.slice(1)} Exercise • ${submission.wordCount} words`}
        backButton={{
          label: 'Back to Writing Hub',
          onClick: () => router.push('/dashboard/student/writing')
        }}
      />

      <div className="lg:container lg:mx-auto">
        <FeedbackWorkspace
          submission={submission}
          referenceTranslation={referenceTranslation}
          hasTeacherReview={!!teacherReview}
          teacherReview={teacherReview}
          teacherReviewLoading={teacherReviewLoading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}
