"use client";

import { QuizBlank } from "@/lib/models/writing";
import { checkAnswer } from "@/lib/utils/quizGenerator";
import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";

interface MiniExerciseSentenceProps {
  sentence: string;
  blank: QuizBlank;
  answer: string;
  onAnswerChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showResult: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function MiniExerciseSentence({
  sentence,
  blank,
  answer,
  onAnswerChange,
  onKeyDown,
  showResult,
  inputRef,
}: MiniExerciseSentenceProps) {
  
  // Build the display parts with single blank
  const parts: Array<{ type: "text" | "blank"; content: string }> = [];

  // Add text before blank
  if (blank.position > 0) {
    parts.push({
      type: "text",
      content: sentence.substring(0, blank.position),
    });
  }

  // Add blank
  parts.push({
    type: "blank",
    content: blank.correctAnswer,
  });

  // Add remaining text
  const endPosition = blank.position + blank.correctAnswer.length;
  if (endPosition < sentence.length) {
    parts.push({
      type: "text",
      content: sentence.substring(endPosition),
    });
  }

  return (
    <div className="mb-6 text-base sm:text-lg leading-loose overflow-hidden">
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <span key={index} className="text-gray-900">
              {part.content}
            </span>
          );
        } else {
          const answerIsCorrect =
            showResult && checkAnswer(answer, part.content);
          const answerIsIncorrect = showResult && !answerIsCorrect;

          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 mx-1.5 my-2 relative"
            >
              <input
                ref={inputRef}
                type="text"
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                onKeyDown={onKeyDown}
                readOnly={showResult}
                className={`text-base font-bold text-center transition-all outline-none ${
                  answerIsCorrect
                    ? "bg-piku-mint text-gray-900 px-1.5 py-1"
                    : answerIsIncorrect
                    ? "bg-red-100 text-red-700 px-1.5 py-1 rounded-l-md"
                    : "bg-gray-100 hover:bg-gray-150 focus:bg-white focus:ring-2 focus:ring-blue-400 rounded-md px-1.5 py-1"
                }`}
                style={{
                  width: `${Math.min(Math.max(part.content.length * 10, 60), 200)}px`,
                  maxWidth: "calc(100vw - 6rem)",
                }}
              />
              {!showResult && (
                <GermanCharAutocomplete
                  textareaRef={inputRef}
                  content={answer}
                  onContentChange={onAnswerChange}
                />
              )}
              {answerIsIncorrect && (
                <span className="inline-flex items-center justify-center px-1.5 py-1 bg-piku-mint text-gray-900 text-base font-bold rounded-r-md">
                  {part.content}
                </span>
              )}
            </span>
          );
        }
      })}
    </div>
  );
}
