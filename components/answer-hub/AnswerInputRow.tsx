"use client";

import { useRef, useState } from "react";
import { ExerciseAnswer } from "@/lib/models/exercises";
import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";
import { Clipboard, X, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";

export interface AnswerInputRowProps {
  answer: ExerciseAnswer;
  value: string;
  onChange: (value: string) => void;
  canSave: boolean;
  isSaving: boolean;
}

export function AnswerInputRow({
  answer,
  value,
  onChange,
  canSave,
  isSaving,
}: AnswerInputRowProps) {
  const [isMultiline, setIsMultiline] = useState(false);
  // We use a specific ref type that works for both but we'll cast when passing to specific elements
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  const handleValueChange = (newValue: string) => {
    if (newValue.length > 0) {
      const firstChar = newValue.charAt(0);
      if (firstChar !== firstChar.toUpperCase()) {
        newValue = firstChar.toUpperCase() + newValue.slice(1);
      }
    }
    onChange(newValue);
  };

  const handlePaste = async () => {
    try {
      // Try to read from clipboard
      const text = await navigator.clipboard.readText();
      if (text) {
        handleValueChange(text);
        // Focus the current element
        setTimeout(() => {
          (inputRef.current as HTMLElement)?.focus();
        }, 0);
      }
    } catch (error) {
      console.error("Failed to paste:", error);

      // If permission denied or not supported, inform the user
      showToast(
        "Unable to access clipboard. Please use Ctrl+V / Cmd+V to paste.",
        "warning"
      );

      // Fallback: Focus the input so they can manually paste easily
      (inputRef.current as HTMLElement)?.focus();
    }
  };

  const handleClear = () => {
    handleValueChange("");
    setTimeout(() => {
      (inputRef.current as HTMLElement)?.focus();
    }, 0);
  };

  return (
    <div
      className={`bg-gray-50 border border-gray-200 p-4 ${
        !canSave ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Pencil Icon */}
        <div className="flex-shrink-0 mt-1">
          <svg
            className={`w-5 h-5 ${canSave ? "text-blue-600" : "text-gray-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>

        {/* Input Field */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Item {answer.itemNumber}
          </label>

          <div className="relative">
            {isMultiline ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                autoComplete="off"
                spellCheck={false}
                data-lpignore="true"
                placeholder={
                  canSave
                    ? "Type your answer here..."
                    : "Saving disabled - type for practice only"
                }
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                disabled={!canSave}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 outline-none transition-colors text-sm pr-20 rounded-none resize-y min-h-[80px] ${
                  canSave
                    ? "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                autoComplete="off"
                spellCheck={false}
                data-lpignore="true"
                placeholder={
                  canSave
                    ? "Type your answer here..."
                    : "Saving disabled - type for practice only"
                }
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                disabled={!canSave}
                className={`w-full px-3 py-2 border border-gray-300 outline-none transition-colors text-sm pr-24 rounded-none ${
                  canSave
                    ? "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
            )}

            {/* Action Buttons */}
            {canSave && (
              <div
                className={`absolute right-2 flex items-center gap-1 ${
                  isMultiline ? "top-2" : "top-1/2 -translate-y-1/2"
                }`}
              >
                <button
                  onClick={() => setIsMultiline(!isMultiline)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title={
                    isMultiline
                      ? "Switch to single line"
                      : "Switch to multi-line"
                  }
                  type="button"
                >
                  {isMultiline ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={handlePaste}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Paste from clipboard"
                  type="button"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                </button>
                {value && (
                  <button
                    onClick={handleClear}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Clear answer"
                    type="button"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <GermanCharAutocomplete
              textareaRef={inputRef}
              content={value}
              onContentChange={handleValueChange}
            />
          </div>

          {/* Saving indicator */}
          <p className="mt-1 text-xs text-gray-500">
            {canSave ? (
              isSaving ? (
                <span className="text-blue-600 font-medium">Saving...</span>
              ) : (
                'Press "Save Answers" to submit'
              )
            ) : (
              <span className="text-amber-600">Saving disabled</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
