/**
 * Inline Editable Exercise Card
 * Allows creating/editing exercises directly in the list without a dialog
 * Provides seamless inline editing experience
 */

"use client";

import { useState, KeyboardEvent, useRef } from "react";
import {
  Check,
  X,
  Plus,
  Trash2,
  GripVertical,
  Link as LinkIcon,
  Youtube,
  Music,
} from "lucide-react";
import { ExerciseAnswer, ExerciseAttachment } from "@/lib/models/exercises";
import { CreateExerciseOverrideInput } from "@/lib/models/exerciseOverride";
import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";
import { InlineAnswerInput } from "./InlineAnswerInput";
import { InlineItemNumberInput } from "./InlineItemNumberInput";
import { AudioAttachmentSelector } from "./AudioAttachmentSelector";
import { PDFAttachmentSelector } from "./pdf";
import { CEFRLevel } from "@/lib/models/cefr";

// Flattened type for inline editing UI
interface InlineExerciseData {
  exerciseId?: string;
  exerciseNumber?: string;
  question?: string;
  answers?: ExerciseAnswer[];
  difficulty?: 'easy' | 'medium' | 'hard';
  attachments?: ExerciseAttachment[];
  modifications?: {
    attachments?: ExerciseAttachment[];
  };
}

interface InlineEditableExerciseCardProps {
  initialData?: InlineExerciseData;
  sectionName: string;
  level: CEFRLevel;
  bookType: "AB" | "KB";
  lessonNumber: number;
  onSave: (data: CreateExerciseOverrideInput) => Promise<void>;
  onCancel: () => void;
  colorScheme: {
    bg: string;
    text: string;
    badge: string;
    border: string;
  };
}

