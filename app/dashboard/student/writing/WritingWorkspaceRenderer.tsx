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
import { SavedVocabulary } from "@/lib/models/savedVocabulary";
import type { TranslationExercise } from "@/lib/data/translationExercises";
import type { CreativeWritingExercise } from "@/lib/data/creativeExercises";
import type { EmailTemplate } from "@/lib/data/emailTemplates";
import type { LetterTemplate } from "@/lib/data/letterTemplates";
import {
  WorkspaceContainer,
  createAttemptHistory,
  createViewingAttemptProps,
} from "./workspace/WorkspaceContainer";
import { FreestyleInstructions } from "./workspace/FreestyleInstructions";

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
  selectedTranslation?: TranslationExercise;
  selectedCreative?: CreativeWritingExercise;
  selectedEmail?: EmailTemplate;
  selectedLetter?: LetterTemplate;
  isFreestyle?: boolean;
  freestyleTopic?: string;
  setFreestyleTopic?: (topic: string) => void;
  isPublic?: boolean;
  setIsPublic?: (isPublic: boolean) => void;
  writingText: string;
  emailContent: { to: string; subject: string; body: string };
  wordCount: number;
  emailWordCount: number;
  viewingAttempt?: ViewingAttempt;
  attempts: AttemptData[];
  setWritingText: (text: string) => void;
  setEmailContent: (content: { to: string; subject: string; body: string }) => void;
  handleBackToCurrentDraft?: () => void;
  handleViewSubmission: (submissionId: string) => void;
  handleViewAttemptContent: (attempt: AttemptData) => void;
  detectedWords: SavedVocabulary[];
  onConfirmUsedWords: (wordIds: string[]) => void;
  onDismissDetectedWords: () => void;
}

export function WritingWorkspaceRenderer(props: WritingWorkspaceRendererProps) {
  const {
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
  } = props;

  const containerProps = {
    attempts,
    viewingAttempt,
    detectedWords,
    onViewSubmission: handleViewSubmission,
    onViewAttemptContent: handleViewAttemptContent,
    onConfirmUsedWords,
    onDismissDetectedWords,
  };

  const attemptHistory = createAttemptHistory(attempts, handleViewSubmission, handleViewAttemptContent);
  const viewingProps = createViewingAttemptProps(viewingAttempt);

  // Translation Exercise
  if (selectedTranslation) {
    return (
      <WorkspaceContainer {...containerProps}>
        <TranslationWorkspace
          exercise={selectedTranslation}
          translationText={viewingAttempt ? viewingAttempt.content : writingText}
          onChange={setWritingText}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={viewingProps}
          onBackToCurrentDraft={viewingAttempt ? handleBackToCurrentDraft : undefined}
          attemptHistory={attemptHistory}
        />
      </WorkspaceContainer>
    );
  }

  // Creative Writing Exercise
  if (selectedCreative) {
    return (
      <WorkspaceContainer {...containerProps}>
        <CreativeWritingArea
          exercise={selectedCreative}
          content={viewingAttempt ? viewingAttempt.content : writingText}
          wordCount={viewingAttempt ? viewingAttempt.wordCount : wordCount}
          onChange={setWritingText}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={viewingProps}
          attemptHistory={attemptHistory}
        />
      </WorkspaceContainer>
    );
  }

  // Email Writing Exercise
  if (selectedEmail) {
    return (
      <WorkspaceContainer {...containerProps}>
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
          viewingAttempt={viewingProps}
          attemptHistory={attemptHistory}
        />
      </WorkspaceContainer>
    );
  }

  // Letter Writing Exercise
  if (selectedLetter) {
    return (
      <WorkspaceContainer {...containerProps}>
        <LetterWritingArea
          template={selectedLetter}
          content={viewingAttempt ? viewingAttempt.content : writingText}
          wordCount={viewingAttempt ? viewingAttempt.wordCount : wordCount}
          onChange={setWritingText}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={viewingProps}
          attemptHistory={attemptHistory}
        />
      </WorkspaceContainer>
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
      <FreestyleInstructions
        freestyleTopic={freestyleTopic}
        isPublic={isPublic}
        viewingAttempt={!!viewingAttempt}
        setFreestyleTopic={setFreestyleTopic}
        setIsPublic={setIsPublic}
      />
    );

    return (
      <WorkspaceContainer {...containerProps}>
        <WritingWorkspace
          value={viewingAttempt ? viewingAttempt.content : writingText}
          onChange={setWritingText}
          placeholder="Start writing here..."
          topIndicator={topIndicator}
          instructions={instructions}
          attemptCount={attempts.length}
          readOnly={!!viewingAttempt}
          viewingAttempt={viewingProps}
          attemptHistory={attemptHistory}
        />
      </WorkspaceContainer>
    );
  }

  return null;
}
