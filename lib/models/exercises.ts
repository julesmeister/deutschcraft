/**
 * Exercise Models for Answer Hub
 * Schritte textbook exercise data structure
 */

import { CEFRLevel } from './cefr';

/**
 * Exercise Answer Model
 * Individual answer item within an exercise
 */
export interface ExerciseAnswer {
  itemNumber: string;           // "a", "b", "1", "2", etc.
  correctAnswer: string;         // The correct answer text
  explanation?: string;          // Optional explanation or grammar note
}

/**
 * Exercise Model
 * Individual exercise from Schritte workbook
 */
export interface Exercise {
  exerciseId: string;            // Unique ID: "A1.1-L1-AB-1a"
  level: CEFRLevel;              // A1, A2, B1, B2, C1, C2
  bookType: 'AB' | 'KB';         // Arbeitsbuch or Kursbuch
  lessonNumber: number;          // 1-7
  exerciseNumber: string;        // "1a", "2b", "3", etc.
  section?: string;              // "Schritt A", "Schritt B", "Fokus Beruf", etc.

  title: string;                 // Exercise title/description
  question?: string;             // Optional question text
  answers: ExerciseAnswer[];     // Array of correct answers

  pageNumber?: number;           // Page in the book
  topic?: string;                // "Verben", "Nomen", "Adjektive", etc.
  difficulty?: 'easy' | 'medium' | 'hard';
  
  attachments?: ExerciseAttachment[]; // Links/Attachments (YouTube, etc.)

  createdAt?: number;
  updatedAt?: number;
}

/**
 * Exercise Attachment Model
 */
export interface ExerciseAttachment {
  type: 'youtube' | 'link';
  url: string;
  title?: string;
}

/**
 * Lesson Model
 * Container for exercises in a lesson
 */
export interface Lesson {
  lessonNumber: number;          // 1-7
  title: string;                 // "Lektion 1: Guten Tag"
  exercises: Exercise[];         // Array of exercises
}

/**
 * Exercise Book Model
 * Top-level container for all exercises in a book
 */
export interface ExerciseBook {
  level: CEFRLevel;              // A1, A2, B1, B2, C1, C2
  subLevel: '1' | '2';           // 1 or 2 (e.g., A1.1 or A1.2)
  bookType: 'AB' | 'KB';         // Arbeitsbuch or Kursbuch
  lessons: Lesson[];             // Array of lessons
}

/**
 * Helper: Get exercise title with context
 */
export function getExerciseTitle(exercise: Exercise): string {
  return `Übung ${exercise.exerciseNumber}: ${exercise.title}`;
}

/**
 * Helper: Get lesson display name
 */
export function getLessonDisplayName(lesson: Lesson): string {
  return lesson.title;
}

/**
 * Helper: Count total exercises in a book
 */
export function countExercises(book: ExerciseBook): number {
  return book.lessons.reduce((total, lesson) => total + lesson.exercises.length, 0);
}

/**
 * Helper: Filter exercises by difficulty
 */
export function filterByDifficulty(
  exercises: Exercise[],
  difficulty: 'easy' | 'medium' | 'hard'
): Exercise[] {
  return exercises.filter(ex => ex.difficulty === difficulty);
}

/**
 * Helper: Filter exercises by topic
 */
export function filterByTopic(exercises: Exercise[], topic: string): Exercise[] {
  return exercises.filter(ex => ex.topic === topic);
}
