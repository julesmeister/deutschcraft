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
import { getTemplateById } from "@/lib/data/emailTemplates";
import { CEFRLevelInfo } from "@/lib/models/cefr";
import { EmailWritingForm } from "@/components/writing/EmailWritingForm";
import { FloatingRedemittelWidget } from "@/components/writing/FloatingRedemittelWidget";
import { AttemptHistory } from "@/components/writing/AttemptHistory";
import { SavedWordDetection } from "@/components/writing/SavedWordDetection";
import { WritingSubmission } from "@/lib/models/writing";
import { motion } from "framer-motion";

export default function EmailExercisePage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const emailId = params.emailId as string;

  const template = getTemplateById(emailId);

  // Email content state
  const [emailContent, setEmailContent] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [viewingAttempt, setViewingAttempt] =
    useState<WritingSubmission | null>(null);

  // Word detection
  const { detectedWords, detectWords, confirmUsedWords, clearDetectedWords } =
    useWritingWordDetection();

  const emailWordCount = emailContent.body
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // Attempts
  const { data: attempts = [] } = useExerciseAttempts(
    session?.user?.email,
    template?.id
  );

  // Submission handlers
  const submissionHandlers = useWritingSubmissionHandlers({
    selectedLevel: template?.level ?? ("B1" as any),
    selectedTranslation: null,
    selectedCreative: null,
    selectedEmail: template ?? null,
    selectedLetter: null,
    writingText: emailContent.body,
    emailContent,
    userEmail: session?.user?.email,
  });

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">404</div>
          <p className="text-gray-600 mb-4">Email template not found.</p>
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

  const hasContent = emailContent.body.trim().length > 0;

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/dashboard/student/writing/feedback/${submissionId}`);
  };

  const handleViewAttemptContent = (attempt: WritingSubmission) => {
    setViewingAttempt(attempt);
  };

  const handleConfirmUsedWords = async (wordIds: string[]) => {
    await confirmUsedWords(session?.user?.email, wordIds);
  };

  const buildStructuredFields = () => ({
    structuredFields: {
      ...(emailContent.to && { emailTo: emailContent.to }),
      ...(emailContent.subject && { emailSubject: emailContent.subject }),
    },
  });

  const handleSubmit = async () => {
    await submissionHandlers.handleSubmit(buildStructuredFields());
    await detectWords(session?.user?.email, emailContent.body);
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
        title={template.title}
        subtitle={`${CEFRLevelInfo[template.level].displayName} \u2022 ${template.difficulty} \u2022 Email`}
        backButton={{
          label: "Back to Writing Exercises",
          onClick: () => router.push("/dashboard/student/writing"),
        }}
        actions={
          !viewingAttempt ? (
            <div className="flex items-center gap-3">
              <ActionButton
                onClick={() => submissionHandlers.handleSaveDraft(buildStructuredFields())}
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
          <EmailWritingForm
            template={template}
            emailContent={viewingAttempt ? { to: "", subject: "", body: viewingAttempt.content } : emailContent}
            wordCount={viewingAttempt ? viewingAttempt.wordCount : emailWordCount}
            onChange={setEmailContent}
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

      <FloatingRedemittelWidget currentLevel={template.level} />
    </div>
  );
}
