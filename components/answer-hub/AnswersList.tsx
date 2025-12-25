/**
 * Answers List Component
 * Displays correct answers for an exercise (teachers only)
 * Students see only item numbers
 */

import { ExerciseAnswer } from '@/lib/models/exercises';

interface AnswersListProps {
  answers: ExerciseAnswer[];
  showExplanations?: boolean;
  isTeacher?: boolean;
}

export function AnswersList({
  answers,
  showExplanations = true,
  isTeacher = false
}: AnswersListProps) {
  if (answers.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No answers available
      </div>
    );
  }

  // Teacher view: Show correct answers
  if (isTeacher) {
    return (
      <div className="space-y-2">
        {answers.map((answer, index) => (
          <div
            key={index}
            className="flex items-start gap-3 py-2 px-3 bg-emerald-50 rounded-lg border border-emerald-200"
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

  // Student view: Show only item numbers (answers hidden)
  return (
    <div className="space-y-2">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
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
          <p className="text-sm text-blue-800">
            <span className="font-semibold">For Students:</span> Correct answers are hidden.
            Discuss your solutions with your batch-mates below!
          </p>
        </div>
      </div>

      {answers.map((answer, index) => (
        <div
          key={index}
          className="flex items-start gap-3 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          {/* Question Mark Icon for Students */}
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Item Number Only */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm text-gray-700">
                {answer.itemNumber}.
              </span>
              <span className="text-sm text-gray-400 italic">
                (Answer hidden - for teachers only)
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
