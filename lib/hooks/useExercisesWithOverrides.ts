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
 * 1. Mark hidden exercises with _isHidden metadata (DON'T remove them)
 * 2. Apply modifications to existing exercises
 * 3. Add newly created exercises
 * 4. Sort by custom display order
 * 5. Mark exercises with metadata flags
 */
function mergeExercisesWithOverrides(
  jsonExercises: Exercise[],
  overrides: ExerciseOverride[],
  isTeacherView: boolean = false
): ExerciseWithOverrideMetadata[] {
  // First, tag each exercise with its original JSON index for stable identification
  const exercisesWithIndex = jsonExercises.map((ex, idx) => ({
    ...ex,
    _originalIndex: idx,
  }));
  // Step 1: Mark hidden exercises with metadata
  const hideOverrides = overrides.filter(o => o.overrideType === 'hide' && o.isHidden);

  // Build set of hidden exercise IDs (extract base ID from duplicates)
  const hiddenIds = new Set(
    hideOverrides.map(o => {
      // For duplicates like "L2-B2_dup0", extract base ID "L2-B2"
      return o.exerciseId; // Keep the full unique ID for now
    })
  );

  // Track which duplicate occurrence to hide (for exercises with _at suffix)
  const hiddenDuplicates = new Map<string, Set<number>>();
  hideOverrides.forEach(o => {
    const match = o.exerciseId.match(/^(.+)_at(\d+)$/);
    if (match) {
      const [_, baseId, originalIndex] = match;
      if (!hiddenDuplicates.has(baseId)) {
        hiddenDuplicates.set(baseId, new Set());
      }
      hiddenDuplicates.get(baseId)!.add(parseInt(originalIndex));
    }
  });

  let exercises: ExerciseWithOverrideMetadata[] = exercisesWithIndex
    .map((ex) => {
      // Check if this specific occurrence should be hidden (using original index)
      const isDuplicateHidden = hiddenDuplicates.has(ex.exerciseId) &&
                                hiddenDuplicates.get(ex.exerciseId)!.has(ex._originalIndex);

      // Check if the whole exercise ID is hidden (non-duplicate case)
      const isDirectlyHidden = hiddenIds.has(ex.exerciseId);

      const isHidden = isDuplicateHidden || isDirectlyHidden;

      // Clone and add _isHidden metadata
      return {
        ...ex,
        _isHidden: isHidden,
      };
    })
    // For students, filter out hidden exercises
    // For teachers, keep them visible (just marked)
    .filter(ex => isTeacherView || !ex._isHidden);

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
  // Build order map with both base IDs and duplicate IDs
  const orderMap = new Map(
    overrides
      .filter(o => o.displayOrder !== undefined)
      .map(o => [o.exerciseId, o.displayOrder!])
  );

  // Build a lookup map from original index to occurrence index for fallback
  // This handles old _dup{occurrenceIndex} overrides in the database
  const originalIndexToOccurrence = new Map<number, number>();
  const occurrenceCounter = new Map<string, number>();
  exercises.forEach((ex) => {
    const exWithIndex = ex as any;
    if (exWithIndex._originalIndex !== undefined) {
      const currentCount = occurrenceCounter.get(ex.exerciseId) || 0;
      originalIndexToOccurrence.set(exWithIndex._originalIndex, currentCount);
      occurrenceCounter.set(ex.exerciseId, currentCount + 1);
    }
  });

  // Debug logging for L8 only
  const isL8 = exercises.length > 0 && exercises[0].exerciseId?.includes('L8');
  if (isL8 && orderMap.size > 0) {
    console.log("[Sort L8] Order map size:", orderMap.size);
    const atKeys = Array.from(orderMap.keys()).filter(k => k.includes('_at'));
    if (atKeys.length > 0) {
      console.log("[Sort L8] Found", atKeys.length, "_at keys in order map");
      console.log("[Sort L8] Sample _at keys:", Array.from(orderMap.entries())
        .filter(([k, v]) => k.includes('_at'))
        .slice(0, 3)
        .map(([k, v]) => `${k}=${v}`));
    }
    console.log("[Sort L8] Before sort:", exercises.slice(0, 5).map(e => {
      const ex = e as any;
      return `${e.exerciseId}@${ex._originalIndex}`;
    }));

    // Show what displayOrders will be found for first 5 exercises
    console.log("[Sort L8] Display orders for first 5:");
    exercises.slice(0, 5).forEach((e, idx) => {
      const ex = e as any;
      let order = orderMap.get(e.exerciseId);
      let source = "base";
      if (order === undefined && ex._originalIndex !== undefined) {
        const atKey = `${e.exerciseId}_at${ex._originalIndex}`;
        order = orderMap.get(atKey);
        if (order !== undefined) source = `_at${ex._originalIndex}`;
      }
      order = order ?? 9999;
      console.log(`  [${idx}] ${e.exerciseId}@${ex._originalIndex} -> order=${order} (${source})`);
    });
  }

  exercises.sort((a, b) => {
    const aWithIndex = a as any;
    const bWithIndex = b as any;

    // CRITICAL FIX: For exercises with _originalIndex, try _at suffix FIRST
    // This ensures duplicates use their specific displayOrder, not a shared base ID order
    let orderA: number | undefined;
    let lookupKeyA = a.exerciseId;

    if (aWithIndex._originalIndex !== undefined) {
      // Try _at{originalIndex} first (new format for duplicates)
      const atKey = `${a.exerciseId}_at${aWithIndex._originalIndex}`;
      orderA = orderMap.get(atKey);
      if (orderA !== undefined) {
        lookupKeyA = atKey;
      } else {
        // Fallback to _dup{occurrenceIndex} (old format)
        const occIndex = originalIndexToOccurrence.get(aWithIndex._originalIndex);
        if (occIndex !== undefined) {
          const dupKey = `${a.exerciseId}_dup${occIndex}`;
          orderA = orderMap.get(dupKey);
          if (orderA !== undefined) lookupKeyA = dupKey;
        }
      }
    }

    // If no _at or _dup match, try base ID
    if (orderA === undefined) {
      orderA = orderMap.get(a.exerciseId);
    }
    orderA = orderA ?? 9999;

    // Same logic for B
    let orderB: number | undefined;

    if (bWithIndex._originalIndex !== undefined) {
      const atKey = `${b.exerciseId}_at${bWithIndex._originalIndex}`;
      orderB = orderMap.get(atKey);

      if (orderB === undefined) {
        const occIndex = originalIndexToOccurrence.get(bWithIndex._originalIndex);
        if (occIndex !== undefined) {
          orderB = orderMap.get(`${b.exerciseId}_dup${occIndex}`);
        }
      }
    }

    if (orderB === undefined) {
      orderB = orderMap.get(b.exerciseId);
    }
    orderB = orderB ?? 9999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Fallback to original exercise number
    return a.exerciseNumber.localeCompare(b.exerciseNumber);
  });

  if (isL8 && orderMap.size > 0) {
    console.log("[Sort L8] After sort:", exercises.slice(0, 5).map(e => {
      const ex = e as any;
      return `${e.exerciseId}@${ex._originalIndex}`;
    }));

    // Show what displayOrders were actually used after sorting
    console.log("[Sort L8] Actual display orders after sort:");
    exercises.slice(0, 5).forEach((e, idx) => {
      const ex = e as any;
      let order = orderMap.get(e.exerciseId);
      let source = "base";
      if (order === undefined && ex._originalIndex !== undefined) {
        const atKey = `${e.exerciseId}_at${ex._originalIndex}`;
        order = orderMap.get(atKey);
        if (order !== undefined) source = `_at${ex._originalIndex}`;
      }
      order = order ?? 9999;
      console.log(`  [${idx}] ${e.exerciseId}@${ex._originalIndex} -> order=${order} (${source})`);
    });
  }

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

  // Check if current view is teacher (they can see hidden exercises)
  const isTeacherView = currentUser?.role === 'TEACHER';

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

      // Merge exercises (teachers see hidden ones, students don't)
      const mergedExercises = mergeExercisesWithOverrides(
        lesson.exercises,
        lessonOverrides,
        isTeacherView
      );

      return {
        ...lesson,
        exercises: mergedExercises,
      };
    });
  }, [lessons, overrides, isTeacherView]);

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
