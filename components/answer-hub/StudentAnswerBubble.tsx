/**
 * Student Answer Bubble Component
 * Displays student answer with bubble/leaf effect styling
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";

interface StudentAnswerBubbleProps {
  itemNumber: string;
  answer: string;
  studentName: string;
  isOwnAnswer: boolean;
  isSaving?: boolean;
  submittedAt?: number;
  onEdit?: (value: string) => void;
  onDelete?: () => void;
}

// Helper function to format time ago
function getTimeAgo(timestamp?: number): string {
  if (!timestamp) return "";

  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function StudentAnswerBubble({
  itemNumber,
  answer,
  studentName,
  isOwnAnswer,
  isSaving = false,
  submittedAt,
  onEdit,
  onDelete,
}: StudentAnswerBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(answer);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea when content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [value, isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent editing if clicking buttons or links
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    // Don't trigger edit if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    if (isOwnAnswer && onEdit) {
      setIsEditing(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onEdit) {
      onEdit(newValue);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const timeAgo = getTimeAgo(submittedAt);

  return (
    <div
      className={`px-6 py-3 flex gap-4 hover:bg-gray-50 transition-colors group ${
        isOwnAnswer && onEdit ? "cursor-pointer" : ""
      }`}
      onClick={handleClick}
    >
      <div className="font-mono text-sm font-semibold text-gray-500 w-8 pt-0.5 flex-shrink-0">
        {itemNumber}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium ${
                isOwnAnswer ? "text-blue-700 font-bold" : "text-gray-900"
              }`}
            >
              {studentName}
              {isOwnAnswer && " (You)"}
            </span>
            {timeAgo && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-400">{timeAgo}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
              {isCopied ? "copied!" : "copy"}
            </button>
            {isOwnAnswer && onDelete && (
              <>
                <span className="text-xs text-gray-300">•</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                >
                  delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-full">
          {isEditing && isOwnAnswer ? (
            <div className="relative w-full">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                autoFocus
                className="w-full p-0 text-sm text-gray-900 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none overflow-hidden font-medium leading-normal"
                style={{ minHeight: "24px" }}
                onClick={(e) => e.stopPropagation()}
              />
              {isEditing && (
                <GermanCharAutocomplete
                  textareaRef={textareaRef}
                  content={value}
                  onContentChange={(newContent) => {
                    setValue(newContent);
                    if (onEdit) {
                      onEdit(newContent);
                    }
                  }}
                />
              )}
              {isSaving && (
                <span className="text-xs text-blue-600 mt-1 block">
                  Saving...
                </span>
              )}
            </div>
          ) : (
            <div
              className={`text-sm text-gray-900 font-medium whitespace-pre-wrap leading-normal ${
                isOwnAnswer && onEdit
                  ? "group-hover:text-blue-700 transition-colors"
                  : ""
              }`}
              title={isOwnAnswer && onEdit ? "Click to edit" : ""}
            >
              {value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
