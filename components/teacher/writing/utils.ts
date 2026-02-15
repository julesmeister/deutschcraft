/**
 * Utility functions for writing submissions
 */

import { WritingExerciseType } from '@/lib/models/writing';
import { TRANSLATION_EXERCISES } from '@/lib/data/translations';
import { CREATIVE_EXERCISES } from '@/lib/data/creativeExercises';
import { EMAIL_TEMPLATES } from '@/lib/data/emailTemplates';
import { LETTER_TEMPLATES } from '@/lib/data/letterTemplates';

/**
 * Get exercise title from exerciseId and type
 * Searches all static data sources, handling both DB-stored type names
 * (e.g. 'formal', 'informal') and model type names ('formal-letter', 'informal-letter')
 */
export function getExerciseTitle(exerciseId: string, exerciseType: WritingExerciseType | string, dbTitle?: string): string {
  // Prefer title fetched from DB (via JOIN)
  if (dbTitle) return dbTitle;

  try {
    switch (exerciseType) {
      case 'translation': {
        const exercise = TRANSLATION_EXERCISES.find((ex) => ex.exerciseId === exerciseId);
        return exercise?.title || 'Translation Exercise';
      }
      case 'creative': {
        const exercise = CREATIVE_EXERCISES.find((ex) => ex.exerciseId === exerciseId);
        return exercise?.title || 'Creative Writing';
      }
      case 'email': {
        const template = EMAIL_TEMPLATES.find((t) => t.id === exerciseId);
        return template?.title || 'Email Exercise';
      }
      case 'formal-letter':
      case 'informal-letter':
      case 'formal':
      case 'informal': {
        const template = LETTER_TEMPLATES.find((t) => t.id === exerciseId);
        return template?.title || 'Letter Exercise';
      }
      default: {
        // Fallback: search all static sources by ID
        const fromTranslation = TRANSLATION_EXERCISES.find((ex) => ex.exerciseId === exerciseId);
        if (fromTranslation) return fromTranslation.title;
        const fromCreative = CREATIVE_EXERCISES.find((ex) => ex.exerciseId === exerciseId);
        if (fromCreative) return fromCreative.title;
        const fromEmail = EMAIL_TEMPLATES.find((t) => t.id === exerciseId);
        if (fromEmail) return fromEmail.title;
        const fromLetter = LETTER_TEMPLATES.find((t) => t.id === exerciseId);
        if (fromLetter) return fromLetter.title;
        return 'Writing Exercise';
      }
    }
  } catch (error) {
    console.error('[getExerciseTitle] Error:', error);
    return 'Writing Exercise';
  }
}

/**
 * Get student name from user data
 */
export function getStudentName(
  userId: string,
  allStudents: Array<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  }>
): string {
  // Try to match by id first
  let student = allStudents.find((s) => s.id === userId);

  // If not found, try to match by email
  if (!student) {
    student = allStudents.find((s) => s.email === userId);
  }

  if (student) {
    // Handle both formats: {name: "Full Name"} OR {firstName: "First", lastName: "Last"}
    const displayName =
      (student as any).name ||
      `${student.firstName || ''} ${student.lastName || ''}`.trim();
    return displayName || student.email;
  }

  // Fallback to userId if student not found
  return userId;
}
