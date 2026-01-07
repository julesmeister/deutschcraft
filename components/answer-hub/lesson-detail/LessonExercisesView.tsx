"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExerciseFilters,
  FilterState,
} from "@/components/answer-hub/ExerciseFilters";
import { ExerciseListSection } from "@/components/answer-hub/ExerciseListSection";
import { TeacherControls } from "@/components/answer-hub/TeacherControls";
import { FloatingExerciseNavigator } from "@/components/answer-hub/FloatingExerciseNavigator";
import { LessonEmptyState } from "./LessonEmptyState";
import { useExerciseFilters } from "@/lib/hooks/useExerciseFilters";
import {
  ExerciseWithOverrideMetadata,
  CreateExerciseOverrideInput,
} from "@/lib/models/exerciseOverride";
import { Lesson } from "@/lib/models/exercises";

interface LessonExercisesViewProps {
  lesson: { exercises: ExerciseWithOverrideMetadata[] } | null;
  isTeacher: boolean;
  levelBook: string;
  lessonId: string;

  // Stats
  interactions: any;
  discussions: any;
  teacherInteractions: any;
  answerCount: number;

  // Overrides info
  hasOverrides: boolean;
  overrideCount: number;

  // Handlers
  handlers: {
    onCreateExercise: () => void;
    onReorder: (exercises: ExerciseWithOverrideMetadata[]) => void;
    onEditExercise: (
      exercise: ExerciseWithOverrideMetadata,
      globalIndex?: number
    ) => void;
    onToggleHide: (
      exerciseId: string,
      isHidden: boolean,
      exerciseIndex?: number
    ) => void;
    onReorderSections?: (sectionOrder: string[]) => void;
    onAddToSection?: (sectionName: string) => void;
    onSaveInlineExercise?: (data: CreateExerciseOverrideInput) => Promise<void>;
    onCancelInlineExercise?: () => void;
    onSaveInlineEdit?: (data: CreateExerciseOverrideInput) => Promise<void>;
    onCancelInlineEdit?: () => void;
  };

  // Inline Edit State
  editingState: {
    sectionName: string | null;
    exerciseId: string | null;
  };

  // Duplicate info
  duplicateInfo: {
    ids: Set<string>;
    visibleIds: Set<string>;
  };
}

export function LessonExercisesView({
  lesson,
  isTeacher,
  levelBook,
  lessonId,
  interactions,
  discussions,
  teacherInteractions,
  answerCount,
  hasOverrides,
  overrideCount,
  handlers,
  editingState,
  duplicateInfo,
}: LessonExercisesViewProps) {
  const router = useRouter();

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    difficulty: "all",
    status: "all",
    hasDiscussion: "all",
  });

  // Filter exercises based on filters
  const filteredExercises = useExerciseFilters(lesson as Lesson, filters);

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

  const exerciseCount = lesson?.exercises.length || 0;

  if (exerciseCount === 0) {
    return (
      <LessonEmptyState
        type="no-exercises"
        isTeacher={isTeacher}
        onCreateExercise={handlers.onCreateExercise}
      />
    );
  }

  return (
    <>
      {/* Teacher Controls */}
      {isTeacher && (
        <div className="animate-slide-up animation-delay-100">
          <TeacherControls
            hasOverrides={hasOverrides}
            overrideCount={overrideCount}
            onCreateExercise={handlers.onCreateExercise}
            answerCount={answerCount}
            onViewAllAnswers={() =>
              router.push(
                `/dashboard/student/answer-hub/${levelBook}/${lessonId}/summary`
              )
            }
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 animate-slide-up animation-delay-100">
        <ExerciseFilters
          filters={filters}
          onFilterChange={setFilters}
          totalCount={exerciseCount}
          filteredCount={filteredExercises.length}
        />
      </div>

      {/* Exercises List */}
      {filteredExercises.length > 0 ? (
        <>
          {/* Floating Navigator */}
          <FloatingExerciseNavigator
            exercises={filteredExercises}
            onScrollToExercise={scrollToExercise}
            interactions={isTeacher ? teacherInteractions : interactions}
          />
          <div className="animate-fade-in-up animation-delay-200">
            <ExerciseListSection
              filteredExercises={filteredExercises}
              levelBook={levelBook}
              lessonId={lessonId}
              isTeacher={isTeacher}
              duplicateExerciseIds={duplicateInfo.ids}
              visibleDuplicateIds={duplicateInfo.visibleIds}
              interactionStats={interactions}
              discussionStats={discussions}
              onReorder={handlers.onReorder}
              onEditExercise={handlers.onEditExercise}
              onToggleHide={handlers.onToggleHide}
              onReorderSections={handlers.onReorderSections}
              onAddToSection={handlers.onAddToSection}
              onSaveInlineExercise={handlers.onSaveInlineExercise}
              onCancelInlineExercise={handlers.onCancelInlineExercise}
              editingSectionName={editingState.sectionName}
              onSaveInlineEdit={handlers.onSaveInlineEdit}
              onCancelInlineEdit={handlers.onCancelInlineEdit}
              editingExerciseId={editingState.exerciseId}
            />
          </div>
        </>
      ) : (
        <LessonEmptyState
          type="no-matches"
          onClearFilters={() =>
            setFilters({
              search: "",
              difficulty: "all",
              status: "all",
              hasDiscussion: "all",
            })
          }
        />
      )}
    </>
  );
}
