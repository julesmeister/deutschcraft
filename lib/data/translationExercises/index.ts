/**
 * Translation Exercises
 * Main export file for all translation exercises organized by CEFR level
 */

import { CEFRLevel } from '@/lib/models/cefr';
import { TranslationExercise } from './types';
import { A1_TRANSLATION_EXERCISES } from './A1';
import { A2_TRANSLATION_EXERCISES } from './A2';
import { B1_TRANSLATION_EXERCISES } from './B1';
import { B2_TRANSLATION_EXERCISES } from './B2';
import { C1_TRANSLATION_EXERCISES } from './C1';
import { C2_TRANSLATION_EXERCISES } from './C2';

// Export types
export type { TranslationExercise } from './types';

// Export all exercises combined
export const TRANSLATION_EXERCISES: TranslationExercise[] = [
  ...A1_TRANSLATION_EXERCISES,
  ...A2_TRANSLATION_EXERCISES,
  ...B1_TRANSLATION_EXERCISES,
  ...B2_TRANSLATION_EXERCISES,
  ...C1_TRANSLATION_EXERCISES,
  ...C2_TRANSLATION_EXERCISES,
];

// Export exercises by level
export {
  A1_TRANSLATION_EXERCISES,
  A2_TRANSLATION_EXERCISES,
  B1_TRANSLATION_EXERCISES,
  B2_TRANSLATION_EXERCISES,
  C1_TRANSLATION_EXERCISES,
  C2_TRANSLATION_EXERCISES,
};

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

/**
 * Get exercises by difficulty
 */
export function getExercisesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): TranslationExercise[] {
  return TRANSLATION_EXERCISES.filter(exercise => exercise.difficulty === difficulty);
}

/**
 * Get random exercises for practice
 */
export function getRandomExercises(count: number, level?: CEFRLevel): TranslationExercise[] {
  const pool = level ? getExercisesByLevel(level) : TRANSLATION_EXERCISES;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
