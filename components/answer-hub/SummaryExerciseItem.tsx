"use client";

import Link from "next/link";
import { StudentAnswerBubble } from "./StudentAnswerBubble";
import { ExerciseWithOverrideMetadata } from "@/lib/models/exerciseOverride";
import { StudentLessonAnswer, MarkedWord } from "@/lib/models/studentAnswers";
import { useSaveStudentAnswer } from "@/lib/hooks/useStudentAnswers";

interface SummaryExerciseItemProps {
  exercise: ExerciseWithOverrideMetadata;
  answers: StudentLessonAnswer[];
  index: number;
  levelBook: string;
  lessonId: string;
  isTeacher: boolean;
  currentUserId?: string;
}

// Helper for date formatting
const formatAnswerDate = (timestamp: number | string) => {
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " at " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
};

export function SummaryExerciseItem({
  exercise,
  answers,
  index,
  levelBook,
  lessonId,
  isTeacher,
  currentUserId,
}: SummaryExerciseItemProps) {
  const { updateMarkedWords } = useSaveStudentAnswer();

  // Sort answers
  const sortedAnswers = [...answers].sort((a, b) => {
    if (isTeacher) {
      const nameCompare = (a.studentName || "").localeCompare(
        b.studentName || ""
      );
      if (nameCompare !== 0) return nameCompare;
    }
    return a.itemNumber.localeCompare(b.itemNumber, undefined, {
      numeric: true,
    });
  });

  const handleSaveMarkedWords = async (
    studentId: string,
    itemNumber: string,
    markedWords: MarkedWord[]
  ) => {
    await updateMarkedWords(
      studentId,
      exercise.exerciseId,
      itemNumber,
      markedWords
    );
  };

  return (
    <div
      id={`exercise-${exercise.exerciseId}-${index}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden scroll-mt-24"
    >
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
              {exercise.exerciseNumber}
            </span>
            <h3 className="font-bold text-gray-900">{exercise.title}</h3>
          </div>
          {exercise.question && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {exercise.question}
            </p>
          )}
        </div>
        {!isTeacher && (
          <Link
            href={`/dashboard/student/answer-hub/${levelBook}/${lessonId}/${encodeURIComponent(
              exercise.exerciseId
            )}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
          >
            Edit Answers
          </Link>
        )}
      </div>

      {sortedAnswers.length === 0 ? (
        <div className="px-6 py-4 text-center text-gray-500 italic text-sm">
          No submissions yet.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {sortedAnswers.map((ans, idx) => {
            const isOwnAnswer = currentUserId === ans.studentId;
            // Only allow marking if it's the user's own answer (even if teacher views it, usually teacher marks student work in detailed view, but here let's stick to user's own answers for now or follow same pattern)
            // Actually, if isTeacher is true, currentUserId is teacher's ID. Teacher usually doesn't have answers here unless testing.
            // But if we want to allow marking, we check if it is own answer.

            return (
              <StudentAnswerBubble
                key={`${ans.studentId}-${ans.itemNumber}-${idx}`}
                itemNumber={ans.itemNumber}
                answer={ans.studentAnswer}
                studentName={ans.studentName || "Unknown"}
                isOwnAnswer={isOwnAnswer}
                submittedAt={ans.submittedAt}
                isCorrect={isTeacher ? ans.isCorrect : undefined}
                markedWords={ans.markedWords}
                onSaveMarkedWords={
                  isOwnAnswer
                    ? (words) =>
                        handleSaveMarkedWords(
                          ans.studentId,
                          ans.itemNumber,
                          words
                        )
                    : undefined
                }
                // No edit/delete handlers in summary view
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
