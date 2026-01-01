/**
 * Inline Editable Exercise Card
 * Allows creating/editing exercises directly in the list without a dialog
 * Provides seamless inline editing experience
 */

"use client";

import { useState, KeyboardEvent } from "react";
import { Check, X, Plus, Trash2 } from "lucide-react";
import { ExerciseAnswer } from "@/lib/models/exercises";
import { CreateExerciseOverrideInput } from "@/lib/models/exerciseOverride";

interface InlineEditableExerciseCardProps {
  initialData?: Partial<CreateExerciseOverrideInput>;
  sectionName: string;
  onSave: (data: CreateExerciseOverrideInput) => Promise<void>;
  onCancel: () => void;
  colorScheme: {
    bg: string;
    text: string;
    badge: string;
  };
}

export function InlineEditableExerciseCard({
  initialData,
  sectionName,
  onSave,
  onCancel,
  colorScheme,
}: InlineEditableExerciseCardProps) {
  const [exerciseNumber, setExerciseNumber] = useState(
    initialData?.exerciseNumber || ""
  );
  const [question, setQuestion] = useState(initialData?.question || "");
  const [answers, setAnswers] = useState<ExerciseAnswer[]>(
    initialData?.answers && initialData.answers.length > 0
      ? initialData.answers
      : [{ itemNumber: "1", correctAnswer: "" }]
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddAnswer = () => {
    const nextNumber = (answers.length + 1).toString();
    setAnswers([...answers, { itemNumber: nextNumber, correctAnswer: "" }]);
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length === 1) return;
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const handleUpdateAnswer = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = { ...updated[index], correctAnswer: value };
    setAnswers(updated);
  };

  const handleUpdateAnswerNumber = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = { ...updated[index], itemNumber: value };
    setAnswers(updated);
  };

  const handleKeyDown = (e: KeyboardEvent, callback: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  };

  const handleSave = async () => {
    if (!exerciseNumber.trim()) {
      alert("Exercise number is required");
      return;
    }

    if (answers.length === 0) {
      alert("At least one answer slot is required");
      return;
    }

    setIsSaving(true);
    try {
      // Use existing exerciseId if editing, or generate new one if creating
      let exerciseId = initialData?.exerciseId;

      if (!exerciseId) {
        // Generate unique exerciseId from section, exercise number, and timestamp
        const timestamp = Date.now();
        const sanitizedSection = sectionName
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase();
        const sanitizedNumber = exerciseNumber
          .trim()
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase();
        exerciseId = `${sanitizedSection}-${sanitizedNumber}-${timestamp}`;
      }

      // Build override data without undefined fields
      const overrideData: CreateExerciseOverrideInput = {
        exerciseId,
        exerciseNumber: exerciseNumber.trim(),
        section: sectionName,
        answers: answers,
        overrideType: "create",
        difficulty: initialData?.difficulty || "medium",
      };

      // Only add question if it's not empty
      if (question.trim()) {
        overrideData.question = question.trim();
      }

      await onSave(overrideData);
    } catch (error) {
      console.error("Error saving exercise:", error);
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`${colorScheme.bg} px-6 py-4 border-2 border-dashed border-gray-300`}
    >
      <div className="space-y-3">
        {/* Exercise Number & Question */}
        <div className="flex items-start gap-3">
          <input
            type="text"
            value={exerciseNumber}
            onChange={(e) => setExerciseNumber(e.target.value)}
            placeholder="Exercise number (e.g., 1, 2a, 3b)"
            className="flex-shrink-0 w-32 px-3 py-2 text-sm font-bold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-piku-purple"
            autoFocus
          />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question/instructions (optional)"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-piku-purple"
          />
        </div>

        {/* Answers */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Answers
            </span>
            <button
              onClick={handleAddAnswer}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Add answer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {answers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={answer.itemNumber}
                onChange={(e) =>
                  handleUpdateAnswerNumber(index, e.target.value)
                }
                placeholder="#"
                className="flex-shrink-0 w-10 px-1 py-1.5 text-xs font-semibold text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-piku-purple"
              />
              <input
                type="text"
                value={answer.correctAnswer}
                onChange={(e) => handleUpdateAnswer(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && index === answers.length - 1) {
                    handleAddAnswer();
                  }
                }}
                placeholder="Enter answer"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-piku-purple"
              />
              {answers.length > 1 && (
                <button
                  onClick={() => handleRemoveAnswer(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove answer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
          >
            <X className="w-3 h-3" />
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50"
          >
            <Check className="w-3 h-3" />
            {isSaving ? "SAVING..." : "SAVE"}
          </button>
        </div>
      </div>
    </div>
  );
}
