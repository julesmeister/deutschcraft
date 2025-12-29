/**
 * Hooks for managing student exercise answers
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  StudentAnswerSubmission,
  StudentExerciseAnswers,
  groupAnswersByStudent
} from '@/lib/models/studentAnswers';

/**
 * Hook to save a student's answer
 */
export function useSaveStudentAnswer() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAnswer = async (
    studentId: string,
    studentName: string,
    exerciseId: string,
    itemNumber: string,
    studentAnswer: string
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const submissionId = `${studentId}_${exerciseId}_${itemNumber}`;
      const submission: StudentAnswerSubmission = {
        studentId,
        studentName,
        exerciseId,
        itemNumber,
        studentAnswer,
        submittedAt: Date.now()
      };

      // Check if we're using Turso or Firestore
      if (process.env.NEXT_PUBLIC_USE_TURSO === 'true') {
        const { saveStudentAnswer } = await import('@/lib/services/turso/studentAnswerService');
        await saveStudentAnswer(submission);
      } else {
        await setDoc(
          doc(db, 'studentAnswers', submissionId),
          submission
        );
      }

      setIsSaving(false);
      return true;
    } catch (err) {
      console.error('Error saving student answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to save answer');
      setIsSaving(false);
      return false;
    }
  };

  const deleteAnswer = async (
    studentId: string,
    exerciseId: string,
    itemNumber: string
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const submissionId = `${studentId}_${exerciseId}_${itemNumber}`;
      
      // Check if we're using Turso or Firestore
      if (process.env.NEXT_PUBLIC_USE_TURSO === 'true') {
        const { deleteStudentAnswer } = await import('@/lib/services/turso/studentAnswerService');
        await deleteStudentAnswer(studentId, exerciseId, itemNumber);
      } else {
        const { deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        await deleteDoc(doc(db, 'studentAnswers', submissionId));
      }

      setIsSaving(false);
      return true;
    } catch (err) {
      console.error('Error deleting student answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete answer');
      setIsSaving(false);
      return false;
    }
  };

  return { saveAnswer, deleteAnswer, isSaving, error };
}

/**
 * Hook to fetch all student answers for an exercise
 */
export function useStudentAnswers(exerciseId: string | null) {
  const [answers, setAnswers] = useState<StudentExerciseAnswers[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswers = useCallback(async () => {
    if (!exerciseId) {
      setAnswers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if we're using Turso or Firestore
      if (process.env.NEXT_PUBLIC_USE_TURSO === 'true') {
        const { getExerciseAnswersGrouped } = await import('@/lib/services/turso/studentAnswerService');
        const grouped = await getExerciseAnswersGrouped(exerciseId);
        setAnswers(grouped);
      } else {
        const { query, collection, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const { groupAnswersByStudent } = await import('@/lib/models/studentAnswers');
        
        const q = query(
          collection(db, 'studentAnswers'),
          where('exerciseId', '==', exerciseId)
        );

        const querySnapshot = await getDocs(q);
        const submissions: StudentAnswerSubmission[] = [];

        querySnapshot.forEach((doc) => {
          submissions.push(doc.data() as StudentAnswerSubmission);
        });

        // Group by student
        const grouped = groupAnswersByStudent(submissions);
        setAnswers(grouped);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching student answers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch answers');
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  return { answers, isLoading, error, refresh: fetchAnswers };
}
