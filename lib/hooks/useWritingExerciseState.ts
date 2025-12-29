/**
 * Custom hook for managing writing exercise page state and handlers
 * Extracted from WritingExercisesPage to reduce file complexity
 */

import { useState, useTransition } from "react";
import { CEFRLevel } from "@/lib/models/cefr";
import {
  TranslationExercise,
  CreativeWritingExercise,
  WritingSubmission,
} from "@/lib/models/writing";
import { EmailTemplate } from "@/lib/data/emailTemplates";
import { LetterTemplate } from "@/lib/data/letterTemplates";
import { useWritingStats, useStudentSubmissions } from "./useWritingExercises";
import { useWritingSubmissionHandlers } from "./useWritingSubmissionHandlers";
import { useExerciseAttempts, useAttemptStats } from "./useWritingAttempts";
import { usePersistedLevel } from "./usePersistedLevel";

export type ExerciseType =
  | "translation"
  | "creative"
  | "email"
  | "letters"
  | "freestyle"
  | null;

interface UseWritingExerciseStateProps {
  userEmail?: string;
}

export function useWritingExerciseState({
  userEmail,
}: UseWritingExerciseStateProps) {
  // Core state
  const [selectedLevel, setSelectedLevel] =
    usePersistedLevel("writing-last-level");
  const [showHistory, setShowHistory] = useState(false);
  const [selectedExerciseType, setSelectedExerciseType] =
    useState<ExerciseType>(null);
  const [selectedTranslation, setSelectedTranslation] =
    useState<TranslationExercise | null>(null);
  const [selectedCreative, setSelectedCreative] =
    useState<CreativeWritingExercise | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailTemplate | null>(
    null
  );
  const [selectedLetter, setSelectedLetter] = useState<LetterTemplate | null>(
    null
  );
  const [isFreestyle, setIsFreestyle] = useState(false);
  const [freestyleTopic, setFreestyleTopic] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [writingText, setWritingText] = useState("");
  const [emailContent, setEmailContent] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [viewingAttempt, setViewingAttempt] =
    useState<WritingSubmission | null>(null);
  const [isPendingLevelChange, startTransition] = useTransition();

  // Calculate word count
  const wordCount = writingText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const emailWordCount = emailContent.body
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Fetch writing stats
  const {
    data: writingStats,
    isLoading: statsLoading,
    error: statsError,
  } = useWritingStats(userEmail);
  const { data: submissions = [], isLoading: submissionsLoading } =
    useStudentSubmissions(userEmail);

  // Get current exercise and ID
  const currentExercise =
    selectedTranslation ||
    selectedCreative ||
    selectedEmail ||
    selectedLetter ||
    (isFreestyle
      ? {
          id: "freestyle",
          title: freestyleTopic || "Freestyle Writing",
          type: "freestyle",
          level: selectedLevel,
        }
      : null);

  const currentExerciseId = currentExercise
    ? "exerciseId" in currentExercise
      ? currentExercise.exerciseId
      : "id" in currentExercise
      ? currentExercise.id
      : "templateId" in currentExercise
      ? (currentExercise as any).templateId
      : undefined
    : undefined;

  // Fetch attempts for current exercise
  const { data: attempts = [], isLoading: attemptsLoading } =
    useExerciseAttempts(userEmail, currentExerciseId);
  const { data: attemptStats } = useAttemptStats(userEmail, currentExerciseId);

  // Submission handlers
  const submissionHandlers = useWritingSubmissionHandlers({
    selectedLevel,
    selectedTranslation,
    selectedCreative,
    selectedEmail,
    selectedLetter,
    isFreestyle,
    freestyleTopic,
    isPublic,
    writingText,
    emailContent,
    userEmail,
  });

  const handleSaveDraft = async (additionalFields?: any) => {
    // If no changes since last save, skip
    if (!submissionHandlers.hasUnsavedChanges && submissionHandlers.lastSaved) {
      return;
    }

    // Get current content based on type
    const content =
      selectedEmail || selectedLetter
        ? JSON.stringify(emailContent)
        : writingText;

    if (!currentExerciseId || !content) return;

    await submissionHandlers.saveDraft(
      currentExerciseId,
      currentExercise?.type || "creative",
      content,
      additionalFields
    );
  };

  const handleSubmitWithTracking = async (additionalFields?: any) => {
    // Get current content based on type
    const content =
      selectedEmail || selectedLetter
        ? JSON.stringify(emailContent)
        : writingText;

    if (!currentExerciseId || !content) return;

    await submissionHandlers.submitExercise(
      currentExerciseId,
      currentExercise?.type || "creative",
      content,
      additionalFields
    );
  };

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
    setIsFreestyle(false);
    setFreestyleTopic("");
    setIsPublic(false);
    setWritingText("");
    setEmailContent({ to: "", subject: "", body: "" });
  };

  const handleTranslationSelect = (exercise: TranslationExercise) => {
    setSelectedTranslation(exercise);
    setWritingText("");
    setEmailContent({ to: "", subject: "", body: "" });
    submissionHandlers.resetDraftState();
  };

  const handleCreativeSelect = (exercise: CreativeWritingExercise) => {
    setSelectedCreative(exercise);
    setWritingText("");
    setEmailContent({ to: "", subject: "", body: "" });
    submissionHandlers.resetDraftState();
  };

  const handleEmailSelect = (template: EmailTemplate) => {
    setSelectedEmail(template);
    setWritingText("");
    setEmailContent({
      to: template.recipient,
      subject: template.subject,
      body: "",
    });
    submissionHandlers.resetDraftState();
  };

  const handleLetterSelect = (template: LetterTemplate) => {
    setSelectedLetter(template);
    setWritingText("");
    setEmailContent({ to: "", subject: "", body: "" });
    submissionHandlers.resetDraftState();
  };

  const handleFreestyleSelect = () => {
    setIsFreestyle(true);
    setWritingText("");
    setEmailContent({ to: "", subject: "", body: "" });
    submissionHandlers.resetDraftState();
  };

  const handleBackToExerciseTypes = () => {
    setSelectedExerciseType(null);
    setSelectedTranslation(null);
    setSelectedCreative(null);
    setSelectedEmail(null);
    setSelectedLetter(null);
    setIsFreestyle(false);
    setWritingText("");
    setEmailContent({ to: "", subject: "", body: "" });
  };

  const handleBackToExerciseList = () => {
    setSelectedTranslation(null);
    setSelectedCreative(null);
    setSelectedEmail(null);
    setSelectedLetter(null);
    setIsFreestyle(false);
    setWritingText("");
    setEmailContent({ to: "", subject: "", body: "" });
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
    handleSaveDraft,
    handleSubmitWithTracking,

    // Event handlers
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
    // Freestyle specific
    isFreestyle,
    freestyleTopic,
    setFreestyleTopic,
    isPublic,
    setIsPublic,
  };
}
