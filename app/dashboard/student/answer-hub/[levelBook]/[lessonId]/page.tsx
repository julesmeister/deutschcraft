/**
 * Lesson Detail Page
 * Shows all exercises in a specific lesson
 * Teachers can create, edit, hide, and reorder exercises
 */

"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LessonDetailHeader } from "@/components/answer-hub/LessonDetailHeader";
import { ExerciseOverrideDialog } from "@/components/answer-hub/ExerciseOverrideDialog";
import { HiddenExercisesModal } from "@/components/answer-hub/HiddenExercisesModal";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { useActiveBatches } from "@/lib/hooks/useBatches";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { useLessonWithOverrides } from "@/lib/hooks/useExercisesWithOverrides";
import { useLessonHandlers } from "@/lib/hooks/useLessonHandlers";
import { useLessonPageHandlers } from "@/lib/hooks/useLessonPageHandlers";
import { useDuplicateDetection } from "@/lib/hooks/useDuplicateDetection";
import { useHiddenExercises } from "@/lib/hooks/useHiddenExercises";
import { CEFRLevel } from "@/lib/models/cefr";
import { useBatchSelection } from "@/lib/hooks/useBatchSelection";
import { useAllLessonAnswers } from "@/lib/hooks/useStudentAnswers";
import { useExerciseInteractions } from "@/lib/hooks/useExerciseInteractions";
import { useToast } from "@/lib/hooks/useToast";

