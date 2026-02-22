/**
 * QuizReviewView — Teacher grading + score summary
 * M3 Expressive: tonal surfaces, segmented nav, outlined cards, state layers
 */

"use client";

import { useState, useMemo } from "react";
import type { useQuizData } from "./useQuizData";
import type { QuizAnswer } from "@/lib/models/quiz";

interface QuizReviewViewProps {
  data: ReturnType<typeof useQuizData>;
}

export function QuizReviewView({ data }: QuizReviewViewProps) {
  const {
    isTeacher, sessionState, questions, answers, userId, currentQuiz,
    handleGradeAnswer, handleEndQuiz, handleClearSession, fetchAnswers,
  } = data;

  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);
  const isFinished = sessionState?.status === "finished";

  // Refresh answers when entering review
  useMemo(() => {
    if (sessionState?.quizId && (sessionState.status === "reviewing" || sessionState.status === "finished")) {
      fetchAnswers(sessionState.quizId);
    }
  }, [sessionState?.quizId, sessionState?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const studentScores = useMemo(() => {
    const scoreMap = new Map<string, { userName: string; total: number; correct: number; graded: number }>();
    for (const a of answers) {
      if (!scoreMap.has(a.userId)) {
        scoreMap.set(a.userId, { userName: a.userName, total: 0, correct: 0, graded: 0 });
      }
      const s = scoreMap.get(a.userId)!;
      s.total++;
      if (a.isCorrect !== null && a.isCorrect !== undefined) {
        s.graded++;
        if (a.isCorrect) s.correct++;
      }
    }
    return Array.from(scoreMap.values()).sort((a, b) => b.correct - a.correct);
  }, [answers]);

  const myAnswers = useMemo(() => answers.filter((a) => a.userId === userId), [answers, userId]);

  if (!sessionState) return null;

  // ─── Finished: Score Summary ───
  if (isFinished) {
    return (
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[22px] font-semibold text-[#1D1B20] leading-7">Quiz Results</h3>
            {currentQuiz && <p className="text-[11px] text-[#79747E] mt-1 font-medium tracking-wide uppercase">{currentQuiz.title}</p>}
          </div>
          {isTeacher && (
            <button
              onClick={handleClearSession}
              className="h-10 px-5 bg-[#E8DEF8] text-[#6750A4] text-sm font-medium rounded-full hover:bg-[#D0BCFF] active:scale-[0.97] transition-all"
            >
              Close
            </button>
          )}
        </div>

        {/* Teacher: leaderboard */}
        {isTeacher && (
          <div className="space-y-2 mb-4">
            {studentScores.map((s, i) => {
              const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
              // M3 ranking colors
              const rankBg = i === 0 ? "#FFD8E4" : i === 1 ? "#E8DEF8" : "#E7E0EC";
              const rankFg = i === 0 ? "#633B48" : i === 1 ? "#6750A4" : "#49454F";
              return (
                <div key={i} className="flex items-center gap-3 p-4 bg-[#FFFBFE] rounded-[16px]">
                  <span
                    className="w-9 h-9 text-sm font-bold rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: rankBg, color: rankFg }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D1B20] truncate">{s.userName}</p>
                    {/* M3 linear progress indicator */}
                    <div className="mt-1.5 h-1 bg-[#E7E0EC] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pct >= 70 ? "#4CAF50" : pct >= 40 ? "#FF9800" : "#BA1A1A",
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[#1D1B20] tabular-nums">{s.correct}/{s.total}</span>
                    <p className="text-[11px] text-[#79747E] tabular-nums">{pct}%</p>
                  </div>
                </div>
              );
            })}
            {studentScores.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-[#79747E]">No answers submitted</p>
              </div>
            )}
          </div>
        )}

        {/* Student: my results */}
        {!isTeacher && (
          <div>
            {/* Score hero — M3 filled card */}
            {myAnswers.length > 0 && (
              <div className="p-6 bg-[#EADDFF] rounded-[16px] text-center mb-5">
                <p className="text-sm font-medium text-[#6750A4] mb-1">Your Score</p>
                <p className="text-4xl font-bold text-[#21005D] tabular-nums">
                  {myAnswers.filter((a) => a.isCorrect).length}/{myAnswers.length}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const myAnswer = myAnswers.find((a) => a.questionId === q.questionId);
                const isCorrect = myAnswer?.isCorrect === true;
                const isWrong = myAnswer?.isCorrect === false;
                // M3 tonal surface colors
                const cardBg = isCorrect ? "#C8FFC7" : isWrong ? "#FFDAD6" : "#FFFBFE";
                const cardBorder = isCorrect ? "#4CAF50" : isWrong ? "#BA1A1A" : "#CAC4D0";
                return (
                  <div key={q.questionId} className="p-4 rounded-[16px]" style={{ backgroundColor: cardBg }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 bg-[#6750A4] text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {/* M3 status chip */}
                      {isCorrect && <span className="text-[11px] h-6 px-2.5 rounded-[8px] font-medium bg-[#1B5E20]/10 text-[#1B5E20] flex items-center">Correct</span>}
                      {isWrong && <span className="text-[11px] h-6 px-2.5 rounded-[8px] font-medium bg-[#BA1A1A]/10 text-[#BA1A1A] flex items-center">Incorrect</span>}
                      {myAnswer && myAnswer.isCorrect === null && <span className="text-[11px] h-6 px-2.5 rounded-[8px] font-medium bg-[#E7E0EC] text-[#49454F] flex items-center">Pending</span>}
                      {!myAnswer && <span className="text-[11px] h-6 px-2.5 rounded-[8px] font-medium bg-[#E7E0EC] text-[#79747E] flex items-center">Skipped</span>}
                    </div>
                    <p className="text-sm text-[#1D1B20] mb-1">{q.questionText}</p>
                    {myAnswer && (
                      <p className="text-[11px] text-[#49454F]">Your answer: <span className="font-semibold text-[#1D1B20]">{myAnswer.answerText}</span></p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Reviewing: Teacher Grading ───
  const reviewQuestion = questions[reviewQuestionIndex];
  const questionAnswers = reviewQuestion
    ? answers.filter((a) => a.questionId === reviewQuestion.questionId)
    : [];
  const ungradedCount = answers.filter((a) => a.isCorrect === null || a.isCorrect === undefined).length;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[22px] font-semibold text-[#1D1B20] leading-7">Review</h3>
        {/* M3 filled tonal button */}
        <button
          onClick={handleEndQuiz}
          className="flex items-center gap-2 h-10 px-5 bg-[#6750A4] text-white text-sm font-medium rounded-full active:scale-[0.97] transition-all"
        >
          Finish
          {ungradedCount > 0 && (
            <span className="bg-white/20 text-[11px] px-2 py-0.5 rounded-full tabular-nums">{ungradedCount} left</span>
          )}
        </button>
      </div>

      {/* M3 segmented button navigation */}
      <div className="flex gap-0 mb-5 overflow-x-auto pb-1 rounded-full bg-[#E7E0EC]" style={{ width: "fit-content" }}>
        {questions.map((_, idx) => {
          const qAnswers = answers.filter((a) => a.questionId === questions[idx].questionId);
          const allGraded = qAnswers.length > 0 && qAnswers.every((a) => a.isCorrect !== null && a.isCorrect !== undefined);
          const isActive = idx === reviewQuestionIndex;
          return (
            <button
              key={idx}
              onClick={() => setReviewQuestionIndex(idx)}
              className={`shrink-0 h-8 min-w-[40px] px-3 text-[11px] font-bold transition-all ${
                ""
              } ${
                isActive
                  ? "bg-[#E8DEF8] text-[#1D1B20]"
                  : allGraded
                  ? "bg-[#C8FFC7]/40 text-[#1B5E20]"
                  : "bg-transparent text-[#49454F] hover:bg-[#1D1B20]/8"
              }`}
            >
              {allGraded && !isActive && "✓ "}{idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question + answers */}
      {reviewQuestion && (
        <div>
          {/* M3 outlined card */}
          <div className="mb-4 p-4 bg-[#FFFBFE] rounded-[16px]">
            <p className="text-sm font-medium text-[#1D1B20] leading-relaxed">{reviewQuestion.questionText}</p>
            {reviewQuestion.correctAnswer && (
              <div className="flex items-center gap-2 mt-3 h-7 px-3 rounded-[8px] bg-[#C8FFC7] w-fit">
                <span className="text-[11px] font-bold text-[#1B5E20]">&#10003; {reviewQuestion.correctAnswer}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {questionAnswers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#79747E]">No answers for this question</p>
              </div>
            ) : (
              questionAnswers.map((answer) => (
                <AnswerGradeRow
                  key={answer.answerId}
                  answer={answer}
                  isTeacher={isTeacher}
                  onGrade={handleGradeAnswer}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Answer Grading Row — M3 card with state layers ───

function AnswerGradeRow({
  answer,
  isTeacher,
  onGrade,
}: {
  answer: QuizAnswer;
  isTeacher: boolean;
  onGrade: (answerId: string, isCorrect: boolean) => Promise<void>;
}) {
  const isGraded = answer.isCorrect !== null && answer.isCorrect !== undefined;

  // M3 tonal surface based on grade
  const bg = isGraded
    ? answer.isCorrect ? "#C8FFC7" : "#FFDAD6"
    : "#FFFBFE";
  return (
    <div
      className="flex items-center justify-between p-4 rounded-[16px] transition-all"
      style={{ backgroundColor: bg }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-[#79747E] mb-0.5 tracking-wide uppercase">{answer.userName}</p>
        <p className="text-sm text-[#1D1B20]">{answer.answerText}</p>
      </div>
      {isTeacher && !isGraded && (
        <div className="flex gap-2 ml-3 shrink-0">
          {/* M3 filled tonal icon buttons */}
          <button
            onClick={() => onGrade(answer.answerId, true)}
            className="w-10 h-10 rounded-full bg-[#C8FFC7] text-[#1B5E20] hover:bg-[#A5D6A7] flex items-center justify-center transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>
          <button
            onClick={() => onGrade(answer.answerId, false)}
            className="w-10 h-10 rounded-full bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#FFB4AB] flex items-center justify-center transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {isGraded && (
        <span className={`ml-3 text-[11px] font-bold h-6 px-2.5 rounded-[8px] flex items-center ${
          answer.isCorrect ? "bg-[#1B5E20]/10 text-[#1B5E20]" : "bg-[#BA1A1A]/10 text-[#BA1A1A]"
        }`}>
          {answer.isCorrect ? "Correct" : "Incorrect"}
        </span>
      )}
    </div>
  );
}
