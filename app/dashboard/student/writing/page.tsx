'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TabBar, TabItem } from '@/components/ui/TabBar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { AlertDialog } from '@/components/ui/Dialog';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { useWritingStats, useStudentSubmissions } from '@/lib/hooks/useWritingExercises';
import { useWritingSubmissionHandlers } from '@/lib/hooks/useWritingSubmissionHandlers';
import { useExerciseAttempts, useAttemptStats } from '@/lib/hooks/useWritingAttempts';
import { AttemptHistory } from '@/components/writing/AttemptHistory';
import { AttemptStats } from '@/components/writing/AttemptStats';
import { TranslationWorkspace } from '@/components/writing/TranslationWorkspace';
import { CreativeWritingArea } from '@/components/writing/CreativeWritingArea';
import { EmailTemplateInstructions } from '@/components/writing/EmailTemplateInstructions';
import { EmailWritingForm } from '@/components/writing/EmailWritingForm';
import { LetterWritingArea } from '@/components/writing/LetterWritingArea';
import { WritingHub } from './WritingHub';
import { TRANSLATION_EXERCISES } from '@/lib/data/translationExercises';
import { CREATIVE_EXERCISES } from '@/lib/data/creativeExercises';
import { EMAIL_TEMPLATES, type EmailTemplate } from '@/lib/data/emailTemplates';
import { LETTER_TEMPLATES, type LetterTemplate } from '@/lib/data/letterTemplates';
import { TranslationExercise, CreativeWritingExercise, WritingSubmission } from '@/lib/models/writing';

type ExerciseType = 'translation' | 'creative' | 'email' | 'letters' | null;

