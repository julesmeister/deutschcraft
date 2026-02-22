/**
 * QuizQuestionForm — Form to add a new question to a quiz
 * M3 Expressive: segmented button, tonal surface, filled inputs, assist chips
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
    <div className="p-5 bg-[#E8DEF8]/50 rounded-[16px]">
      <p className="text-[11px] font-bold text-[#6750A4] mb-3 tracking-widest uppercase">Add Question</p>

      {/* M3 outlined text field */}
      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Type your question..."
        className="w-full px-4 py-3 bg-[#FFFBFE] rounded-[12px] text-sm text-[#1D1B20] placeholder:text-[#CAC4D0] resize-none focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
        rows={2}
      />

      {/* M3 segmented button + time chip */}
      <div className="flex items-center gap-3 mt-3">
        {/* Segmented button */}
        <div className="flex rounded-full overflow-hidden bg-[#E7E0EC]">
          <button
            onClick={() => setQuestionType("text")}
            className={`text-[11px] h-8 px-4 font-medium rounded-full transition-all ${
              questionType === "text"
                ? "bg-[#E8DEF8] text-[#1D1B20]"
                : "text-[#49454F] hover:bg-[#1D1B20]/8"
            }`}
          >
            {questionType === "text" && <span className="mr-1">&#10003;</span>}
            Text
          </button>
          <button
            onClick={() => setQuestionType("multiple_choice")}
            className={`text-[11px] h-8 px-4 font-medium rounded-full transition-all ${
              questionType === "multiple_choice"
                ? "bg-[#E8DEF8] text-[#1D1B20]"
                : "text-[#49454F] hover:bg-[#1D1B20]/8"
            }`}
          >
            {questionType === "multiple_choice" && <span className="mr-1">&#10003;</span>}
            Multiple Choice
          </button>
        </div>

        {/* Time chip — M3 input chip style */}
        <div className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-transparent">
          <svg className="w-[14px] h-[14px] text-[#49454F]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="text-[11px] font-medium text-[#49454F] bg-transparent focus:outline-none cursor-pointer"
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
        <div className="mt-4 space-y-2">
          {choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectIndex(i)}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all text-xs font-medium ${
                  correctIndex === i
                    ? "bg-[#6750A4] text-white"
                    : "bg-[#E7E0EC] text-[#79747E] hover:bg-[#D0BCFF] hover:text-[#6750A4]"
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
                className="flex-1 h-10 px-3 bg-[#FFFBFE] rounded-[12px] text-sm text-[#1D1B20] placeholder:text-[#CAC4D0] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
              />
            </div>
          ))}
          <p className="text-[11px] text-[#79747E] font-medium ml-10">Tap the circle to mark the correct answer</p>
        </div>
      )}

      {/* M3 filled button */}
      <button
        onClick={handleSubmit}
        disabled={!questionText.trim() || isAdding}
        className="mt-4 w-full h-10 bg-[#6750A4] text-white text-sm font-medium rounded-full hover:shadow-[0_1px_3px_1px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all disabled:opacity-38 disabled:shadow-none"
      >
        {isAdding ? "Adding..." : "Add Question"}
      </button>
    </div>
  );
}
