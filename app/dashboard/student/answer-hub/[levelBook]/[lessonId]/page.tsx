/**
 * Lesson Detail Page
 * Shows all exercises in a specific lesson
 * Teachers can create, edit, hide, and reorder exercises
 */

"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CatLoader } from "@/components/ui/CatLoader";
import { LessonDetailHeader } from "@/components/answer-hub/LessonDetailHeader";
import {
  ExerciseFilters,
  FilterState,
} from "@/components/answer-hub/ExerciseFilters";
import { ExerciseOverrideDialog } from "@/components/answer-hub/ExerciseOverrideDialog";
import { HiddenExercisesModal } from "@/components/answer-hub/HiddenExercisesModal";
import { ExerciseListSection } from "@/components/answer-hub/ExerciseListSection";
import { TeacherControls } from "@/components/answer-hub/TeacherControls";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { useActiveBatches } from "@/lib/hooks/useBatches";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { Batch } from "@/lib/models";
import { useLessonWithOverrides } from "@/lib/hooks/useExercisesWithOverrides";
import { useLessonHandlers } from "@/lib/hooks/useLessonHandlers";
import { useLessonPageHandlers } from "@/lib/hooks/useLessonPageHandlers";
import { useDuplicateDetection } from "@/lib/hooks/useDuplicateDetection";
import { useExerciseFilters } from "@/lib/hooks/useExerciseFilters";
import { useHiddenExercises } from "@/lib/hooks/useHiddenExercises";
import { CEFRLevel } from "@/lib/models/cefr";
import { useBatchSelection } from "@/lib/hooks/useBatchSelection";
import {
  ExerciseWithOverrideMetadata,
  CreateExerciseOverrideInput,
} from "@/lib/models/exerciseOverride";

import { useExerciseInteractions } from "@/lib/hooks/useExerciseInteractions";

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();
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

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    difficulty: "all",
    status: "all",
    hasDiscussion: "all",
  });

  // Filter exercises based on filters
  const filteredExercises = useExerciseFilters(lesson, filters);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Answer Hub 📝"
          subtitle="Loading lesson..."
          backButton={{
            label: "Back to Lessons",
            onClick: () => router.push("/dashboard/student/answer-hub"),
          }}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <CatLoader message="Loading lesson exercises..." size="md" />
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Answer Hub 📝"
          subtitle="Lesson not found"
          backButton={{
            label: "Back to Lessons",
            onClick: () => router.push("/dashboard/student/answer-hub"),
          }}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="bg-white border border-red-200 rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Lesson Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              {error ||
                `Could not find Lektion ${lessonNumber} for ${level} ${bookType}`}
            </p>
            <Link
              href="/dashboard/student/answer-hub"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Lessons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const exerciseCount = lesson?.exercises.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
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
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Teacher Controls */}
        {isTeacher && (
          <TeacherControls
            hasOverrides={hasOverrides}
            overrideCount={overrideCount}
            onCreateExercise={handleCreateExercise}
          />
        )}

        {/* Filters */}
        {exerciseCount > 0 && (
          <div className="mb-6">
            <ExerciseFilters
              filters={filters}
              onFilterChange={setFilters}
              totalCount={exerciseCount}
              filteredCount={filteredExercises.length}
            />
          </div>
        )}

        {/* Exercises List */}
        {exerciseCount > 0 ? (
          filteredExercises.length > 0 ? (
            <ExerciseListSection
              filteredExercises={filteredExercises}
              levelBook={levelBook}
              lessonId={lessonId}
              isTeacher={isTeacher}
              duplicateExerciseIds={duplicateExerciseIds}
              visibleDuplicateIds={visibleDuplicateIds}
              interactionStats={interactions}
              discussionStats={discussions}
              onReorder={handleReorder}
              onEditExercise={handleEditExercise}
              onToggleHide={handleToggleHide}
              onReorderSections={isTeacher ? handleReorderSections : undefined}
              onAddToSection={isTeacher ? handleAddToSection : undefined}
              onSaveInlineExercise={
                isTeacher ? handleSaveInlineExercise : undefined
              }
              onCancelInlineExercise={
                isTeacher ? handleCancelInlineExercise : undefined
              }
              editingSectionName={editingSectionName}
              onSaveInlineEdit={isTeacher ? handleSaveInlineEdit : undefined}
              onCancelInlineEdit={
                isTeacher ? handleCancelInlineEdit : undefined
              }
              editingExerciseId={editingExerciseId}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Exercises Match Your Filters
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    difficulty: "all",
                    status: "all",
                    hasDiscussion: "all",
                  })
                }
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Exercises Yet
            </h3>
            <p className="text-gray-600 mb-4">
              {isTeacher
                ? "Get started by creating your first custom exercise!"
                : "Exercises for this lesson will be added soon."}
            </p>
            {isTeacher && (
              <button
                onClick={handleCreateExercise}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <Plus className="w-4 h-4" />
                Create Exercise
              </button>
            )}
          </div>
        )}
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
