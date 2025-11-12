/**
 * Custom hook for handling writing submission logic
 * Extracted from student writing page to reduce file size
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCreateWritingSubmission,
  useUpdateWritingSubmission,
} from './useWritingExercises';
import { WritingSubmission, WritingExerciseType, TranslationExercise, CreativeWritingExercise } from '@/lib/models/writing';
import { CEFRLevel } from '@/lib/models/cefr';
import { updateDailyProgress, updateWritingStats } from '@/lib/services/writingProgressService';
import { getNextAttemptNumber, hasDraftAttempt } from '@/lib/services/writingAttemptService';
import { EmailTemplate } from '@/lib/data/emailTemplates';
import { LetterTemplate } from '@/lib/data/letterTemplates';

interface UseWritingSubmissionHandlersProps {
  selectedLevel: CEFRLevel;
  selectedTranslation: TranslationExercise | null;
  selectedCreative: CreativeWritingExercise | null;
  selectedEmail: EmailTemplate | null;
  selectedLetter: LetterTemplate | null;
  writingText: string;
  userEmail?: string;
}

export function useWritingSubmissionHandlers({
  selectedLevel,
  selectedTranslation,
  selectedCreative,
  selectedEmail,
  selectedLetter,
  writingText,
  userEmail,
}: UseWritingSubmissionHandlersProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const createSubmission = useCreateWritingSubmission();
  const updateSubmission = useUpdateWritingSubmission();

  const handleSaveDraft = async () => {
    if (!userEmail) {
      alert('You must be logged in to save a draft');
      return;
    }

    if (!writingText.trim()) {
      alert('Please write something before saving');
      return;
    }

    setIsSaving(true);

    try {
      const currentExercise = selectedTranslation || selectedCreative || selectedEmail || selectedLetter;
      if (!currentExercise) {
        alert('No exercise selected');
        return;
      }

      const exerciseId = (currentExercise as any).exerciseId || (currentExercise as any).id || (currentExercise as any).templateId;
      const exerciseType: WritingExerciseType = selectedTranslation
        ? 'translation'
        : selectedCreative
        ? 'creative'
        : selectedEmail
        ? 'email'
        : ((selectedLetter as any)?.type || 'formal-letter') as WritingExerciseType;

      const wordCount = writingText.trim().split(/\s+/).length;

      if (currentDraftId) {
        // Update existing draft
        await updateSubmission.mutateAsync({
          submissionId: currentDraftId,
          updates: {
            content: writingText,
            wordCount,
            lastSavedAt: Date.now(),
            updatedAt: Date.now(),
          },
        });
        alert('Draft updated successfully!');
      } else {
        // Check if there's already a draft for this exercise
        const existingDraft = await hasDraftAttempt(userEmail, exerciseId);

        if (existingDraft) {
          // Resume existing draft
          setCurrentDraftId(existingDraft.submissionId);
          await updateSubmission.mutateAsync({
            submissionId: existingDraft.submissionId,
            updates: {
              content: writingText,
              wordCount,
              lastSavedAt: Date.now(),
              updatedAt: Date.now(),
            },
          });
          alert('Draft updated successfully!');
        } else {
          // Create new draft (get next attempt number)
          const attemptNumber = await getNextAttemptNumber(userEmail, exerciseId);

          const submissionData: Omit<WritingSubmission, 'submissionId' | 'createdAt' | 'updatedAt' | 'version'> = {
            userId: userEmail,
            exerciseId,
            exerciseType,
            level: selectedLevel,
            content: writingText,
            wordCount,
            characterCount: writingText.length,
            attemptNumber,
            status: 'draft',
            startedAt: Date.now(),
            lastSavedAt: Date.now(),
          };

          const result = await createSubmission.mutateAsync(submissionData);
          setCurrentDraftId(result.submissionId);
          alert(`Draft saved successfully! (Attempt ${attemptNumber})`);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!userEmail) {
      alert('You must be logged in to submit');
      return;
    }

    if (!writingText.trim()) {
      alert('Please write your response before submitting.');
      return;
    }

    setIsSaving(true);

    try {
      const currentExercise = selectedTranslation || selectedCreative || selectedEmail || selectedLetter;
      if (!currentExercise) {
        alert('No exercise selected');
        return;
      }

      const exerciseId = (currentExercise as any).exerciseId || (currentExercise as any).id || (currentExercise as any).templateId;
      const exerciseType: WritingExerciseType = selectedTranslation
        ? 'translation'
        : selectedCreative
        ? 'creative'
        : selectedEmail
        ? 'email'
        : ((selectedLetter as any)?.type || 'formal-letter') as WritingExerciseType;

      const wordCount = writingText.trim().split(/\s+/).length;

      // Check min word count requirement (if exists)
      const minWords = (currentExercise as any).wordCountRange?.min || (currentExercise as any).minWords || 0;
      if (minWords > 0 && wordCount < minWords) {
        alert(`Please write at least ${minWords} words. Current: ${wordCount} words.`);
        setIsSaving(false);
        return;
      }

      let submissionId: string;
      let finalSubmission: WritingSubmission;
      let attemptNumber: number;

      if (currentDraftId) {
        // Update existing draft to submitted
        await updateSubmission.mutateAsync({
          submissionId: currentDraftId,
          updates: {
            content: writingText,
            wordCount,
            characterCount: writingText.length,
            status: 'submitted',
            submittedAt: Date.now(),
            lastSavedAt: Date.now(),
            updatedAt: Date.now(),
          },
        });
        submissionId = currentDraftId;

        // We need the full submission for progress tracking
        // The attempt number should already be in the draft
        finalSubmission = {
          userId: userEmail,
          exerciseId,
          exerciseType,
          level: selectedLevel,
          content: writingText,
          wordCount,
          characterCount: writingText.length,
          attemptNumber: 1, // Will be updated from actual data
          status: 'submitted',
          submissionId: currentDraftId,
          startedAt: Date.now(),
          submittedAt: Date.now(),
          lastSavedAt: Date.now(),
          updatedAt: Date.now(),
          createdAt: Date.now(),
          version: 1,
        };
      } else {
        // Create new submission (get next attempt number)
        attemptNumber = await getNextAttemptNumber(userEmail, exerciseId);

        const submissionData: Omit<WritingSubmission, 'submissionId' | 'createdAt' | 'updatedAt' | 'version'> = {
          userId: userEmail,
          exerciseId,
          exerciseType,
          level: selectedLevel,
          content: writingText,
          wordCount,
          characterCount: writingText.length,
          attemptNumber,
          status: 'submitted',
          startedAt: Date.now(),
          submittedAt: Date.now(),
          lastSavedAt: Date.now(),
        };

        const result = await createSubmission.mutateAsync(submissionData);
        submissionId = result.submissionId;
        finalSubmission = result as WritingSubmission;
      }

      // Update progress tracking (daily and aggregate stats)
      try {
        await Promise.all([
          updateDailyProgress(userEmail, finalSubmission),
          updateWritingStats(userEmail, finalSubmission),
        ]);
      } catch (progressError) {
        console.error('Failed to update progress stats:', progressError);
        // Don't block navigation if stats update fails
      }

      // Navigate to feedback page (will show "Awaiting teacher review")
      router.push(`/dashboard/student/writing/feedback/${submissionId}`);
    } catch (error) {
      console.error('Error submitting writing:', error);
      alert('Failed to submit. Please try again.');
      setIsSaving(false);
    }
  };

  const resetDraftState = () => {
    setCurrentDraftId(null);
  };

  return {
    isSaving,
    currentDraftId,
    handleSaveDraft,
    handleSubmit,
    resetDraftState,
  };
}
