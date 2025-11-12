'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WritingFeedback as WritingFeedbackComponent } from '@/components/writing/WritingFeedback';
import { RevisionHistory } from '@/components/writing/RevisionHistory';
import { TeacherFeedbackDisplay } from '@/components/writing/TeacherFeedbackDisplay';
import { PeerReviewsDisplay } from '@/components/writing/PeerReviewsDisplay';
import { ActivityCard } from '@/components/ui/activity/ActivityCard';
import { useWritingSubmission, useTeacherReview, usePeerReviews } from '@/lib/hooks/useWritingExercises';

export default function WritingFeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const submissionId = params.submissionId as string;

  const [activeTab, setActiveTab] = useState<'feedback' | 'history' | 'peer'>('feedback');

  const { data: submission, isLoading } = useWritingSubmission(submissionId);
  const { data: teacherReview, isLoading: teacherReviewLoading } = useTeacherReview(submissionId);
  const { data: peerReviews = [], isLoading: peerReviewsLoading } = usePeerReviews(submissionId);

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
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading feedback...</p>
            </div>
          </div>
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

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Your Submission */}
        <ActivityCard title="Your Submission">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-neutral-800 leading-relaxed whitespace-pre-wrap">{submission.content}</p>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-neutral-600">
            <span>Words: {submission.wordCount}</span>
            <span>•</span>
            <span>Status: {submission.status}</span>
            {submission.submittedAt && (
              <>
                <span>•</span>
                <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
              </>
            )}
            <span>•</span>
            <span>Version: {submission.version}</span>
          </div>
        </ActivityCard>

        {/* Tabs Navigation */}
        <div className="flex gap-2 border-b border-neutral-200 mt-6">
          <TabButton
            label="Teacher Feedback"
            active={activeTab === 'feedback'}
            badge={teacherReview ? '✓' : undefined}
            onClick={() => setActiveTab('feedback')}
          />
          <TabButton
            label="Peer Reviews"
            active={activeTab === 'peer'}
            count={peerReviews.length}
            onClick={() => setActiveTab('peer')}
          />
          <TabButton
            label="Revision History"
            active={activeTab === 'history'}
            count={submission.previousVersions?.length || 0}
            onClick={() => setActiveTab('history')}
          />
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Teacher Feedback Tab */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {teacherReviewLoading ? (
                <LoadingCard />
              ) : teacherReview ? (
                <TeacherFeedbackDisplay teacherReview={teacherReview} />
              ) : (
                <PendingFeedbackCard />
              )}

              {/* Legacy AI Feedback (if exists) */}
              {submission.aiFeedback && (
                <div className="mt-6">
                  <WritingFeedbackComponent
                    feedback={submission.aiFeedback}
                    studentText={submission.content}
                    referenceText={submission.originalText}
                  />
                </div>
              )}
            </div>
          )}

          {/* Peer Reviews Tab */}
          {activeTab === 'peer' && (
            peerReviewsLoading ? (
              <LoadingCard />
            ) : (
              <PeerReviewsDisplay peerReviews={peerReviews} />
            )
          )}

          {/* Revision History Tab */}
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
                <NoRevisionHistoryCard />
              )}
            </ActivityCard>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface TabButtonProps {
  label: string;
  active: boolean;
  badge?: string;
  count?: number;
  onClick: () => void;
}

function TabButton({ label, active, badge, count, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-semibold transition ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-neutral-500 hover:text-neutral-700'
      }`}
    >
      {label}
      {badge && <span className="ml-2 text-xs">{badge}</span>}
      {count !== undefined && count > 0 && ` (${count})`}
    </button>
  );
}

function LoadingCard() {
  return (
    <ActivityCard title="Loading...">
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    </ActivityCard>
  );
}

function PendingFeedbackCard() {
  return (
    <ActivityCard title="Feedback Pending">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⏳</div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Awaiting Teacher Review</h3>
        <p className="text-neutral-600">
          Your teacher will review your submission soon. Check back later for feedback.
        </p>
      </div>
    </ActivityCard>
  );
}

function NoRevisionHistoryCard() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Revision History</h3>
      <p className="text-neutral-600">
        This is the first version of your submission. Future edits will appear here.
      </p>
    </div>
  );
}
