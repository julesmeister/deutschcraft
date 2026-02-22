/**
 * QuizActiveView — Live quiz in progress
 * M3 Expressive: tonal surfaces, prominent timer, segmented progress, state layers
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
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#E8DEF8]" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#6750A4] animate-spin" />
        </div>
        <p className="mt-3 text-sm font-medium text-[#49454F]">Waiting for question...</p>
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
      {/* M3 linear progress indicator + timer */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 flex-1 mr-4">
          {/* M3 segmented progress track */}
          <div className="flex gap-[3px] flex-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                  i === questionIndex
                    ? "bg-[#6750A4]"
                    : i < questionIndex
                    ? "bg-[#D0BCFF]"
                    : "bg-[#E7E0EC]"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-[#79747E] tabular-nums shrink-0">
            {questionIndex + 1}/{questions.length}
          </span>
        </div>
        <CountdownTimer
          startedAt={sessionState.questionStartedAt}
          duration={currentQuestion.timeLimit}
        />
      </div>

      {/* Question card — M3 filled card */}
      <div className="p-5 bg-[#EADDFF] rounded-[16px] mb-5">
        {/* M3 assist chip for type */}
        <span className={`inline-flex items-center text-[11px] h-7 px-3 rounded-[8px] font-medium mb-3 border ${
          currentQuestion.questionType === "multiple_choice"
            ? "border-[#D0BCFF] bg-[#FEF7FF] text-[#6750A4]"
            : "border-[#FFD8E4] bg-[#FEF7FF] text-[#633B48]"
        }`}>
          {currentQuestion.questionType === "multiple_choice" ? "Multiple Choice" : "Text Answer"}
        </span>
        <p className="text-base font-medium text-[#21005D] leading-relaxed">{currentQuestion.questionText}</p>
      </div>

      {/* Student answer area */}
      {!isTeacher && !hasSubmitted && (
        <div>
          {currentQuestion.questionType === "multiple_choice" && currentQuestion.choices ? (
            <div className="space-y-2 mb-4">
              {currentQuestion.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedChoice(choice)}
                  className={`w-full text-left px-4 py-3.5 rounded-[16px] text-sm font-medium transition-all duration-200 border-2 ${
                    selectedChoice === choice
                      ? "bg-[#EADDFF] text-[#21005D] border-[#6750A4]"
                      : "bg-[#FFFBFE] text-[#1D1B20] border-[#CAC4D0] hover:bg-[#F6EDFF] hover:border-[#D0BCFF]"
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full mr-3 text-xs font-bold border-2 ${
                    selectedChoice === choice
                      ? "bg-[#6750A4] text-white border-[#6750A4]"
                      : "bg-transparent text-[#79747E] border-[#79747E]"
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
              className="w-full px-4 py-3 bg-[#FFFBFE] rounded-[12px] text-sm text-[#1D1B20] placeholder:text-[#CAC4D0] resize-none focus:outline-none focus:ring-2 focus:ring-[#6750A4] border border-[#CAC4D0] mb-4"
              rows={3}
            />
          )}

          {/* M3 filled button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!answerText.trim() && !selectedChoice)}
            className="w-full h-12 bg-[#6750A4] text-white font-medium rounded-full hover:shadow-[0_1px_3px_1px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all disabled:opacity-38 disabled:shadow-none"
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </button>
        </div>
      )}

      {/* Student: submitted state */}
      {!isTeacher && hasSubmitted && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#C8FFC7] rounded-[20px] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#1B5E20]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-[#1D1B20] font-semibold text-base">Answer submitted!</p>
          <p className="text-sm text-[#79747E] mt-1">Waiting for the next question...</p>
        </div>
      )}

      {/* Teacher controls — M3 tonal surface */}
      {isTeacher && (
        <div className="p-5 bg-[#E8DEF8]/60 rounded-[16px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#6750A4] rounded-[12px] flex items-center justify-center">
              <span className="text-sm font-bold text-white">{currentQuestionAnswers.length}</span>
            </div>
            <span className="text-sm text-[#49454F] font-medium">
              answer{currentQuestionAnswers.length !== 1 ? "s" : ""} submitted
            </span>
          </div>
          <div className="flex gap-2">
            {/* M3 filled button */}
            <button
              onClick={handleNextQuestion}
              className={`flex-1 h-10 font-medium rounded-full transition-all active:scale-[0.98] text-sm ${
                isLastQuestion
                  ? "bg-[#FFD8E4] text-[#633B48] hover:shadow-[0_1px_3px_1px_rgba(0,0,0,0.15)]"
                  : "bg-[#6750A4] text-white hover:shadow-[0_1px_3px_1px_rgba(0,0,0,0.15)]"
              }`}
            >
              {isLastQuestion ? "Finish & Review" : "Next Question"}
            </button>
            {/* M3 outlined button */}
            <button
              onClick={handleEndQuiz}
              className="h-10 px-5 bg-transparent text-[#BA1A1A] font-medium rounded-full border border-[#BA1A1A] hover:bg-[#BA1A1A]/8 active:scale-[0.98] transition-all text-sm"
            >
              End
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Countdown Timer — M3 Expressive with circular indicator ───

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

  // M3 color tokens
  const bg = isExpired ? "#FFDAD6" : isLow ? "#FFD8E4" : "#EADDFF";
  const fg = isExpired ? "#BA1A1A" : isLow ? "#633B48" : "#6750A4";

  return (
    <div
      className={`flex items-center gap-2 h-8 px-3 rounded-full text-sm font-bold tabular-nums transition-all ${isLow && !isExpired ? "animate-pulse" : ""}`}
      style={{ backgroundColor: bg, color: fg }}
    >
      {/* M3 circular progress */}
      <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <circle
          cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeDasharray={`${pct * 50.3} 50.3`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s linear" }}
        />
      </svg>
      {mins}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
