/**
 * Custom hook for managing writing exercise page state and handlers
 * Extracted from WritingExercisesPage to reduce file complexity
 */

import { useState, useTransition } from 'react';
import { CEFRLevel } from '@/lib/models/cefr';
import { TranslationExercise, CreativeWritingExercise, WritingSubmission } from '@/lib/models/writing';
import { EmailTemplate } from '@/lib/data/emailTemplates';
import { LetterTemplate } from '@/lib/data/letterTemplates';
import { useWritingStats, useStudentSubmissions } from './useWritingExercises';
import { useWritingSubmissionHandlers } from './useWritingSubmissionHandlers';
import { useExerciseAttempts, useAttemptStats } from './useWritingAttempts';
import { usePersistedLevel } from './usePersistedLevel';

export type ExerciseType = 'translation' | 'creative' | 'email' | 'letters' | null;

interface UseWritingExerciseStateProps {
  userEmail?: string;
}

export function useWritingExerciseState({ userEmail }: UseWritingExerciseStateProps) {
  // Core state
  const [selectedLevel, setSelectedLevel] = usePersistedLevel('writing-last-level');
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

  // Fetch writing stats
  const { data: writingStats, isLoading: statsLoading, error: statsError } = useWritingStats(userEmail);
  const { data: submissions = [], isLoading: submissionsLoading } = useStudentSubmissions(userEmail);

  // Get current exercise and ID
  const currentExercise = selectedTranslation || selectedCreative || selectedEmail || selectedLetter;
  const currentExerciseId = currentExercise
    ? ('exerciseId' in currentExercise ? currentExercise.exerciseId :
       'id' in currentExercise ? currentExercise.id :
       'templateId' in currentExercise ? (currentExercise as any).templateId : undefined)
    : undefined;

  // Fetch attempts for current exercise
  const { data: attempts = [], isLoading: attemptsLoading } = useExerciseAttempts(userEmail, currentExerciseId);
  const { data: attemptStats } = useAttemptStats(userEmail, currentExerciseId);

  // Submission handlers
  const submissionHandlers = useWritingSubmissionHandlers({
    selectedLevel,
    selectedTranslation,
    selectedCreative,
    selectedEmail,
    selectedLetter,
    writingText,
    emailContent,
    userEmail,
  });

  // Event handlers
  const handleExerciseTypeSelect = (type: ExerciseType) => {
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
    submissionHandlers.resetDraftState();
  };

  const handleCreativeSelect = (exercise: CreativeWritingExercise) => {
    setSelectedCreative(exercise);
    setWritingText('');
    setEmailContent({ to: '', subject: '', body: '' });
    submissionHandlers.resetDraftState();
  };

  const handleEmailSelect = (template: EmailTemplate) => {
    setSelectedEmail(template);
    setWritingText('');
    setEmailContent({ to: template.recipient, subject: template.subject, body: '' });
    submissionHandlers.resetDraftState();
  };

  const handleLetterSelect = (template: LetterTemplate) => {
    setSelectedLetter(template);
    setWritingText('');
    setEmailContent({ to: '', subject: '', body: '' });
    submissionHandlers.resetDraftState();
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

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return {
    // State
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

    // Data
    writingStats,
    statsLoading,
    statsError,
    submissions,
    submissionsLoading,
    currentExercise,
    currentExerciseId,
    attempts,
    attemptsLoading,
    attemptStats,

    // Submission handlers
    ...submissionHandlers,

    // Event handlers
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
  };
}
