/**
 * Hook for managing hidden exercises modal and data
 */

import { useState, useMemo } from 'react';
import { useTeacherOverrides } from './useExerciseOverrides';
import { CEFRLevel } from '../models/cefr';

export interface HiddenExercise {
  exerciseId: string;
  overrideId: string;
}

export interface UseHiddenExercisesResult {
  hiddenExercises: HiddenExercise[];
  isHiddenModalOpen: boolean;
  openHiddenModal: () => void;
  closeHiddenModal: () => void;
}

/**
 * Manages hidden exercises modal and retrieves hidden exercise data
 *
 * @param isTeacher - Whether the current user is a teacher
 * @param userEmail - The user's email
 * @param level - CEFR level
 * @param lessonNumber - The lesson number
 * @returns Hidden exercises data and modal controls
 */
export function useHiddenExercises(
  isTeacher: boolean,
  userEmail: string | null,
  level: CEFRLevel,
  lessonNumber: number
): UseHiddenExercisesResult {
  const [isHiddenModalOpen, setIsHiddenModalOpen] = useState(false);

  // Get hidden exercises from overrides
  const { overrides: allOverrides } = useTeacherOverrides(
    isTeacher ? userEmail : undefined,
    level,
    lessonNumber
  );

  const hiddenExercises = useMemo(() => {
    if (!allOverrides) return [];
    return allOverrides
      .filter(o => o.overrideType === 'hide' && o.isHidden)
      .map(o => ({
        exerciseId: o.exerciseId,
        overrideId: o.overrideId,
      }));
  }, [allOverrides]);

  return {
    hiddenExercises,
    isHiddenModalOpen,
    openHiddenModal: () => setIsHiddenModalOpen(true),
    closeHiddenModal: () => setIsHiddenModalOpen(false),
  };
}
