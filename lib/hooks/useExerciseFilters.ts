/**
 * Hook for filtering exercises based on search and criteria
 */

import { useMemo } from 'react';
import { Lesson } from '../models/exercises';
import { ExerciseWithOverrideMetadata } from '../models/exerciseOverride';
import { FilterState } from '@/components/answer-hub/ExerciseFilters';

/**
 * Filters exercises based on search term and difficulty
 *
 * @param lesson - The lesson containing exercises
 * @param filters - The filter criteria (search, difficulty, etc.)
 * @returns Filtered exercises array
 */
export function useExerciseFilters(
  lesson: Lesson | null,
  filters: FilterState
): ExerciseWithOverrideMetadata[] {
  return useMemo(() => {
    if (!lesson) return [];

    return lesson.exercises.filter((exercise) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesNumber = exercise.exerciseNumber.toLowerCase().includes(searchLower);
        const matchesTitle = exercise.title?.toLowerCase().includes(searchLower);
        const matchesQuestion = exercise.question?.toLowerCase().includes(searchLower);
        if (!matchesNumber && !matchesTitle && !matchesQuestion) {
          return false;
        }
      }

      // Difficulty filter
      if (filters.difficulty !== 'all' && exercise.difficulty !== filters.difficulty) {
        return false;
      }

      return true;
    });
  }, [lesson, filters]);
}
