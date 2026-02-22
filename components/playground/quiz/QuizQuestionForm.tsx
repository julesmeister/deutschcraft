/**
 * QuizQuestionForm — Form to add a new question to a quiz
 * M3 Expressive: tonal surface, segmented toggle, rich MC editor
 */

"use client";

import { useState } from "react";

interface QuizQuestionFormProps {
  onAdd: (
    questionText: string,
    questionType: "text" | "multiple_choice",
    choices?: string[],
    correctAnswer?: string,
    timeLimit?: number
  ) => Promise<void>;
}

export function QuizQuestionForm({ onAdd }: QuizQuestionFormProps) {
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
    <div className="p-4 bg-violet-50/70 rounded-2xl">
      <p className="text-xs font-bold text-violet-500 uppercase tracking-wide mb-3">Add Question</p>

      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Type your question..."
        className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 shadow-sm"
        rows={2}
      />

      {/* Type toggle + time limit */}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setQuestionType("text")}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
              questionType === "text" ? "bg-amber-100 text-amber-700 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setQuestionType("multiple_choice")}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
              questionType === "multiple_choice" ? "bg-blue-100 text-blue-700 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Multiple Choice
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 shadow-sm">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="text-xs font-semibold text-gray-600 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value={30}>30s</option>
            <option value={60}>60s</option>
            <option value={90}>90s</option>
            <option value={120}>2min</option>
            <option value={180}>3min</option>
          </select>
        </div>
      </div>

      {/* MC choices */}
      {questionType === "multiple_choice" && (
        <div className="mt-3 space-y-2">
          {choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectIndex(i)}
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all text-xs font-bold ${
                  correctIndex === i
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-white text-gray-400 hover:bg-gray-50 shadow-sm"
                }`}
              >
                {correctIndex === i ? "✓" : String.fromCharCode(65 + i)}
              </button>
              <input
                value={c}
                onChange={(e) => {
                  const next = [...choices];
                  next[i] = e.target.value;
                  setChoices(next);
                }}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 px-3 py-2 bg-white rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 shadow-sm"
              />
            </div>
          ))}
          <p className="text-xs text-violet-400 font-medium ml-9">Tap the circle to mark the correct answer</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!questionText.trim() || isAdding}
        className="mt-4 w-full py-3 bg-violet-600 text-white text-sm font-semibold rounded-2xl hover:bg-violet-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:active:scale-100"
      >
        {isAdding ? "Adding..." : "Add Question"}
      </button>
    </div>
  );
}
