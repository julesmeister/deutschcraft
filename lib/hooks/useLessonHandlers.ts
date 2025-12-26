/**
 * Custom hook for lesson page handlers
 * Manages exercise override operations (create, edit, hide, reorder)
 */

import { useState } from 'react';
import { CEFRLevel } from '../models/cefr';
import { ExerciseWithOverrideMetadata, CreateExerciseOverrideInput } from '../models/exerciseOverride';
import {
  useCreateOverride,
  useUpdateOverride,
  useReorderExercises,
} from './useExerciseOverrides';

export function useLessonHandlers(
  userEmail: string | null,
  level: CEFRLevel,
  lessonNumber: number,
  duplicateExerciseIds: Set<string>,
  exerciseIndexMap: Map<string, number>
) {
  // Dialog state
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingExercise, setEditingExercise] = useState<ExerciseWithOverrideMetadata | null>(null);

  // Mutations
  const createOverride = useCreateOverride();
  const updateOverride = useUpdateOverride();
  const reorderExercises = useReorderExercises();

  // Handle creating new exercise
  const handleCreateExercise = () => {
    setDialogMode('create');
    setEditingExercise(null);
    setIsOverrideDialogOpen(true);
  };

  // Handle editing exercise
  const handleEditExercise = (exercise: ExerciseWithOverrideMetadata) => {
    setDialogMode('edit');
    setEditingExercise(exercise);
    setIsOverrideDialogOpen(true);
  };

  // Handle hiding/unhiding exercise (with duplicate support)
  const handleToggleHide = async (exerciseId: string, isHidden: boolean, exerciseIndex?: number) => {
    if (!userEmail) {
      console.log('❌ No userEmail');
      return;
    }

    console.log('=== HIDE CLICKED ===');
    console.log('exerciseId:', exerciseId);
    console.log('isHidden:', isHidden);
    console.log('exerciseIndex:', exerciseIndex);

    // For duplicates, append occurrence index to make unique override ID
    const isDuplicate = duplicateExerciseIds.has(exerciseId);
    let uniqueExerciseId = exerciseId;

    if (isDuplicate && exerciseIndex !== undefined) {
      const occurrenceIndex = exerciseIndexMap.get(`${exerciseIndex}`) || 0;
      uniqueExerciseId = `${exerciseId}_dup${occurrenceIndex}`;
      console.log('📌 Duplicate detected, unique ID:', uniqueExerciseId);
    }

    const overrideId = `${userEmail}_${uniqueExerciseId}`;
    console.log('Override ID:', overrideId);

    try {
      // Try to update first
      console.log('Attempting update...');
      await updateOverride.mutateAsync({
        overrideId,
        updates: {
          overrideType: 'hide',
          isHidden,
          level,
          lessonNumber,
          exerciseId: uniqueExerciseId, // Store the unique ID
        },
      });
      console.log('✅ Update successful');
    } catch (error: any) {
      console.log('Update failed:', error?.message);
      // If document doesn't exist, create it
      if (error?.message?.includes('No document to update')) {
        try {
          console.log('Creating new override...');
          await createOverride.mutateAsync({
            teacherEmail: userEmail,
            override: {
              exerciseId: uniqueExerciseId, // Use unique ID for duplicates
              overrideType: 'hide',
              isHidden,
              level,
              lessonNumber,
            },
          });
          console.log('✅ Create successful');
        } catch (createError) {
          console.error('❌ Error creating hide override:', createError);
        }
      } else {
        console.error('❌ Error toggling hide:', error);
      }
    }
  };

  // Handle reordering exercises
  const handleReorder = async (reorderedExercises: ExerciseWithOverrideMetadata[]) => {
    if (!userEmail) return;

    const orderUpdates = reorderedExercises.map((ex, idx) => ({
      overrideId: `${userEmail}_${ex.exerciseId}`,
      displayOrder: idx,
      exerciseId: ex.exerciseId,
      teacherEmail: userEmail,
      level,
      lessonNumber,
    }));

    try {
      await reorderExercises.mutateAsync(orderUpdates);
    } catch (error) {
      console.error('Error reordering exercises:', error);
    }
  };

  // Handle submitting override (create or edit)
  const handleSubmitOverride = async (override: CreateExerciseOverrideInput) => {
    if (!userEmail) return;

    try {
      if (dialogMode === 'create') {
        await createOverride.mutateAsync({
          teacherEmail: userEmail,
          override,
        });
      } else if (editingExercise) {
        const overrideId = `${userEmail}_${editingExercise.exerciseId}`;
        await updateOverride.mutateAsync({
          overrideId,
          updates: override,
        });
      }

      setIsOverrideDialogOpen(false);
      setEditingExercise(null);
    } catch (error) {
      console.error('Error submitting override:', error);
    }
  };

  return {
    isOverrideDialogOpen,
    setIsOverrideDialogOpen,
    dialogMode,
    editingExercise,
    setEditingExercise,
    handleCreateExercise,
    handleEditExercise,
    handleToggleHide,
    handleReorder,
    handleSubmitOverride,
  };
}