export function InlineEditableExerciseCard({
  initialData,
  sectionName,
  level,
  bookType,
  lessonNumber,
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
  const [attachments, setAttachments] = useState<ExerciseAttachment[]>(
    initialData?.modifications?.attachments || initialData?.attachments || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const questionRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const exerciseNumberRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleAddAnswer = () => {
    let nextNumber = (answers.length + 1).toString();

    if (answers.length > 0) {
      const lastAnswer = answers[answers.length - 1];
      const nextSeq = getNextSequence(lastAnswer.itemNumber);
      if (nextSeq) {
        nextNumber = nextSeq;
      }
    }

    setAnswers([...answers, { itemNumber: nextNumber, correctAnswer: "" }]);
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length === 1) return;
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const handleAddAttachment = () => {
    setAttachments([...attachments, { type: "link", url: "", title: "" }]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleUpdateAttachment = (
    index: number,
    field: keyof ExerciseAttachment,
    value: string
  ) => {
    const updated = [...attachments];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-detect type if URL changes
    if (field === "url") {
      if (value.includes("youtube.com") || value.includes("youtu.be")) {
        updated[index].type = "youtube";
      } else {
        updated[index].type = "link";
      }
    }

    setAttachments(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(index);
    // Add transparent drag image or styling here if needed
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newAnswers = [...answers];
    const draggedItem = newAnswers[draggedIndex];
    newAnswers.splice(draggedIndex, 1);
    newAnswers.splice(index, 0, draggedItem);

    setAnswers(newAnswers);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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
      // Note: We cast to any because we are constructing the exerciseData properties
      // which will likely be mapped to exerciseData object in the handler or API
      const overrideData: any = {
        exerciseId,
        exerciseNumber: exerciseNumber.trim(),
        section: sectionName,
        answers: answers,
        overrideType: "create",
        difficulty: initialData?.difficulty || "medium",
        attachments: attachments.length > 0 ? attachments : undefined,
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
          <div className="relative flex-shrink-0 group">
            <input
              ref={exerciseNumberRef}
              type="text"
              value={exerciseNumber}
              onChange={(e) => setExerciseNumber(e.target.value)}
              onClick={() => {
                if (exerciseNumber === (initialData?.exerciseNumber || "")) {
                  setExerciseNumber("");
                }
              }}
              placeholder="Exercise number (e.g., 1, 2a, 3b)"
              className="flex-shrink-0 w-32 px-3 py-2 pr-8 text-sm font-bold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-piku-purple"
              autoFocus
            />
            {exerciseNumber && (
              <button
                onClick={() => {
                  setExerciseNumber("");
                  exerciseNumberRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                tabIndex={-1}
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <GermanCharAutocomplete
              textareaRef={exerciseNumberRef}
              content={exerciseNumber}
              onContentChange={setExerciseNumber}
            />
          </div>
          <div className="flex-1 relative group">
            <input
              ref={questionRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Question/instructions (optional)"
              className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-piku-purple"
            />
            {question && (
              <button
                onClick={() => {
                  setQuestion("");
                  questionRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                tabIndex={-1}
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <GermanCharAutocomplete
              textareaRef={questionRef}
              content={question}
              onContentChange={setQuestion}
            />
          </div>
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
            <div
              key={index}
              className={`flex items-center gap-2 transition-all ${
                draggedIndex === index ? "opacity-50" : "opacity-100"
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
                title="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
              </div>

              <InlineItemNumberInput
                value={answer.itemNumber}
                onValueChange={(val) => handleUpdateAnswerNumber(index, val)}
                onClick={() => handleUpdateAnswerNumber(index, "")}
                placeholder="#"
                className="flex-shrink-0 w-10 px-1 py-1.5 text-xs font-semibold text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-piku-purple"
              />
              <InlineAnswerInput
                value={answer.correctAnswer}
                onValueChange={(val) => handleUpdateAnswer(index, val)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && index === answers.length - 1) {
                    handleAddAnswer();
                  }
                }}
                placeholder="Enter answer"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-piku-purple"
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

        {/* Audio Attachments */}
        <div className="border-t pt-3">
          <AudioAttachmentSelector
            level={level}
            bookType={bookType}
            lessonNumber={lessonNumber}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        </div>

        {/* PDF Attachments */}
        <div className="border-t pt-3">
          <PDFAttachmentSelector
            level={level}
            bookType={bookType}
            lessonNumber={lessonNumber}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        </div>

        {/* Link/YouTube Attachments */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Links & YouTube
            </span>
            <button
              onClick={handleAddAttachment}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Add link or YouTube video"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {attachments.filter(a => a.type !== 'audio' && a.type !== 'pdf').map((attachment, index) => {
            // Find the actual index in the full attachments array
            const actualIndex = attachments.findIndex(a => a === attachment);

            return (
              <div key={actualIndex} className="flex items-center gap-2">
                <div className="flex-shrink-0 text-gray-400 p-1">
                  {attachment.type === "youtube" ? (
                    <Youtube className="w-4 h-4 text-red-500" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                </div>

                <input
                  type="text"
                  value={attachment.url}
                  onChange={(e) =>
                    handleUpdateAttachment(actualIndex, "url", e.target.value)
                  }
                  placeholder="URL (e.g. https://youtube.com/...)"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-piku-purple"
                />

                <input
                  type="text"
                  value={attachment.title || ""}
                  onChange={(e) =>
                    handleUpdateAttachment(actualIndex, "title", e.target.value)
                  }
                  placeholder="Title (optional)"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-piku-purple"
                />

                <button
                  onClick={() => handleRemoveAttachment(actualIndex)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove attachment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
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

function getNextSequence(current: string): string | null {
  const trimmed = current.trim();

  // Integer (1, 2, 10)
  if (/^\d+$/.test(trimmed)) {
    return (parseInt(trimmed, 10) + 1).toString();
  }

  // Single Letter (a, b, A, B)
  if (/^[a-zA-Z]$/.test(trimmed)) {
    const code = trimmed.charCodeAt(0);
    if (trimmed.toLowerCase() === "z") return null;
    return String.fromCharCode(code + 1);
  }

  // Number with separator (1., 1), 1:)
  const numSepMatch = trimmed.match(/^(\d+)([\.\)\:])$/);
  if (numSepMatch) {
    return `${parseInt(numSepMatch[1], 10) + 1}${numSepMatch[2]}`;
  }

  // Letter with separator (a., a), A:)
  const charSepMatch = trimmed.match(/^([a-zA-Z])([\.\)\:])$/);
  if (charSepMatch) {
    const char = charSepMatch[1];
    if (char.toLowerCase() === "z") return null;
    return `${String.fromCharCode(char.charCodeAt(0) + 1)}${charSepMatch[2]}`;
  }

  return null;
}
