/**
 * QuizReviewView — Teacher grading + score summary
 * M3 Expressive: tonal surfaces, visible grade buttons, rich score cards
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quiz Results</h3>
            {currentQuiz && <p className="text-xs text-gray-400 mt-0.5">{currentQuiz.title}</p>}
          </div>
          {isTeacher && (
            <button
              onClick={handleClearSession}
              className="px-4 py-2 bg-white text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 active:scale-[0.97] transition-all shadow-sm"
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
              return (
                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm">
                  <span className={`w-8 h-8 text-sm font-bold rounded-full flex items-center justify-center shrink-0 ${
                    i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-gray-100 text-gray-500" : "bg-orange-50 text-orange-400"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.userName}</p>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-gray-900">{s.correct}/{s.total}</span>
                    <p className="text-xs text-gray-400">{pct}%</p>
                  </div>
                </div>
              );
            })}
            {studentScores.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400">No answers submitted</p>
              </div>
            )}
          </div>
        )}

        {/* Student: my results */}
        {!isTeacher && (
          <div>
            {/* Score hero */}
            {myAnswers.length > 0 && (
              <div className="p-5 bg-violet-100 rounded-2xl text-center mb-5">
                <p className="text-sm font-medium text-violet-500 mb-1">Your Score</p>
                <p className="text-3xl font-black text-violet-700">
                  {myAnswers.filter((a) => a.isCorrect).length}/{myAnswers.length}
                </p>
              </div>
            )}

            <div className="space-y-2.5">
              {questions.map((q, idx) => {
                const myAnswer = myAnswers.find((a) => a.questionId === q.questionId);
                const isCorrect = myAnswer?.isCorrect === true;
                const isWrong = myAnswer?.isCorrect === false;
                return (
                  <div key={q.questionId} className={`p-4 rounded-2xl shadow-sm ${
                    isCorrect ? "bg-emerald-50" : isWrong ? "bg-red-50" : "bg-white"
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 bg-violet-100 text-violet-600 text-xs font-bold rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {isCorrect && <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-lg font-semibold">Correct</span>}
                      {isWrong && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-lg font-semibold">Incorrect</span>}
                      {myAnswer && myAnswer.isCorrect === null && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg font-semibold">Pending</span>}
                      {!myAnswer && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-lg font-semibold">Skipped</span>}
                    </div>
                    <p className="text-sm text-gray-800 mb-1">{q.questionText}</p>
                    {myAnswer && (
                      <p className="text-xs text-gray-500">Your answer: <span className="font-semibold text-gray-700">{myAnswer.answerText}</span></p>
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
        <h3 className="text-lg font-bold text-gray-900">Review Answers</h3>
        <button
          onClick={handleEndQuiz}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-2xl hover:bg-emerald-600 active:scale-[0.97] transition-all shadow-sm"
        >
          Finish
          {ungradedCount > 0 && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{ungradedCount} left</span>
          )}
        </button>
      </div>

      {/* Question nav pills */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {questions.map((_, idx) => {
          const qAnswers = answers.filter((a) => a.questionId === questions[idx].questionId);
          const allGraded = qAnswers.length > 0 && qAnswers.every((a) => a.isCorrect !== null && a.isCorrect !== undefined);
          return (
            <button
              key={idx}
              onClick={() => setReviewQuestionIndex(idx)}
              className={`shrink-0 w-9 h-9 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                idx === reviewQuestionIndex
                  ? "bg-violet-600 text-white shadow-sm"
                  : allGraded
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-white text-gray-500 shadow-sm hover:bg-gray-50"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question + answers */}
      {reviewQuestion && (
        <div>
          <div className="mb-4 p-4 bg-white rounded-2xl shadow-sm">
            <p className="text-sm font-semibold text-gray-800 leading-relaxed">{reviewQuestion.questionText}</p>
            {reviewQuestion.correctAnswer && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">&#10003;</span>
                <span className="text-xs font-semibold text-emerald-600">{reviewQuestion.correctAnswer}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {questionAnswers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400">No answers for this question</p>
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

// ─── Answer Grading Row ───

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

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
      isGraded
        ? answer.isCorrect ? "bg-emerald-50" : "bg-red-50"
        : "bg-white shadow-sm"
    }`}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 mb-0.5">{answer.userName}</p>
        <p className="text-sm text-gray-800">{answer.answerText}</p>
      </div>
      {isTeacher && !isGraded && (
        <div className="flex gap-2 ml-3 shrink-0">
          <button
            onClick={() => onGrade(answer.answerId, true)}
            className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 flex items-center justify-center transition-all active:scale-95 font-bold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>
          <button
            onClick={() => onGrade(answer.answerId, false)}
            className="w-10 h-10 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center transition-all active:scale-95 font-bold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {isGraded && (
        <span className={`ml-3 text-xs font-bold px-2.5 py-1 rounded-lg ${
          answer.isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
        }`}>
          {answer.isCorrect ? "Correct" : "Incorrect"}
        </span>
      )}
    </div>
  );
}
