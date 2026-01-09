/**
 * Answers List Component
 * Displays correct answers for an exercise (teachers only)
 * Students can input and save their answers
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { ExerciseAnswer } from "@/lib/models/exercises";
import { TeacherAnswerDisplay } from "./TeacherAnswerDisplay";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { AnswerInputRow, AnswerInputRowHandle } from "./AnswerInputRow";
import { useAnswerSaving, useCopyForAI } from "./useAnswerSaving";
import { ExerciseItemsSection } from "./ExerciseItemsSection";
import { SaveWarning } from "./SaveWarning";
import { AnswerActionsHeader } from "./AnswerActionsHeader";

interface AnswersListProps {
  answers: ExerciseAnswer[];
  exerciseId: string;
  showExplanations?: boolean;
  isTeacher?: boolean;
  onAnswerSaved?: () => void;
  onUpdateAnswer?: (itemIndex: number, newAnswer: string) => Promise<void>;
}

export function AnswersList({
  answers,
  exerciseId,
  showExplanations = true,
  isTeacher = false,
  onAnswerSaved,
  onUpdateAnswer,
}: AnswersListProps) {
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId, userName } = getUserInfo(currentUser, session);

  const [isCollapsed, setIsCollapsed] = useState(!isTeacher);
  const [studentInputs, setStudentInputs] = useState<Record<string, string>>({});

  // Refs for navigation
  const inputRefs = useRef<Map<string, AnswerInputRowHandle>>(new Map());

  // Use custom hooks for saving and copying
  const { canSave, isGlobalSaving, savingStates, handleManualSave } = useAnswerSaving(
    exerciseId,
    userId,
    userName,
    studentInputs,
    setStudentInputs,
    onAnswerSaved
  );

  const { isCopying, handleCopyForAI } = useCopyForAI(answers, studentInputs);

  // Handle input change
  const handleInputChange = useCallback((itemNumber: string, value: string) => {
    setStudentInputs((prev) => ({ ...prev, [itemNumber]: value }));
  }, []);

  // Handle navigation between fields
  const handleNavigate = useCallback(
    (currentItemNumber: string, direction: "up" | "down") => {
      const currentIndex = answers.findIndex(
        (a) => a.itemNumber === currentItemNumber
      );
      if (currentIndex === -1) return;

      const targetIndex =
        direction === "down" ? currentIndex + 1 : currentIndex - 1;

      if (targetIndex >= 0 && targetIndex < answers.length) {
        const targetItemNumber = answers[targetIndex].itemNumber;
        const ref = inputRefs.current.get(targetItemNumber);
        if (ref) {
          ref.focus();
        }
      }
    },
    [answers]
  );

  // Teacher view: Show correct answers (always visible, NOT collapsible)
  if (isTeacher) {
    return (
      <TeacherAnswerDisplay
        answers={answers}
        showExplanations={showExplanations}
        exerciseId={exerciseId}
        onUpdateAnswer={onUpdateAnswer}
      />
    );
  }

  if (answers.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">No answers available</div>
    );
  }

  // Student view: Three separate sections
  return (
    <div className="space-y-8">
      {/* Section 1: Exercise Items */}
      <ExerciseItemsSection
        answers={answers}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Section 2: Your Answers */}
      <div>
        <AnswerActionsHeader
          canSave={canSave}
          isGlobalSaving={isGlobalSaving}
          isCopying={isCopying}
          onManualSave={handleManualSave}
          onCopyForAI={handleCopyForAI}
        />

        {!canSave && (
          <SaveWarning exerciseId={exerciseId} userId={userId} userName={userName} />
        )}

        <div className="space-y-3">
          {answers.map((answer, index) => (
            <AnswerInputRow
              key={index}
              ref={(el) => {
                if (el) {
                  inputRefs.current.set(answer.itemNumber, el);
                } else {
                  inputRefs.current.delete(answer.itemNumber);
                }
              }}
              answer={answer}
              value={studentInputs[answer.itemNumber] || ""}
              onChange={(newValue) =>
                handleInputChange(answer.itemNumber, newValue)
              }
              canSave={canSave}
              isSaving={!!savingStates[answer.itemNumber]}
              onNavigate={(direction) =>
                handleNavigate(answer.itemNumber, direction)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
