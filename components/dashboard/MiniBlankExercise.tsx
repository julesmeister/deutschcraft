"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QuizBlank } from "@/lib/models/writing";
import { checkAnswer } from "@/lib/utils/quizGenerator";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { useUserQuizStats } from "@/lib/hooks/useReviewQuizzes";
import { calculateQuizPoints } from "@/lib/hooks/useQuizStats";
import { useToast } from "@/components/ui/toast";
import confetti from "canvas-confetti";
import { MiniExerciseHeader } from "./MiniExerciseHeader";
import { MiniExerciseSentence } from "./MiniExerciseSentence";

import { SRSStats } from "@/lib/services/writing/markedWordQuizService";
import { SRSStatsDisplay } from "./SRSStatsDisplay";

interface SessionStats {
  points: number;
  accuracy: number;
}

interface MiniBlankExerciseProps {
  sentence: string;
  blanks: QuizBlank[]; // Will use only the first blank
  onRefresh: () => void;
  onComplete?: (
    points: number,
    correctAnswers: number,
    totalBlanks: number,
    sentenceId?: string
  ) => void;
  userId?: string;
  isLoading?: boolean;
  exerciseType?: string;
  submittedAt?: number;
  sentenceId?: string;
  srsStats?: SRSStats | null;
  sessionStats?: SessionStats;
  hasNext?: boolean;
  showFullQuizButton?: boolean;
}

export function MiniBlankExercise({
  sentence,
  blanks,
  onRefresh,
  onComplete,
  userId,
  isLoading,
  exerciseType,
  submittedAt,
  sentenceId,
  srsStats,
  sessionStats,
  hasNext = true,
  showFullQuizButton = true,
}: MiniBlankExerciseProps) {
  // Only use the first blank
  const singleBlank = blanks.length > 0 ? [blanks[0]] : [];

  const [answer, setAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  // Fetch quiz stats
  const { data: quizStats } = useUserQuizStats(userId || null);

  // Reset state when sentence changes
  useEffect(() => {
    setAnswer("");
    setShowResult(false);
    setIsCorrect(false);
  }, [sentence, sentenceId]);

  const handleCheck = () => {
    // Check if blank is filled
    if (!answer.trim()) return;

    // Check if answer is correct
    const blank = singleBlank[0];
    const correct = checkAnswer(answer, blank.correctAnswer);

    const points = calculateQuizPoints(correct ? 1 : 0, 1);

    setIsCorrect(correct);
    setShowResult(true);

    // Show toast with results
    if (correct) {
      // Trigger confetti for correct answer
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success(`Perfect! +${points} points!`);
    } else {
      toast.warning(
        `Not quite right. +${points} points. Correct answer: "${blank.correctAnswer}"`
      );
    }

    // Notify parent component
    if (onComplete) {
      onComplete(points, correct ? 1 : 0, 1, sentenceId);
    }
  };

  const handleNext = () => {
    onRefresh();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isFilled = answer.trim().length > 0;
    if (e.key === "Enter" && !showResult && isFilled) {
      handleCheck();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-bold text-gray-900">Quick Practice</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (singleBlank.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📝</span>
          <h3 className="text-lg font-bold text-gray-900">Quick Practice</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Complete writing exercises to unlock quick practice sentences!
        </p>
      </div>
    );
  }

  const isFilled = answer.trim().length > 0;

  return (
    <div className="bg-white border border-gray-200 p-6">
      {/* Optional Stats Bar */}
      {(srsStats || sessionStats) && (
        <div className="mb-6 bg-gray-900 rounded-xl p-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Session Stats */}
            {sessionStats && (
              <div
                className={`flex items-center gap-6 ${
                  srsStats
                    ? "border-b md:border-b-0 md:border-r border-gray-700 pb-4 md:pb-0 md:pr-6 w-full md:w-auto justify-center md:justify-start"
                    : "w-full justify-center"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white leading-none">
                    {Math.round(sessionStats.accuracy)}%
                  </div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
                    Accuracy
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-piku-mint leading-none">
                    {sessionStats.points}
                  </div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
                    Points
                  </div>
                </div>
              </div>
            )}

            {/* SRS Stats */}
            {srsStats && (
              <div className="flex-1 w-full md:w-auto">
                <SRSStatsDisplay
                  stats={srsStats}
                  className="justify-center md:justify-end"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <MiniExerciseHeader
        quizStats={quizStats}
        onFullQuiz={() => router.push("/dashboard/student/writing/quiz")}
        onCheck={handleCheck}
        onNext={handleNext}
        showResult={showResult}
        isFilled={isFilled}
        hasNext={hasNext}
        showFullQuizButton={showFullQuizButton}
      />

      {/* Description */}
      <p className="text-sm text-gray-600 mb-6">
        {exerciseType && submittedAt ? (
          <>
            From your{" "}
            <span className="font-medium text-gray-900 capitalize">
              {exerciseType}
            </span>{" "}
            exercise
            <span className="text-gray-500">
              {" "}
              •{" "}
              {new Date(submittedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </>
        ) : (
          <>Fill in the blank with the correct word</>
        )}
      </p>

      {/* Sentence with blank */}
      <MiniExerciseSentence
        sentence={sentence}
        blank={singleBlank[0]}
        answer={answer}
        onAnswerChange={setAnswer}
        onKeyDown={handleKeyDown}
        showResult={showResult}
        inputRef={inputRef}
      />

      {/* Mobile Actions */}
      {(showFullQuizButton || !showResult || hasNext) && (
        <div className="lg:hidden flex justify-end gap-3">
          {showFullQuizButton && (
            <div className="w-32">
              <ActionButton
                onClick={() => router.push("/dashboard/student/writing/quiz")}
                variant="cyan"
                icon={<ActionButtonIcons.Document />}
              >
                Full Quiz
              </ActionButton>
            </div>
          )}
          {!showResult ? (
            <div className="w-48">
              <ActionButton
                onClick={handleCheck}
                disabled={!isFilled}
                variant="purple"
                icon={<ActionButtonIcons.Check />}
              >
                Check Answer
              </ActionButton>
            </div>
          ) : (
            hasNext && (
              <div className="w-40">
                <ActionButton
                  onClick={handleNext}
                  variant="mint"
                  icon={<ActionButtonIcons.ArrowRight />}
                >
                  Next
                </ActionButton>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
