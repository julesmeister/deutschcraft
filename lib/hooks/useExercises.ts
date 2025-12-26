/**
 * Exercise Data Loading Hook
 * Loads Schritte exercise data from JSON files
 */

import { useMemo } from 'react';
import { CEFRLevel } from '@/lib/models/cefr';
import { ExerciseBook, Lesson } from '@/lib/models/exercises';

// Import exercise data files
import a11ABData from '@/lib/data/exercises/a1-1-arbeitsbuch.json';
import a12ABData from '@/lib/data/exercises/a1-2-arbeitsbuch.json';
import a21ABData from '@/lib/data/exercises/a2-1-arbeitsbuch.json';
import a22ABData from '@/lib/data/exercises/a2-2-arbeitsbuch.json';
import b11ABData from '@/lib/data/exercises/b1-1-arbeitsbuch.json';
import b12ABData from '@/lib/data/exercises/b1-2-arbeitsbuch.json';
// TODO: Add more imports as JSON files are created

const a11AB = a11ABData as unknown as ExerciseBook;
const a12AB = a12ABData as unknown as ExerciseBook;
const a21AB = a21ABData as unknown as ExerciseBook;
const a22AB = a22ABData as unknown as ExerciseBook;
const b11AB = b11ABData as unknown as ExerciseBook;
const b12AB = b12ABData as unknown as ExerciseBook;

/**
 * Map of exercise data by level-sublevel-bookType
 * Key format: "A1-1-AB", "A1-2-AB", "A1-1-UP", etc.
 */
const exerciseDataMap: Record<string, ExerciseBook> = {
  'A1-1-AB': a11AB,
  'A1-2-AB': a12AB,
  'A2-1-AB': a21AB,
  'A2-2-AB': a22AB,
  'B1-1-AB': b11AB,
  'B1-2-AB': b12AB,
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
 * NOTE: Loads BOTH sublevels (e.g., A1.1 + A1.2) and combines all lessons
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
      // Load BOTH sublevels for the given CEFR level
      const book1Key = getExerciseBookKey(level, '1', bookType);
      const book2Key = getExerciseBookKey(level, '2', bookType);

      const book1 = exerciseDataMap[book1Key];
      const book2 = exerciseDataMap[book2Key];

      // If neither book exists, return error
      if (!book1 && !book2) {
        return {
          exerciseBook: null,
          lessons: [],
          isLoading: false,
          error: `No exercises available for ${level} ${bookType}`,
        };
      }

      // Combine lessons from both books
      const allLessons: Lesson[] = [
        ...(book1?.lessons || []),
        ...(book2?.lessons || []),
      ];

      // Return the first book as the primary, but with combined lessons
      return {
        exerciseBook: book1 || book2,
        lessons: allLessons,
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
 * NOTE: Returns true if EITHER sublevel exists
 */
export function useHasExercises(level: CEFRLevel, bookType: 'AB' | 'KB' = 'AB'): boolean {
  return useMemo(() => {
    const book1Key = getExerciseBookKey(level, '1', bookType);
    const book2Key = getExerciseBookKey(level, '2', bookType);
    return (book1Key in exerciseDataMap) || (book2Key in exerciseDataMap);
  }, [level, bookType]);
}
