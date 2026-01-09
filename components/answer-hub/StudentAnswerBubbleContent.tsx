"use client";

import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";
import { MarkedWord } from "@/lib/models/studentAnswers";

interface StudentAnswerBubbleContentProps {
  isEditing: boolean;
  isMarkingMode: boolean;
  isOwnAnswer: boolean;
  value: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  isSaving: boolean;
  markedWords: MarkedWord[];
  
  // Handlers
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onContentChange: (newContent: string) => void;
  onToggleWordMark: (word: string, start: number, end: number) => void;
  canEdit?: boolean;
}

// Tokenize answer text into words with positions, preserving line structure
function tokenizeAnswer(text: string): Array<{word: string, start: number, end: number, isLineBreak?: boolean}> {
  const tokens: Array<{word: string, start: number, end: number, isLineBreak?: boolean}> = [];
  const lines = text.split('\n');
  let currentPosition = 0;

  lines.forEach((line, lineIndex) => {
    // Tokenize words in the line
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      tokens.push({
        word: match[0],
        start: currentPosition + match.index,
        end: currentPosition + match.index + match[0].length
      });
    }

    // Add line break token if not the last line
    if (lineIndex < lines.length - 1) {
      currentPosition += line.length;
      tokens.push({
        word: '\n',
        start: currentPosition,
        end: currentPosition + 1,
        isLineBreak: true
      });
      currentPosition += 1; // Account for the newline character
    } else {
      currentPosition += line.length;
    }
  });

  return tokens;
}

export function StudentAnswerBubbleContent({
  isEditing,
  isMarkingMode,
  isOwnAnswer,
  value,
  textareaRef,
  isSaving,
  markedWords,
  onChange,
  onBlur,
  onKeyDown,
  onContentChange,
  onToggleWordMark,
  canEdit,
}: StudentAnswerBubbleContentProps) {

  // Check if word is marked
  function isWordMarked(startIndex: number): boolean {
    return markedWords.some(mw => mw.startIndex === startIndex);
  }

  // Strip trailing punctuation from word and adjust indices
  function stripPunctuation(word: string, start: number, end: number): { word: string, start: number, end: number } {
    // Preserve German characters (ä, ö, ü, ß) while stripping punctuation
    const stripped = word.replace(/[^\w\säöüÄÖÜß]+$/g, '');
    const removedCount = word.length - stripped.length;
    return {
      word: stripped,
      start,
      end: end - removedCount
    };
  }

  return (
    <div className="w-full">
      {isEditing && isOwnAnswer ? (
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            autoFocus
            className="w-full p-0 text-sm text-gray-900 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none overflow-hidden font-medium leading-normal"
            style={{ minHeight: "24px" }}
            onClick={(e) => e.stopPropagation()}
          />
          {isEditing && (
            <GermanCharAutocomplete
              textareaRef={textareaRef}
              content={value}
              onContentChange={onContentChange}
            />
          )}
          {isSaving && (
            <span className="text-xs text-blue-600 mt-1 block">
              Saving...
            </span>
          )}
        </div>
      ) : isMarkingMode ? (
        <div className="leading-relaxed">
          {tokenizeAnswer(value).map((token, idx) => {
            // Render line breaks
            if (token.isLineBreak) {
              return <br key={idx} />;
            }

            const marked = isWordMarked(token.start);
            const { word: cleanWord, start, end } = stripPunctuation(token.word, token.start, token.end);
            return (
              <span
                key={idx}
                onClick={() => onToggleWordMark(cleanWord, start, end)}
                className={`
                  inline-block cursor-pointer px-0.5 mx-0.5 rounded transition-colors
                  ${marked
                    ? 'bg-yellow-300 text-gray-900 font-medium'
                    : 'hover:bg-yellow-100'
                  }
                `}
              >
                {token.word}
                {marked && <span className="ml-1 text-xs">✓</span>}
              </span>
            );
          })}
        </div>
      ) : (
        <div
          className={`text-sm text-gray-900 font-medium whitespace-pre-wrap leading-normal ${
            isOwnAnswer && canEdit
              ? "group-hover:text-blue-700 transition-colors"
              : ""
          }`}
          title={isOwnAnswer && canEdit ? "Click to edit" : ""}
        >
          {value}
        </div>
      )}
    </div>
  );
}
