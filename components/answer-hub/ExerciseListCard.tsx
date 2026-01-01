/**
 * Exercise List Card - Flat row style matching GrammarRuleCard
 * Supports override metadata badges and teacher actions
 */

"use client";

import Link from "next/link";
import { Edit3, GripVertical } from "lucide-react";
import { ExerciseWithOverrideMetadata } from "@/lib/models/exerciseOverride";

interface ExerciseListCardProps {
  exercise: ExerciseWithOverrideMetadata;
  levelBook: string;
  lessonId: string;
  colorScheme: {
    bg: string;
    text: string;
    badge: string;
  };
  isTeacher?: boolean;
  onEdit?: (e: React.MouseEvent) => void;
  onToggleHide?: (e: React.MouseEvent) => void;
  isDraggable?: boolean;
  isDuplicate?: boolean;
  interactionStats?: {
    hasInteracted: boolean;
    submissionCount: number;
    lastSubmittedAt?: number;
  };
  commentCount?: number;
}

export function ExerciseListCard({
  exercise,
  levelBook,
  lessonId,
  colorScheme,
  isTeacher,
  onEdit,
  onToggleHide,
  isDraggable,
  isDuplicate,
  interactionStats,
  commentCount,
}: ExerciseListCardProps) {
  // Construct exercise detail URL using exerciseId (unique identifier)
  const exerciseUrl = `/dashboard/student/answer-hub/${levelBook}/${lessonId}/${encodeURIComponent(
    exercise.exerciseId
  )}`;

  const answerCount = exercise.answers.length;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if dragging
    if (
      (e.currentTarget as HTMLElement).getAttribute("data-dragging") === "true"
    ) {
      e.preventDefault();
      return;
    }

    // If clicking on a button, don't navigate
    if ((e.target as HTMLElement).closest("button")) {
      e.preventDefault();
      return;
    }
  };

  const cardContent = (
    <div
      className={`group ${
        colorScheme.bg
      } px-6 py-4 transition-all duration-200 ${
        isDraggable ? "" : "cursor-pointer"
      } ${exercise._isHidden ? "opacity-50 bg-gray-100" : ""} h-full ${
        isDraggable ? "rounded-r-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`text-lg font-bold transition-colors duration-200 ${
                exercise._isHidden
                  ? "text-gray-500 line-through"
                  : `text-gray-900 ${colorScheme.text}`
              }`}
            >
              {exercise.exerciseNumber}
            </h3>
          </div>
          <p
            className={`text-sm mb-0 ${
              exercise._isHidden ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {answerCount} item{answerCount !== 1 ? "s" : ""}
            {exercise.question &&
              ` - ${exercise.question.substring(0, 60)}${
                exercise.question.length > 60 ? "..." : ""
              }`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Status Badges (Custom > Modified) */}
          {exercise._isCreated ? (
            <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-green-100 text-green-800">
              CUSTOM
            </span>
          ) : exercise._isModified ? (
            <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800">
              MODIFIED
            </span>
          ) : null}

          {/* Hidden Badge */}
          {exercise._isHidden && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-200 text-gray-700">
              HIDDEN
            </span>
          )}

          {/* Duplicate Warning Badge */}
          {isDuplicate && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-yellow-100 text-yellow-800">
              DUPLICATE
            </span>
          )}

          {/* Teacher Action Badges */}
          {isTeacher && (
            <>
              <button
                onClick={onEdit}
                className="inline-flex items-center px-3 py-1 text-xs font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                title="Edit exercise"
              >
                EDIT
              </button>
              <button
                onClick={onToggleHide}
                className={`inline-flex items-center px-3 py-1 text-xs font-bold transition-colors ${
                  exercise._isHidden
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
                title={exercise._isHidden ? "Unhide exercise" : "Hide exercise"}
              >
                {exercise._isHidden ? "SHOW" : "HIDE"}
              </button>
            </>
          )}

          {/* Interaction Badge */}
          {interactionStats?.hasInteracted && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-blue-100 text-blue-700">
              {interactionStats.submissionCount > 0
                ? `${interactionStats.submissionCount} submitted`
                : "Viewed"}
            </span>
          )}

          {/* Comment Badge */}
          {commentCount !== undefined && commentCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-purple-100 text-purple-700">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
              {commentCount}
            </span>
          )}

          {/* Answer Count Badge */}
          <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600">
            {answerCount}
          </span>

          {/* View Button */}
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 group-hover:text-white ${colorScheme.badge} transition-all duration-200`}
          >
            VIEW
          </span>
        </div>
      </div>
    </div>
  );

  if (isDraggable) {
    return (
      <div
        className={`flex items-stretch rounded-lg overflow-hidden ${
          exercise._isHidden ? "opacity-50" : ""
        }`}
      >
        <div
          className={`flex items-center justify-center px-3 cursor-grab active:cursor-grabbing ${colorScheme.bg} border-r border-black/5 hover:bg-opacity-80 transition-colors rounded-none`}
          title="Drag to reorder"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <Link
          href={exerciseUrl}
          onClick={handleCardClick}
          draggable={false}
          className="flex-1 min-w-0 rounded-r-lg"
        >
          {cardContent}
        </Link>
      </div>
    );
  }

  return (
    <Link href={exerciseUrl} onClick={handleCardClick} draggable={false}>
      {cardContent}
    </Link>
  );
}
