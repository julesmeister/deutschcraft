/**
 * Teacher Answer Display Component
 * Shows correct answers with explanations for teachers
 */

'use client';

import { ExerciseAnswer } from '@/lib/models/exercises';

interface TeacherAnswerDisplayProps {
  answers: ExerciseAnswer[];
  showExplanations?: boolean;
}

export function TeacherAnswerDisplay({
  answers,
  showExplanations = true,
}: TeacherAnswerDisplayProps) {
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
          className="flex items-start gap-3 py-2 px-3 bg-emerald-50 border border-emerald-200"
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
              <span className="font-medium text-base text-gray-900">
                {answer.correctAnswer}
              </span>
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
