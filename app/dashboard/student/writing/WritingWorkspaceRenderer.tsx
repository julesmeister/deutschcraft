/**
 * Writing Workspace Renderer
 * Handles rendering of different writing exercise types and their workspaces
 */

"use client";

import { TranslationWorkspace } from "@/components/writing/TranslationWorkspace";
import { WritingWorkspace } from "@/components/writing/WritingWorkspace";
import { CreativeWritingArea } from "@/components/writing/CreativeWritingArea";
import { EmailWritingForm } from "@/components/writing/EmailWritingForm";
import { LetterWritingArea } from "@/components/writing/LetterWritingArea";
import { AttemptHistory } from "@/components/writing/AttemptHistory";
import { SavedWordDetection } from "@/components/writing/SavedWordDetection";
import { SavedVocabulary } from "@/lib/models/savedVocabulary";
import type { TranslationExercise } from "@/lib/data/translationExercises";
import type { CreativeWritingExercise } from "@/lib/data/creativeExercises";
import type { EmailTemplate } from "@/lib/data/emailTemplates";
import type { LetterTemplate } from "@/lib/data/letterTemplates";

interface ViewingAttempt {
  content: string;
  wordCount: number;
  attemptNumber: number;
  status: string;
}

interface AttemptData {
  id: string;
  attemptNumber: number;
  createdAt: number;
  status: string;
  wordCount: number;
}

interface WritingWorkspaceRendererProps {
  // Exercise selections
  selectedTranslation?: TranslationExercise;
  selectedCreative?: CreativeWritingExercise;
  selectedEmail?: EmailTemplate;
  selectedLetter?: LetterTemplate;

  // Content state
  writingText: string;
  emailContent: { to: string; subject: string; body: string };
  wordCount: number;
  emailWordCount: number;

  // Viewing state
  viewingAttempt?: ViewingAttempt;
  attempts: AttemptData[];

  // Change handlers
  setWritingText: (text: string) => void;
  setEmailContent: (content: {
    to: string;
    subject: string;
    body: string;
  }) => void;

  // Navigation handlers
  handleBackToCurrentDraft?: () => void;
  handleViewSubmission: (submissionId: string) => void;
  handleViewAttemptContent: (attempt: AttemptData) => void;

  // Word detection
  detectedWords: SavedVocabulary[];
  onConfirmUsedWords: (wordIds: string[]) => void;
  onDismissDetectedWords: () => void;
}

