/**
 * QuizSetManager — Teacher-only view for creating and managing quiz sets
 * Create quizzes, add/edit questions (text or MC), set time limits, start quiz
 */

"use client";

import { useState } from "react";
import type { useQuizData } from "./useQuizData";

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

  // If no quiz selected, show quiz list
  if (!currentQuiz) {
    return (
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Quiz Sets</h3>
          <button
            onClick={() => setShowNewQuiz(true)}
            className="px-3 py-1.5 bg-piku-purple text-white text-sm font-bold rounded-xl hover:bg-opacity-90 transition"
          >
            + New Quiz
          </button>
        </div>

        {showNewQuiz && (
          <div className="mb-4 flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Quiz title..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-piku-purple/30"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTitle.trim()) {
                  handleCreateQuiz(newTitle.trim());
                  setNewTitle("");
                  setShowNewQuiz(false);
                }
              }}
            />
            <button
              onClick={() => {
                if (newTitle.trim()) {
                  handleCreateQuiz(newTitle.trim());
                  setNewTitle("");
                  setShowNewQuiz(false);
                }
              }}
              className="px-3 py-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition"
            >
              Create
            </button>
            <button
              onClick={() => { setShowNewQuiz(false); setNewTitle(""); }}
              className="px-3 py-2 text-gray-500 text-sm hover:text-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {quizzes.length === 0 && !showNewQuiz ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-800 font-bold text-sm mb-2">Create your first quiz</p>
            <div className="text-xs text-gray-400 space-y-1 mb-4">
              <p>1. Click <span className="font-semibold text-gray-500">+ New Quiz</span> to create a quiz set</p>
              <p>2. Add text or multiple-choice questions</p>
              <p>3. Hit <span className="font-semibold text-green-600">Start Quiz</span> to go live</p>
            </div>
            <button
              onClick={() => setShowNewQuiz(true)}
              className="px-4 py-2 bg-piku-purple text-white text-sm font-bold rounded-xl hover:bg-opacity-90 transition"
            >
              + New Quiz
            </button>
          </div>
        ) : quizzes.length === 0 ? null : (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <div
                key={quiz.quizId}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition cursor-pointer group"
                onClick={() => { setCurrentQuiz(quiz); fetchQuizDetail(quiz.quizId); }}
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{quiz.title}</p>
                  <p className="text-xs text-gray-400">{new Date(quiz.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.quizId); }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-sm transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Quiz selected → show question editor
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => { setCurrentQuiz(null); }}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-bold text-gray-900 flex-1">{currentQuiz.title}</h3>
        {questions.length > 0 && (
          <button
            onClick={() => handleStartQuiz(currentQuiz.quizId)}
            className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition"
          >
            Start Quiz
          </button>
        )}
      </div>

      {/* Question list */}
      <div className="space-y-3 mb-4">
        {questions.map((q, idx) => (
          <div key={q.questionId} className="p-3 border border-gray-100 rounded-xl group">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-400">Q{idx + 1}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    q.questionType === "multiple_choice" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {q.questionType === "multiple_choice" ? "MC" : "Text"}
                  </span>
                  <span className="text-xs text-gray-400">{q.timeLimit}s</span>
                </div>
                <p className="text-sm text-gray-800">{q.questionText}</p>
                {q.choices && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {q.choices.map((c, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          c === q.correctAnswer ? "bg-green-100 text-green-700 font-bold" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDeleteQuestion(q.questionId)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition shrink-0"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add question form */}
      <QuestionForm onAdd={handleAddQuestion} />
    </div>
  );
}

// ─── Question Form (extracted) ───

interface QuestionFormProps {
  onAdd: (
    questionText: string,
    questionType: "text" | "multiple_choice",
    choices?: string[],
    correctAnswer?: string,
    timeLimit?: number
  ) => Promise<void>;
}

function QuestionForm({ onAdd }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"text" | "multiple_choice">("text");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState(60);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async () => {
    if (!questionText.trim()) return;
    setIsAdding(true);
    try {
      if (questionType === "multiple_choice") {
        const validChoices = choices.filter((c) => c.trim());
        if (validChoices.length < 2) return;
        await onAdd(questionText.trim(), "multiple_choice", validChoices, validChoices[correctIndex] || validChoices[0], timeLimit);
      } else {
        await onAdd(questionText.trim(), "text", undefined, undefined, timeLimit);
      }
      setQuestionText("");
      setChoices(["", "", "", ""]);
      setCorrectIndex(0);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="border border-dashed border-gray-200 rounded-xl p-4">
      <p className="text-xs font-bold text-gray-400 mb-2">ADD QUESTION</p>

      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Type your question..."
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-piku-purple/30"
        rows={2}
      />

      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQuestionType("text")}
            className={`text-xs px-2 py-1 rounded-lg font-semibold transition ${
              questionType === "text" ? "bg-amber-100 text-amber-700" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setQuestionType("multiple_choice")}
            className={`text-xs px-2 py-1 rounded-lg font-semibold transition ${
              questionType === "multiple_choice" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            MC
          </button>
        </div>

        <select
          value={timeLimit}
          onChange={(e) => setTimeLimit(Number(e.target.value))}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
        >
          <option value={30}>30s</option>
          <option value={60}>60s</option>
          <option value={90}>90s</option>
          <option value={120}>2min</option>
          <option value={180}>3min</option>
        </select>
      </div>

      {questionType === "multiple_choice" && (
        <div className="mt-2 space-y-1">
          {choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                className="accent-green-500"
              />
              <input
                value={c}
                onChange={(e) => {
                  const next = [...choices];
                  next[i] = e.target.value;
                  setChoices(next);
                }}
                placeholder={`Option ${i + 1}`}
                className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-piku-purple/30"
              />
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">Select the correct answer with the radio button</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!questionText.trim() || isAdding}
        className="mt-3 w-full py-2 bg-piku-purple text-white text-sm font-bold rounded-xl hover:bg-opacity-90 transition disabled:opacity-50"
      >
        {isAdding ? "Adding..." : "Add Question"}
      </button>
    </div>
  );
}
