"use client";

import { useState, useCallback, useRef } from "react";
import { useSaveStudentAnswer } from "@/lib/hooks/useStudentAnswers";
import { useToast } from "@/lib/hooks/useToast";
import { StudentAnswerBubbleHandle } from "./StudentAnswerBubble";
import { StudentExerciseAnswers, MarkedWord } from "@/lib/models/studentAnswers";

// Need to extend the type if it's missing markedWords in the original definition
interface ExtendedStudentAnswer {
  itemNumber: string;
  studentAnswer: string;
  submittedAt: number;
  markedWords?: MarkedWord[];
}

interface ExtendedStudentExerciseAnswers extends Omit<StudentExerciseAnswers, 'answers'> {
  answers: ExtendedStudentAnswer[];
}

export function useStudentAnswersDisplay(
  exerciseId: string,
  userId: string,
  allStudentAnswers: ExtendedStudentExerciseAnswers[],
  refresh: (silent?: boolean) => void
) {
  const {
    saveAnswer,
    deleteAnswer,
    updateMarkedWords,
    isSaving: isDeleting,
  } = useSaveStudentAnswer();
  const { showToast } = useToast();

  // Track saving states for auto-save
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  // Track delete target for confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<{
    studentId: string;
    itemNumber: string;
  } | null>(null);

  // Refs for navigation
  const bubbleRefs = useRef<Map<string, StudentAnswerBubbleHandle>>(new Map());

  const handleNavigate = useCallback(
    (currentItemNumber: string, direction: "up" | "down") => {
      // Find current student's answers
      const myEntry = allStudentAnswers.find((s) => s.studentId === userId);
      if (!myEntry) return;

      // Sort answers by item number
      const sortedAnswers = [...myEntry.answers].sort((a, b) =>
        a.itemNumber.localeCompare(b.itemNumber, undefined, { numeric: true })
      );

      const currentIndex = sortedAnswers.findIndex(
        (a) => a.itemNumber === currentItemNumber
      );
      if (currentIndex === -1) return;

      const targetIndex =
        direction === "down" ? currentIndex + 1 : currentIndex - 1;

      if (targetIndex >= 0 && targetIndex < sortedAnswers.length) {
        const targetItemNumber = sortedAnswers[targetIndex].itemNumber;
        const ref = bubbleRefs.current.get(targetItemNumber);
        if (ref) {
          ref.startEditing();
        }
      }
    },
    [allStudentAnswers, userId]
  );

  // Save answer immediately (triggered on blur/save click)
  const handleEditChange = useCallback(
    async (
      studentId: string,
      studentName: string,
      itemNumber: string,
      value: string
    ) => {
      const key = `${studentId}_${itemNumber}`;

      if (!value || value.trim() === "") {
        return;
      }

      setSavingStates((prev) => ({ ...prev, [key]: true }));

      const success = await saveAnswer(
        studentId,
        studentName,
        exerciseId,
        itemNumber,
        value.trim()
      );

      setSavingStates((prev) => ({ ...prev, [key]: false }));

      if (success) {
        showToast(`Answer updated for Item ${itemNumber}`, "success");
        // Silent refresh to update local state without loading spinner
        refresh(true);
      } else {
        showToast(`Failed to update answer for Item ${itemNumber}`, "error");
      }
    },
    [exerciseId, saveAnswer, showToast, refresh]
  );

  const handleDeleteClick = useCallback(
    (studentId: string, itemNumber: string) => {
      setDeleteTarget({ studentId, itemNumber });
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    const { studentId, itemNumber } = deleteTarget;
    const success = await deleteAnswer(studentId, exerciseId, itemNumber);

    if (success) {
      showToast(`Answer for Item ${itemNumber} deleted`, "success");
      refresh(true);
      setDeleteTarget(null);
    } else {
      showToast(`Failed to delete answer for Item ${itemNumber}`, "error");
    }
  }, [deleteTarget, exerciseId, deleteAnswer, showToast, refresh]);

  const handleSaveMarkedWords = useCallback(
    async (
      studentId: string,
      exerciseId: string,
      itemNumber: string,
      markedWords: MarkedWord[]
    ) => {
      const success = await updateMarkedWords(
        studentId,
        exerciseId,
        itemNumber,
        markedWords
      );

      if (success) {
        showToast(`Marked ${markedWords.length} word(s) for practice`, "success");
        refresh(true); // Silent refresh
      } else {
        showToast('Failed to save marked words', 'error');
      }
    },
    [updateMarkedWords, showToast, refresh]
  );

  // Copy for AI Review handler
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyForAI = async () => {
    try {
      setIsCopying(true);
      let prompt =
        "I'm reviewing student answers. Please check the following answers and provide corrections/feedback.\n\n";

      allStudentAnswers.forEach((student) => {
        prompt += `Student: ${student.studentName}\n`;
        // Sort answers by item number
        const sortedAnswers = [...student.answers].sort((a, b) =>
          a.itemNumber.localeCompare(b.itemNumber, undefined, { numeric: true })
        );

        sortedAnswers.forEach((ans) => {
          prompt += `Item ${ans.itemNumber}: ${ans.studentAnswer}\n`;
        });
        prompt += "\n";
      });

      prompt +=
        "\nPlease provide corrected versions for any incorrect answers.";

      await navigator.clipboard.writeText(prompt);
      showToast("Copied to clipboard for AI review!", "success");
      setTimeout(() => setIsCopying(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      showToast("Failed to copy to clipboard", "error");
      setIsCopying(false);
    }
  };

  return {
    savingStates,
    deleteTarget,
    isDeleting,
    bubbleRefs,
    isCopying,
    setDeleteTarget,
    handleNavigate,
    handleEditChange,
    handleDeleteClick,
    handleConfirmDelete,
    handleSaveMarkedWords,
    handleCopyForAI,
  };
}
