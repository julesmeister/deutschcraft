'use client';

import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { AlertDialog } from '@/components/ui/Dialog';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useWritingExerciseState } from '@/lib/hooks/useWritingExerciseState';
import { CEFRLevelInfo } from '@/lib/models/cefr';
import { AttemptHistory } from '@/components/writing/AttemptHistory';
import { TranslationWorkspace } from '@/components/writing/TranslationWorkspace';
import { CreativeWritingArea } from '@/components/writing/CreativeWritingArea';
import { EmailTemplateInstructions } from '@/components/writing/EmailTemplateInstructions';
import { EmailWritingForm } from '@/components/writing/EmailWritingForm';
import { LetterWritingArea } from '@/components/writing/LetterWritingArea';
import { WritingHub } from './WritingHub';
import { TRANSLATION_EXERCISES } from '@/lib/data/translationExercises';
import { CREATIVE_EXERCISES } from '@/lib/data/creativeExercises';
import { EMAIL_TEMPLATES } from '@/lib/data/emailTemplates';
import { LETTER_TEMPLATES } from '@/lib/data/letterTemplates';

export default function WritingExercisesPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();

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
    handleSubmit,
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
    handleBackToExerciseTypes,
    handleBackToExerciseList,
    handleViewAttemptContent,
    handleBackToCurrentDraft,
    handleLevelChange,
    handleToggleHistory,
  } = useWritingExerciseState({ userEmail: session?.user?.email });

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/dashboard/student/writing/feedback/${submissionId}`);
  };

  // Filter exercises by selected level
  const filteredTranslationExercises = TRANSLATION_EXERCISES.filter(ex => ex.level === selectedLevel);
  const filteredCreativeExercises = CREATIVE_EXERCISES.filter(ex => ex.level === selectedLevel);
  const filteredEmailTemplates = EMAIL_TEMPLATES.filter(ex => ex.level === selectedLevel);
  const filteredLetterTemplates = LETTER_TEMPLATES.filter(ex => ex.level === selectedLevel);

  const hasSelectedExercise = !!(selectedTranslation || selectedCreative || selectedEmail || selectedLetter);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={currentExercise ? (currentExercise.title || (currentExercise as any).name) : "Writing Exercises ✍️"}
        subtitle={
          currentExercise
            ? `${CEFRLevelInfo[selectedLevel].displayName} • ${(currentExercise as any).difficulty || 'Exercise'}`
            : "Practice your German writing skills through creative and translation exercises"
        }
        backButton={
          selectedExerciseType
            ? {
                label: hasSelectedExercise ? 'Back to Exercise List' : 'Back to Exercise Types',
                onClick: hasSelectedExercise ? handleBackToExerciseList : handleBackToExerciseTypes
              }
            : undefined
        }
        actions={
          hasSelectedExercise && (
            <div className="flex gap-2">
              <ActionButton
                onClick={handleSaveDraft}
                disabled={isSaving || !writingText.trim()}
                variant="cyan"
                icon={<ActionButtonIcons.Document />}
                className="min-w-[140px]"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </ActionButton>
              <ActionButton
                onClick={handleSubmit}
                disabled={isSaving || !writingText.trim()}
                variant="purple"
                icon={<ActionButtonIcons.Check />}
                className="min-w-[200px]"
              >
                {isSaving ? 'Submitting...' : 'Submit for Review'}
              </ActionButton>
            </div>
          )
        }
      />

      {/* Loading indicator for level transitions */}
      {isPendingLevelChange && (
        <div className="fixed top-20 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-down">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            <span className="font-medium">Updating exercises...</span>
          </div>
        </div>
      )}

      {/* Optimistic save feedback */}
      {optimisticSaveState.saved && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{optimisticSaveState.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={hasSelectedExercise ? '' : 'lg:container lg:mx-auto lg:px-6 py-8'}>
        {selectedTranslation ? (
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
          </div>
        ) : selectedCreative ? (
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
          </div>
        ) : selectedEmail ? (
          <div className="max-w-4xl mx-auto">
            <EmailTemplateInstructions template={selectedEmail} />
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
          </div>
        ) : selectedLetter ? (
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
          </div>
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
    </div>
  );
}
