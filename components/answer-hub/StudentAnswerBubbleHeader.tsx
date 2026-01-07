"use client";

import { getTimeAgo } from "./ui-utils";

interface StudentAnswerBubbleHeaderProps {
  studentName: string;
  isOwnAnswer: boolean;
  submittedAt?: number;
  isCorrect?: boolean;
  isEditing: boolean;
  onSave: (e: React.MouseEvent) => void;
  isCopied: boolean;
  onCopy: (e: React.MouseEvent) => void;
  onEdit?: () => void;
  onDelete?: () => void;

  // Marking props
  canMark?: boolean;
  isMarkingMode: boolean;
  markedWordsCount: number;
  isSavingMarks: boolean;
  onToggleMarkingMode: (e: React.MouseEvent) => void;
  onSaveMarkedWords: (e: React.MouseEvent) => void;
  onCancelMarkingMode: (e: React.MouseEvent) => void;
}

export function StudentAnswerBubbleHeader({
  studentName,
  isOwnAnswer,
  submittedAt,
  isCorrect,
  isEditing,
  onSave,
  isCopied,
  onCopy,
  onEdit,
  onDelete,
  canMark,
  isMarkingMode,
  markedWordsCount,
  isSavingMarks,
  onToggleMarkingMode,
  onSaveMarkedWords,
  onCancelMarkingMode,
}: StudentAnswerBubbleHeaderProps) {
  const timeAgo = getTimeAgo(submittedAt);

  return (
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
        {isCorrect !== undefined && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              isCorrect
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isCorrect ? "Correct" : "Incorrect"}
          </span>
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
              onMouseDown={onSave}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors"
            >
              Save
            </button>
            <span className="text-xs text-gray-300">•</span>
          </>
        )}
        <button
          onClick={onCopy}
          className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
        >
          {isCopied ? "Copied!" : "Copy"}
        </button>
        {canMark && !isEditing && (
          <>
            <span className="text-xs text-gray-300">•</span>
            {!isMarkingMode ? (
              <button
                onClick={onToggleMarkingMode}
                className="text-xs text-gray-400 hover:text-purple-600 transition-colors"
              >
                📌 Mark to Practice
              </button>
            ) : (
              <>
                <button
                  onClick={onSaveMarkedWords}
                  disabled={markedWordsCount === 0 || isSavingMarks}
                  className="text-xs font-bold text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                >
                  {isSavingMarks ? "Saving..." : `Save (${markedWordsCount})`}
                </button>
                <span className="text-xs text-gray-300">•</span>
                <button
                  onClick={onCancelMarkingMode}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </>
        )}
        {isOwnAnswer && !isEditing && onEdit && !isMarkingMode && (
          <>
            <span className="text-xs text-gray-300">•</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
              Edit
            </button>
          </>
        )}
        {isOwnAnswer && onDelete && !isMarkingMode && (
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
  );
}
