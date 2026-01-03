import { ReactNode } from "react";
import { AttemptHistory } from "@/components/writing/AttemptHistory";
import { SavedWordDetection } from "@/components/writing/SavedWordDetection";
import { SavedVocabulary } from "@/lib/models/savedVocabulary";

interface AttemptData {
  id: string;
  attemptNumber: number;
  createdAt: number;
  status: string;
  wordCount: number;
}

interface WorkspaceContainerProps {
  children: ReactNode;
  attempts: AttemptData[];
  viewingAttempt?: { content: string; wordCount: number; attemptNumber: number; status: string };
  detectedWords: SavedVocabulary[];
  onViewSubmission: (submissionId: string) => void;
  onViewAttemptContent: (attempt: AttemptData) => void;
  onConfirmUsedWords: (wordIds: string[]) => void;
  onDismissDetectedWords: () => void;
}

export function WorkspaceContainer({
  children,
  attempts,
  viewingAttempt,
  detectedWords,
  onViewSubmission,
  onViewAttemptContent,
  onConfirmUsedWords,
  onDismissDetectedWords,
}: WorkspaceContainerProps) {
  return (
    <div className="lg:container lg:mx-auto">
      {children}

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

export function createAttemptHistory(
  attempts: AttemptData[],
  onViewSubmission: (submissionId: string) => void,
  onViewAttemptContent: (attempt: AttemptData) => void
) {
  return (
    <AttemptHistory
      attempts={attempts}
      onViewAttempt={onViewSubmission}
      onViewContent={onViewAttemptContent}
      currentAttemptId={undefined}
    />
  );
}

export function createViewingAttemptProps(viewingAttempt?: { attemptNumber: number; status: string }) {
  return viewingAttempt
    ? {
        attemptNumber: viewingAttempt.attemptNumber,
        status: viewingAttempt.status,
      }
    : undefined;
}
