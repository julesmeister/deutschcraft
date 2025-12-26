/**
 * Exercise List Section - Groups and renders exercises by section
 * Handles both teacher (draggable) and student (static) views
 */

'use client';

import { CategoryList } from '@/components/ui/CategoryList';
import { DraggableExerciseList } from './DraggableExerciseList';
import { ExerciseListCard } from './ExerciseListCard';
import { ExerciseWithOverrideMetadata } from '@/lib/models/exerciseOverride';
import { CARD_COLOR_SCHEMES } from '@/lib/constants/answerHubColors';

interface ExerciseListSectionProps {
  filteredExercises: ExerciseWithOverrideMetadata[];
  levelBook: string;
  lessonId: string;
  isTeacher: boolean;
  duplicateExerciseIds: Set<string>;
  onReorder: (exercises: ExerciseWithOverrideMetadata[]) => void;
  onEditExercise: (exercise: ExerciseWithOverrideMetadata) => void;
  onToggleHide: (exerciseId: string, isHidden: boolean, exerciseIndex?: number) => void;
}

export function ExerciseListSection({
  filteredExercises,
  levelBook,
  lessonId,
  isTeacher,
  duplicateExerciseIds,
  onReorder,
  onEditExercise,
  onToggleHide,
}: ExerciseListSectionProps) {
  // Group exercises by section and track global indices
  const exercisesBySection: Record<string, Array<{ exercise: ExerciseWithOverrideMetadata; globalIndex: number }>> = {};
  filteredExercises.forEach((ex, globalIndex) => {
    const section = ex.section || 'Übungen';
    if (!exercisesBySection[section]) {
      exercisesBySection[section] = [];
    }
    exercisesBySection[section].push({ exercise: ex, globalIndex });
  });

  const sections = Object.keys(exercisesBySection);
  let colorIndex = 0;

  // Transform into CategoryList format
  const categories = sections.map((section) => {
    const sectionExercises = exercisesBySection[section].map(item => item.exercise);

    // Render exercises differently for teachers vs students
    const items = isTeacher ? (
      <DraggableExerciseList
        exercises={sectionExercises}
        onReorder={onReorder}
        onEdit={onEditExercise}
        onToggleHide={(exerciseId, isHidden) => {
          // Find global index for this exercise
          const item = exercisesBySection[section].find(item => item.exercise.exerciseId === exerciseId);
          onToggleHide(exerciseId, isHidden, item?.globalIndex);
        }}
        isTeacher={true}
        renderExercise={(exercise) => {
          const colorScheme = CARD_COLOR_SCHEMES[colorIndex % CARD_COLOR_SCHEMES.length];
          colorIndex++;
          // Find global index for this exercise
          const item = exercisesBySection[section].find(item => item.exercise.exerciseId === exercise.exerciseId);
          return (
            <ExerciseListCard
              exercise={exercise}
              levelBook={levelBook}
              lessonId={lessonId}
              colorScheme={colorScheme}
              isTeacher={true}
              isDraggable={true}
              isDuplicate={duplicateExerciseIds.has(exercise.exerciseId)}
              onEdit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditExercise(exercise);
              }}
              onToggleHide={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleHide(exercise.exerciseId, !exercise._isHidden, item?.globalIndex);
              }}
            />
          );
        }}
      />
    ) : (
      sectionExercises.map((exercise) => {
        const colorScheme = CARD_COLOR_SCHEMES[colorIndex % CARD_COLOR_SCHEMES.length];
        colorIndex++;
        return (
          <ExerciseListCard
            key={exercise.exerciseId}
            exercise={exercise}
            levelBook={levelBook}
            lessonId={lessonId}
            colorScheme={colorScheme}
          />
        );
      })
    );

    return {
      key: section,
      header: section,
      items: [items], // Wrap in array for CategoryList
    };
  });

  return <CategoryList categories={categories} />;
}
