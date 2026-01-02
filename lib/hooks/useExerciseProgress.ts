/**
 * Exercise Progress Hooks
 * Calculate progress based on student answers
 */

'use client';

import { useMemo } from 'react';
import { useStudentAnswers, useStudentLessonAnswers } from './useStudentAnswers';
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
  // Get all exercise IDs
  const exerciseIds = useMemo(() => 
    lesson.exercises.map(ex => ex.exerciseId), 
    [lesson]
  );

  // Fetch answers for all exercises at once
  // This is much better than mapping hooks in a loop!
  const { answers } = useStudentLessonAnswers(studentId || undefined, exerciseIds);

  return useMemo(() => {
    if (!studentId) return null;

    let exercisesCompleted = 0;
    let lastActivityAt = 0;

    // Group answers by exerciseId
    const answersByExercise = new Map<string, typeof answers>();
    answers.forEach(ans => {
      const existing = answersByExercise.get(ans.exerciseId) || [];
      existing.push(ans);
      answersByExercise.set(ans.exerciseId, existing);
    });

    lesson.exercises.forEach(exercise => {
      const exerciseAnswers = answersByExercise.get(exercise.exerciseId) || [];

      if (exerciseAnswers.length > 0) {
        const itemsCompleted = exerciseAnswers.length;
        const totalItems = exercise.answers.length;

        // For custom/override exercises, totalItems might need to come from the exercise object
        // The check itemsCompleted === totalItems assumes we have all items.
        // If an exercise has 5 questions and student answered 5, it's complete.
        if (itemsCompleted >= totalItems && totalItems > 0) {
          exercisesCompleted++;
        }

        const lastAttempt = Math.max(
          ...exerciseAnswers.map(a => a.submittedAt || 0)
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
  }, [lesson, studentId, answers]);
}
