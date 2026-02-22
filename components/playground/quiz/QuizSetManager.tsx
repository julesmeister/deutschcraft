/**
 * QuizSetManager — Teacher-only: create and manage quiz sets
 * M3 Expressive: tonal surfaces, FAB, assist chips, squircle cards, state layers
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[22px] font-semibold text-[#1D1B20] leading-7">Quiz Sets</h3>
            <p className="text-[11px] font-medium text-[#79747E] mt-1 tracking-wide uppercase">Create & launch live quizzes</p>
          </div>
          {!showNewQuiz && (
            <button
              onClick={() => setShowNewQuiz(true)}
              className="h-14 w-14 bg-[#EADDFF] hover:bg-[#D0BCFF] text-[#21005D] rounded-[16px] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-[0_1px_3px_1px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.3)]"
              title="New Quiz"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )}
        </div>

        {/* Create quiz — M3 filled card */}
        {showNewQuiz && (
          <div className="mb-5 p-5 bg-[#E8DEF8] rounded-[16px]">
            <p className="text-[11px] font-bold text-[#6750A4] mb-3 tracking-widest uppercase">New Quiz</p>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter quiz title..."
              autoFocus
              className="w-full h-14 px-4 bg-[#FEF7FF] rounded-[12px] text-sm text-[#1D1B20] placeholder:text-[#CAC4D0] focus:outline-none focus:ring-2 focus:ring-[#6750A4] border border-[#CAC4D0]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTitle.trim()) {
                  handleCreateQuiz(newTitle.trim());
                  setNewTitle("");
                  setShowNewQuiz(false);
                }
              }}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (newTitle.trim()) {
                    handleCreateQuiz(newTitle.trim());
                    setNewTitle("");
                    setShowNewQuiz(false);
                  }
                }}
                disabled={!newTitle.trim()}
                className="flex-1 h-10 bg-[#6750A4] text-white text-sm font-medium rounded-full hover:shadow-[0_1px_3px_1px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all disabled:opacity-38 disabled:shadow-none"
              >
                Create
              </button>
              <button
                onClick={() => { setShowNewQuiz(false); setNewTitle(""); }}
                className="h-10 px-6 bg-transparent text-[#6750A4] text-sm font-medium rounded-full border border-[#79747E] hover:bg-[#6750A4]/8 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {quizzes.length === 0 && !showNewQuiz && (
          <div className="text-center py-10">
            <div className="w-[72px] h-[72px] bg-[#EADDFF] rounded-[22px] flex items-center justify-center mx-auto mb-6">
              <svg className="w-9 h-9 text-[#6750A4]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#1D1B20] font-semibold text-base mb-4">Create your first quiz</p>
            {/* M3 step indicators */}
            <div className="inline-flex flex-col gap-3 text-left mb-6">
              {[
                { n: "1", text: "Tap the + button to create a set" },
                { n: "2", text: "Add text or multiple-choice questions" },
                { n: "3", text: "Hit Start Quiz to go live" },
              ].map((step) => (
                <div key={step.n} className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-[#6750A4] text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                    {step.n}
                  </span>
                  <span className="text-sm text-[#49454F]">{step.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowNewQuiz(true)}
              className="h-10 px-6 bg-[#6750A4] text-white text-sm font-medium rounded-full hover:shadow-[0_1px_3px_1px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all"
            >
              + New Quiz
            </button>
          </div>
        )}

        {/* Quiz list — M3 elevated cards */}
        {quizzes.length > 0 && (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <button
                key={quiz.quizId}
                className="w-full flex items-center justify-between p-4 bg-[#FFFBFE] rounded-[16px] hover:bg-[#F6EDFF] active:scale-[0.99] transition-all text-left group shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                onClick={() => { setCurrentQuiz(quiz); fetchQuizDetail(quiz.quizId); }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-[#EADDFF] rounded-[12px] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#6750A4]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1D1B20] text-sm truncate">{quiz.title}</p>
                    <p className="text-[11px] text-[#79747E]">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.quizId); }}
                  className="w-9 h-9 rounded-full bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#FFB4AB] flex items-center justify-center transition-all shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
      {/* Top bar — M3 top app bar style */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setCurrentQuiz(null)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#1D1B20]/8 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 text-[#1D1B20]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-base font-medium text-[#1D1B20] flex-1 truncate">{currentQuiz.title}</h3>
        {questions.length > 0 && (
          <button
            onClick={() => handleStartQuiz(currentQuiz.quizId)}
            className="flex items-center gap-2 h-14 px-6 bg-[#D0BCFF] text-[#381E72] text-sm font-medium rounded-[16px] hover:shadow-[0_1px_3px_1px_rgba(0,0,0,0.15)] active:scale-[0.97] transition-all shadow-[0_1px_3px_1px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.3)]"
          >
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start Quiz
          </button>
        )}
      </div>

      {/* Question list — M3 outlined cards */}
      {questions.length > 0 && (
        <div className="space-y-3 mb-5">
          {questions.map((q, idx) => (
            <div key={q.questionId} className="p-4 bg-[#FFFBFE] rounded-[16px] border border-[#CAC4D0] group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 bg-[#6750A4] text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    {/* M3 assist chip */}
                    <span className={`text-[11px] h-7 px-3 rounded-[8px] font-medium flex items-center border ${
                      q.questionType === "multiple_choice"
                        ? "border-[#D0BCFF] bg-[#EADDFF] text-[#6750A4]"
                        : "border-[#FFD8E4] bg-[#FFD8E4] text-[#633B48]"
                    }`}>
                      {q.questionType === "multiple_choice" ? "Multiple Choice" : "Text"}
                    </span>
                    <span className="text-[11px] text-[#79747E] font-medium h-7 px-2 rounded-[8px] border border-[#CAC4D0] flex items-center">{q.timeLimit}s</span>
                  </div>
                  <p className="text-sm text-[#1D1B20] leading-relaxed">{q.questionText}</p>
                  {q.choices && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {q.choices.map((c, i) => (
                        <span
                          key={i}
                          className={`text-[11px] h-6 px-2.5 rounded-[8px] font-medium flex items-center ${
                            c === q.correctAnswer
                              ? "bg-[#C8FFC7] text-[#1B5E20] border border-[#4CAF50]/30"
                              : "bg-[#E7E0EC] text-[#49454F]"
                          }`}
                        >
                          {c === q.correctAnswer && <span className="mr-1">&#10003;</span>}
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q.questionId)}
                  className="w-9 h-9 rounded-full bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#FFB4AB] flex items-center justify-center transition-all shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
        <div className="text-center py-6 mb-4">
          <p className="text-sm text-[#79747E]">No questions yet — add one below</p>
        </div>
      )}

      {/* Add question form */}
      <QuizQuestionForm onAdd={handleAddQuestion} />
    </div>
  );
}
