"use client";

import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { AlertDialog } from "@/components/ui/Dialog";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useWritingExerciseState } from "@/lib/hooks/useWritingExerciseState";
import { useWritingWordDetection } from "@/lib/hooks/useWritingWordDetection";
import { CEFRLevelInfo } from "@/lib/models/cefr";
import { WritingHub } from "./WritingHub";
import { WritingWorkspaceRenderer } from "./WritingWorkspaceRenderer";
import { FloatingRedemittelWidget } from "@/components/writing/FloatingRedemittelWidget";
import { TRANSLATION_EXERCISES } from "@/lib/data/translationExercises";
import { CREATIVE_EXERCISES } from "@/lib/data/creativeExercises";
import { EMAIL_TEMPLATES } from "@/lib/data/emailTemplates";
import { LETTER_TEMPLATES } from "@/lib/data/letterTemplates";

export default function WritingExercisesPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();

  // Word detection hook
  const { detectedWords, detectWords, confirmUsedWords, clearDetectedWords } =
    useWritingWordDetection();

  const {
    selectedLevel,
    showHistory,
    selectedExerciseType,
    selectedTranslation,
    selectedCreative,
    selectedEmail,
    selectedLetter,
    writingText,
    emailContent,
    viewingAttempt,
    isPendingLevelChange,
    wordCount,
    emailWordCount,
    writingStats,
    statsLoading,
    submissions,
    submissionsLoading,
    currentExercise,
    attempts,
    isSaving,
    handleSaveDraft,
    handleSubmit: originalHandleSubmit,
    dialogState,
    closeDialog,
    optimisticSaveState,
    setWritingText,
    setEmailContent,
    handleExerciseTypeSelect,
    handleTranslationSelect,
    handleCreativeSelect,
    handleEmailSelect,
    handleLetterSelect,
    handleFreestyleSelect,
    handleBackToExerciseTypes,
    handleBackToExerciseList,
    handleViewAttemptContent,
    handleBackToCurrentDraft,
    handleLevelChange,
    handleToggleHistory,
    isFreestyle,
    freestyleTopic,
    setFreestyleTopic,
    isPublic,
    setIsPublic,
  } = useWritingExerciseState({ userEmail: session?.user?.email });

  // Wrapper for handleSubmit to detect saved words
  const handleSubmit = async () => {
    // Collect additional fields for freestyle
    const additionalFields = isFreestyle
      ? {
          isPublic,
          exerciseTitle: freestyleTopic,
        }
      : undefined;

    await originalHandleSubmit(additionalFields);

    // After successful submission, detect saved words
    const textToAnalyze = selectedEmail ? emailContent.body : writingText;
    await detectWords(session?.user?.email, textToAnalyze);
  };

  // Handler for confirming used words
  const handleConfirmUsedWords = async (wordIds: string[]) => {
    await confirmUsedWords(session?.user?.email, wordIds);
  };

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/dashboard/student/writing/feedback/${submissionId}`);
  };

  // Filter exercises by selected level
  const filteredTranslationExercises = TRANSLATION_EXERCISES.filter(
    (ex) => ex.level === selectedLevel
  );
  const filteredCreativeExercises = CREATIVE_EXERCISES.filter(
    (ex) => ex.level === selectedLevel
  );
  const filteredEmailTemplates = EMAIL_TEMPLATES.filter(
    (ex) => ex.level === selectedLevel
  );
  const filteredLetterTemplates = LETTER_TEMPLATES.filter(
    (ex) => ex.level === selectedLevel
  );

  const hasSelectedExercise = !!(
    selectedTranslation ||
    selectedCreative ||
    selectedEmail ||
    selectedLetter ||
    isFreestyle
  );

  // Check if content is filled based on exercise type
  const hasContent = selectedEmail
    ? emailContent.body.trim().length > 0
    : writingText.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={
          currentExercise
            ? currentExercise.title || (currentExercise as any).name
            : isFreestyle
            ? freestyleTopic || "Freestyle Writing"
            : "Writing Exercises ✍️"
        }
        subtitle={
          currentExercise
            ? `${CEFRLevelInfo[selectedLevel].displayName} • ${
                (currentExercise as any).difficulty || "Exercise"
              }`
            : isFreestyle
            ? "Write freely about any topic you like"
            : "Practice your German writing skills through creative and translation exercises"
        }
        backButton={
          selectedExerciseType
            ? {
                label: hasSelectedExercise
                  ? "Back to Exercise List"
                  : "Back to Exercise Types",
                onClick: hasSelectedExercise
                  ? handleBackToExerciseList
                  : handleBackToExerciseTypes,
              }
            : {
                label: "Back to Dashboard",
                onClick: () => router.push("/dashboard/student"),
              }
        }
        actions={
          hasSelectedExercise && !viewingAttempt ? (
            <div className="flex items-center gap-3">
              <ActionButton
                onClick={() =>
                  handleSaveDraft(
                    isFreestyle
                      ? { isPublic, exerciseTitle: freestyleTopic }
                      : undefined
                  )
                }
                disabled={isSaving || !hasContent}
                variant="gray"
                icon={<ActionButtonIcons.Save />}
              >
                {isSaving ? "Saving..." : "Draft"}
              </ActionButton>
              <ActionButton
                onClick={handleSubmit}
                disabled={isSaving || !hasContent}
                variant="purple"
                icon={<ActionButtonIcons.Check />}
              >
                Submit
              </ActionButton>
            </div>
          ) : undefined
        }
        levelSelector={
          !hasSelectedExercise
            ? {
                selectedLevel,
                onLevelChange: handleLevelChange,
                isPending: isPendingLevelChange,
              }
            : undefined
        }
      />

      {/* Main Content */}
      <div
        className={
          hasSelectedExercise ? "" : "lg:container lg:mx-auto lg:px-6 py-8"
        }
      >
        {hasSelectedExercise ? (
          <WritingWorkspaceRenderer
            selectedTranslation={selectedTranslation}
            selectedCreative={selectedCreative}
            selectedEmail={selectedEmail}
            selectedLetter={selectedLetter}
            isFreestyle={isFreestyle}
            freestyleTopic={freestyleTopic}
            setFreestyleTopic={setFreestyleTopic}
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            writingText={writingText}
            emailContent={emailContent}
            wordCount={wordCount}
            emailWordCount={emailWordCount}
            viewingAttempt={viewingAttempt}
            attempts={attempts}
            setWritingText={setWritingText}
            setEmailContent={setEmailContent}
            handleBackToCurrentDraft={handleBackToCurrentDraft}
            handleViewSubmission={handleViewSubmission}
            handleViewAttemptContent={handleViewAttemptContent}
            detectedWords={detectedWords}
            onConfirmUsedWords={handleConfirmUsedWords}
            onDismissDetectedWords={clearDetectedWords}
          />
        ) : (
          <div className="px-6">
            <WritingHub
              selectedLevel={selectedLevel}
              onLevelChange={handleLevelChange}
              selectedExerciseType={selectedExerciseType}
              onExerciseTypeSelect={handleExerciseTypeSelect}
              writingStats={writingStats ?? undefined}
              statsLoading={statsLoading}
              submissions={submissions}
              submissionsLoading={submissionsLoading}
              showHistory={showHistory}
              onToggleHistory={handleToggleHistory}
              onViewSubmission={handleViewSubmission}
              filteredTranslationExercises={filteredTranslationExercises}
              filteredCreativeExercises={filteredCreativeExercises}
              filteredEmailTemplates={filteredEmailTemplates}
              filteredLetterTemplates={filteredLetterTemplates}
              onTranslationSelect={handleTranslationSelect}
              onCreativeSelect={handleCreativeSelect}
              onEmailSelect={handleEmailSelect}
              onLetterSelect={handleLetterSelect}
              onFreestyleSelect={handleFreestyleSelect}
              userEmail={session?.user?.email}
            />
          </div>
        )}
      </div>

      {/* Dialog for alerts and confirmations */}
      <AlertDialog
        open={dialogState.isOpen}
        onClose={closeDialog}
        title={dialogState.title}
        message={dialogState.message}
      />

      {/* Floating Redemittel Widget - Show when working on an exercise */}
      {hasSelectedExercise && (
        <FloatingRedemittelWidget currentLevel={selectedLevel} />
      )}
    </div>
  );
}
