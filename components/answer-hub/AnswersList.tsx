/**
 * Answers List Component
 * Displays correct answers for an exercise (teachers only)
 * Students can input and save their answers
 */

"use client";

import { useState, useCallback } from "react";
import { ExerciseAnswer } from "@/lib/models/exercises";
import { TeacherAnswerDisplay } from "./TeacherAnswerDisplay";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { AnswerInputRow } from "./AnswerInputRow";
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
}

export function AnswersList({
  answers,
  exerciseId,
  showExplanations = true,
  isTeacher = false,
  onAnswerSaved,
}: AnswersListProps) {
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId, userName } = getUserInfo(currentUser, session);

  const [isCollapsed, setIsCollapsed] = useState(!isTeacher);
  const [studentInputs, setStudentInputs] = useState<Record<string, string>>({});

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

  // Teacher view: Show correct answers (always visible, NOT collapsible)
  if (isTeacher) {
    return (
      <TeacherAnswerDisplay
        answers={answers}
        showExplanations={showExplanations}
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
              answer={answer}
              value={studentInputs[answer.itemNumber] || ""}
              onChange={(newValue) =>
                handleInputChange(answer.itemNumber, newValue)
              }
              canSave={canSave}
              isSaving={!!savingStates[answer.itemNumber]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
