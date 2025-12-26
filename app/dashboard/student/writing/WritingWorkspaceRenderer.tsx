/**
 * Writing Workspace Renderer
 * Handles rendering of different writing exercise types and their workspaces
 */

'use client';

import { TranslationWorkspace } from '@/components/writing/TranslationWorkspace';
import { CreativeWritingArea } from '@/components/writing/CreativeWritingArea';
import { EmailWritingForm } from '@/components/writing/EmailWritingForm';
import { LetterWritingArea } from '@/components/writing/LetterWritingArea';
import { AttemptHistory } from '@/components/writing/AttemptHistory';
import { SavedWordDetection } from '@/components/writing/SavedWordDetection';
import { SavedVocabulary } from '@/lib/models/savedVocabulary';
import type { TranslationExercise } from '@/lib/data/translationExercises';
import type { CreativeWritingExercise } from '@/lib/data/creativeExercises';
import type { EmailTemplate } from '@/lib/data/emailTemplates';
import type { LetterTemplate } from '@/lib/data/letterTemplates';

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
  setEmailContent: (content: { to: string; subject: string; body: string }) => void;

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
          translationText={viewingAttempt ? viewingAttempt.content : writingText}
          onChange={setWritingText}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={viewingAttempt ? {
            attemptNumber: viewingAttempt.attemptNumber,
            status: viewingAttempt.status
          } : undefined}
          onBackToCurrentDraft={viewingAttempt ? handleBackToCurrentDraft : undefined}
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
          viewingAttempt={viewingAttempt ? {
            attemptNumber: viewingAttempt.attemptNumber,
            status: viewingAttempt.status
          } : undefined}
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
          emailContent={viewingAttempt ? { to: '', subject: '', body: viewingAttempt.content } : emailContent}
          wordCount={viewingAttempt ? viewingAttempt.wordCount : emailWordCount}
          onChange={setEmailContent}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={viewingAttempt ? {
            attemptNumber: viewingAttempt.attemptNumber,
            status: viewingAttempt.status
          } : undefined}
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
          viewingAttempt={viewingAttempt ? {
            attemptNumber: viewingAttempt.attemptNumber,
            status: viewingAttempt.status
          } : undefined}
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

  // No exercise selected
  return null;
}
