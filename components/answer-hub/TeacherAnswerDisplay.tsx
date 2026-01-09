/**
 * Teacher Answer Display Component
 * Shows correct answers with explanations for teachers
 * Supports inline editing of correct answers
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { ExerciseAnswer } from '@/lib/models/exercises';

interface TeacherAnswerDisplayProps {
  answers: ExerciseAnswer[];
  showExplanations?: boolean;
  exerciseId?: string;
  onUpdateAnswer?: (itemIndex: number, newAnswer: string) => Promise<void>;
}

export function TeacherAnswerDisplay({
  answers,
  showExplanations = true,
  exerciseId,
  onUpdateAnswer,
}: TeacherAnswerDisplayProps) {
  // Inline editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingIndex]);

  // Handle starting inline edit
  const handleStartEdit = (index: number, currentAnswer: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUpdateAnswer) {
      setEditingIndex(index);
      setEditValue(currentAnswer);
    }
  };

  // Handle saving inline edit
  const handleSaveEdit = async () => {
    if (editingIndex === null || !onUpdateAnswer || isSaving) return;

    const trimmedValue = editValue.trim();
    const originalAnswer = answers[editingIndex].correctAnswer;

    // Only save if value changed (allow empty string to clear the answer)
    if (trimmedValue !== originalAnswer) {
      setIsSaving(true);
      try {
        await onUpdateAnswer(editingIndex, trimmedValue);
        // Success - close the editor
        setEditingIndex(null);
        setEditValue('');
      } catch (error) {
        console.error('Failed to update answer:', error);
        alert('Failed to save changes. Please try again.');
        // Revert on error
        setEditValue(originalAnswer);
      } finally {
        setIsSaving(false);
      }
    } else {
      // No change, just close
      setEditingIndex(null);
      setEditValue('');
    }
  };

  // Handle clearing the field
  const handleClearField = () => {
    setEditValue('');
    // Keep focus on input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle canceling inline edit (Escape key only)
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };
  if (answers.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No answers available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {answers.map((answer, index) => (
        <div
          key={index}
          className={`flex items-start gap-3 py-2 px-3 bg-emerald-50 border border-emerald-200 ${
            onUpdateAnswer && editingIndex !== index
              ? 'cursor-pointer hover:bg-emerald-100 transition-colors'
              : ''
          }`}
          onClick={
            onUpdateAnswer && editingIndex !== index
              ? (e) => handleStartEdit(index, answer.correctAnswer, e)
              : undefined
          }
        >
          {/* Checkmark Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="w-5 h-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Answer Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm text-gray-700">
                {answer.itemNumber}.
              </span>
              {editingIndex === index ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSaving}
                    className="flex-1 font-medium text-base text-gray-900 bg-transparent focus:outline-none border-0 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSaveEdit();
                      }}
                      disabled={isSaving}
                      className="p-1 rounded hover:bg-emerald-200 transition-colors disabled:opacity-50"
                      title="Save (Enter)"
                    >
                      <svg
                        className="w-4 h-4 text-emerald-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClearField();
                      }}
                      disabled={isSaving}
                      className="p-1 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      title="Clear field"
                    >
                      <svg
                        className="w-4 h-4 text-red-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <span className="font-medium text-base text-gray-900">
                  {answer.correctAnswer}
                </span>
              )}
            </div>

            {/* Optional Explanation */}
            {showExplanations && answer.explanation && (
              <div className="mt-1 text-xs text-emerald-700 flex items-start gap-1">
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
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
                <span>{answer.explanation}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
