"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { Input } from "../ui/Input";
import { ExerciseAnswer } from "@/lib/models/exercises";
import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";

export function AnswerEditorRow({
  answer,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  answer: ExerciseAnswer;
  index: number;
  onUpdate: (
    index: number,
    field: "itemNumber" | "correctAnswer",
    value: string
  ) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const itemNumberRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-start gap-2">
      <div className="w-24 relative">
        <Input
          ref={itemNumberRef}
          type="text"
          value={answer.itemNumber}
          onChange={(e) => onUpdate(index, "itemNumber", e.target.value)}
          placeholder="Item #"
        />
        <GermanCharAutocomplete
          textareaRef={itemNumberRef}
          content={answer.itemNumber}
          onContentChange={(newContent) =>
            onUpdate(index, "itemNumber", newContent)
          }
        />
      </div>
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          type="text"
          value={answer.correctAnswer}
          onChange={(e) => onUpdate(index, "correctAnswer", e.target.value)}
          placeholder="Correct answer"
        />
        <GermanCharAutocomplete
          textareaRef={inputRef}
          content={answer.correctAnswer}
          onContentChange={(newContent) =>
            onUpdate(index, "correctAnswer", newContent)
          }
        />
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove answer"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
