/**
 * Creative Writing Exercises
 * Main export file for all creative exercises organized by CEFR level
 */

import { CEFRLevel } from '@/lib/models/cefr';
import { CreativeWritingExercise } from './types';
import { A1_CREATIVE_EXERCISES } from './A1';
import { A2_CREATIVE_EXERCISES } from './A2';
import { B1_CREATIVE_EXERCISES } from './B1';
import { B2_CREATIVE_EXERCISES } from './B2';
import { C1_CREATIVE_EXERCISES } from './C1';
import { C2_CREATIVE_EXERCISES } from './C2';

// Export types
export type { CreativeWritingExercise } from './types';

// Export all exercises combined
export const CREATIVE_EXERCISES: CreativeWritingExercise[] = [
  ...A1_CREATIVE_EXERCISES,
  ...A2_CREATIVE_EXERCISES,
  ...B1_CREATIVE_EXERCISES,
  ...B2_CREATIVE_EXERCISES,
  ...C1_CREATIVE_EXERCISES,
  ...C2_CREATIVE_EXERCISES,
];

// Export exercises by level
export {
  A1_CREATIVE_EXERCISES,
  A2_CREATIVE_EXERCISES,
  B1_CREATIVE_EXERCISES,
  B2_CREATIVE_EXERCISES,
  C1_CREATIVE_EXERCISES,
  C2_CREATIVE_EXERCISES,
};

/**
 * Get creative exercises filtered by CEFR level
 */
export function getExercisesByLevel(level: CEFRLevel): CreativeWritingExercise[] {
  return CREATIVE_EXERCISES.filter(exercise => exercise.level === level);
}

/**
 * Get a specific exercise by ID
 */
export function getExerciseById(id: string): CreativeWritingExercise | undefined {
  return CREATIVE_EXERCISES.find(exercise => exercise.exerciseId === id);
}

/**
 * Get exercises by type
 */
export function getExercisesByType(type: 'creative' | 'descriptive' | 'dialogue'): CreativeWritingExercise[] {
  return CREATIVE_EXERCISES.filter(exercise => exercise.type === type);
}

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: string): CreativeWritingExercise[] {
  return CREATIVE_EXERCISES.filter(exercise => exercise.category === category);
}
