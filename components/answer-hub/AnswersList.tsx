/**
 * Answers List Component
 * Displays correct answers for an exercise (teachers only)
 * Students can input and save their answers
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ExerciseAnswer } from "@/lib/models/exercises";
import { TeacherAnswerDisplay } from "./TeacherAnswerDisplay";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { getUserInfo } from "@/lib/utils/userHelpers";
import {
  useSaveStudentAnswer,
  useStudentAnswers,
} from "@/lib/hooks/useStudentAnswers";
import { useToast } from "@/lib/hooks/useToast";
import { AnswerInputRow } from "./AnswerInputRow";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

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
  const [studentInputs, setStudentInputs] = useState<Record<string, string>>(
    {}
  );
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  const { saveAnswer } = useSaveStudentAnswer();
  const { showToast } = useToast();

  // Check if saving is enabled (requires exerciseId and authenticated user)
  const canSave = Boolean(exerciseId && userId && userName);

  // Global saving state for manual save
  const [isGlobalSaving, setIsGlobalSaving] = useState(false);

  // Handle input change (update local state only)
  const handleInputChange = useCallback((itemNumber: string, value: string) => {
    setStudentInputs((prev) => ({ ...prev, [itemNumber]: value }));
  }, []);

  // Manual save handler
  const handleManualSave = async () => {
    if (!canSave || !userId || !userName) return;

    const inputsToSave = Object.entries(studentInputs).filter(
      ([_, value]) => value && value.trim() !== ""
    );

    if (inputsToSave.length === 0) {
      showToast("No answers to save", "info");
      return;
    }

    setIsGlobalSaving(true);
    setSavingStates((prev) => {
      const newStates = { ...prev };
      inputsToSave.forEach(([itemNumber]) => {
        newStates[itemNumber] = true;
      });
      return newStates;
    });

    try {
      // Save all changed inputs in parallel
      const savePromises = inputsToSave.map(([itemNumber, value]) =>
        saveAnswer(userId, userName, exerciseId, itemNumber, value.trim())
      );

      const results = await Promise.all(savePromises);
      const allSuccess = results.every(Boolean);

      if (allSuccess) {
        showToast(
          `Saved ${inputsToSave.length} answer${
            inputsToSave.length !== 1 ? "s" : ""
          }!`,
          "success"
        );
        if (onAnswerSaved) {
          onAnswerSaved();
        }
      } else {
        const successCount = results.filter(Boolean).length;
        showToast(
          `Saved ${successCount} of ${inputsToSave.length} answers. Some failed.`,
          "warning"
        );
        if (successCount > 0 && onAnswerSaved) {
          onAnswerSaved();
        }
      }
    } catch (error) {
      console.error("Error saving answers:", error);
      showToast("Failed to save answers", "error");
    } finally {
      setIsGlobalSaving(false);
      setSavingStates({});
    }
  };

  // Copy for AI Review handler
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyForAI = async () => {
    try {
      setIsCopying(true);
      let prompt =
        "I'm practicing German. Please check my answers for the following exercise items. Provide corrections if needed.\n\n";

      // Sort answers by item number
      const sortedAnswers = [...answers].sort((a, b) => {
        return a.itemNumber.localeCompare(b.itemNumber, undefined, {
          numeric: true,
        });
      });

      sortedAnswers.forEach((ans) => {
        const studentAnswer =
          studentInputs[ans.itemNumber] || "(No answer provided)";
        prompt += `Item ${ans.itemNumber}: ${studentAnswer}\n`;
      });

      prompt +=
        "\nPlease provide corrected versions for any incorrect answers.";

      await navigator.clipboard.writeText(prompt);
      showToast("Copied to clipboard for AI review!", "success");

      // Reset copying state after a moment
      setTimeout(() => setIsCopying(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      showToast("Failed to copy to clipboard", "error");
      setIsCopying(false);
    }
  };

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
      {/* Section 1: Exercise Items - Collapsible (shows item numbers only) */}
      <div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors duration-200 mb-2"
        >
          <span className="text-sm font-semibold">
            {isCollapsed ? "Show Exercise Items" : "Hide Exercise Items"} (
            {answers.length} item{answers.length !== 1 ? "s" : ""})
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isCollapsed ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {!isCollapsed && (
          <div className="bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-800 mb-2">
                  <span className="font-semibold">
                    Exercise has {answers.length} item
                    {answers.length !== 1 ? "s" : ""}:
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {answers.map((answer, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                    >
                      Item {answer.itemNumber}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Your Answers - NOT Collapsible (input fields) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Answers</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyForAI}
              disabled={isCopying}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1.5 transition-colors"
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

            {canSave && (
              <ActionButton
                onClick={handleManualSave}
                disabled={isGlobalSaving}
                icon={<ActionButtonIcons.Save />}
                size="compact"
                variant="purple"
                className="!w-auto"
              >
                {isGlobalSaving ? "Saving..." : "Save Answers"}
              </ActionButton>
            )}
          </div>
        </div>

        {/* Warning if saving is disabled */}
        {!canSave && (
          <div className="bg-amber-50 border border-amber-200 p-4 mb-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-amber-800 font-semibold mb-1">
                  Answer saving is disabled
                </p>
                <p className="text-xs text-amber-700">
                  {!exerciseId && "Exercise ID is missing. "}
                  {!userId &&
                    !userName &&
                    "Please log in to save your answers. "}
                  You can still type your answers for practice.
                </p>
              </div>
            </div>
          </div>
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
