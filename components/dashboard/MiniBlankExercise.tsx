/**
 * MiniBlankExercise Component
 * Displays a single random fill-in-the-blank sentence from corrected writing exercises
 * Mini practice exercise for the student dashboard
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QuizBlank } from "@/lib/models/writing";
import { checkAnswer } from "@/lib/utils/quizGenerator";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { useUserQuizStats } from "@/lib/hooks/useReviewQuizzes";
import { calculateQuizPoints } from "@/lib/hooks/useQuizStats";
import { useToast } from "@/components/ui/toast";
import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";
import confetti from "canvas-confetti";

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
  }, [sentence]);

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

  // Build the display parts with single blank
  const blank = singleBlank[0];
  const parts: Array<{ type: "text" | "blank"; content: string }> = [];

  // Add text before blank
  if (blank.position > 0) {
    parts.push({
      type: "text",
      content: sentence.substring(0, blank.position),
    });
  }

  // Add blank
  parts.push({
    type: "blank",
    content: blank.correctAnswer,
  });

  // Add remaining text
  const endPosition = blank.position + blank.correctAnswer.length;
  if (endPosition < sentence.length) {
    parts.push({
      type: "text",
      content: sentence.substring(endPosition),
    });
  }

  const isFilled = answer.trim().length > 0;

  return (
    <div className="bg-white border border-gray-200 p-6">
      {/* Header */}
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
              onClick={() => router.push("/dashboard/student/writing/quiz")}
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
                onClick={handleCheck}
                disabled={!isFilled}
                variant="purple"
                icon={<ActionButtonIcons.Check />}
                size="compact"
              >
                Check Answer
              </ActionButton>
            </div>
          ) : (
            <div className="w-40">
              <ActionButton
                onClick={handleNext}
                variant="mint"
                icon={<ActionButtonIcons.ArrowRight />}
                size="compact"
              >
                Next
              </ActionButton>
            </div>
          )}
        </div>

        {/* Mobile/Tablet: Score badge only */}
        <div className="lg:hidden">
          {quizStats && quizStats.totalQuizzes > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
              <span className="text-[10px] font-medium text-gray-600">
                Best:
              </span>
              <span className="text-xs font-bold text-gray-900">
                {quizStats.bestScore}
              </span>
            </div>
          )}
        </div>
      </div>

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
      <div className="mb-6 text-lg leading-loose">
        {parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <span key={index} className="text-gray-900">
                {part.content}
              </span>
            );
          } else {
            const answerIsCorrect =
              showResult && checkAnswer(answer, part.content);
            const answerIsIncorrect = showResult && !answerIsCorrect;

            return (
              <span
                key={index}
                className="inline-flex items-center gap-1 mx-1.5 my-2 relative"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  readOnly={showResult}
                  className={`text-base font-bold text-center transition-all outline-none ${
                    answerIsCorrect
                      ? "bg-piku-mint text-gray-900 px-1.5 py-1"
                      : answerIsIncorrect
                      ? "bg-red-100 text-red-700 px-1.5 py-1 rounded-l-md"
                      : "bg-gray-100 hover:bg-gray-150 focus:bg-white focus:ring-2 focus:ring-blue-400 rounded-md px-1.5 py-1"
                  }`}
                  style={{
                    width: `${Math.max(part.content.length * 10, 60)}px`,
                  }}
                />
                {!showResult && (
                  <GermanCharAutocomplete
                    textareaRef={inputRef}
                    content={answer}
                    onContentChange={setAnswer}
                  />
                )}
                {answerIsIncorrect && (
                  <span className="inline-flex items-center justify-center px-1.5 py-1 bg-piku-mint text-gray-900 text-base font-bold rounded-r-md">
                    {part.content}
                  </span>
                )}
              </span>
            );
          }
        })}
      </div>

      {/* Mobile Actions */}
      <div className="lg:hidden flex justify-end gap-3">
        <div className="w-32">
          <ActionButton
            onClick={() => router.push("/dashboard/student/writing/quiz")}
            variant="cyan"
            icon={<ActionButtonIcons.Document />}
          >
            Full Quiz
          </ActionButton>
        </div>
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
          <div className="w-40">
            <ActionButton
              onClick={handleNext}
              variant="mint"
              icon={<ActionButtonIcons.ArrowRight />}
            >
              Next
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
