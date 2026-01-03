import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface AnswerActionsHeaderProps {
  canSave: boolean;
  isGlobalSaving: boolean;
  isCopying: boolean;
  onManualSave: () => void;
  onCopyForAI: () => void;
}

export function AnswerActionsHeader({
  canSave,
  isGlobalSaving,
  isCopying,
  onManualSave,
  onCopyForAI,
}: AnswerActionsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Your Answers</h3>
      <div className="flex items-center gap-3">
        <button
          onClick={onCopyForAI}
          disabled={isCopying}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1.5 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <span>{isCopying ? "Copied!" : "Copy for AI Review"}</span>
        </button>

        {canSave && (
          <ActionButton
            onClick={onManualSave}
            disabled={isGlobalSaving}
            icon={<ActionButtonIcons.Save />}
            size="compact"
            variant="purple"
            className="!w-auto"
          >
            {isGlobalSaving ? "Saving..." : "Save Answers"}
          </ActionButton>
        )}
      </div>
    </div>
  );
}
