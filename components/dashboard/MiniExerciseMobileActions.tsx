"use client";

import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface MiniExerciseMobileActionsProps {
  onFullQuiz: () => void;
  onCheck: () => void;
  onNext: () => void;
  showResult: boolean;
  isFilled: boolean;
  hasNext: boolean;
  showFullQuizButton: boolean;
}

export function MiniExerciseMobileActions({
  onFullQuiz,
  onCheck,
  onNext,
  showResult,
  isFilled,
  hasNext,
  showFullQuizButton,
}: MiniExerciseMobileActionsProps) {
  if (!showFullQuizButton && showResult && !hasNext) return null;

  return (
    <div className="lg:hidden flex gap-2">
      {showFullQuizButton && (
        <div className="flex-1">
          <ActionButton
            onClick={onFullQuiz}
            variant="cyan"
            icon={<ActionButtonIcons.Document />}
            size="compact"
          >
            Full Quiz
          </ActionButton>
        </div>
      )}
      {!showResult ? (
        <div className="flex-1">
          <ActionButton
            onClick={onCheck}
            disabled={!isFilled}
            variant="purple"
            icon={<ActionButtonIcons.Check />}
            size="compact"
          >
            Check Answer
          </ActionButton>
        </div>
      ) : (
        hasNext && (
          <div className="flex-1">
            <ActionButton
              onClick={onNext}
              variant="mint"
              icon={<ActionButtonIcons.ArrowRight />}
              size="compact"
            >
              Next
            </ActionButton>
          </div>
        )
      )}
    </div>
  );
}
