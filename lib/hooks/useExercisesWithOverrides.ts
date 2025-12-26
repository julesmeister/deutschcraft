/**
 * Combined hook: Merges JSON exercises with teacher overrides
 *
 * This hook provides the final exercise list that students and teachers see,
 * combining base exercises from JSON files with teacher customizations from Firestore.
 *
 * For students: Loads their teacher's overrides and merges them
 * For teachers: Loads their own overrides and merges them
 */

import { useMemo } from 'react';
import { useExercises } from './useExercises';
import { useTeacherOverrides } from './useExerciseOverrides';
import { useCurrentStudent } from './useUsers';
import { CEFRLevel } from '../models/cefr';
import {
  Exercise,
  ExerciseBook,
  Lesson,
} from '../models/exercises';
import {
  ExerciseOverride,
  ExerciseWithOverrideMetadata,
} from '../models/exerciseOverride';

// ============================================================================
// MERGING ALGORITHM
// ============================================================================

/**
 * Merge JSON exercises with teacher overrides
 * Priority: Teacher overrides > JSON base data
 *
 * Algorithm:
 * 1. Filter out hidden exercises
 * 2. Apply modifications to existing exercises
 * 3. Add newly created exercises
 * 4. Sort by custom display order
 * 5. Mark exercises with metadata flags
 */
function mergeExercisesWithOverrides(
  jsonExercises: Exercise[],
  overrides: ExerciseOverride[]
): ExerciseWithOverrideMetadata[] {
  console.log('🔄 MERGE CALLED');
  console.log('Overrides:', overrides.length);

  // Step 1: Filter out hidden exercises
  const hideOverrides = overrides.filter(o => o.overrideType === 'hide' && o.isHidden);
  console.log('Hide overrides:', hideOverrides);

  // Build set of hidden exercise IDs (extract base ID from duplicates)
  const hiddenIds = new Set(
    hideOverrides.map(o => {
      // For duplicates like "L2-B2_dup0", extract base ID "L2-B2"
      const baseId = o.exerciseId.replace(/_dup\d+$/, '');
      console.log(`Hiding: ${o.exerciseId} → base: ${baseId}`);
      return o.exerciseId; // Keep the full unique ID for now
    })
  );
  console.log('Hidden IDs:', Array.from(hiddenIds));

  // Track which duplicate occurrence to hide (for exercises with _dup suffix)
  const hiddenDuplicates = new Map<string, Set<number>>();
  hideOverrides.forEach(o => {
    const match = o.exerciseId.match(/^(.+)_dup(\d+)$/);
    if (match) {
      const [_, baseId, dupIndex] = match;
      if (!hiddenDuplicates.has(baseId)) {
        hiddenDuplicates.set(baseId, new Set());
      }
      hiddenDuplicates.get(baseId)!.add(parseInt(dupIndex));
    }
  });

  // Track occurrence index for each exerciseId as we filter
  const occurrenceMap = new Map<string, number>();

  let exercises: ExerciseWithOverrideMetadata[] = jsonExercises
    .filter((ex, index) => {
      // Track which occurrence this is
      const currentOccurrence = occurrenceMap.get(ex.exerciseId) || 0;
      occurrenceMap.set(ex.exerciseId, currentOccurrence + 1);

      // Check if this specific occurrence should be hidden
      const isDuplicateHidden = hiddenDuplicates.has(ex.exerciseId) &&
                                hiddenDuplicates.get(ex.exerciseId)!.has(currentOccurrence);

      // Check if the whole exercise ID is hidden (non-duplicate case)
      const isDirectlyHidden = hiddenIds.has(ex.exerciseId);

      const isHidden = isDuplicateHidden || isDirectlyHidden;

      if (isHidden) {
        console.log(`🚫 Filtering out: ${ex.exerciseId} (occurrence ${currentOccurrence})`);
      }
      return !isHidden;
    })
    .map(ex => ({ ...ex })); // Clone to avoid mutations

  console.log('Exercises after hiding:', exercises.length);

  // Step 2: Apply modifications to existing exercises
  const modificationMap = new Map(
    overrides
      .filter(o => o.overrideType === 'modify' && o.modifications)
      .map(o => [o.exerciseId, o])
  );

  exercises = exercises.map(ex => {
    const override = modificationMap.get(ex.exerciseId);
    if (override?.modifications) {
      return {
        ...ex,
        ...override.modifications,
        _isModified: true, // Mark as modified for UI badges
        _displayOrder: override.displayOrder,
      };
    }
    return ex;
  });

  // Step 3: Add newly created exercises
  const createdExercises: ExerciseWithOverrideMetadata[] = overrides
    .filter(o => o.overrideType === 'create' && o.exerciseData)
    .map(o => ({
      ...o.exerciseData!,
      exerciseId: o.exerciseId,
      _isCreated: true, // Mark as created for UI badges
      _displayOrder: o.displayOrder,
    }));

  exercises = [...exercises, ...createdExercises];

  // Step 4: Apply custom ordering
  const orderMap = new Map(
    overrides
      .filter(o => o.displayOrder !== undefined)
      .map(o => [o.exerciseId, o.displayOrder!])
  );

  exercises.sort((a, b) => {
    const orderA = orderMap.get(a.exerciseId) ?? 9999;
    const orderB = orderMap.get(b.exerciseId) ?? 9999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Fallback to original exercise number
    return a.exerciseNumber.localeCompare(b.exerciseNumber);
  });

  return exercises;
}

