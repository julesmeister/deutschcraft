/**
 * Exercise Data Loading Hook
 * Loads Schritte exercise data from JSON files
 */

import { useMemo } from 'react';
import { CEFRLevel } from '@/lib/models/cefr';
import { ExerciseBook, Lesson } from '@/lib/models/exercises';

// Import exercise data files
import a11AB from '@/lib/data/exercises/a1-1-arbeitsbuch.json';
// import a12AB from '@/lib/data/exercises/a1-2-arbeitsbuch.json';
// import a21AB from '@/lib/data/exercises/a2-1-arbeitsbuch.json';
// TODO: Add more imports as JSON files are created

/**
 * Map of exercise data by level-sublevel-bookType
 * Key format: "A1-1-AB", "A1-2-AB", etc.
 */
const exerciseDataMap: Record<string, ExerciseBook> = {
  'A1-1-AB': a11AB as ExerciseBook,
  // 'A1-2-AB': a12AB as ExerciseBook,
  // 'A2-1-AB': a21AB as ExerciseBook,
  // TODO: Add more mappings as files are created
};

/**
 * Get exercise book key for data map lookup
 */
function getExerciseBookKey(
  level: CEFRLevel,
  subLevel: '1' | '2',
  bookType: 'AB' | 'KB'
): string {
  return `${level}-${subLevel}-${bookType}`;
}

/**
 * Get sub-level from CEFRLevel
 * A1, B1, C1 → '1'
 * A2, B2, C2 → '2'
 */
function getSubLevel(level: CEFRLevel): '1' | '2' {
  // Check if level ends with '1' or '2'
  const levelStr = level.toString();
  if (levelStr.endsWith('1')) return '1';
  if (levelStr.endsWith('2')) return '2';

  // For levels without sub-level (shouldn't happen), default to '1'
  return '1';
}

/**
 * Hook: Load exercise data for a specific level and book type
 */
export function useExercises(
  level: CEFRLevel,
  bookType: 'AB' | 'KB' = 'AB'
): {
  exerciseBook: ExerciseBook | null;
  lessons: Lesson[];
  isLoading: boolean;
  error: string | null;
} {
  const result = useMemo(() => {
    try {
      // Determine sub-level from CEFR level
      const subLevel = getSubLevel(level);

      // Build key for data map
      const bookKey = getExerciseBookKey(level, subLevel, bookType);

      // Lookup exercise book
      const book = exerciseDataMap[bookKey];

      if (!book) {
        return {
          exerciseBook: null,
          lessons: [],
          isLoading: false,
          error: `No exercises available for ${level} ${bookType}`,
        };
      }

      return {
        exerciseBook: book,
        lessons: book.lessons || [],
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error('[useExercises] Error loading exercises:', error);
      return {
        exerciseBook: null,
        lessons: [],
        isLoading: false,
        error: 'Failed to load exercise data',
      };
    }
  }, [level, bookType]);

  return result;
}

/**
 * Hook: Get all available exercise book keys
 */
export function useAvailableExerciseBooks(): string[] {
  return useMemo(() => Object.keys(exerciseDataMap), []);
}

/**
 * Hook: Check if exercise data exists for a level/bookType
 */
export function useHasExercises(level: CEFRLevel, bookType: 'AB' | 'KB' = 'AB'): boolean {
  return useMemo(() => {
    const subLevel = getSubLevel(level);
    const bookKey = getExerciseBookKey(level, subLevel, bookType);
    return bookKey in exerciseDataMap;
  }, [level, bookType]);
}
