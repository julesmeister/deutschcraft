/**
 * QuizReviewView — Teacher grading + score summary (reviewing/finished states)
 * Teacher: grade text answers, see auto-graded MC answers, finish review
 * Student: see their results after quiz is finished
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

  // Score summary per student
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

  // Student's own answers (for student view)
  const myAnswers = useMemo(() => answers.filter((a) => a.userId === userId), [answers, userId]);

  if (!sessionState) return null;

  // ─── Finished: Score Summary ───
  if (isFinished) {
    return (
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Quiz Results</h3>
          {isTeacher && (
            <button
              onClick={handleClearSession}
              className="px-3 py-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
            >
              Close
            </button>
          )}
        </div>

        {currentQuiz && (
          <p className="text-sm text-gray-500 mb-4">{currentQuiz.title}</p>
        )}

        {/* Teacher: all student scores */}
        {isTeacher && (
          <div className="space-y-2 mb-4">
            {studentScores.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-piku-purple/10 text-piku-purple text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{s.userName}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{s.correct}/{s.total}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    ({s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
            {studentScores.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No answers submitted</p>
            )}
          </div>
        )}

        {/* Student: my results */}
        {!isTeacher && (
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const myAnswer = myAnswers.find((a) => a.questionId === q.questionId);
              return (
                <div key={q.questionId} className="p-3 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400">Q{idx + 1}</span>
                    {myAnswer?.isCorrect === true && <span className="text-xs text-green-600 font-bold">Correct</span>}
                    {myAnswer?.isCorrect === false && <span className="text-xs text-red-600 font-bold">Incorrect</span>}
                    {myAnswer && myAnswer.isCorrect === null && <span className="text-xs text-gray-400 font-bold">Pending</span>}
                    {!myAnswer && <span className="text-xs text-gray-300">Not answered</span>}
                  </div>
                  <p className="text-sm text-gray-800 mb-1">{q.questionText}</p>
                  {myAnswer && (
                    <p className="text-xs text-gray-500">Your answer: <span className="font-medium">{myAnswer.answerText}</span></p>
                  )}
                </div>
              );
            })}

            {/* Score total */}
            {myAnswers.length > 0 && (
              <div className="mt-4 p-4 bg-piku-purple/5 rounded-xl text-center">
                <p className="text-sm text-gray-600">Your Score</p>
                <p className="text-2xl font-black text-piku-purple">
                  {myAnswers.filter((a) => a.isCorrect).length}/{myAnswers.length}
                </p>
              </div>
            )}
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Review Answers</h3>
        <button
          onClick={handleEndQuiz}
          className="px-4 py-1.5 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition"
        >
          Finish Review ({ungradedCount} ungraded)
        </button>
      </div>

      {/* Question nav */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {questions.map((_, idx) => {
          const qAnswers = answers.filter((a) => a.questionId === questions[idx].questionId);
          const allGraded = qAnswers.length > 0 && qAnswers.every((a) => a.isCorrect !== null && a.isCorrect !== undefined);
          return (
            <button
              key={idx}
              onClick={() => setReviewQuestionIndex(idx)}
              className={`shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition ${
                idx === reviewQuestionIndex
                  ? "bg-piku-purple text-white"
                  : allGraded
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Current question + answers */}
      {reviewQuestion && (
        <div>
          <div className="mb-3 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-semibold text-gray-800">{reviewQuestion.questionText}</p>
            {reviewQuestion.correctAnswer && (
              <p className="text-xs text-green-600 mt-1">Correct: {reviewQuestion.correctAnswer}</p>
            )}
          </div>

          <div className="space-y-2">
            {questionAnswers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No answers for this question</p>
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
    <div className={`flex items-center justify-between p-3 rounded-xl border ${
      isGraded
        ? answer.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        : "border-gray-100"
    }`}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-400">{answer.userName}</p>
        <p className="text-sm text-gray-800 truncate">{answer.answerText}</p>
      </div>
      {isTeacher && !isGraded && (
        <div className="flex gap-1 ml-2 shrink-0">
          <button
            onClick={() => onGrade(answer.answerId, true)}
            className="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition text-sm font-bold"
          >
            ✓
          </button>
          <button
            onClick={() => onGrade(answer.answerId, false)}
            className="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition text-sm font-bold"
          >
            ✗
          </button>
        </div>
      )}
      {isGraded && (
        <span className={`ml-2 text-xs font-bold ${answer.isCorrect ? "text-green-600" : "text-red-600"}`}>
          {answer.isCorrect ? "Correct" : "Incorrect"}
        </span>
      )}
    </div>
  );
}
