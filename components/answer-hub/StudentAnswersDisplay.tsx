"use client";

import { useEffect } from "react";
import { useStudentAnswers } from "@/lib/hooks/useStudentAnswers";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { StudentAnswerBubble } from "./StudentAnswerBubble";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { useStudentAnswersDisplay } from "./useStudentAnswersDisplay";
import { StudentAnswersHeader } from "./StudentAnswersHeader";

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
  } = useStudentAnswersDisplay(
    exerciseId,
    userId,
    allStudentAnswers,
    refresh
  );

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
      <StudentAnswersHeader 
        count={allStudentAnswers.length}
        isCopying={isCopying}
        onCopyForAI={handleCopyForAI}
      />

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
                          ans.itemNumber,
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
