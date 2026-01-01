/**
 * Exercise Detail Page
 * Shows single exercise with answers and batch-filtered discussion
 */

"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CatLoader } from "@/components/ui/CatLoader";
import { AnswersList } from "@/components/answer-hub/AnswersList";
import { ExerciseDiscussion } from "@/components/answer-hub/ExerciseDiscussion";
import { StudentAnswersDisplay } from "@/components/answer-hub/StudentAnswersDisplay";
import { DictionaryLookup } from "@/components/dictionary/DictionaryLookup";
import { FloatingRedemittelWidget } from "@/components/writing/FloatingRedemittelWidget";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { useActiveBatches } from "@/lib/hooks/useBatches";
import { useBatchSelection } from "@/lib/hooks/useBatchSelection";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { useLessonWithOverrides } from "@/lib/hooks/useExercisesWithOverrides";
import { useExerciseProgress } from "@/lib/hooks/useExerciseProgress";
import { CEFRLevel } from "@/lib/models/cefr";

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId } = getUserInfo(currentUser, session);

  // State to trigger refresh of student answers
  const [answersRefreshTrigger, setAnswersRefreshTrigger] = useState(0);

  // Parse URL params (exerciseNumber param is actually exerciseId now)
  const levelBook = params.levelBook as string;
  const lessonId = params.lessonId as string;
  const exerciseId = decodeURIComponent(params.exerciseNumber as string);

  // Parse level and book type
  const [levelPart, bookType] = levelBook.split("-") as [string, "AB" | "KB"];
  const level = levelPart as CEFRLevel;

  // Parse lesson number
  const lessonNumber = parseInt(lessonId.replace("L", ""));

  // Load exercises with teacher overrides (includes custom exercises)
  const { lesson, isLoading, error } = useLessonWithOverrides(
    level,
    bookType,
    lessonNumber,
    session?.user?.email || null
  );

  // Find the exercise (using exerciseId which is unique)
  const exercise = lesson?.exercises.find((e) => e.exerciseId === exerciseId);

  // Check if user is a teacher (role is uppercase in database)
  const isTeacher = currentUser?.role === "TEACHER";

  // Load teacher's batches (only for teachers)
  const { batches } = useActiveBatches(
    isTeacher ? session?.user?.email : undefined
  );

  // Use persistent batch selection
  const { selectedBatch } = useBatchSelection({
    batches,
    user: currentUser,
  });

  // Get current user's batch ID
  // If teacher: use selected batch from dropdown/persistence
  // If student: use their assigned batch
  const currentUserBatchId = isTeacher
    ? selectedBatch?.batchId
    : currentUser?.batchId;

  // Get exercise progress
  const exerciseProgress = useExerciseProgress(
    exercise?.exerciseId || "",
    exercise?.answers.length || 0,
    userId
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Answer Hub 📝"
          subtitle="Loading exercise..."
          backButton={{
            label: "Back to Lesson",
            onClick: () =>
              router.push(
                `/dashboard/student/answer-hub/${levelBook}/${lessonId}`
              ),
          }}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <CatLoader message="Loading exercise..." size="md" />
        </div>
      </div>
    );
  }

  if (error || !exercise || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Answer Hub 📝"
          subtitle="Exercise not found"
          backButton={{
            label: "Back to Lesson",
            onClick: () =>
              router.push(
                `/dashboard/student/answer-hub/${levelBook}/${lessonId}`
              ),
          }}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="bg-white border border-red-200 shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Exercise Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              {error ||
                `Could not find this exercise in ${
                  lesson?.title || `Lektion ${lessonNumber}`
                }`}
            </p>
            <Link
              href={`/dashboard/student/answer-hub/${levelBook}/${lessonId}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Lesson
            </Link>
          </div>
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
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title={`${lesson.title} - Übung ${exercise.exerciseNumber}`}
        subtitle={`${level} ${bookType}`}
        backButton={{
          label: "Back to Lesson",
          onClick: () =>
            router.push(
              `/dashboard/student/answer-hub/${levelBook}/${lessonId}`
            ),
        }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Exercise Card */}
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden mb-6">
          {/* Exercise Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h1 className="text-2xl font-black text-gray-900 mb-2">
                  {exercise.title}
                </h1>

                {/* Question */}
                {exercise.question && (
                  <p className="text-base text-gray-700 mb-3">
                    {exercise.question}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  {exerciseProgress && !isTeacher && (
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-bold ${
                        exerciseProgress.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : exerciseProgress.status === "in_progress"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {exerciseProgress.status === "completed"
                        ? "✓ COMPLETED"
                        : exerciseProgress.status === "in_progress"
                        ? `IN PROGRESS (${exerciseProgress.itemsCompleted}/${exerciseProgress.totalItems})`
                        : "NEW"}
                    </span>
                  )}

                  {/* Difficulty Badge */}
                  {exercise.difficulty && (
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-bold ${difficultyColor}`}
                    >
                      {exercise.difficulty.charAt(0).toUpperCase() +
                        exercise.difficulty.slice(1)}
                    </span>
                  )}

                  {/* Book Type Badge */}
                  <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700">
                    {bookType}
                  </span>

                  {/* Topic Badge */}
                  {exercise.topic && (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600">
                      {exercise.topic}
                    </span>
                  )}

                  {/* Page Number */}
                  {exercise.pageNumber && (
                    <span className="text-xs text-gray-500">
                      📖 Seite {exercise.pageNumber}
                    </span>
                  )}

                  {/* Item Count */}
                  <span className="text-xs text-gray-500">
                    {exercise.answers.length} item
                    {exercise.answers.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className={`w-5 h-5 ${
                  isTeacher ? "text-emerald-600" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isTeacher
                      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  }
                />
              </svg>
              <h2 className="font-black text-lg text-gray-900">
                {isTeacher ? "Correct Answers" : "Exercise Items"}
              </h2>
            </div>

            <AnswersList
              answers={exercise.answers}
              exerciseId={exercise.exerciseId}
              showExplanations={true}
              isTeacher={isTeacher}
              onAnswerSaved={() => setAnswersRefreshTrigger((prev) => prev + 1)}
            />
          </div>
        </div>

        {/* Student Answers Section */}
        <StudentAnswersDisplay
          exerciseId={exercise.exerciseId}
          refreshTrigger={answersRefreshTrigger}
        />

        {/* Discussion Section */}
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden mt-6">
          <ExerciseDiscussion
            exerciseId={exercise.exerciseId}
            currentUser={currentUser}
            currentUserBatchId={currentUserBatchId}
          />
        </div>

        {/* Dictionary Section */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg mt-6 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📚</span>
            <h2 className="font-black text-lg text-gray-900">
              Dictionary Lookup
            </h2>
          </div>
          <DictionaryLookup className="w-full" />
        </div>

        {/* Navigation Footer */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href={`/dashboard/student/answer-hub/${levelBook}/${lessonId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Lesson Exercises</span>
          </Link>

          <Link
            href="/dashboard/student/answer-hub"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            View All Lessons
          </Link>
        </div>
      </div>

      <FloatingRedemittelWidget currentLevel={level} />
    </div>
  );
}