// ============================================================================
// HOOK
// ============================================================================

export interface UseExercisesWithOverridesResult {
  exerciseBook: ExerciseBook | null;
  lessons: Lesson[];
  isLoading: boolean;
  error: Error | null;
  hasOverrides: boolean;
  overrideCount: number;
}

/**
 * Get exercises with teacher overrides applied
 *
 * @param level - CEFR level (A1, B1, etc.)
 * @param bookType - Book type (AB or KB)
 * @param lessonNumber - Optional lesson number filter for overrides
 * @param userEmail - Optional user email (defaults to current user)
 * @returns Merged exercises with overrides applied
 */
export function useExercisesWithOverrides(
  level: CEFRLevel,
  bookType: 'AB' | 'KB',
  lessonNumber?: number,
  userEmail?: string | null
): UseExercisesWithOverridesResult {
  // Get current user to determine teacher
  const { student: currentUser } = useCurrentStudent(userEmail);

  // Get base JSON exercises
  const { exerciseBook, lessons, isLoading: jsonLoading, error } = useExercises(level, bookType);

  // Determine teacher email
  // - If current user is a student, use their assigned teacherId
  // - If current user is a teacher, use their own email
  // - If no user, don't load overrides
  const teacherEmail = currentUser?.role === 'STUDENT'
    ? currentUser.teacherId
    : currentUser?.role === 'TEACHER'
    ? currentUser.email
    : undefined;

  // Get teacher overrides
  const { overrides, isLoading: overridesLoading } = useTeacherOverrides(
    teacherEmail,
    level,
    lessonNumber
  );

  // Merge exercises with overrides
  const mergedLessons = useMemo(() => {
    if (!lessons || !overrides) return lessons || [];

    return lessons.map(lesson => {
      // Filter overrides for this specific lesson
      // Check both direct lessonNumber field (for hide/modify overrides) AND exerciseData.lessonNumber (for create overrides)
      const lessonOverrides = overrides.filter(
        o => o.lessonNumber === lesson.lessonNumber || o.exerciseData?.lessonNumber === lesson.lessonNumber
      );

      // Merge exercises
      const mergedExercises = mergeExercisesWithOverrides(
        lesson.exercises,
        lessonOverrides
      );

      return {
        ...lesson,
        exercises: mergedExercises,
      };
    });
  }, [lessons, overrides]);

  return {
    exerciseBook,
    lessons: mergedLessons,
    isLoading: jsonLoading || overridesLoading,
    error,
    hasOverrides: (overrides?.length ?? 0) > 0,
    overrideCount: overrides?.length ?? 0,
  };
}

/**
 * Get a single lesson with overrides applied
 * Convenience wrapper for lesson detail pages
 */
export function useLessonWithOverrides(
  level: CEFRLevel,
  bookType: 'AB' | 'KB',
  lessonNumber: number,
  userEmail?: string | null
) {
  const result = useExercisesWithOverrides(level, bookType, lessonNumber, userEmail);

  const lesson = useMemo(() => {
    return result.lessons.find(l => l.lessonNumber === lessonNumber) || null;
  }, [result.lessons, lessonNumber]);

  return {
    ...result,
    lesson,
  };
}
