/**
 * FeedbackWorkspace Component
 * 2-column layout (desktop): Submission | Feedback/History tabs
 * 3-tab layout (mobile/tablet): Submission | Feedback | History
 */

'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WritingSubmission, TeacherReview } from '@/lib/models/writing';
import { useToast } from '@/components/ui/toast';
import { saveAICorrectedVersion } from '@/lib/services/writing';
import { createReviewQuiz, completeReviewQuiz } from '@/lib/services/writing/reviewQuizService';
import { generateQuizBlanks } from '@/lib/utils/quizGenerator';
import { getUser } from '@/lib/services/user';
import { getUserFullName } from '@/lib/models/user';
import { useUpdateProgressForQuiz } from '@/lib/hooks/useWritingExercises';
import { SubmissionContent } from './SubmissionContent';
import { FeedbackContent } from './FeedbackContent';
import { HistoryContent } from './HistoryContent';
import { TabButton } from './TabButton';

interface FeedbackWorkspaceProps {
  submission: WritingSubmission;
  referenceTranslation?: string; // For translation exercises
  hasTeacherReview?: boolean; // Whether teacher has reviewed
  teacherReview?: TeacherReview | null; // Teacher review data for corrected version
  teacherReviewLoading: boolean;
  activeTab: 'submission' | 'feedback' | 'history';
  onTabChange: (tab: 'submission' | 'feedback' | 'history') => void;
}

export function FeedbackWorkspace({
  submission,
  referenceTranslation,
  hasTeacherReview,
  teacherReview,
  teacherReviewLoading,
  activeTab,
  onTabChange
}: FeedbackWorkspaceProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const updateProgressForQuiz = useUpdateProgressForQuiz();
  const [quizMode, setQuizMode] = useState<'ai' | 'teacher' | 'reference' | null>(null);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState<string>('You');

  // Fetch author name for history timeline
  useEffect(() => {
    async function fetchAuthorName() {
      if (submission.userId) {
        try {
          const user = await getUser(submission.userId);
          if (user) {
            const displayName = (user as any).name || getUserFullName(user);
            setAuthorName(displayName);
          }
        } catch (error) {
          console.error('Failed to fetch user name:', error);
        }
      }
    }
    fetchAuthorName();
  }, [submission.userId]);

  const handleSaveAICorrection = async (correctedText: string) => {
    await saveAICorrectedVersion(submission.submissionId, correctedText);
    // Invalidate and refetch submission data
    await queryClient.invalidateQueries({
      queryKey: ['writing-submission', submission.submissionId]
    });
  };

  const handleStartQuiz = async (sourceType: 'ai' | 'teacher' | 'reference', correctedText: string) => {
    try {
      const blanks = generateQuizBlanks(submission.content, correctedText);

      if (blanks.length === 0) {
        toast.info('No corrections to review in this version.');
        return;
      }

      const quiz = await createReviewQuiz(
        submission.submissionId,
        submission.userId,
        submission.exerciseId,
        submission.exerciseType,
        sourceType,
        submission.content,
        correctedText,
        blanks
      );

      setCurrentQuizId(quiz.quizId);
      setQuizMode(sourceType);
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start quiz. Please try again.');
    }
  };

  const handleCompleteQuiz = async (
    score: number,
    correctAnswers: number,
    totalBlanks: number,
    answers: Record<number, string>
  ) => {
    if (!currentQuizId) return;

    try {
      // Complete the quiz and get the updated quiz data
      const completedQuiz = await completeReviewQuiz(currentQuizId, answers, score, correctAnswers);

      // Update daily progress for streak tracking (using hook for abstraction)
      if (completedQuiz) {
        await updateProgressForQuiz.mutateAsync({
          userId: completedQuiz.userId,
          quiz: completedQuiz,
        });
      }

      toast.success(`Quiz completed! Score: ${score}%`, { duration: 5000 });

      // Invalidate quiz stats to refresh the data
      await queryClient.invalidateQueries({
        queryKey: ['user-quiz-stats', submission.userId]
      });
      await queryClient.invalidateQueries({
        queryKey: ['completed-quizzes', submission.userId]
      });

      setQuizMode(null);
      setCurrentQuizId(null);
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast.error('Failed to save quiz results. Please try again.');
    }
  };

  const handleCancelQuiz = () => {
    setQuizMode(null);
    setCurrentQuizId(null);
  };

  return (
    <div className="bg-white flex flex-col min-h-screen">
      {/* Tabs Navigation (Sticky) */}
      <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
        <TabButton
          label="Submission"
          active={activeTab === 'submission'}
          onClick={() => onTabChange('submission')}
        />
        <TabButton
          label="Feedback"
          active={activeTab === 'feedback'}
          badge={teacherReview ? '✓' : undefined}
          onClick={() => onTabChange('feedback')}
        />
        <TabButton
          label="History"
          active={activeTab === 'history'}
          count={submission.previousVersions?.length || 0}
          onClick={() => onTabChange('history')}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'submission' && (
          <div className="h-full">
            <SubmissionContent
              submission={submission}
              hasTeacherReview={hasTeacherReview}
              teacherReview={teacherReview}
              referenceTranslation={referenceTranslation}
              quizMode={quizMode}
              onStartQuiz={handleStartQuiz}
              onCompleteQuiz={handleCompleteQuiz}
              onCancelQuiz={handleCancelQuiz}
              onSaveAICorrection={handleSaveAICorrection}
            />
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <FeedbackContent
              submission={submission}
              teacherReview={teacherReview}
              teacherReviewLoading={teacherReviewLoading}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <HistoryContent submission={submission} authorName={authorName} />
          </div>
        )}
      </div>
    </div>
  );
}
