"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QuizBlank } from "@/lib/models/writing";
import { checkAnswer } from "@/lib/utils/quizGenerator";
import { useUserQuizStats } from "@/lib/hooks/useReviewQuizzes";
import { calculateQuizPoints } from "@/lib/hooks/useQuizStats";
import { useToast } from "@/components/ui/toast";
import confetti from "canvas-confetti";
import { MiniExerciseHeader } from "./MiniExerciseHeader";
import { MiniExerciseSentence } from "./MiniExerciseSentence";
import { MiniExerciseStatsBar, SessionStats } from "./MiniExerciseStatsBar";
import { MiniExerciseMobileActions } from "./MiniExerciseMobileActions";

import { SRSStats } from "@/lib/services/writing/markedWordQuizService";

interface MiniBlankExerciseProps {
  sentence: string;
  blanks: QuizBlank[];
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
  const singleBlank = blanks.length > 0 ? [blanks[0]] : [];

  const [answer, setAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  const { data: quizStats } = useUserQuizStats(userId || null);

  useEffect(() => {
    setAnswer("");
    setShowResult(false);
    setIsCorrect(false);
  }, [sentence, sentenceId]);

  const handleCheck = () => {
    if (!answer.trim()) return;

    const blank = singleBlank[0];
    const correct = checkAnswer(answer, blank.correctAnswer);
    const points = calculateQuizPoints(correct ? 1 : 0, 1);

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success(`Perfect! +${points} points!`);
    } else {
      toast.warning(
        `Not quite right. +${points} points. Correct answer: "${blank.correctAnswer}"`
      );
    }

    if (onComplete) {
      onComplete(points, correct ? 1 : 0, 1, sentenceId);
    }
  };

  const handleNext = () => onRefresh();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !showResult && answer.trim().length > 0) {
      handleCheck();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 p-4 sm:p-6">
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
      <div className="bg-white border border-gray-200 p-4 sm:p-6">
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
    <div className="bg-white border border-gray-200 p-4 sm:p-6 overflow-hidden">
      <MiniExerciseStatsBar srsStats={srsStats} sessionStats={sessionStats} />

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

      <MiniExerciseSentence
        sentence={sentence}
        blank={singleBlank[0]}
        answer={answer}
        onAnswerChange={setAnswer}
        onKeyDown={handleKeyDown}
        showResult={showResult}
        inputRef={inputRef}
      />

      <MiniExerciseMobileActions
        onFullQuiz={() => router.push("/dashboard/student/writing/quiz")}
        onCheck={handleCheck}
        onNext={handleNext}
        showResult={showResult}
        isFilled={isFilled}
        hasNext={hasNext}
        showFullQuizButton={showFullQuizButton}
      />
    </div>
  );
}
