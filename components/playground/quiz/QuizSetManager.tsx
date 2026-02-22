/**
 * QuizSetManager — Teacher-only: create and manage quiz sets
 * M3 Expressive design with tonal surfaces, filled buttons, visible states
 */

"use client";

import { useState } from "react";
import type { useQuizData } from "./useQuizData";
import { QuizQuestionForm } from "./QuizQuestionForm";

interface QuizSetManagerProps {
  data: ReturnType<typeof useQuizData>;
}

export function QuizSetManager({ data }: QuizSetManagerProps) {
  const {
    quizzes, currentQuiz, questions,
    setCurrentQuiz, fetchQuizDetail,
    handleCreateQuiz, handleDeleteQuiz,
    handleAddQuestion, handleDeleteQuestion,
    handleStartQuiz,
  } = data;

  const [newTitle, setNewTitle] = useState("");
  const [showNewQuiz, setShowNewQuiz] = useState(false);

  // ─── Quiz List View ───
  if (!currentQuiz) {
    return (
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quiz Sets</h3>
            <p className="text-xs text-gray-400 mt-0.5">Create quizzes and go live</p>
          </div>
          {!showNewQuiz && (
            <button
              onClick={() => setShowNewQuiz(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-2xl hover:bg-violet-700 active:scale-[0.97] transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Quiz
            </button>
          )}
        </div>

        {/* Create quiz form */}
        {showNewQuiz && (
          <div className="mb-5 p-4 bg-violet-50 rounded-2xl">
            <p className="text-xs font-semibold text-violet-600 mb-2">NEW QUIZ</p>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter quiz title..."
              autoFocus
              className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 shadow-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTitle.trim()) {
                  handleCreateQuiz(newTitle.trim());
                  setNewTitle("");
                  setShowNewQuiz(false);
                }
              }}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  if (newTitle.trim()) {
                    handleCreateQuiz(newTitle.trim());
                    setNewTitle("");
                    setShowNewQuiz(false);
                  }
                }}
                disabled={!newTitle.trim()}
                className="flex-1 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 active:scale-[0.97] transition-all disabled:opacity-40 disabled:active:scale-100"
              >
                Create
              </button>
              <button
                onClick={() => { setShowNewQuiz(false); setNewTitle(""); }}
                className="px-4 py-2.5 bg-white text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 active:scale-[0.97] transition-all shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {quizzes.length === 0 && !showNewQuiz && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-violet-100 rounded-[20px] flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-900 font-bold text-base mb-3">Create your first quiz</p>
            <div className="inline-flex flex-col gap-2 text-left mb-5">
              {[
                { n: "1", text: "Tap + New Quiz to create a set" },
                { n: "2", text: "Add text or multiple-choice questions" },
                { n: "3", text: "Hit Start Quiz to go live" },
              ].map((step) => (
                <div key={step.n} className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-violet-100 text-violet-600 text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                    {step.n}
                  </span>
                  <span className="text-sm text-gray-500">{step.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowNewQuiz(true)}
              className="px-6 py-3 bg-violet-600 text-white text-sm font-semibold rounded-2xl hover:bg-violet-700 active:scale-[0.97] transition-all shadow-sm"
            >
              + New Quiz
            </button>
          </div>
        )}

        {/* Quiz list */}
        {quizzes.length > 0 && (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <button
                key={quiz.quizId}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-violet-50/60 active:scale-[0.99] transition-all shadow-sm text-left group"
                onClick={() => { setCurrentQuiz(quiz); fetchQuizDetail(quiz.quizId); }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{quiz.title}</p>
                    <p className="text-xs text-gray-400">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.quizId); }}
                  className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Question Editor View ───
  return (
    <div className="p-5">
      {/* Back + title + start */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setCurrentQuiz(null)}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-base font-bold text-gray-900 flex-1 truncate">{currentQuiz.title}</h3>
        {questions.length > 0 && (
          <button
            onClick={() => handleStartQuiz(currentQuiz.quizId)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-2xl hover:bg-emerald-600 active:scale-[0.97] transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start Quiz
          </button>
        )}
      </div>

      {/* Question list */}
      {questions.length > 0 && (
        <div className="space-y-2.5 mb-5">
          {questions.map((q, idx) => (
            <div key={q.questionId} className="p-4 bg-white rounded-2xl shadow-sm group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 bg-violet-100 text-violet-600 text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      q.questionType === "multiple_choice" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                    }`}>
                      {q.questionType === "multiple_choice" ? "Multiple Choice" : "Text"}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{q.timeLimit}s</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{q.questionText}</p>
                  {q.choices && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {q.choices.map((c, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                            c === q.correctAnswer ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {c === q.correctAnswer && <span className="mr-0.5">&#10003;</span>}
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q.questionId)}
                  className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty questions hint */}
      {questions.length === 0 && (
        <div className="text-center py-4 mb-4">
          <p className="text-sm text-gray-400">No questions yet — add one below</p>
        </div>
      )}

      {/* Add question form */}
      <QuizQuestionForm onAdd={handleAddQuestion} />
    </div>
  );
}
