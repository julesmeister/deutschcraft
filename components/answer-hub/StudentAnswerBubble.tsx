"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { MarkedWord } from "@/lib/models/studentAnswers";
import { AnswerNumberBadge } from "./AnswerNumberBadge";
import { StudentAnswerBubbleHeader } from "./StudentAnswerBubbleHeader";
import { StudentAnswerBubbleContent } from "./StudentAnswerBubbleContent";

interface StudentAnswerBubbleProps {
  itemNumber: string;
  answer: string;
  studentName: string;
  isOwnAnswer: boolean;
  isSaving?: boolean;
  submittedAt?: number;
  isCorrect?: boolean;
  onEdit?: (value: string) => void;
  onDelete?: () => void;
  onNavigate?: (direction: "up" | "down") => void;
  markedWords?: MarkedWord[];
  onSaveMarkedWords?: (words: MarkedWord[]) => void;
}

export interface StudentAnswerBubbleHandle {
  startEditing: () => void;
}

export const StudentAnswerBubble = forwardRef<
  StudentAnswerBubbleHandle,
  StudentAnswerBubbleProps
>(
  (
    {
      itemNumber,
      answer,
      studentName,
      isOwnAnswer,
      isSaving = false,
      submittedAt,
      isCorrect,
      onEdit,
      onDelete,
      onNavigate,
      markedWords: initialMarkedWords,
      onSaveMarkedWords,
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(answer);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const prevAnswerRef = useRef(answer);
    const [isMarkingMode, setIsMarkingMode] = useState(false);
    const [markedWords, setMarkedWords] = useState<MarkedWord[]>(
      initialMarkedWords || []
    );
    const [isSavingMarks, setIsSavingMarks] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    useImperativeHandle(ref, () => ({
      startEditing: () => {
        setIsEditing(true);
      },
    }));

    // Sync value with answer prop only when prop changes
    useEffect(() => {
      if (answer !== prevAnswerRef.current) {
        setValue(answer);
        prevAnswerRef.current = answer;
      }
    }, [answer]);

    // Auto-resize textarea when content changes
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      }
    }, [value, isEditing]);

    // Handle double click to edit
    const handleDoubleClick = (e: React.MouseEvent) => {
      // Prevent editing if clicking buttons or links
      if ((e.target as HTMLElement).closest("button")) {
        return;
      }

      if (isOwnAnswer && onEdit) {
        setIsEditing(true);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
    };

    const handleBlur = () => {
      if (onEdit && value !== answer) {
        onEdit(value);
      }
      setIsEditing(false);
    };

    const handleSave = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onEdit && value !== answer) {
        onEdit(value);
      }
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!onNavigate) return;

      if (e.key === "ArrowUp") {
        const textarea = e.currentTarget;
        // Navigate up if cursor is at the beginning
        if (textarea.selectionStart === 0) {
          e.preventDefault();
          onNavigate("up");
        }
      } else if (e.key === "ArrowDown") {
        const textarea = e.currentTarget;
        // Navigate down if cursor is at the end
        if (textarea.selectionStart === textarea.value.length) {
          e.preventDefault();
          onNavigate("down");
        }
      }
    };

    const handleCopy = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    };

    // Toggle word marking
    function toggleWordMark(
      word: string,
      startIndex: number,
      endIndex: number
    ) {
      // Check if word is already marked
      const isWordMarked = markedWords.some(
        (mw) => mw.startIndex === startIndex
      );

      if (isWordMarked) {
        setMarkedWords((prev) =>
          prev.filter((mw) => mw.startIndex !== startIndex)
        );
      } else {
        setMarkedWords((prev) => [
          ...prev,
          {
            word,
            startIndex,
            endIndex,
            markedAt: Date.now(),
          },
        ]);
      }
    }

    // Save marked words
    async function handleSaveMarkedWords(e: React.MouseEvent) {
      e.stopPropagation();
      if (!onSaveMarkedWords) return;

      setIsSavingMarks(true);
      try {
        await onSaveMarkedWords(markedWords);
        setIsMarkingMode(false);
      } catch (error) {
        console.error("Failed to save marked words", error);
      } finally {
        setIsSavingMarks(false);
      }
    }

    return (
      <div
        className={`px-6 py-3 flex gap-4 hover:bg-gray-50 transition-colors group ${
          isOwnAnswer && onEdit ? "cursor-pointer" : ""
        }`}
        onDoubleClick={handleDoubleClick}
      >
        <AnswerNumberBadge itemNumber={itemNumber} />

        <div className="flex-1 min-w-0">
          <StudentAnswerBubbleHeader
            studentName={studentName}
            isOwnAnswer={isOwnAnswer}
            submittedAt={submittedAt}
            isCorrect={isCorrect}
            isEditing={isEditing}
            onSave={handleSave}
            isCopied={isCopied}
            onCopy={handleCopy}
            onEdit={onEdit ? () => setIsEditing(true) : undefined}
            onDelete={onDelete}
            canMark={!!onSaveMarkedWords}
            isMarkingMode={isMarkingMode}
            markedWordsCount={markedWords.length}
            isSavingMarks={isSavingMarks}
            onToggleMarkingMode={(e) => {
              e.stopPropagation();
              setIsMarkingMode(true);
            }}
            onSaveMarkedWords={handleSaveMarkedWords}
            onCancelMarkingMode={(e) => {
              e.stopPropagation();
              setIsMarkingMode(false);
              setMarkedWords(initialMarkedWords || []);
            }}
          />

          <StudentAnswerBubbleContent
            isEditing={isEditing}
            isMarkingMode={isMarkingMode}
            isOwnAnswer={isOwnAnswer}
            value={value}
            textareaRef={textareaRef}
            isSaving={isSaving}
            markedWords={markedWords}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onContentChange={(newContent) => setValue(newContent)}
            onToggleWordMark={toggleWordMark}
            canEdit={!!onEdit}
          />
        </div>
      </div>
    );
  }
);

StudentAnswerBubble.displayName = "StudentAnswerBubble";
