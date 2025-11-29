/**
 * SubmissionContent Component
 * Displays the student's submission with AI/teacher corrections and reference
 */

import { WritingSubmission, TeacherReview } from '@/lib/models/writing';
import { CopyForAIButton } from '@/components/writing/CopyForAIButton';
import { AICorrectionsPanel } from '@/components/writing/AICorrectionsPanel';
import { DiffTextCorrectedOnly } from '@/components/writing/DiffText';
import { ReviewQuiz } from '@/components/writing/ReviewQuiz';

interface SubmissionContentProps {
  submission: WritingSubmission;
  hasTeacherReview: boolean;
  teacherReview?: TeacherReview | null;
  referenceTranslation?: string;
  quizMode: 'ai' | 'teacher' | 'reference' | null;
  onStartQuiz: (sourceType: 'ai' | 'teacher' | 'reference', correctedText: string) => void;
  onCompleteQuiz: (score: number, correctAnswers: number, totalBlanks: number, answers: Record<number, string>) => void;
  onCancelQuiz: () => void;
  onSaveAICorrection: (correctedText: string) => Promise<void>;
}

export function SubmissionContent({
  submission,
  hasTeacherReview,
  teacherReview,
  referenceTranslation,
  quizMode,
  onStartQuiz,
  onCompleteQuiz,
  onCancelQuiz,
  onSaveAICorrection,
}: SubmissionContentProps) {
  return (
    <div className="p-4 md:p-8 lg:block">
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
          onComplete={onCompleteQuiz}
          onCancel={onCancelQuiz}
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
                      onClick={() => onStartQuiz('ai', submission.aiCorrectedVersion!)}
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
                  onSave={onSaveAICorrection}
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
                    onClick={() => onStartQuiz('teacher', teacherReview.correctedVersion!)}
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
                    onClick={() => onStartQuiz('reference', referenceTranslation)}
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
  );
}
