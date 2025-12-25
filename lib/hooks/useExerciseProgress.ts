/**
 * Exercise Progress Hooks
 * Calculate progress based on student answers
 */

'use client';

import { useMemo } from 'react';
import { useStudentAnswers } from './useStudentAnswers';
import { Exercise, Lesson } from '@/lib/models/exercises';
import { ExerciseProgress, LessonProgress } from '@/lib/models/exerciseProgress';

/**
 * Calculate progress for a single exercise
 */
export function useExerciseProgress(
  exerciseId: string,
  totalItems: number,
  studentId: string | null
): ExerciseProgress | null {
  const { answers } = useStudentAnswers(exerciseId);

  return useMemo(() => {
    if (!studentId) return null;

    // Find this student's answers
    const studentAnswers = answers.find(a => a.studentId === studentId);

    if (!studentAnswers || studentAnswers.answers.length === 0) {
      return {
        exerciseId,
        studentId,
        status: 'new',
        itemsCompleted: 0,
        totalItems,
        lastAttemptedAt: Date.now(),
      };
    }

    const itemsCompleted = studentAnswers.answers.length;
    const isCompleted = itemsCompleted === totalItems;
    const lastAttemptedAt = Math.max(
      ...studentAnswers.answers.map(a => a.submittedAt || Date.now())
    );

    return {
      exerciseId,
      studentId,
      status: isCompleted ? 'completed' : 'in_progress',
      itemsCompleted,
      totalItems,
      lastAttemptedAt,
      completedAt: isCompleted ? lastAttemptedAt : undefined,
    };
  }, [exerciseId, totalItems, studentId, answers]);
}

/**
 * Calculate progress for all exercises in a lesson
 */
export function useLessonProgress(
  lesson: Lesson,
  studentId: string | null
): LessonProgress | null {
  // For each exercise, get the student's answers
  const exerciseProgresses = lesson.exercises.map(ex => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { answers } = useStudentAnswers(ex.exerciseId);
    return { exercise: ex, answers };
  });

  return useMemo(() => {
    if (!studentId) return null;

    let exercisesCompleted = 0;
    let lastActivityAt = 0;

    exerciseProgresses.forEach(({ exercise, answers }) => {
      const studentAnswers = answers.find(a => a.studentId === studentId);

      if (studentAnswers && studentAnswers.answers.length > 0) {
        const itemsCompleted = studentAnswers.answers.length;
        const totalItems = exercise.answers.length;

        if (itemsCompleted === totalItems) {
          exercisesCompleted++;
        }

        const lastAttempt = Math.max(
          ...studentAnswers.answers.map(a => a.submittedAt || 0)
        );
        lastActivityAt = Math.max(lastActivityAt, lastAttempt);
      }
    });

    const totalExercises = lesson.exercises.length;
    const percentage = totalExercises > 0
      ? Math.round((exercisesCompleted / totalExercises) * 100)
      : 0;

    return {
      lessonId: `L${lesson.lessonNumber}`,
      studentId,
      exercisesCompleted,
      totalExercises,
      percentage,
      lastActivityAt: lastActivityAt || Date.now(),
    };
  }, [lesson, studentId, exerciseProgresses]);
}
