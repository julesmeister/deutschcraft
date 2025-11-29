/**
 * FeedbackContent Component
 * Displays teacher feedback or waiting state
 */

import { WritingSubmission, TeacherReview } from '@/lib/models/writing';
import { TeacherFeedbackDisplay } from '@/components/writing/TeacherFeedbackDisplay';
import { WritingFeedback as WritingFeedbackComponent } from '@/components/writing/WritingFeedback';

interface FeedbackContentProps {
  submission: WritingSubmission;
  teacherReview?: TeacherReview | null;
  teacherReviewLoading: boolean;
}

export function FeedbackContent({
  submission,
  teacherReview,
  teacherReviewLoading,
}: FeedbackContentProps) {
  return (
    <>
      {teacherReviewLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-600">Loading feedback...</p>
          </div>
        </div>
      ) : teacherReview ? (
        <TeacherFeedbackDisplay teacherReview={teacherReview} />
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">⏳</div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Awaiting Teacher Review</h3>
          <p className="text-xs text-gray-600">
            Your teacher will review your submission soon.
          </p>
        </div>
      )}

      {/* Legacy AI Feedback (if exists) */}
      {submission.aiFeedback && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <WritingFeedbackComponent
            feedback={submission.aiFeedback}
            studentText={submission.content}
            referenceText={submission.originalText}
          />
        </div>
      )}
    </>
  );
}
