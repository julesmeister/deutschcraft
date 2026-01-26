/**
 * Playground Room Header Actions
 * Action buttons for the room header (Exercise, Materials, Minimize, End)
 */

"use client";

import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface PlaygroundRoomHeaderActionsProps {
  userRole: "teacher" | "student";
  isHost: boolean;
  onOpenExerciseSelector?: () => void;
  onOpenMaterialSelector?: () => void;
  onMinimize?: () => void;
  onEndRoom: () => Promise<void>;
}

export function PlaygroundRoomHeaderActions({
  userRole,
  isHost,
  onOpenExerciseSelector,
  onOpenMaterialSelector,
  onMinimize,
  onEndRoom,
}: PlaygroundRoomHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {userRole === "teacher" && onOpenExerciseSelector && (
        <ActionButton
          onClick={onOpenExerciseSelector}
          variant="purple"
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        >
          Exercise
        </ActionButton>
      )}
      {userRole === "teacher" && onOpenMaterialSelector && (
        <ActionButton
          onClick={onOpenMaterialSelector}
          variant="cyan"
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        >
          Materials
        </ActionButton>
      )}
      {onMinimize && (
        <ActionButton
          onClick={onMinimize}
          variant="gray"
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          }
        >
          Minimize
        </ActionButton>
      )}
      {isHost && (
        <ActionButton
          onClick={onEndRoom}
          variant="red"
          icon={<ActionButtonIcons.Close />}
        >
          End
        </ActionButton>
      )}
    </div>
  );
}
