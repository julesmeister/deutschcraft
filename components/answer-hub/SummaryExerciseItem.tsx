
"use client";

import Link from "next/link";
import { AnswerNumberBadge } from "./AnswerNumberBadge";
import { ExerciseWithOverrideMetadata } from "@/lib/models/exerciseOverride";
import { StudentLessonAnswer } from "@/lib/models/studentAnswer";

interface SummaryExerciseItemProps {
  exercise: ExerciseWithOverrideMetadata;
  answers: StudentLessonAnswer[];
  index: number;
  levelBook: string;
  lessonId: string;
  isTeacher: boolean;
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
}: SummaryExerciseItemProps) {
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
          {sortedAnswers.map((ans, idx) => (
            <div
              key={`${ans.studentId}-${ans.itemNumber}-${idx}`}
              className="px-6 py-3 flex gap-4 hover:bg-gray-50 transition-colors"
            >
              <AnswerNumberBadge itemNumber={ans.itemNumber} />

              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <div className="flex items-baseline gap-2 text-xs">
                    {isTeacher && (
                      <span
                        className="font-bold text-gray-900"
                        title={ans.studentName}
                      >
                        {ans.studentName || "Unknown"}
                      </span>
                    )}
                    <span className="text-gray-400">
                      {isTeacher && "•"} {formatAnswerDate(ans.submittedAt)}
                    </span>
                  </div>
                  {isTeacher && ans.isCorrect !== undefined && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        ans.isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {ans.isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  )}
                </div>
                <div className="text-gray-900 font-medium text-sm whitespace-pre-wrap">
                  {ans.studentAnswer}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