export function WritingWorkspaceRenderer({
  selectedTranslation,
  selectedCreative,
  selectedEmail,
  selectedLetter,
  isFreestyle,
  freestyleTopic,
  setFreestyleTopic,
  isPublic,
  setIsPublic,
  writingText,
  emailContent,
  wordCount,
  emailWordCount,
  viewingAttempt,
  attempts,
  setWritingText,
  setEmailContent,
  handleBackToCurrentDraft,
  handleViewSubmission,
  handleViewAttemptContent,
  detectedWords,
  onConfirmUsedWords,
  onDismissDetectedWords,
}: WritingWorkspaceRendererProps) {
  // Translation Exercise
  if (selectedTranslation) {
    return (
      <div className="lg:container lg:mx-auto">
        <TranslationWorkspace
          exercise={selectedTranslation}
          translationText={
            viewingAttempt ? viewingAttempt.content : writingText
          }
          onChange={setWritingText}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={
            viewingAttempt
              ? {
                  attemptNumber: viewingAttempt.attemptNumber,
                  status: viewingAttempt.status,
                }
              : undefined
          }
          onBackToCurrentDraft={
            viewingAttempt ? handleBackToCurrentDraft : undefined
          }
          attemptHistory={
            <AttemptHistory
              attempts={attempts}
              onViewAttempt={handleViewSubmission}
              onViewContent={handleViewAttemptContent}
              currentAttemptId={undefined}
            />
          }
        />

        {/* Saved Word Detection - Show after submission */}
        {detectedWords.length > 0 && !viewingAttempt && (
          <SavedWordDetection
            detectedWords={detectedWords}
            onConfirm={onConfirmUsedWords}
            onDismiss={onDismissDetectedWords}
          />
        )}
      </div>
    );
  }

  // Creative Writing Exercise
  if (selectedCreative) {
    return (
      <div className="lg:container lg:mx-auto">
        <CreativeWritingArea
          exercise={selectedCreative}
          content={viewingAttempt ? viewingAttempt.content : writingText}
          wordCount={viewingAttempt ? viewingAttempt.wordCount : wordCount}
          onChange={setWritingText}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={
            viewingAttempt
              ? {
                  attemptNumber: viewingAttempt.attemptNumber,
                  status: viewingAttempt.status,
                }
              : undefined
          }
          attemptHistory={
            <AttemptHistory
              attempts={attempts}
              onViewAttempt={handleViewSubmission}
              onViewContent={handleViewAttemptContent}
              currentAttemptId={undefined}
            />
          }
        />

        {/* Saved Word Detection - Show after submission */}
        {detectedWords.length > 0 && !viewingAttempt && (
          <SavedWordDetection
            detectedWords={detectedWords}
            onConfirm={onConfirmUsedWords}
            onDismiss={onDismissDetectedWords}
          />
        )}
      </div>
    );
  }

  // Email Writing Exercise
  if (selectedEmail) {
    return (
      <div className="lg:container lg:mx-auto">
        <EmailWritingForm
          template={selectedEmail}
          emailContent={
            viewingAttempt
              ? { to: "", subject: "", body: viewingAttempt.content }
              : emailContent
          }
          wordCount={viewingAttempt ? viewingAttempt.wordCount : emailWordCount}
          onChange={setEmailContent}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={
            viewingAttempt
              ? {
                  attemptNumber: viewingAttempt.attemptNumber,
                  status: viewingAttempt.status,
                }
              : undefined
          }
          attemptHistory={
            <AttemptHistory
              attempts={attempts}
              onViewAttempt={handleViewSubmission}
              onViewContent={handleViewAttemptContent}
              currentAttemptId={undefined}
            />
          }
        />

        {/* Saved Word Detection - Show after submission */}
        {detectedWords.length > 0 && !viewingAttempt && (
          <SavedWordDetection
            detectedWords={detectedWords}
            onConfirm={onConfirmUsedWords}
            onDismiss={onDismissDetectedWords}
          />
        )}
      </div>
    );
  }

  // Letter Writing Exercise
  if (selectedLetter) {
    return (
      <div className="lg:container lg:mx-auto">
        <LetterWritingArea
          template={selectedLetter}
          content={viewingAttempt ? viewingAttempt.content : writingText}
          wordCount={viewingAttempt ? viewingAttempt.wordCount : wordCount}
          onChange={setWritingText}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={
            viewingAttempt
              ? {
                  attemptNumber: viewingAttempt.attemptNumber,
                  status: viewingAttempt.status,
                }
              : undefined
          }
          attemptHistory={
            <AttemptHistory
              attempts={attempts}
              onViewAttempt={handleViewSubmission}
              onViewContent={handleViewAttemptContent}
              currentAttemptId={undefined}
            />
          }
        />

        {/* Saved Word Detection - Show after submission */}
        {detectedWords.length > 0 && !viewingAttempt && (
          <SavedWordDetection
            detectedWords={detectedWords}
            onConfirm={onConfirmUsedWords}
            onDismiss={onDismissDetectedWords}
          />
        )}
      </div>
    );
  }

  // Freestyle Writing Exercise
  if (isFreestyle) {
    const topIndicator = (
      <div className="text-sm font-medium text-emerald-600">
        {viewingAttempt ? viewingAttempt.wordCount : wordCount} words
      </div>
    );

    const instructions = (
      <>
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            📝 Your Topic
          </h3>
          {!viewingAttempt && setFreestyleTopic ? (
            <div className="mb-4">
              <input
                type="text"
                value={freestyleTopic || ""}
                onChange={(e) => setFreestyleTopic(e.target.value)}
                placeholder="Enter your topic here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ) : (
            <p className="text-base text-gray-900 leading-relaxed mb-4">
              {freestyleTopic || "No topic selected"}
            </p>
          )}

          {!viewingAttempt && setIsPublic && (
            <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 block">
                  Public Submission
                </span>
                <span className="text-xs text-gray-500">
                  Allow other students to see your writing
                </span>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? "bg-purple-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Tips</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Write freely about your chosen topic</li>
            <li>• Use the public/private toggle to control visibility</li>
            <li>• Check grammar before submitting</li>
          </ul>
        </div>
      </>
    );

    return (
      <div className="lg:container lg:mx-auto">
        <WritingWorkspace
          value={viewingAttempt ? viewingAttempt.content : writingText}
          onChange={setWritingText}
          placeholder="Start writing here..."
          topIndicator={topIndicator}
          instructions={instructions}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={
            viewingAttempt
              ? {
                  attemptNumber: viewingAttempt.attemptNumber,
                  status: viewingAttempt.status,
                }
              : undefined
          }
          attemptHistory={
            <AttemptHistory
              attempts={attempts}
              onViewAttempt={handleViewSubmission}
              onViewContent={handleViewAttemptContent}
              currentAttemptId={undefined}
            />
          }
        />

        {detectedWords.length > 0 && !viewingAttempt && (
          <SavedWordDetection
            detectedWords={detectedWords}
            onConfirm={onConfirmUsedWords}
            onDismiss={onDismissDetectedWords}
          />
        )}
      </div>
    );
  }

  // No exercise selected
  return null;
}
