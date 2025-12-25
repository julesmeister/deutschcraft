/**
 * Exercise Progress Models
 * Track student progress on exercises
 */

export interface ExerciseProgress {
  exerciseId: string;
  studentId: string;
  status: 'new' | 'in_progress' | 'completed';
  itemsCompleted: number;
  totalItems: number;
  lastAttemptedAt: number;
  completedAt?: number;
}

export interface LessonProgress {
  lessonId: string;
  studentId: string;
  exercisesCompleted: number;
  totalExercises: number;
  percentage: number;
  lastActivityAt: number;
}
