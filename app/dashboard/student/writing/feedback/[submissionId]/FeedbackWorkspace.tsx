/**
 * FeedbackWorkspace Component
 * 3-tab layout: Submission | Feedback | History
 */

'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WritingSubmission, TeacherReview } from '@/lib/models/writing';
import { CopyForAIButton } from '@/components/writing/CopyForAIButton';
import { AICorrectionsPanel } from '@/components/writing/AICorrectionsPanel';
import { DiffTextCorrectedOnly } from '@/components/writing/DiffText';
import { ReviewQuiz } from '@/components/writing/ReviewQuiz';
import { useToast } from '@/components/ui/toast';
import { saveAICorrectedVersion } from '@/lib/services/writing/submissions-mutations';
import { createReviewQuiz, completeReviewQuiz } from '@/lib/services/writing/reviewQuizService';
import { generateQuizBlanks } from '@/lib/utils/quizGenerator';
import { WritingFeedback as WritingFeedbackComponent } from '@/components/writing/WritingFeedback';
import { TeacherFeedbackDisplay } from '@/components/writing/TeacherFeedbackDisplay';
import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { getUser } from '@/lib/services/userService';
import { getUserFullName } from '@/lib/models/user';
import { useUpdateProgressForQuiz } from '@/lib/hooks/useWritingExercises';

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
    <div className="bg-white">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
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

      {/* Tab Content */}
      <div className="overflow-y-auto">
        {/* SUBMISSION TAB */}
        {activeTab === 'submission' && (
          <div className="p-4 md:p-8">
            {/* Submission Metadata */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm font-medium">
                <span className="text-gray-900">{submission.wordCount}</span>
                <span className="text-gray-400 mx-1">words</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className={`px-2 py-1 rounded-full ${
                  submission.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                  submission.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {submission.status}
                </span>
                {submission.submittedAt && (
                  <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {/* Quiz Mode */}
            {quizMode && (
              <ReviewQuiz
                originalText={submission.content}
                correctedText={
                  quizMode === 'ai' ? submission.aiCorrectedVersion! :
                  quizMode === 'teacher' ? teacherReview?.correctedVersion! :
                  referenceTranslation!
                }
                sourceType={quizMode}
                onComplete={handleCompleteQuiz}
                onCancel={handleCancelQuiz}
              />
            )}

            {/* Normal View Mode */}
            {!quizMode && (
              <>
                {/* Original English Text (for translation exercises) */}
                {submission.exerciseType === 'translation' && submission.originalText && (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🇬🇧</span>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Original English</h3>
                      </div>
                      <p className="text-base text-gray-600 leading-relaxed">
                        {submission.originalText}
                      </p>
                    </div>
                    <div className="w-full h-px bg-gray-200 my-6" />
                  </>
                )}

                {/* Student's Translation */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✍️</span>
                      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Your Translation</h3>
                    </div>
                    {!hasTeacherReview && (
                      <CopyForAIButton
                        studentText={submission.content}
                        originalText={submission.originalText}
                        exerciseType={submission.exerciseType}
                      />
                    )}
                  </div>
                  <p className="text-lg md:text-xl lg:text-2xl text-gray-900 leading-relaxed whitespace-pre-wrap"
                     style={{
                       lineHeight: '1.6',
                       fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                     }}>
                    {submission.content}
                  </p>
                </div>

                {/* AI Corrected Version */}
                {(!hasTeacherReview || submission.aiCorrectedVersion) && (
                  <>
                    <div className="w-full h-px bg-gray-200 my-6" />
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">✨</span>
                          <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wide">AI-Corrected Version</h3>
                          {hasTeacherReview && submission.aiCorrectedVersion && (
                            <span className="text-xs text-gray-500 font-normal">(for comparison)</span>
                          )}
                        </div>
                        {submission.aiCorrectedVersion && (
                          <button
                            onClick={() => handleStartQuiz('ai', submission.aiCorrectedVersion!)}
                            className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>📝</span> Test Yourself
                          </button>
                        )}
                      </div>
                      <AICorrectionsPanel
                        submissionId={submission.submissionId}
                        currentAICorrection={submission.aiCorrectedVersion}
                        currentAICorrectedAt={submission.aiCorrectedAt}
                        originalText={submission.content}
                        onSave={handleSaveAICorrection}
                      />
                    </div>
                  </>
                )}

                {/* Teacher's Corrected Version */}
                {hasTeacherReview && teacherReview?.correctedVersion && (
                  <>
                    <div className="w-full h-px bg-gray-200 my-6" />
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">✏️</span>
                          <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Teacher's Corrected Version</h3>
                        </div>
                        <button
                          onClick={() => handleStartQuiz('teacher', teacherReview.correctedVersion!)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>📝</span> Test Yourself
                        </button>
                      </div>
                      <DiffTextCorrectedOnly
                        originalText={submission.content}
                        correctedText={teacherReview.correctedVersion}
                        className="text-base"
                      />
                    </div>
                  </>
                )}

                {/* Reference Translation */}
                {referenceTranslation && (
                  <>
                    <div className="w-full h-px bg-gray-200 my-6" />
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">✅</span>
                          <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide">Reference Translation</h3>
                        </div>
                        <button
                          onClick={() => handleStartQuiz('reference', referenceTranslation)}
                          className="text-xs text-green-600 hover:text-green-800 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>📝</span> Test Yourself
                        </button>
                      </div>
                      <DiffTextCorrectedOnly
                        originalText={submission.content}
                        correctedText={referenceTranslation}
                        className="text-base"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <div className="p-4 md:p-8">
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
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="p-4 md:p-8">
            <ActivityTimeline
              items={[
                // Current version
                {
                  id: 'current',
                  icon: <span className="text-white text-xs">✓</span>,
                  iconColor: 'bg-blue-500',
                  title: `Version ${submission.version}`,
                  description: `${submission.wordCount} words • ${submission.characterCount} characters`,
                  timestamp: submission.submittedAt
                    ? new Date(submission.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Draft',
                  tags: [
                    {
                      label: 'Current',
                      color: 'blue',
                    },
                    {
                      label: submission.status,
                      color: submission.status === 'submitted' ? 'amber' :
                             submission.status === 'reviewed' ? 'green' : 'gray',
                    },
                  ],
                  metadata: (
                    <div className="text-xs text-gray-500 mt-1">
                      <span>By: {authorName}</span>
                    </div>
                  ),
                },
                // Previous versions (if any)
                ...(submission.previousVersions || []).map((version) => ({
                  id: `version-${version.version}`,
                  icon: <span className="text-white text-xs">{version.version}</span>,
                  iconColor: 'bg-gray-400',
                  title: `Version ${version.version}`,
                  description: version.wordCount
                    ? `${version.wordCount} words`
                    : 'Previous version',
                  timestamp: version.savedAt
                    ? new Date(version.savedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A',
                  metadata: (
                    <div className="text-xs text-gray-500 mt-1">
                      <span>By: {authorName}</span>
                    </div>
                  ),
                })),
              ] as ActivityItem[]}
              showConnector={true}
              showPagination={false}
            />
          </div>
        )}
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
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <span>{label}</span>
      {badge && <span className="ml-1 text-xs">{badge}</span>}
      {count !== undefined && count > 0 && (
        <span className="ml-1 text-xs text-gray-500">({count})</span>
      )}
    </button>
  );
}