// New components
import { LessonLoading } from "@/components/answer-hub/lesson-detail/LessonLoading";
import { LessonError } from "@/components/answer-hub/lesson-detail/LessonError";
import { LessonExercisesView } from "@/components/answer-hub/lesson-detail/LessonExercisesView";

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId, userEmail } = getUserInfo(currentUser, session);

  // Parse URL params
  // Format: levelBook = "B1-AB", lessonId = "L1"
  const levelBook = params.levelBook as string;
  const lessonId = params.lessonId as string;

  // Parse level and book type from levelBook
  const [levelPart, bookType] = levelBook.split("-") as [string, "AB" | "KB"];
  const level = levelPart as CEFRLevel;

  // Parse lesson number from lessonId
  const lessonNumber = parseInt(lessonId.replace("L", ""));

  // Load exercises with teacher overrides merged
  const { lesson, isLoading, error, hasOverrides, overrideCount } =
    useLessonWithOverrides(level, bookType, lessonNumber, userEmail);

  // Load interaction stats for all exercises in this lesson
  const exerciseIds = useMemo(
    () => lesson?.exercises.map((ex) => ex.exerciseId) || [],
    [lesson]
  );

  const { interactions, discussions } = useExerciseInteractions(
    userId || userEmail,
    exerciseIds
  );

  // Check if user is a teacher (role is uppercase in database)
  const isTeacher = currentUser?.role === "TEACHER";

  // Load all answers for teacher to show count
  const { answers: allAnswers } = useAllLessonAnswers(exerciseIds, isTeacher);
  const answerCount = allAnswers.length;

  // Calculate teacher interactions (submission counts per exercise)
  const teacherInteractions = useMemo(() => {
    if (!isTeacher) return interactions;

    const stats: Record<
      string,
      { submissionCount: number; lastSubmittedAt: number }
    > = {};

    // Group answers by exerciseId
    allAnswers.forEach((answer) => {
      if (!stats[answer.exerciseId]) {
        stats[answer.exerciseId] = {
          submissionCount: 0,
          lastSubmittedAt: 0,
        };
      }
      stats[answer.exerciseId].submissionCount++;
      // We can track latest submission if needed, though mostly used for count > 0 check
      stats[answer.exerciseId].lastSubmittedAt = Math.max(
        stats[answer.exerciseId].lastSubmittedAt,
        answer.submittedAt
      );
    });

    return stats;
  }, [isTeacher, interactions, allAnswers]);

  // Load teacher's batches (only for teachers)
  const { batches } = useActiveBatches(isTeacher ? userEmail : undefined);

  // Use persistent batch selection
  const { selectedBatch, setSelectedBatch, sortedBatches } = useBatchSelection({
    batches,
    user: currentUser,
  });

  // Hidden exercises modal and data
  const {
    hiddenExercises,
    isHiddenModalOpen,
    openHiddenModal,
    closeHiddenModal,
  } = useHiddenExercises(isTeacher, userEmail, level, lessonNumber);

  // Detect duplicate exerciseIds and create index map
  const { duplicateExerciseIds, exerciseIndexMap, visibleDuplicateIds } =
    useDuplicateDetection(lesson);

  // Teacher handlers (create, hide, reorder, dialog)
  const {
    isOverrideDialogOpen,
    setIsOverrideDialogOpen,
    dialogMode,
    editingExercise,
    setEditingExercise,
    handleCreateExercise,
    handleToggleHide,
    handleReorder,
    handleSubmitOverride,
  } = useLessonHandlers(
    userEmail,
    level,
    lessonNumber,
    duplicateExerciseIds,
    exerciseIndexMap
  );

  // Inline editing and section management handlers
  const {
    editingSectionName,
    editingExerciseId,
    handleReorderSections,
    handleAddToSection,
    handleSaveInlineExercise,
    handleCancelInlineExercise,
    handleEditExercise,
    handleSaveInlineEdit,
    handleCancelInlineEdit,
  } = useLessonPageHandlers(
    userEmail,
    level,
    lessonNumber,
    lesson,
    handleReorder
  );

  // Refresh handler - invalidate React Query cache to refetch all data
  const handleRefresh = async () => {
    try {
      // Invalidate exercise overrides to refetch teacher's changes
      await queryClient.invalidateQueries({
        queryKey: ["exercise-overrides"],
      });

      // Invalidate student answers
      await queryClient.invalidateQueries({
        queryKey: ["student-answers"],
      });

      // Invalidate exercise interactions
      await queryClient.invalidateQueries({
        queryKey: ["exercise-interactions"],
      });

      // Show success toast
      toast.success(
        "Exercise list refreshed successfully!",
        3000,
        "Refresh Complete"
      );
    } catch (error) {
      console.error("Failed to refresh exercises:", error);
      toast.error(
        "Failed to refresh exercises. Please try again.",
        5000,
        "Refresh Failed"
      );
    }
  };

  if (isLoading) {
    return <LessonLoading />;
  }

  if (error || !lesson) {
    return (
      <LessonError
        error={error as Error}
        lessonNumber={lessonNumber}
        level={level}
        bookType={bookType}
      />
    );
  }

  const exerciseCount = lesson?.exercises.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="animate-fade-in-up">
        <LessonDetailHeader
          lessonTitle={lesson?.title || "Lesson"}
          level={level}
          bookType={bookType}
          exerciseCount={exerciseCount}
          isTeacher={isTeacher}
          hiddenExercisesCount={hiddenExercises.length}
          batches={sortedBatches}
          selectedBatch={selectedBatch}
          onOpenHiddenModal={openHiddenModal}
          onSelectBatch={setSelectedBatch}
          onCreateBatch={() => router.push("/dashboard/teacher/batches")}
          onBack={() => router.push("/dashboard/student/answer-hub")}
          onViewSummary={
            !isTeacher
              ? () =>
                  router.push(
                    `/dashboard/student/answer-hub/${levelBook}/${lessonId}/summary`
                  )
              : undefined
          }
          onRefresh={!isTeacher ? handleRefresh : undefined}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <LessonExercisesView
          lesson={lesson}
          isTeacher={isTeacher}
          levelBook={levelBook}
          lessonId={lessonId}
          interactions={interactions}
          discussions={discussions}
          teacherInteractions={teacherInteractions}
          answerCount={answerCount}
          hasOverrides={hasOverrides}
          overrideCount={overrideCount}
          handlers={{
            onCreateExercise: handleCreateExercise,
            onReorder: handleReorder,
            onEditExercise: handleEditExercise,
            onToggleHide: handleToggleHide,
            onReorderSections: isTeacher ? handleReorderSections : undefined,
            onAddToSection: isTeacher ? handleAddToSection : undefined,
            onSaveInlineExercise: isTeacher
              ? handleSaveInlineExercise
              : undefined,
            onCancelInlineExercise: isTeacher
              ? handleCancelInlineExercise
              : undefined,
            onSaveInlineEdit: isTeacher ? handleSaveInlineEdit : undefined,
            onCancelInlineEdit: isTeacher ? handleCancelInlineEdit : undefined,
          }}
          editingState={{
            sectionName: editingSectionName,
            exerciseId: editingExerciseId,
          }}
          duplicateInfo={{
            ids: duplicateExerciseIds,
            visibleIds: visibleDuplicateIds,
          }}
        />
      </div>

      {/* Exercise Override Dialog */}
      <ExerciseOverrideDialog
        isOpen={isOverrideDialogOpen}
        onClose={() => {
          setIsOverrideDialogOpen(false);
          setEditingExercise(null);
        }}
        onSubmit={handleSubmitOverride}
        mode={dialogMode}
        exercise={editingExercise || undefined}
        level={level}
        bookType={bookType}
        lessonNumber={lessonNumber}
      />

      {/* Hidden Exercises Modal */}
      <HiddenExercisesModal
        isOpen={isHiddenModalOpen}
        onClose={closeHiddenModal}
        hiddenExercises={hiddenExercises}
        onUnhide={(exerciseId) => handleToggleHide(exerciseId, false)}
      />
    </div>
  );
}
