/**
 * Exercise Card Component
 * Display exercise with answers and batch-filtered discussion
 */

"use client";

import { useState } from "react";
import { Exercise } from "@/lib/models/exercises";
import { ExerciseWithOverrideMetadata } from "@/lib/models/exerciseOverride";
import { User } from "@/lib/models/user";
import { AnswersList } from "./AnswersList";
import { ExerciseDiscussion } from "./ExerciseDiscussion";
import { ExerciseStatusBadge } from "./ExerciseStatusBadge";
import { getBookTypeColor, getDifficultyColor } from "./ui-utils";
import { getExerciseTitle } from "@/lib/models/exercises";

interface ExerciseCardProps {
  exercise: Exercise | ExerciseWithOverrideMetadata;
  currentUser: User | null;
  currentUserBatchId: string | null | undefined;
  colorScheme: {
    bg: string;
    badge: string;
  };
}

export function ExerciseCard({
  exercise,
  currentUser,
  currentUserBatchId,
  colorScheme,
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if current user is a teacher (role is uppercase in database)
  const isTeacher = currentUser?.role === "TEACHER";

  const difficultyColor = getDifficultyColor(exercise.difficulty);
  const bookTypeColor = getBookTypeColor(exercise.bookType);

  return (
    <div
      className={`group bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 ${colorScheme.bg} hover:shadow-md overflow-hidden`}
    >
      {/* Card Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Exercise Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {getExerciseTitle(exercise)}
            </h3>

            {/* Question (if available) */}
            {exercise.question && (
              <p className="text-sm text-gray-600 mb-3">{exercise.question}</p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Badges */}
              <ExerciseStatusBadge exercise={exercise} variant="default" />

              {/* Difficulty Badge */}
              {exercise.difficulty && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficultyColor}`}
                >
                  {exercise.difficulty.charAt(0).toUpperCase() +
                    exercise.difficulty.slice(1)}
                </span>
              )}

              {/* Book Type Badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bookTypeColor}`}
              >
                {exercise.bookType}
              </span>

              {/* Topic Badge */}
              {exercise.topic && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                  {exercise.topic}
                </span>
              )}

              {/* Page Number */}
              {exercise.pageNumber && (
                <span className="text-xs text-gray-500">
                  📖 Seite {exercise.pageNumber}
                </span>
              )}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Card Body (Collapsible) */}
      {isExpanded && (
        <div className="p-5 space-y-5">
          {/* Correct Answers Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-5 h-5 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="font-bold text-sm text-gray-900">
                {isTeacher ? "Correct Answers" : "Exercise Items"}
              </h4>
            </div>
            <AnswersList
              answers={exercise.answers}
              exerciseId={exercise.exerciseId}
              showExplanations={true}
              isTeacher={isTeacher}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Discussion Section */}
          <ExerciseDiscussion
            exerciseId={exercise.exerciseId}
            currentUser={currentUser}
            currentUserBatchId={currentUserBatchId}
          />
        </div>
      )}

      {/* Collapsed Preview */}
      {!isExpanded && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <span>View answers & discussion</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
