"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CatLoader } from "@/components/ui/CatLoader";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { BatchSelector } from "@/components/ui/BatchSelector";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { useLessonWithOverrides } from "@/lib/hooks/useExercisesWithOverrides";
import {
  useStudentLessonAnswers,
  useAllLessonAnswers,
} from "@/lib/hooks/useStudentAnswers";
import { useActiveBatches } from "@/lib/hooks/useBatches";
import { useBatchSelection } from "@/lib/hooks/useBatchSelection";
import {
  useBatchStudents,
  useTeacherStudents,
} from "@/lib/hooks/useUserQueries";
import { CEFRLevel } from "@/lib/models/cefr";
import { FloatingExerciseNavigator } from "@/components/answer-hub/FloatingExerciseNavigator";
import { SummaryExerciseItem } from "@/components/answer-hub/SummaryExerciseItem";

export default function LessonSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId, userRole } = getUserInfo(currentUser, session);
  const isTeacher = userRole === "teacher";

  // Parse URL params
  const levelBook = params.levelBook as string;
  const lessonId = params.lessonId as string;
  const [levelPart, bookType] = levelBook.split("-") as [string, "AB" | "KB"];
  const level = levelPart as CEFRLevel;
  const lessonNumber = parseInt(lessonId.replace("L", ""));

  // Fetch lesson data
  const { lesson, isLoading: isLessonLoading } = useLessonWithOverrides(
    level,
    bookType,
    lessonNumber,
    session?.user?.email || null
  );

  // Get all exercise IDs in this lesson
  const exerciseIds = useMemo(
    () => lesson?.exercises.map((e) => e.exerciseId) || [],
    [lesson]
  );

  // --- Teacher Logic ---
  const { batches: teacherBatches } = useActiveBatches(
    isTeacher ? currentUser?.email : undefined
  );
  const { selectedBatch, setSelectedBatch } = useBatchSelection({
    batches: teacherBatches,
    user: currentUser,
  });
  const { students: batchStudents, isLoading: isBatchStudentsLoading } =
    useBatchStudents(selectedBatch?.batchId);
  const {
    students: allTeacherStudents,
    isLoading: isAllTeacherStudentsLoading,
  } = useTeacherStudents(isTeacher ? currentUser?.email : undefined);

  // --- Data Fetching ---
  // Student: Fetch own answers
  const { answers: studentAnswers, isLoading: isStudentAnswersLoading } =
    useStudentLessonAnswers(!isTeacher ? userId : null, exerciseIds);

  // Teacher: Fetch all answers
  const { answers: allAnswers, isLoading: isAllAnswersLoading } =
    useAllLessonAnswers(exerciseIds, isTeacher);

  // --- Data Processing ---
  const displayAnswers = useMemo(() => {
    if (!isTeacher) return studentAnswers;

    // Determine which students to filter by
    let allowedStudents = [];
    if (selectedBatch) {
      allowedStudents = batchStudents;
    } else {
      // Fallback to all teacher students if no batch selected
      allowedStudents = allTeacherStudents;
    }

    // If no students found, return empty (or handle "View All" if we want to show everything)
    if (!allowedStudents.length) return [];

    const studentIds = new Set(allowedStudents.map((s) => s.userId));
    // Also check emails as fallback if userId doesn't match
    const studentEmails = new Set(allowedStudents.map((s) => s.email));

    return allAnswers.filter(
      (a) => studentIds.has(a.studentId) || studentEmails.has(a.studentId)
    );
  }, [
    isTeacher,
    studentAnswers,
    allAnswers,
    selectedBatch,
    batchStudents,
    allTeacherStudents,
  ]);

  const answersByExercise = useMemo(() => {
    const map = new Map<string, typeof displayAnswers>();
    displayAnswers.forEach((a) => {
      if (!map.has(a.exerciseId)) map.set(a.exerciseId, []);
      map.get(a.exerciseId)?.push(a);
    });
    return map;
  }, [displayAnswers]);

  // Create interactions object for FloatingExerciseNavigator
  const interactions = useMemo(() => {
    const result: Record<
      string,
      { submissionCount: number; lastSubmittedAt: number }
    > = {};
    answersByExercise.forEach((answers, exerciseId) => {
      result[exerciseId] = {
        submissionCount: answers.length,
        lastSubmittedAt: 0,
      };
    });
    return result;
  }, [answersByExercise]);

  // For students: only show attempted. For teachers: show all exercises
  const displayExercises = useMemo(() => {
    if (isTeacher) return lesson?.exercises || [];
    return (
      lesson?.exercises.filter((ex) => answersByExercise.has(ex.exerciseId)) ||
      []
    );
  }, [lesson, answersByExercise, isTeacher]);

  const isLoading =
    isLessonLoading ||
    (!isTeacher && isStudentAnswersLoading) ||
    (isTeacher &&
      (isAllAnswersLoading ||
        isBatchStudentsLoading ||
        (selectedBatch === null && isAllTeacherStudentsLoading)));

  // Helper for scrolling
  const scrollToExercise = (exerciseId: string, index: number) => {
    const element = document.getElementById(`exercise-${exerciseId}-${index}`);
    if (element) {
      const headerOffset = 100; // Account for sticky headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Lesson Summary"
          subtitle="Loading answers..."
          backButton={{
            label: "Back to Lesson",
            onClick: () =>
              router.push(
                `/dashboard/student/answer-hub/${levelBook}/${lessonId}`
              ),
          }}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <CatLoader message="Loading answers..." size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <DashboardHeader
        title={`${lesson?.title || "Lesson"} - Summary`}
        subtitle={
          isTeacher
            ? `Student answers for ${level} ${bookType} Lektion ${lessonNumber}`
            : `Your answers for ${level} ${bookType} Lektion ${lessonNumber}`
        }
        backButton={{
          label: "Back to Lesson",
          onClick: () =>
            router.push(
              `/dashboard/student/answer-hub/${levelBook}/${lessonId}`
            ),
        }}
        actions={
          isTeacher && (
            <BatchSelector
              batches={teacherBatches}
              selectedBatch={selectedBatch}
              onSelectBatch={setSelectedBatch}
              onCreateBatch={() => router.push("/dashboard/teacher/batches")}
            />
          )
        }
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {displayExercises.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Answers Found
            </h3>
            <p className="text-gray-600 mb-6">
              {isTeacher
                ? "No student answers found for this batch yet."
                : "You haven't submitted any answers for this lesson yet."}
            </p>
            {!isTeacher && (
              <div className="flex justify-center">
                <div className="w-48">
                  <ActionButton
                    variant="purple"
                    onClick={() =>
                      router.push(
                        `/dashboard/student/answer-hub/${levelBook}/${lessonId}`
                      )
                    }
                    icon={<ActionButtonIcons.ArrowRight />}
                  >
                    Start Practicing
                  </ActionButton>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                {displayExercises.length} Exercise
                {displayExercises.length !== 1 ? "s" : ""}{" "}
                {isTeacher ? "Available" : "Attempted"}
              </h2>
              <span className="text-sm text-gray-500">
                Total Answers: {displayAnswers.length}
              </span>
            </div>

            {/* Floating Exercise Navigator */}
            <FloatingExerciseNavigator
              exercises={displayExercises}
              onScrollToExercise={scrollToExercise}
              interactions={interactions}
            />

            {displayExercises.map((ex, idx) => {
              const exAnswers = answersByExercise.get(ex.exerciseId) || [];
              return (
                <SummaryExerciseItem
                  key={`${ex.exerciseId}-${idx}`}
                  exercise={ex}
                  answers={exAnswers}
                  index={idx}
                  levelBook={levelBook}
                  lessonId={lessonId}
                  isTeacher={isTeacher}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