export default function WritingExercisesPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationExercise | null>(null);
  const [selectedCreative, setSelectedCreative] = useState<CreativeWritingExercise | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailTemplate | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<LetterTemplate | null>(null);
  const [writingText, setWritingText] = useState('');
  const [emailContent, setEmailContent] = useState({ to: '', subject: '', body: '' });
  const [viewingAttempt, setViewingAttempt] = useState<WritingSubmission | null>(null);
  const [isPendingLevelChange, startTransition] = useTransition();

  // Calculate word count
  const wordCount = writingText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const emailWordCount = emailContent.body.trim().split(/\s+/).filter(word => word.length > 0).length;

  // Fetch writing stats from Firebase
  const { data: writingStats, isLoading: statsLoading, error: statsError } = useWritingStats(session?.user?.email || undefined);

  // Debug: Log stats
  console.log('[Writing Page] Stats:', writingStats);
  console.log('[Writing Page] Stats Loading:', statsLoading);
  console.log('[Writing Page] Stats Error:', statsError);
  console.log('[Writing Page] User email:', session?.user?.email);
  console.log('[Writing Page] Stats keys:', writingStats ? Object.keys(writingStats) : 'null');

  // Fetch recent submissions
  const { data: submissions = [], isLoading: submissionsLoading } = useStudentSubmissions(session?.user?.email || undefined);

  // Get current exercise ID
  const currentExercise = selectedTranslation || selectedCreative || selectedEmail || selectedLetter;
  const currentExerciseId = currentExercise
    ? ('exerciseId' in currentExercise ? currentExercise.exerciseId :
       'id' in currentExercise ? currentExercise.id :
       'templateId' in currentExercise ? (currentExercise as any).templateId : undefined)
    : undefined;

  // Debug: Log exercise selection
  console.log('[Writing Page] Current exercise:', currentExercise);
  console.log('[Writing Page] Current exercise ID:', currentExerciseId);
  console.log('[Writing Page] Exercise keys:', currentExercise ? Object.keys(currentExercise) : 'null');

  // Fetch attempts for current exercise (if one is selected)
  const { data: attempts = [], isLoading: attemptsLoading } = useExerciseAttempts(session?.user?.email || undefined, currentExerciseId);
  const { data: attemptStats } = useAttemptStats(session?.user?.email || undefined, currentExerciseId);

  // Debug: Log attempts
  console.log('[Writing Page] Attempts:', attempts);
  console.log('[Writing Page] Attempts loading:', attemptsLoading);
  console.log('[Writing Page] Attempt count:', attempts.length);

  // Submission handlers (save draft, submit, etc.)
  const { isSaving, handleSaveDraft, handleSubmit, resetDraftState, dialogState, closeDialog, optimisticSaveState } = useWritingSubmissionHandlers({
    selectedLevel,
    selectedTranslation,
    selectedCreative,
    selectedEmail,
    selectedLetter,
    writingText,
    userEmail: session?.user?.email || undefined,
  });

  const handleExerciseTypeSelect = (type: ExerciseType) => {
    console.log('Exercise type selected:', type);
    // Toggle: if the same type is clicked, deselect it
    if (selectedExerciseType === type) {
      setSelectedExerciseType(null);
    } else {
      setSelectedExerciseType(type);
    }
    setSelectedTranslation(null);
    setSelectedCreative(null);
    setSelectedEmail(null);
    setSelectedLetter(null);
    setWritingText('');
    setEmailContent({ to: '', subject: '', body: '' });
  };

  const handleTranslationSelect = (exercise: TranslationExercise) => {
    setSelectedTranslation(exercise);
    setWritingText('');
    setEmailContent({ to: '', subject: '', body: '' });
    resetDraftState();
  };

  const handleCreativeSelect = (exercise: CreativeWritingExercise) => {
    setSelectedCreative(exercise);
    setWritingText('');
    setEmailContent({ to: '', subject: '', body: '' });
    resetDraftState();
  };

  const handleEmailSelect = (template: EmailTemplate) => {
    setSelectedEmail(template);
    setWritingText('');
    setEmailContent({ to: template.recipient, subject: template.subject, body: '' });
    resetDraftState();
  };

  const handleLetterSelect = (template: LetterTemplate) => {
    setSelectedLetter(template);
    setWritingText('');
    setEmailContent({ to: '', subject: '', body: '' });
    resetDraftState();
  };

  const handleBackToExerciseTypes = () => {
    setSelectedExerciseType(null);
    setSelectedTranslation(null);
    setSelectedCreative(null);
    setSelectedEmail(null);
    setSelectedLetter(null);
    setWritingText('');
    setEmailContent({ to: '', subject: '', body: '' });
  };

  const handleBackToExerciseList = () => {
    setSelectedTranslation(null);
    setSelectedCreative(null);
    setSelectedEmail(null);
    setSelectedLetter(null);
    setWritingText('');
    setEmailContent({ to: '', subject: '', body: '' });
  };

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/dashboard/student/writing/feedback/${submissionId}`);
  };

  const handleViewAttemptContent = (attempt: WritingSubmission) => {
    setViewingAttempt(attempt);
  };

  const handleBackToCurrentDraft = () => {
    setViewingAttempt(null);
  };

  const handleLevelChange = (newLevel: CEFRLevel) => {
    startTransition(() => {
      setSelectedLevel(newLevel);
    });
  };

  // Filter exercises by selected level
  const filteredTranslationExercises = TRANSLATION_EXERCISES.filter(ex => ex.level === selectedLevel);
  const filteredCreativeExercises = CREATIVE_EXERCISES.filter(ex => ex.level === selectedLevel);
  const filteredEmailTemplates = EMAIL_TEMPLATES.filter(ex => ex.level === selectedLevel);
  const filteredLetterTemplates = LETTER_TEMPLATES.filter(ex => ex.level === selectedLevel);

  // Check if an exercise is selected (currentExercise already defined above on line 56)
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
      <div className="container mx-auto px-6 py-8">
        {/* Show exercise workspace if an exercise is selected */}
        {selectedTranslation ? (
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
        ) : selectedCreative ? (
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
        ) : (
          /* Show Main Writing Hub */
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
            onToggleHistory={() => setShowHistory(!showHistory)}
            onViewSubmission={handleViewSubmission}
            filteredTranslationExercises={filteredTranslationExercises}
            filteredCreativeExercises={filteredCreativeExercises}
            filteredEmailTemplates={filteredEmailTemplates}
            filteredLetterTemplates={filteredLetterTemplates}
            onTranslationSelect={handleTranslationSelect}
            onCreativeSelect={handleCreativeSelect}
            onEmailSelect={handleEmailSelect}
            onLetterSelect={handleLetterSelect}
          />
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
