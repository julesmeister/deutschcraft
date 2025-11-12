/**
 * Translation Exercises Index
 * Aggregates all translation exercises from all CEFR levels
 */

import { CEFRLevel } from '@/lib/models/cefr';
import { TranslationExercise } from '@/lib/models/writing';
import { A1_TRANSLATION_EXERCISES } from './a1';
import { A2_TRANSLATION_EXERCISES } from './a2';
import { B1_TRANSLATION_EXERCISES } from './b1';
import { B2_TRANSLATION_EXERCISES } from './b2';

/**
 * All translation exercises combined
 */
export const TRANSLATION_EXERCISES: TranslationExercise[] = [
  ...A1_TRANSLATION_EXERCISES,
  ...A2_TRANSLATION_EXERCISES,
  ...B1_TRANSLATION_EXERCISES,
  ...B2_TRANSLATION_EXERCISES,
];

/**
 * Get translation exercises filtered by CEFR level
 */
export function getExercisesByLevel(level: CEFRLevel): TranslationExercise[] {
  return TRANSLATION_EXERCISES.filter(exercise => exercise.level === level);
}

/**
 * Get a specific exercise by ID
 */
export function getExerciseById(id: string): TranslationExercise | undefined {
  return TRANSLATION_EXERCISES.find(exercise => exercise.exerciseId === id);
}

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: string): TranslationExercise[] {
  return TRANSLATION_EXERCISES.filter(exercise => exercise.category === category);
}

// Re-export individual level exercises for direct access if needed
export { A1_TRANSLATION_EXERCISES } from './a1';
export { A2_TRANSLATION_EXERCISES } from './a2';
export { B1_TRANSLATION_EXERCISES } from './b1';
export { B2_TRANSLATION_EXERCISES } from './b2';
