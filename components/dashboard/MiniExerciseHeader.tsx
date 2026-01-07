"use client";

import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface QuizStats {
  totalQuizzes: number;
  completedQuizzes: number;
  totalPoints: number;
  bestScore: number;
  averageScore: number;
}

interface MiniExerciseHeaderProps {
  quizStats: QuizStats | null | undefined;
  onFullQuiz: () => void;
  onCheck: () => void;
  onNext: () => void;
  showResult: boolean;
  isFilled: boolean;
  hasNext?: boolean;
}

export function MiniExerciseHeader({
  quizStats,
  onFullQuiz,
  onCheck,
  onNext,
  showResult,
  isFilled,
  hasNext = true,
}: MiniExerciseHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-xl md:text-2xl">📝</span>
        <h3 className="text-base md:text-lg font-bold text-gray-900">
          Quick Practice
        </h3>
      </div>

      {/* Desktop: Action buttons + Points badge */}
      <div className="hidden lg:flex items-center gap-3">
        {quizStats && quizStats.totalQuizzes > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
            <span className="text-xs font-medium text-gray-600">Points:</span>
            <span className="text-sm font-bold text-gray-900">
              {quizStats.totalPoints}
            </span>
          </div>
        )}
        <div className="w-40">
          <ActionButton
            onClick={onFullQuiz}
            variant="cyan"
            icon={<ActionButtonIcons.Document />}
            size="compact"
          >
            Full Quiz
          </ActionButton>
        </div>
        {!showResult ? (
          <div className="w-48">
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
            <div className="w-40">
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

      {/* Mobile/Tablet: Score badge only */}
      <div className="lg:hidden">
        {quizStats && quizStats.totalQuizzes > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
            <span className="text-[10px] font-medium text-gray-600">Best:</span>
            <span className="text-xs font-bold text-gray-900">
              {quizStats.bestScore}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
