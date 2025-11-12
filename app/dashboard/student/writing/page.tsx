'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TabBar, TabItem } from '@/components/ui/TabBar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { useWritingStats, useStudentSubmissions } from '@/lib/hooks/useWritingExercises';
import { useWritingSubmissionHandlers } from '@/lib/hooks/useWritingSubmissionHandlers';
import { useExerciseAttempts, useAttemptStats } from '@/lib/hooks/useWritingAttempts';
import { WritingHistory } from '@/components/writing/WritingHistory';
import { AttemptHistory } from '@/components/writing/AttemptHistory';
import { AttemptStats } from '@/components/writing/AttemptStats';
import { WritingTipsCard } from '@/components/writing/WritingTipsCard';
import { TranslationExerciseSelector } from '@/components/writing/TranslationExerciseSelector';
import { TranslationExerciseInfo } from '@/components/writing/TranslationExerciseInfo';
import { TranslationWorkspace } from '@/components/writing/TranslationWorkspace';
import { CreativeExerciseSelector } from '@/components/writing/CreativeExerciseSelector';
import { CreativeWritingInstructions } from '@/components/writing/CreativeWritingInstructions';
import { CreativeWritingArea } from '@/components/writing/CreativeWritingArea';
import { EmailTemplateSelector } from '@/components/writing/EmailTemplateSelector';
import { EmailTemplateInstructions } from '@/components/writing/EmailTemplateInstructions';
import { EmailWritingForm } from '@/components/writing/EmailWritingForm';
import { LetterTemplateSelector } from '@/components/writing/LetterTemplateSelector';
import { LetterTemplateInstructions } from '@/components/writing/LetterTemplateInstructions';
import { LetterWritingArea } from '@/components/writing/LetterWritingArea';
import { TRANSLATION_EXERCISES } from '@/lib/data/translations';
import { CREATIVE_EXERCISES } from '@/lib/data/creativeExercises';
import { EMAIL_TEMPLATES, type EmailTemplate } from '@/lib/data/emailTemplates';
import { LETTER_TEMPLATES, type LetterTemplate } from '@/lib/data/letterTemplates';
import { TranslationExercise, CreativeWritingExercise } from '@/lib/models/writing';

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

  // Calculate word count
  const wordCount = writingText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const emailWordCount = emailContent.body.trim().split(/\s+/).filter(word => word.length > 0).length;

  // Fetch writing stats from Firebase
  const { data: writingStats, isLoading: statsLoading } = useWritingStats(session?.user?.email || undefined);

  // Fetch recent submissions
  const { data: submissions = [], isLoading: submissionsLoading } = useStudentSubmissions(session?.user?.email || undefined);

  // Get current exercise ID
  const currentExercise = selectedTranslation || selectedCreative || selectedEmail || selectedLetter;
  const currentExerciseId = currentExercise
    ? ('exerciseId' in currentExercise ? currentExercise.exerciseId :
       'id' in currentExercise ? currentExercise.id :
       'templateId' in currentExercise ? (currentExercise as any).templateId : undefined)
    : undefined;

  // Fetch attempts for current exercise (if one is selected)
  const { data: attempts = [] } = useExerciseAttempts(session?.user?.email || undefined, currentExerciseId);
  const { data: attemptStats } = useAttemptStats(session?.user?.email || undefined, currentExerciseId);

  // Submission handlers (save draft, submit, etc.)
  const { isSaving, handleSaveDraft, handleSubmit, resetDraftState } = useWritingSubmissionHandlers({
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
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || !writingText.trim()}
                className="cursor-pointer whitespace-nowrap content-center font-medium transition-all duration-150 ease-in-out h-12 rounded-xl bg-gray-200 px-5 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving || !writingText.trim()}
                className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out h-12 rounded-xl bg-blue-500 px-5 py-2 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          )
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Show attempt stats and history if exercise is selected and user has previous attempts */}
        {currentExercise && attemptStats && attemptStats.totalAttempts > 0 && (
          <div className="max-w-4xl mx-auto mb-6">
            <AttemptStats {...attemptStats} />
          </div>
        )}

        {/* Show exercise workspace if an exercise is selected */}
        {selectedTranslation ? (
          <div className="max-w-4xl mx-auto">
            <TranslationExerciseInfo exercise={selectedTranslation} />
            <TranslationWorkspace
              exercise={selectedTranslation}
              translationText={writingText}
              onChange={setWritingText}
            />
            {/* Show attempt history below workspace */}
            {attempts.length > 0 && (
              <div className="mt-8">
                <AttemptHistory
                  attempts={attempts}
                  onViewAttempt={handleViewSubmission}
                  currentAttemptId={undefined}
                />
              </div>
            )}
          </div>
        ) : selectedCreative ? (
          <div className="max-w-4xl mx-auto">
            <CreativeWritingInstructions exercise={selectedCreative} />
            <CreativeWritingArea
              exercise={selectedCreative}
              content={writingText}
              wordCount={wordCount}
              onChange={setWritingText}
            />
            {/* Show attempt history below workspace */}
            {attempts.length > 0 && (
              <div className="mt-8">
                <AttemptHistory
                  attempts={attempts}
                  onViewAttempt={handleViewSubmission}
                  currentAttemptId={undefined}
                />
              </div>
            )}
          </div>
        ) : selectedEmail ? (
          <div className="max-w-4xl mx-auto">
            <EmailTemplateInstructions template={selectedEmail} />
            <EmailWritingForm
              template={selectedEmail}
              emailContent={emailContent}
              wordCount={emailWordCount}
              onChange={setEmailContent}
            />
            {/* Show attempt history below workspace */}
            {attempts.length > 0 && (
              <div className="mt-8">
                <AttemptHistory
                  attempts={attempts}
                  onViewAttempt={handleViewSubmission}
                  currentAttemptId={undefined}
                />
              </div>
            )}
          </div>
        ) : selectedLetter ? (
          <div className="max-w-4xl mx-auto">
            <LetterTemplateInstructions template={selectedLetter} />
            <LetterWritingArea
              template={selectedLetter}
              content={writingText}
              wordCount={wordCount}
              onChange={setWritingText}
            />
            {/* Show attempt history below workspace */}
            {attempts.length > 0 && (
              <div className="mt-8">
                <AttemptHistory
                  attempts={attempts}
                  onViewAttempt={handleViewSubmission}
                  currentAttemptId={undefined}
                />
              </div>
            )}
          </div>
        ) : (
          /* Show Main Writing Hub */
          <>
            {/* Level Selector - Split Button Style */}
            <div className="mb-8">
              <CEFRLevelSelector
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                colorScheme="default"
                showDescription={true}
                size="sm"
              />
            </div>

            {/* Stats - TabBar Style (like flashcard practice) */}
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">Loading your stats...</p>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <TabBar
                  variant="stats"
                  tabs={[
                    {
                      id: 'exercises',
                      label: 'Total Exercises',
                      icon: undefined,
                      value: writingStats?.totalExercisesCompleted || 0,
                    },
                    {
                      id: 'score',
                      label: 'Average Score',
                      icon: undefined,
                      value: `${writingStats?.averageOverallScore || 0}%`,
                    },
                    {
                      id: 'streak',
                      label: 'Day Streak',
                      icon: undefined,
                      value: writingStats?.currentStreak || 0,
                    },
                    {
                      id: 'words',
                      label: 'Words Written',
                      icon: undefined,
                      value: (writingStats?.totalWordsWritten || 0).toLocaleString(),
                    },
                  ]}
                />
              </div>
            )}

            {/* Exercise Types - TabBar Style */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Choose Exercise Type</h2>
              <TabBar
                variant="tabs"
                size="compact"
                activeTabId={selectedExerciseType || undefined}
                onTabChange={(tabId) => handleExerciseTypeSelect(tabId as ExerciseType)}
                tabs={[
                  {
                    id: 'creative',
                    label: 'Creative Writing',
                    icon: null,
                    value: filteredCreativeExercises.length,
                  },
                  {
                    id: 'translation',
                    label: 'Translation',
                    icon: null,
                    value: filteredTranslationExercises.length,
                  },
                  {
                    id: 'email',
                    label: 'Email Writing',
                    icon: null,
                    value: filteredEmailTemplates.length,
                  },
                  {
                    id: 'letters',
                    label: 'Letter Writing',
                    icon: null,
                    value: filteredLetterTemplates.length,
                  },
                ]}
              />
            </div>

            {/* Show Exercise Selector Below When Type is Selected */}
            {selectedExerciseType === 'translation' && (
              <div className="mt-8">
                <TranslationExerciseSelector
                  exercises={filteredTranslationExercises}
                  onSelect={handleTranslationSelect}
                />
              </div>
            )}

            {selectedExerciseType === 'creative' && (
              <div className="mt-8">
                <CreativeExerciseSelector
                  exercises={filteredCreativeExercises}
                  onSelect={handleCreativeSelect}
                />
              </div>
            )}

            {selectedExerciseType === 'email' && (
              <div className="mt-8">
                <EmailTemplateSelector
                  templates={filteredEmailTemplates}
                  onSelect={handleEmailSelect}
                />
              </div>
            )}

            {selectedExerciseType === 'letters' && (
              <div className="mt-8">
                <LetterTemplateSelector
                  templates={filteredLetterTemplates}
                  onSelect={handleLetterSelect}
                />
              </div>
            )}

            {/* Recent Activity / History */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900">Recent Submissions</h2>
                {submissions.length > 3 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {showHistory ? 'Show Less' : 'View All'}
                  </button>
                )}
              </div>

              <WritingHistory
                submissions={showHistory ? submissions : submissions.slice(0, 3)}
                onViewSubmission={handleViewSubmission}
                isLoading={submissionsLoading}
              />
            </div>

            {/* Writing Tips */}
            <div className="mt-8">
              <WritingTipsCard />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
