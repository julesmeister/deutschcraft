/**
 * Playground Room Header Actions
 * Compact action buttons for the room header (Exercise, Materials, Minimize, End)
 */

"use client";

interface PlaygroundRoomHeaderActionsProps {
  userRole: "teacher" | "student";
  isHost: boolean;
  onOpenExerciseSelector?: () => void;
  onOpenMaterialSelector?: () => void;
  onMinimize?: () => void;
  onEndRoom: () => Promise<void>;
}

interface CompactActionProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className: string;
}

function CompactAction({ onClick, icon, label, className }: CompactActionProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${className}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
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
    <div className="flex items-center gap-1.5">
      {userRole === "teacher" && onOpenExerciseSelector && (
        <CompactAction
          onClick={onOpenExerciseSelector}
          label="Exercise"
          className="bg-purple-100 text-purple-700 hover:bg-purple-200"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      )}
      {userRole === "teacher" && onOpenMaterialSelector && (
        <CompactAction
          onClick={onOpenMaterialSelector}
          label="Materials"
          className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      )}
      {onMinimize && (
        <CompactAction
          onClick={onMinimize}
          label="Minimize"
          className="bg-gray-100 text-gray-600 hover:bg-gray-200"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          }
        />
      )}
      {isHost && (
        <CompactAction
          onClick={onEndRoom}
          label="End"
          className="bg-red-100 text-red-600 hover:bg-red-200"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />
      )}
    </div>
  );
}
