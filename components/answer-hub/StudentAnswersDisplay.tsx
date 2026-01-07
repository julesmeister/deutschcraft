/**
 * Student Answers Display Component
 * Shows all student submissions for an exercise
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  useStudentAnswers,
  useSaveStudentAnswer,
} from "@/lib/hooks/useStudentAnswers";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { useToast } from "@/lib/hooks/useToast";
import {
  StudentAnswerBubble,
  StudentAnswerBubbleHandle,
} from "./StudentAnswerBubble";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { MarkedWord } from "@/lib/models/studentAnswers";

interface StudentAnswersDisplayProps {
  exerciseId: string;
  refreshTrigger?: number;
}

export function StudentAnswersDisplay({
  exerciseId,
  refreshTrigger,
}: StudentAnswersDisplayProps) {
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId } = getUserInfo(currentUser, session);

  const {
    answers: allStudentAnswers,
    isLoading,
    refresh,
  } = useStudentAnswers(exerciseId);

  // Listen for external refresh triggers
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      refresh();
    }
  }, [refreshTrigger, refresh]);

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
    [exerciseId, saveAnswer, showToast]
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

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-center text-gray-500">
          <svg
            className="animate-spin h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading student answers...
        </div>
      </div>
    );
  }

  if (allStudentAnswers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          No Student Answers Yet
        </h3>
        <p className="text-sm text-gray-600">
          Student answers will appear here once they start submitting their
          work.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-xl">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-lg font-black text-gray-900">Student Answers</h2>
          <span className="text-sm text-gray-600">
            ({allStudentAnswers.length} student
            {allStudentAnswers.length !== 1 ? "s" : ""})
          </span>

          <button
            onClick={handleCopyForAI}
            disabled={isCopying}
            className="ml-auto text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1.5 transition-colors bg-white px-3 py-1.5 rounded-md border border-purple-100 shadow-sm hover:shadow hover:bg-purple-50"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            <span>{isCopying ? "Copied!" : "Copy for AI Review"}</span>
          </button>
        </div>
      </div>

      {/* Student Answers List */}
      <div className="divide-y divide-gray-100">
        {allStudentAnswers.map((studentAnswers, idx) =>
          studentAnswers.answers.map((ans, ansIdx) => {
            const key = `${studentAnswers.studentId}_${ans.itemNumber}`;
            const isSaving = savingStates[key];
            const isOwnAnswer = userId === studentAnswers.studentId;

            return (
              <StudentAnswerBubble
                key={`${idx}_${ansIdx}`}
                ref={
                  isOwnAnswer
                    ? (el) => {
                        if (el) {
                          bubbleRefs.current.set(ans.itemNumber, el);
                        } else {
                          bubbleRefs.current.delete(ans.itemNumber);
                        }
                      }
                    : undefined
                }
                itemNumber={ans.itemNumber}
                answer={ans.studentAnswer}
                studentName={studentAnswers.studentName}
                isOwnAnswer={isOwnAnswer}
                isSaving={isSaving}
                submittedAt={ans.submittedAt}
                markedWords={ans.markedWords}
                onEdit={
                  isOwnAnswer
                    ? (value) =>
                        handleEditChange(
                          studentAnswers.studentId,
                          studentAnswers.studentName,
                          ans.itemNumber, // Use original itemNumber from ans
                          value
                        )
                    : undefined
                }
                onDelete={
                  isOwnAnswer
                    ? () =>
                        handleDeleteClick(
                          studentAnswers.studentId,
                          ans.itemNumber
                        )
                    : undefined
                }
                onSaveMarkedWords={
                  isOwnAnswer
                    ? (words) =>
                        handleSaveMarkedWords(
                          studentAnswers.studentId,
                          exerciseId,
                          ans.itemNumber,
                          words
                        )
                    : undefined
                }
                onNavigate={
                  isOwnAnswer
                    ? (direction) => handleNavigate(ans.itemNumber, direction)
                    : undefined
                }
              />
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Answer"
        message="Are you sure you want to delete this answer? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
