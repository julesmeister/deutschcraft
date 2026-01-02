/**
 * Teacher Controls - Shows teacher mode status and "New Exercise" button
 */

"use client";

import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface TeacherControlsProps {
  hasOverrides: boolean;
  overrideCount: number;
  onCreateExercise: () => void;
  onViewAllAnswers?: () => void;
  answerCount?: number;
}

export function TeacherControls({
  hasOverrides,
  overrideCount,
  onCreateExercise,
  onViewAllAnswers,
  answerCount = 0,
}: TeacherControlsProps) {
  return (
    <div className="mb-6 bg-white border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">👨‍🏫</div>
          <div>
            <h3 className="font-bold text-gray-900">Teacher Mode</h3>
            <p className="text-sm text-gray-600">
              {hasOverrides
                ? `${overrideCount} customization${
                    overrideCount !== 1 ? "s" : ""
                  } active`
                : "Using default exercises"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onViewAllAnswers && (
            <ActionButton
              variant="orange"
              onClick={onViewAllAnswers}
              icon={
                <span className="flex items-center justify-center w-6 h-6 bg-white text-piku-orange rounded-full text-xs font-bold">
                  {answerCount}
                </span>
              }
              size="default"
            >
              View All Answers
            </ActionButton>
          )}
          <div className="flex-shrink-0 w-48">
            <ActionButton
              variant="mint"
              onClick={onCreateExercise}
              icon={<ActionButtonIcons.Plus />}
              size="default"
            >
              New Exercise
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
