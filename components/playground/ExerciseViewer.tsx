/**
 * Exercise Viewer Component
 * Displays an exercise from the answer hub in the playground room
 * Reuses components from answer-hub to avoid duplication
 */

"use client";

import { useMemo, useState } from "react";
import { Youtube, Link as LinkIcon, ExternalLink, X } from "lucide-react";
import { useExercisesWithOverrides } from "@/lib/hooks/useExercisesWithOverrides";
import { CEFRLevel } from "@/lib/models/cefr";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { PDFViewer } from "@/components/playground/PDFViewer";
import { AnswersList } from "@/components/answer-hub/AnswersList";
import { StudentAnswersDisplay } from "@/components/answer-hub/StudentAnswersDisplay";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { getUserInfo } from "@/lib/utils/userHelpers";

interface ExerciseViewerProps {
  exerciseId: string;
  exerciseNumber: string;
  level: string;
  lessonNumber: number;
  bookType: "AB" | "KB";
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function ExerciseViewer({
  exerciseId,
  exerciseNumber,
  level,
  lessonNumber,
  bookType,
  onClose,
  showCloseButton = true,
}: ExerciseViewerProps) {
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(session?.user?.email || null);
  const { userRole } = getUserInfo(currentUser, session);
  const isTeacher = userRole === "teacher";

  const [answersRefreshTrigger, setAnswersRefreshTrigger] = useState(0);

  // Use exercises with teacher overrides to match Answer Hub
  const { lessons, isLoading, error } = useExercisesWithOverrides(
    level as CEFRLevel,
    bookType,
    lessonNumber,
    session?.user?.email || null
  );

  // Find the exercise in the lessons
  const exercise = useMemo(() => {
    for (const lesson of lessons) {
      const found = lesson.exercises.find((ex) => ex.exerciseId === exerciseId);
      if (found) return found;
    }
    return null;
  }, [lessons, exerciseId]);

  // Find the lesson
  const lesson = useMemo(() => {
    return lessons.find((l) => l.lessonNumber === lessonNumber);
  }, [lessons, lessonNumber]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
          <span className="ml-3 text-gray-500">Loading exercise...</span>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="bg-white rounded-3xl p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-gray-600">
            {error || "Exercise not found"}
          </p>
        </div>
      </div>
    );
  }

  // Difficulty colors
  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    hard: "bg-red-100 text-red-700",
  };

  const difficultyColor = exercise.difficulty
    ? difficultyColors[exercise.difficulty]
    : difficultyColors.medium;

  return (
    <div className="bg-white rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100/60 bg-gradient-to-r from-purple-50/80 to-blue-50/80 rounded-t-3xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-gray-900">
                {lesson?.title || `Lektion ${lessonNumber}`}
              </span>
              <span className="text-gray-400">•</span>
              <span className="font-bold text-purple-600">
                Übung {exerciseNumber}
              </span>
            </div>

            {/* Metadata badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded">
                {level} {bookType}
              </span>
              {exercise.section && (
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  {exercise.section}
                </span>
              )}
              {exercise.difficulty && (
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded ${difficultyColor}`}>
                  {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {exercise.answers.length} {exercise.answers.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close exercise"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Question */}
      {exercise.question && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <p className="text-gray-700">{exercise.question}</p>
        </div>
      )}

      {/* Attachments */}
      {exercise.attachments && exercise.attachments.length > 0 && (
        <div className="p-4 border-b border-gray-100 space-y-3">
          {/* Link/YouTube attachments */}
          {exercise.attachments.some((att) => att.type !== "audio" && att.type !== "pdf") && (
            <div className="flex flex-wrap items-center gap-2">
              {exercise.attachments
                .filter((att) => att.type !== "audio" && att.type !== "pdf")
                .map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      attachment.type === "youtube"
                        ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100"
                    }`}
                  >
                    {attachment.type === "youtube" ? (
                      <Youtube className="w-4 h-4" />
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                    {attachment.title || (attachment.type === "youtube" ? "Watch Video" : "Open Link")}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                ))}
            </div>
          )}

          {/* Audio attachments */}
          {exercise.attachments
            .filter((att) => att.type === "audio")
            .map((attachment, index) => (
              <div key={`audio-${index}`}>
                <AudioPlayer
                  materialTitle={attachment.title || "Audio"}
                  materialUrl={attachment.url}
                  audioId={attachment.audioId}
                />
              </div>
            ))}

          {/* PDF attachments */}
          {exercise.attachments
            .filter((att) => att.type === "pdf")
            .map((attachment, index) => (
              <div key={`pdf-${index}`} className="h-[400px]">
                <PDFViewer
                  materialTitle={attachment.title || "PDF Document"}
                  materialUrl={attachment.url}
                  pageStart={attachment.pageStart}
                  pageEnd={attachment.pageEnd}
                  showCloseButton={false}
                />
              </div>
            ))}
        </div>
      )}

      {/* Answers Section - uses AnswersList which handles both teacher and student views */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-bold text-gray-900">
            {isTeacher ? "Correct Answers" : "Exercise Items"}
          </h3>
        </div>
        <AnswersList
          answers={exercise.answers}
          exerciseId={exercise.exerciseId}
          showExplanations={true}
          isTeacher={isTeacher}
          onAnswerSaved={() => setAnswersRefreshTrigger((prev) => prev + 1)}
        />
      </div>

      {/* Student Answers Section - shown for teachers */}
      {isTeacher && (
        <div className="p-4 border-t border-gray-100">
          <StudentAnswersDisplay
            exerciseId={exercise.exerciseId}
            refreshTrigger={answersRefreshTrigger}
          />
        </div>
      )}
    </div>
  );
}
