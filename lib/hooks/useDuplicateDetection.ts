/**
 * Hook for detecting duplicate exercises
 * Returns maps for identifying duplicates and tracking occurrence indices
 */

import { useMemo } from 'react';
import { Lesson } from '../models/exercises';

export interface DuplicateDetectionResult {
  duplicateExerciseIds: Set<string>;
  exerciseIndexMap: Map<string, number>;
  visibleDuplicateIds: Set<string>;
}

/**
 * Detects duplicate exercises in a lesson
 *
 * @param lesson - The lesson containing exercises
 * @returns Object with duplicate detection data
 */
export function useDuplicateDetection(
  lesson: Lesson | null
): DuplicateDetectionResult {
  return useMemo(() => {
    if (!lesson) {
      return {
        duplicateExerciseIds: new Set<string>(),
        exerciseIndexMap: new Map<string, number>(),
        visibleDuplicateIds: new Set<string>()
      };
    }

    const idCounts = new Map<string, number>();
    const visibleIdCounts = new Map<string, number>();
    const idIndices = new Map<string, number>();
    const indexMap = new Map<string, number>();

    lesson.exercises.forEach((ex, globalIndex) => {
      // Count ALL exercises (for exerciseIndexMap)
      const currentCount = idCounts.get(ex.exerciseId) || 0;
      idCounts.set(ex.exerciseId, currentCount + 1);

      // Track which occurrence this is (0-indexed)
      const occurrenceIndex = idIndices.get(ex.exerciseId) || 0;
      idIndices.set(ex.exerciseId, occurrenceIndex + 1);

      // Store mapping from globalIndex to occurrenceIndex
      indexMap.set(`${globalIndex}`, occurrenceIndex);

      // Count only VISIBLE exercises (for duplicate badge)
      if (!ex._isHidden) {
        const visibleCount = visibleIdCounts.get(ex.exerciseId) || 0;
        visibleIdCounts.set(ex.exerciseId, visibleCount + 1);
      }
    });

    const duplicates = new Set<string>();
    idCounts.forEach((count, id) => {
      if (count > 1) duplicates.add(id);
    });

    // Only show DUPLICATE badge if there are multiple VISIBLE instances
    const visibleDuplicates = new Set<string>();
    visibleIdCounts.forEach((count, id) => {
      if (count > 1) visibleDuplicates.add(id);
    });

    return {
      duplicateExerciseIds: duplicates,
      exerciseIndexMap: indexMap,
      visibleDuplicateIds: visibleDuplicates
    };
  }, [lesson]);
}
