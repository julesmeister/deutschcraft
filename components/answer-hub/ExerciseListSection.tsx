/**
 * Exercise List Section - Groups and renders exercises by section
 * Handles both teacher (draggable) and student (static) views
 */

'use client';

import { CategoryList } from '@/components/ui/CategoryList';
import { DraggableExerciseList } from './DraggableExerciseList';
import { ExerciseListCard } from './ExerciseListCard';
import { InlineEditableExerciseCard } from './InlineEditableExerciseCard';
import { ExerciseWithOverrideMetadata, CreateExerciseOverrideInput } from '@/lib/models/exerciseOverride';
import { CARD_COLOR_SCHEMES } from '@/lib/constants/answerHubColors';

interface ExerciseListSectionProps {
  filteredExercises: ExerciseWithOverrideMetadata[];
  levelBook: string;
  lessonId: string;
  isTeacher: boolean;
  duplicateExerciseIds: Set<string>;
  visibleDuplicateIds: Set<string>;
  interactionStats?: Record<string, { submissionCount: number; lastSubmittedAt: number }>;
  onReorder: (exercises: ExerciseWithOverrideMetadata[]) => void;
  onEditExercise: (exercise: ExerciseWithOverrideMetadata, globalIndex?: number) => void;
  onToggleHide: (exerciseId: string, isHidden: boolean, exerciseIndex?: number) => void;
  onReorderSections?: (sectionOrder: string[]) => void;
  onAddToSection?: (sectionName: string) => void;
  onSaveInlineExercise?: (data: CreateExerciseOverrideInput) => Promise<void>;
  onCancelInlineExercise?: () => void;
  editingSectionName?: string | null;
  onSaveInlineEdit?: (data: CreateExerciseOverrideInput) => Promise<void>;
  onCancelInlineEdit?: () => void;
  editingExerciseId?: string | null;
}

export function ExerciseListSection({
  filteredExercises,
  levelBook,
  lessonId,
  isTeacher,
  duplicateExerciseIds,
  visibleDuplicateIds,
  interactionStats,
  onReorder,
  onEditExercise,
  onToggleHide,
  onReorderSections,
  onAddToSection,
  onSaveInlineExercise,
  onCancelInlineExercise,
  editingSectionName,
  onSaveInlineEdit,
  onCancelInlineEdit,
  editingExerciseId,
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

  // Section reorder handlers
  const handleMoveSectionUp = (index: number) => {
    if (index === 0 || !onReorderSections) return;
    const newOrder = [...sections];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorderSections(newOrder);
  };

  const handleMoveSectionDown = (index: number) => {
    if (index === sections.length - 1 || !onReorderSections) return;
    const newOrder = [...sections];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorderSections(newOrder);
  };

  // Transform into CategoryList format
  const categories = sections.map((section) => {
    const sectionExercises = exercisesBySection[section].map(item => item.exercise);

    // Render exercises differently for teachers vs students
    const exerciseItems = isTeacher ? (
      <DraggableExerciseList
        exercises={sectionExercises}
        onReorder={onReorder}
        onEdit={onEditExercise}
        onToggleHide={(exerciseId, isHidden, sectionIndex) => {
          // Use the section index to get the correct globalIndex for duplicates
          const item = sectionIndex !== undefined ? exercisesBySection[section][sectionIndex] : undefined;
          onToggleHide(exerciseId, isHidden, item?.globalIndex);
        }}
        isTeacher={true}
        renderExercise={(exercise, sectionIndex) => {
          const colorScheme = CARD_COLOR_SCHEMES[colorIndex % CARD_COLOR_SCHEMES.length];
          colorIndex++;

          // Use section index to get correct globalIndex for duplicates
          const item = sectionIndex !== undefined ? exercisesBySection[section][sectionIndex] : undefined;
          const globalIndex = item?.globalIndex;

          // Check if this specific exercise instance is being edited
          const uniqueKey = globalIndex !== undefined
            ? `${exercise.exerciseId}-${globalIndex}`
            : exercise.exerciseId;
          const isBeingEdited = editingExerciseId === uniqueKey;

          if (isBeingEdited && onSaveInlineEdit && onCancelInlineEdit) {
            return (
              <InlineEditableExerciseCard
                initialData={{
                  exerciseId: exercise.exerciseId,
                  exerciseNumber: exercise.exerciseNumber,
                  question: exercise.question,
                  section: exercise.section,
                  answers: exercise.answers,
                  difficulty: exercise.difficulty,
                }}
                sectionName={exercise.section || 'Übungen'}
                onSave={onSaveInlineEdit}
                onCancel={onCancelInlineEdit}
                colorScheme={colorScheme}
              />
            );
          }

          return (
            <ExerciseListCard
              exercise={exercise}
              levelBook={levelBook}
              lessonId={lessonId}
              colorScheme={colorScheme}
              isTeacher={true}
              isDraggable={true}
              isDuplicate={visibleDuplicateIds.has(exercise.exerciseId)}
              interactionStats={interactionStats ? {
                hasInteracted: !!interactionStats[exercise.exerciseId],
                submissionCount: interactionStats[exercise.exerciseId]?.submissionCount || 0,
                lastSubmittedAt: interactionStats[exercise.exerciseId]?.lastSubmittedAt
              } : undefined}
              onEdit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditExercise(exercise, globalIndex);
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
      sectionExercises.map((exercise, index) => {
        const colorScheme = CARD_COLOR_SCHEMES[colorIndex % CARD_COLOR_SCHEMES.length];
        colorIndex++;
        return (
          <ExerciseListCard
            key={`${exercise.exerciseId}-${index}`}
            exercise={exercise}
            levelBook={levelBook}
            lessonId={lessonId}
            colorScheme={colorScheme}
            interactionStats={interactionStats ? {
              hasInteracted: !!interactionStats[exercise.exerciseId],
              submissionCount: interactionStats[exercise.exerciseId]?.submissionCount || 0,
              lastSubmittedAt: interactionStats[exercise.exerciseId]?.lastSubmittedAt
            } : undefined}
          />
        );
      })
    );

    // Build items array (exercises + optional inline editor)
    const items: any[] = [exerciseItems];

    // Add inline editable card if this section is being edited
    if (editingSectionName === section && onSaveInlineExercise && onCancelInlineExercise) {
      const colorScheme = CARD_COLOR_SCHEMES[colorIndex % CARD_COLOR_SCHEMES.length];
      items.push(
        <InlineEditableExerciseCard
          key="inline-editor"
          sectionName={section}
          onSave={onSaveInlineExercise}
          onCancel={onCancelInlineExercise}
          colorScheme={colorScheme}
        />
      );
    }

    return {
      key: section,
      header: section,
      items: items,
    };
  });

  const handleAddToSection = (_sectionIndex: number, sectionName: string) => {
    if (onAddToSection) {
      onAddToSection(sectionName);
    }
  };

  return (
    <CategoryList
      categories={categories}
      onMoveSectionUp={isTeacher && onReorderSections ? handleMoveSectionUp : undefined}
      onMoveSectionDown={isTeacher && onReorderSections ? handleMoveSectionDown : undefined}
      onAddToSection={isTeacher && onAddToSection ? handleAddToSection : undefined}
    />
  );
}
