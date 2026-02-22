/**
 * QuizActiveView — Live quiz in progress
 * M3 Expressive: tonal surfaces, prominent timer, rich interactive states
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
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-[3px] border-violet-200 border-t-violet-500" />
        <p className="mt-2 text-sm font-medium text-gray-400">Waiting for question...</p>
      </div>
    );
  }

  const questionIndex = sessionState.currentQuestionIndex;
  const hasSubmitted = submittedQuestionIds.has(currentQuestion.questionId);
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
      {/* Header: progress + timer */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          {/* Progress dots */}
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === questionIndex ? "w-6 bg-violet-500" : i < questionIndex ? "w-1.5 bg-violet-300" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-400">
            {questionIndex + 1}/{questions.length}
          </span>
        </div>
        <CountdownTimer
          startedAt={sessionState.questionStartedAt}
          duration={currentQuestion.timeLimit}
        />
      </div>

      {/* Question card */}
      <div className="p-5 bg-white rounded-2xl shadow-sm mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
            currentQuestion.questionType === "multiple_choice" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
          }`}>
            {currentQuestion.questionType === "multiple_choice" ? "Multiple Choice" : "Text Answer"}
          </span>
        </div>
        <p className="text-base font-semibold text-gray-900 leading-relaxed">{currentQuestion.questionText}</p>
      </div>

      {/* Student answer area */}
      {!isTeacher && !hasSubmitted && (
        <div>
          {currentQuestion.questionType === "multiple_choice" && currentQuestion.choices ? (
            <div className="space-y-2.5 mb-4">
              {currentQuestion.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedChoice(choice)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-medium transition-all active:scale-[0.99] ${
                    selectedChoice === choice
                      ? "bg-violet-100 text-violet-700 ring-2 ring-violet-400 shadow-sm"
                      : "bg-white text-gray-700 shadow-sm hover:bg-violet-50/50"
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs font-bold ${
                    selectedChoice === choice ? "bg-violet-500 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {choice}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3.5 bg-white rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 shadow-sm mb-4"
              rows={3}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!answerText.trim() && !selectedChoice)}
            className="w-full py-3 bg-violet-600 text-white font-semibold rounded-2xl hover:bg-violet-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:active:scale-100"
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </button>
        </div>
      )}

      {/* Student: submitted state */}
      {!isTeacher && hasSubmitted && (
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-emerald-100 rounded-[20px] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-gray-900 font-bold">Answer submitted!</p>
          <p className="text-sm text-gray-400 mt-1">Waiting for the next question...</p>
        </div>
      )}

      {/* Teacher controls */}
      {isTeacher && (
        <div className="p-4 bg-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-violet-600">{currentQuestionAnswers.length}</span>
              </div>
              <span className="text-sm text-gray-500 font-medium">
                answer{currentQuestionAnswers.length !== 1 ? "s" : ""} submitted
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleNextQuestion}
              className={`flex-1 py-3 font-semibold rounded-2xl transition-all active:scale-[0.98] text-sm shadow-sm ${
                isLastQuestion
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-violet-600 text-white hover:bg-violet-700"
              }`}
            >
              {isLastQuestion ? "Finish & Review" : "Next Question"}
            </button>
            <button
              onClick={handleEndQuiz}
              className="px-4 py-3 bg-red-50 text-red-500 font-semibold rounded-2xl hover:bg-red-100 active:scale-[0.98] transition-all text-sm"
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
  const pct = duration > 0 ? remaining / duration : 0;
  const isLow = remaining <= 10 && remaining > 0;
  const isExpired = remaining === 0;

  return (
    <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-bold transition-all ${
      isExpired
        ? "bg-red-100 text-red-600"
        : isLow
        ? "bg-amber-100 text-amber-600 animate-pulse"
        : "bg-violet-100 text-violet-600"
    }`}>
      {/* Mini progress arc */}
      <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <circle
          cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeDasharray={`${pct * 50.3} 50.3`}
          strokeLinecap="round"
        />
      </svg>
      {mins}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
