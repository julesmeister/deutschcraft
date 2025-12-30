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

  const handleClick = () => {
    if (isOwnAnswer && onEdit) {
      setIsEditing(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onEdit) {
      onEdit(newValue);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const timeAgo = getTimeAgo(submittedAt);

  // Different colors for own answers vs others
  const bubbleColors = isOwnAnswer
    ? "bg-gradient-to-br from-blue-500 to-blue-700"
    : "bg-gradient-to-br from-gray-500 to-gray-700";

  const hoverColors = isOwnAnswer
    ? "hover:from-blue-600 hover:to-blue-800"
    : "";

  return (
    <div className="mb-4">
      <div className="flex items-center ml-2 mb-1">
        <span
          className={`text-xs font-medium ${
            isOwnAnswer ? "text-blue-700 font-bold" : "text-gray-500"
          }`}
        >
          {studentName}
          {isOwnAnswer && " (You)"}
        </span>
        {timeAgo && (
          <>
            <span className="text-xs text-gray-400 mx-2">•</span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </>
        )}
        {isOwnAnswer && onDelete && (
          <>
            <span className="text-xs text-gray-400 mx-2">•</span>
            <button
              onClick={onDelete}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors"
            >
              delete
            </button>
          </>
        )}
      </div>

      <div className="w-full">
        {isEditing && isOwnAnswer ? (
          <div className="relative w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center z-10">
              <span className="text-xs font-bold text-blue-700">
                {itemNumber}
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                const newValue = e.target.value;
                setValue(newValue);
                if (onEdit) {
                  onEdit(newValue);
                }
              }}
              onBlur={handleBlur}
              autoFocus
              className={`w-full pl-12 sm:pl-16 pr-4 sm:pr-8 py-3 sm:py-5 text-sm text-white ${bubbleColors} border border-blue-700 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-300 transition-all duration-150 ease-in-out placeholder-blue-200 resize-none overflow-hidden`}
              style={{ borderRadius: "0 30px 30px 40px", minHeight: "60px" }}
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
              <span className="text-xs text-blue-600 mt-2 ml-2 block">
                Saving...
              </span>
            )}
          </div>
        ) : (
          <div
            onClick={handleClick}
            className={`inline-flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 pr-4 sm:pr-8 py-3 sm:py-5 text-sm text-white ${bubbleColors} transition-all duration-150 ease-in-out ${
              isOwnAnswer && onEdit
                ? `cursor-pointer ${hoverColors} hover:shadow-md`
                : ""
            }`}
            style={{ borderRadius: "0 30px 30px 40px" }}
            title={isOwnAnswer && onEdit ? "Click to edit" : ""}
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-700">
                {itemNumber}
              </span>
            </div>
            <span>{value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
