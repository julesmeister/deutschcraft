"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { AlertDialog } from "@/components/ui/Dialog";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useWritingSubmissionHandlers } from "@/lib/hooks/useWritingSubmissionHandlers";
import { useExerciseAttempts } from "@/lib/hooks/useWritingAttempts";
import { useWritingWordDetection } from "@/lib/hooks/useWritingWordDetection";
import { getExerciseById } from "@/lib/data/translationExercises";
import { CEFRLevelInfo } from "@/lib/models/cefr";
import { TranslationWorkspace } from "@/components/writing/TranslationWorkspace";
import { FloatingRedemittelWidget } from "@/components/writing/FloatingRedemittelWidget";
import { AttemptHistory } from "@/components/writing/AttemptHistory";
import { SavedWordDetection } from "@/components/writing/SavedWordDetection";
import { WritingSubmission } from "@/lib/models/writing";
import { motion } from "framer-motion";

export default function TranslationExercisePage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const exerciseId = params.exerciseId as string;

  const exercise = getExerciseById(exerciseId);

  // Writing state
  const [writingText, setWritingText] = useState("");
  const [viewingAttempt, setViewingAttempt] =
    useState<WritingSubmission | null>(null);

  // Word detection
  const { detectedWords, detectWords, confirmUsedWords, clearDetectedWords } =
    useWritingWordDetection();

  const wordCount = writingText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // Attempts
  const { data: attempts = [] } = useExerciseAttempts(
    session?.user?.email,
    exercise?.exerciseId
  );

  // Submission handlers
  const submissionHandlers = useWritingSubmissionHandlers({
    selectedLevel: exercise?.level ?? ("B1" as any),
    selectedTranslation: exercise ?? null,
    selectedCreative: null,
    selectedEmail: null,
    selectedLetter: null,
    writingText,
    userEmail: session?.user?.email,
  });

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">404</div>
          <p className="text-gray-600 mb-4">Translation exercise not found.</p>
          <button
            onClick={() => router.push("/dashboard/student/writing")}
            className="text-blue-600 hover:underline"
          >
            Back to Writing Exercises
          </button>
        </div>
      </div>
    );
  }

  const hasContent = writingText.trim().length > 0;

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/dashboard/student/writing/feedback/${submissionId}`);
  };

  const handleViewAttemptContent = (attempt: WritingSubmission) => {
    setViewingAttempt(attempt);
  };

  const handleConfirmUsedWords = async (wordIds: string[]) => {
    await confirmUsedWords(session?.user?.email, wordIds);
  };

  const handleSubmit = async () => {
    await submissionHandlers.handleSubmit();
    await detectWords(session?.user?.email, writingText);
  };

  const attemptHistory = (
    <AttemptHistory
      attempts={attempts as any}
      onViewAttempt={handleViewSubmission}
      onViewContent={handleViewAttemptContent as any}
      currentAttemptId={undefined}
    />
  );

  const viewingProps = viewingAttempt
    ? { attemptNumber: viewingAttempt.attemptNumber, status: viewingAttempt.status }
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={exercise.title}
        subtitle={`${CEFRLevelInfo[exercise.level].displayName} \u2022 ${exercise.difficulty} \u2022 ${exercise.category}`}
        backButton={{
          label: "Back to Writing Exercises",
          onClick: () => router.push("/dashboard/student/writing"),
        }}
        actions={
          !viewingAttempt ? (
            <div className="flex items-center gap-3">
              <ActionButton
                onClick={submissionHandlers.handleSaveDraft}
                disabled={submissionHandlers.isSaving || !hasContent}
                variant="gray"
                icon={<ActionButtonIcons.Save />}
              >
                {submissionHandlers.isSaving ? "Saving..." : "Draft"}
              </ActionButton>
              <ActionButton
                onClick={handleSubmit}
                disabled={submissionHandlers.isSaving || !hasContent}
                variant="purple"
                icon={<ActionButtonIcons.Check />}
              >
                Submit
              </ActionButton>
            </div>
          ) : undefined
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="lg:container lg:mx-auto">
          <TranslationWorkspace
            exercise={exercise}
            translationText={viewingAttempt ? viewingAttempt.content : writingText}
            onChange={setWritingText}
            attemptCount={attempts.length}
            readOnly={!!viewingAttempt}
            viewingAttempt={viewingProps}
            attemptHistory={attemptHistory}
          />

          {detectedWords.length > 0 && !viewingAttempt && (
            <SavedWordDetection
              detectedWords={detectedWords}
              onConfirm={handleConfirmUsedWords}
              onDismiss={clearDetectedWords}
            />
          )}
        </div>
      </motion.div>

      <AlertDialog
        open={submissionHandlers.dialogState.isOpen}
        onClose={submissionHandlers.closeDialog}
        title={submissionHandlers.dialogState.title}
        message={submissionHandlers.dialogState.message}
      />

      <FloatingRedemittelWidget currentLevel={exercise.level} />
    </div>
  );
}
