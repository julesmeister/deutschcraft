/**
 * SubmissionContent Component
 * Displays the student's submission with AI/teacher corrections and reference
 */

import { useState } from "react";
import { WritingSubmission, TeacherReview } from "@/lib/models/writing";
import { CopyForAIButton } from "@/components/writing/CopyForAIButton";
import { AICorrectionsPanel } from "@/components/writing/AICorrectionsPanel";
import { SectionHeader } from "@/components/writing/SectionHeader";
import { CorrectedTextSection } from "@/components/writing/CorrectedTextSection";
import { ReviewQuiz } from "@/components/writing/ReviewQuiz";
import { StructuredFieldsDisplay } from "@/components/writing/StructuredFieldsDisplay";

interface SubmissionContentProps {
  submission: WritingSubmission;
  hasTeacherReview: boolean;
  teacherReview?: TeacherReview | null;
  referenceTranslation?: string;
  quizMode: "ai" | "teacher" | "reference" | null;
  onStartQuiz: (
    sourceType: "ai" | "teacher" | "reference",
    correctedText: string
  ) => void;
  onCompleteQuiz: (
    score: number,
    correctAnswers: number,
    totalBlanks: number,
    answers: Record<number, string>
  ) => void;
  onCancelQuiz: () => void;
  onSaveAICorrection: (correctedText: string) => Promise<void>;
  onSaveStructuredFields?: (fields: NonNullable<WritingSubmission['structuredFields']>) => void;
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
  onSaveStructuredFields,
}: SubmissionContentProps) {
  const [isAIEditing, setIsAIEditing] = useState(false);

  return (
    <div className="p-4 md:p-8 lg:block">
      {/* Submission Metadata */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm font-medium">
          <span className="text-gray-900">{submission.wordCount}</span>
          <span className="text-gray-400 mx-1">words</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span
            className={`px-2 py-1 rounded-full ${
              submission.status === "submitted"
                ? "bg-blue-100 text-blue-700"
                : submission.status === "reviewed"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {submission.status}
          </span>
          {submission.submittedAt && (
            <span>
              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Quiz Mode */}
      {quizMode && (
        <ReviewQuiz
          originalText={submission.content}
          correctedText={
            quizMode === "ai"
              ? submission.aiCorrectedVersion!
              : quizMode === "teacher"
              ? teacherReview?.correctedVersion!
              : referenceTranslation!
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
          {submission.exerciseType === "translation" &&
            submission.originalText && (
              <>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🇬🇧</span>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Original English
                    </h3>
                  </div>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {submission.originalText}
                  </p>
                </div>
                <div className="w-full h-px bg-gray-200 my-6" />
              </>
            )}

          {/* Structured Fields (email/letter headers) */}
          <StructuredFieldsDisplay
            fields={submission.structuredFields}
            exerciseType={submission.exerciseType}
            editable={true}
            onSave={onSaveStructuredFields}
          />

          {/* Student's Translation */}
          <div>
            <SectionHeader
              icon="✍️"
              label="Your Translation"
              labelColor="text-gray-700"
              action={
                !hasTeacherReview && (
                  <CopyForAIButton
                    studentText={submission.content}
                    originalText={submission.originalText}
                    exerciseType={submission.exerciseType}
                  />
                )
              }
            />
            <p
              className="text-lg md:text-xl lg:text-2xl text-gray-900 leading-relaxed whitespace-pre-wrap"
              style={{
                lineHeight: "1.6",
                fontFamily:
                  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              {submission.content}
            </p>
          </div>

          {/* AI Corrected Version */}
          {(!hasTeacherReview || submission.aiCorrectedVersion) && (
            <>
              <div className="w-full h-px bg-gray-200 my-6" />
              <div>
                <SectionHeader
                  icon="✨"
                  label="AI-Corrected Version"
                  labelColor="text-purple-700"
                  badge={
                    hasTeacherReview && submission.aiCorrectedVersion
                      ? "(for comparison)"
                      : undefined
                  }
                  action={
                    submission.aiCorrectedVersion && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsAIEditing(true)}
                          className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>✏️</span> Edit
                        </button>
                        <button
                          onClick={() =>
                            onStartQuiz("ai", submission.aiCorrectedVersion!)
                          }
                          className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>📝</span> Test Yourself
                        </button>
                      </div>
                    )
                  }
                />
                <AICorrectionsPanel
                  submissionId={submission.submissionId}
                  currentAICorrection={submission.aiCorrectedVersion}
                  currentAICorrectedAt={submission.aiCorrectedAt}
                  originalText={submission.content}
                  onSave={onSaveAICorrection}
                  isEditing={isAIEditing}
                  onEditChange={setIsAIEditing}
                />
              </div>
            </>
          )}

          {/* Teacher's Corrected Version */}
          {hasTeacherReview && teacherReview?.correctedVersion && (
            <>
              <div className="w-full h-px bg-gray-200 my-6" />
              <CorrectedTextSection
                icon="✏️"
                label="Teacher's Corrected Version"
                labelColor="text-blue-700"
                originalText={submission.content}
                correctedText={teacherReview.correctedVersion}
                onStartQuiz={() =>
                  onStartQuiz("teacher", teacherReview.correctedVersion!)
                }
                className="text-base"
              />
            </>
          )}

          {/* Reference Translation */}
          {referenceTranslation && (
            <>
              <div className="w-full h-px bg-gray-200 my-6" />
              <CorrectedTextSection
                icon="✅"
                label="Reference Translation"
                labelColor="text-green-700"
                originalText={submission.content}
                correctedText={referenceTranslation}
                onStartQuiz={() =>
                  onStartQuiz("reference", referenceTranslation)
                }
                className="text-base"
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
