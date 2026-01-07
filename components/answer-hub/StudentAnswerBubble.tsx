/**
 * Student Answer Bubble Component
 * Displays student answer with bubble/leaf effect styling
 */

"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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
  onNavigate?: (direction: "up" | "down") => void;
}

export interface StudentAnswerBubbleHandle {
  startEditing: () => void;
}

import { AnswerNumberBadge } from "./AnswerNumberBadge";

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

export const StudentAnswerBubble = forwardRef<
  StudentAnswerBubbleHandle,
  StudentAnswerBubbleProps
>(
  (
    {
      itemNumber,
      answer,
      studentName,
      isOwnAnswer,
      isSaving = false,
      submittedAt,
      onEdit,
      onDelete,
      onNavigate,
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(answer);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const prevAnswerRef = useRef(answer);

    useImperativeHandle(ref, () => ({
      startEditing: () => {
        setIsEditing(true);
      },
    }));

    // Sync value with answer prop only when prop changes
    useEffect(() => {
      if (answer !== prevAnswerRef.current) {
        setValue(answer);
        prevAnswerRef.current = answer;
      }
    }, [answer]);

    // Auto-resize textarea when content changes
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      }
    }, [value, isEditing]);

    // Handle double click to edit
    const handleDoubleClick = (e: React.MouseEvent) => {
      // Prevent editing if clicking buttons or links
      if ((e.target as HTMLElement).closest("button")) {
        return;
      }

      if (isOwnAnswer && onEdit) {
        setIsEditing(true);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
    };

    const handleBlur = () => {
      if (onEdit && value !== answer) {
        onEdit(value);
      }
      setIsEditing(false);
    };

    const handleSave = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onEdit && value !== answer) {
        onEdit(value);
      }
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!onNavigate) return;

      if (e.key === "ArrowUp") {
        const textarea = e.currentTarget;
        // Navigate up if cursor is at the beginning
        if (textarea.selectionStart === 0) {
          e.preventDefault();
          onNavigate("up");
        }
      } else if (e.key === "ArrowDown") {
        const textarea = e.currentTarget;
        // Navigate down if cursor is at the end
        if (textarea.selectionStart === textarea.value.length) {
          e.preventDefault();
          onNavigate("down");
        }
      }
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
    const isNumericItem = /^[0-9.]+$/.test(itemNumber);

    return (
      <div
        className={`px-6 py-3 flex gap-4 hover:bg-gray-50 transition-colors group ${
          isOwnAnswer && onEdit ? "cursor-pointer" : ""
        }`}
        onDoubleClick={handleDoubleClick}
      >
        <AnswerNumberBadge itemNumber={itemNumber} />

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
            <div
              className={`flex items-center gap-2 transition-opacity ${
                isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {isEditing && (
                <>
                  <button
                    onMouseDown={handleSave}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors"
                  >
                    Save
                  </button>
                  <span className="text-xs text-gray-300">•</span>
                </>
              )}
              <button
                onClick={handleCopy}
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
              >
                {isCopied ? "Copied!" : "Copy"}
              </button>
              {isOwnAnswer && !isEditing && onEdit && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                </>
              )}
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
                  onKeyDown={handleKeyDown}
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
);

StudentAnswerBubble.displayName = "StudentAnswerBubble";
