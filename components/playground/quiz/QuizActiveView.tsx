/**
 * QuizActiveView — Live quiz in progress
 * Student: question + answer input + countdown timer + "waiting" state after submit
 * Teacher: question + timer + answer count + next/end controls
 */

"use client";

import { useState, useEffect, useRef } from "react";
import type { useQuizData } from "./useQuizData";

interface QuizActiveViewProps {
  data: ReturnType<typeof useQuizData>;
}

export function QuizActiveView({ data }: QuizActiveViewProps) {
  const {
    isTeacher, sessionState, questions, currentQuestion, answers, userId,
    submittedQuestionIds,
    handleNextQuestion, handleSubmitAnswer, handleEndQuiz,
  } = data;

  const [answerText, setAnswerText] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset input when question changes
  const prevQuestionIndex = useRef(sessionState?.currentQuestionIndex);
  useEffect(() => {
    if (sessionState?.currentQuestionIndex !== prevQuestionIndex.current) {
      setAnswerText("");
      setSelectedChoice(null);
      prevQuestionIndex.current = sessionState?.currentQuestionIndex;
    }
  }, [sessionState?.currentQuestionIndex]);

  if (!sessionState || !currentQuestion) {
    return (
      <div className="p-5 text-center text-gray-400">
        <p>Waiting for question...</p>
      </div>
    );
  }

  const questionIndex = sessionState.currentQuestionIndex;
  const hasSubmitted = submittedQuestionIds.has(currentQuestion.questionId);

  // Count answers for current question (teacher view)
  const currentQuestionAnswers = answers.filter((a) => a.questionId === currentQuestion.questionId);
  const isLastQuestion = questionIndex >= questions.length - 1;

  const handleSubmit = async () => {
    const text = currentQuestion.questionType === "multiple_choice" ? selectedChoice : answerText.trim();
    if (!text) return;
    setIsSubmitting(true);
    try {
      await handleSubmitAnswer(currentQuestion.questionId, text);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">
            Q{questionIndex + 1}/{questions.length}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
            currentQuestion.questionType === "multiple_choice" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
          }`}>
            {currentQuestion.questionType === "multiple_choice" ? "MC" : "Text"}
          </span>
        </div>
        <CountdownTimer
          startedAt={sessionState.questionStartedAt}
          duration={currentQuestion.timeLimit}
        />
      </div>

      {/* Question text */}
      <div className="mb-5">
        <p className="text-base font-semibold text-gray-900 leading-relaxed">{currentQuestion.questionText}</p>
      </div>

      {/* Student answer area */}
      {!isTeacher && !hasSubmitted && (
        <div className="mb-4">
          {currentQuestion.questionType === "multiple_choice" && currentQuestion.choices ? (
            <div className="space-y-2">
              {currentQuestion.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedChoice(choice)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                    selectedChoice === choice
                      ? "border-piku-purple bg-piku-purple/5 text-piku-purple"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-piku-purple/30"
              rows={3}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!answerText.trim() && !selectedChoice)}
            className="mt-3 w-full py-2.5 bg-piku-purple text-white font-bold rounded-xl hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </button>
        </div>
      )}

      {/* Student: waiting state */}
      {!isTeacher && hasSubmitted && (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-gray-600 font-semibold">Answer submitted!</p>
          <p className="text-sm text-gray-400 mt-1">Waiting for the next question...</p>
        </div>
      )}

      {/* Teacher controls */}
      {isTeacher && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-800">{currentQuestionAnswers.length}</span> answer{currentQuestionAnswers.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleNextQuestion}
              className={`flex-1 py-2.5 font-bold rounded-xl transition text-sm ${
                isLastQuestion
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-piku-purple text-white hover:bg-opacity-90"
              }`}
            >
              {isLastQuestion ? "Finish & Review" : "Next Question"}
            </button>
            <button
              onClick={handleEndQuiz}
              className="px-4 py-2.5 border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition text-sm"
            >
              End
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Countdown Timer ───

function CountdownTimer({ startedAt, duration }: { startedAt: number | null; duration: number }) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!startedAt) { setRemaining(duration); return; }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setRemaining(Math.max(0, duration - elapsed));
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startedAt, duration]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = remaining <= 10 && remaining > 0;
  const isExpired = remaining === 0;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
      isExpired ? "bg-red-100 text-red-600" : isLow ? "bg-amber-100 text-amber-600 animate-pulse" : "bg-gray-100 text-gray-600"
    }`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {mins}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
