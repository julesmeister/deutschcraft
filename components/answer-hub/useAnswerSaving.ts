import { useState, useCallback } from "react";
import { ExerciseAnswer } from "@/lib/models/exercises";
import { useSaveStudentAnswer } from "@/lib/hooks/useStudentAnswers";
import { useToast } from "@/lib/hooks/useToast";

export function useAnswerSaving(
  exerciseId: string,
  userId: string | null,
  userName: string | null,
  studentInputs: Record<string, string>,
  setStudentInputs: (inputs: Record<string, string>) => void,
  onAnswerSaved?: () => void
) {
  const [isGlobalSaving, setIsGlobalSaving] = useState(false);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const { saveAnswer } = useSaveStudentAnswer();
  const { showToast } = useToast();

  const canSave = Boolean(exerciseId && userId && userName);

  const handleManualSave = useCallback(async () => {
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
        // Keep the saved values visible - don't clear inputs
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
  }, [canSave, userId, userName, studentInputs, saveAnswer, showToast, setStudentInputs, onAnswerSaved, exerciseId]);

  return {
    canSave,
    isGlobalSaving,
    savingStates,
    handleManualSave,
  };
}

export function useCopyForAI(answers: ExerciseAnswer[], studentInputs: Record<string, string>) {
  const [isCopying, setIsCopying] = useState(false);
  const { showToast } = useToast();

  const handleCopyForAI = useCallback(async () => {
    try {
      setIsCopying(true);
      let prompt =
        "I'm practicing German. Please check my answers for the following exercise items. Provide corrections if needed.\n\n";

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

      setTimeout(() => setIsCopying(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      showToast("Failed to copy to clipboard", "error");
      setIsCopying(false);
    }
  }, [answers, studentInputs, showToast]);

  return { isCopying, handleCopyForAI };
}
