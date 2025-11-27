/**
 * FeedbackWorkspace Component
 * 2-column layout for viewing submission and feedback
 */

'use client';

import { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WritingSubmission, TeacherReview } from '@/lib/models/writing';
import { CopyForAIButton } from '@/components/writing/CopyForAIButton';
import { AICorrectionsPanel } from '@/components/writing/AICorrectionsPanel';
import { DiffTextCorrectedOnly } from '@/components/writing/DiffText';
import { saveAICorrectedVersion } from '@/lib/services/writing/submissions-mutations';

interface FeedbackWorkspaceProps {
  submission: WritingSubmission;
  feedbackPanel: ReactNode;
  referenceTranslation?: string; // For translation exercises
  hasTeacherReview?: boolean; // Whether teacher has reviewed
  teacherReview?: TeacherReview | null; // Teacher review data for corrected version
}

export function FeedbackWorkspace({ submission, feedbackPanel, referenceTranslation, hasTeacherReview, teacherReview }: FeedbackWorkspaceProps) {
  const queryClient = useQueryClient();

  const handleSaveAICorrection = async (correctedText: string) => {
    await saveAICorrectedVersion(submission.submissionId, correctedText);
    // Invalidate and refetch submission data
    await queryClient.invalidateQueries({
      queryKey: ['writing-submission', submission.submissionId]
    });
  };

  return (
    <div className="bg-white min-h-[600px] flex">
      {/* LEFT: Your Submission */}
      <div className="flex-1 flex flex-col">
        {/* Submission Metadata */}
        <div className="mb-4 px-8 pt-8 flex items-center justify-between">
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

        {/* Submission Content */}
        <div className="flex-1 overflow-y-auto px-8">
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
              <div className="-mx-8 w-[calc(100%+4rem)] h-px bg-gray-200 my-6" />
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
            <p className="text-2xl text-gray-900 leading-relaxed whitespace-pre-wrap"
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
              <div className="-mx-8 w-[calc(100%+4rem)] h-px bg-gray-200 my-6" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">✨</span>
                  <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wide">AI-Corrected Version</h3>
                  {hasTeacherReview && submission.aiCorrectedVersion && (
                    <span className="text-xs text-gray-500 font-normal">(for comparison)</span>
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
              <div className="-mx-8 w-[calc(100%+4rem)] h-px bg-gray-200 my-6" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">✏️</span>
                  <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Teacher's Corrected Version</h3>
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
              <div className="-mx-8 w-[calc(100%+4rem)] h-px bg-gray-200 my-6" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">✅</span>
                  <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide">Reference Translation</h3>
                </div>
                <DiffTextCorrectedOnly
                  originalText={submission.content}
                  correctedText={referenceTranslation}
                  className="text-base"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* SEPARATOR */}
      <div className="w-px bg-gray-200" />

      {/* RIGHT: Feedback Panel */}
      {feedbackPanel}
    </div>
  );
}
