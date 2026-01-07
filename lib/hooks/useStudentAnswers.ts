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
  groupAnswersByStudent,
  MarkedWord
} from '@/lib/models/studentAnswers';

// Helper to determine if we should use Turso
const useTurso = () => {
  return process.env.NEXT_PUBLIC_DATABASE_PROVIDER === 'turso' || 
         process.env.NEXT_PUBLIC_DATABASE_TYPE === 'turso' || 
         process.env.NEXT_PUBLIC_USE_TURSO === 'true';
};

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
      if (useTurso()) {
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
      if (useTurso()) {
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

  const updateMarkedWords = async (
    studentId: string,
    exerciseId: string,
    itemNumber: string,
    markedWords: MarkedWord[]
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const submissionId = `${studentId}_${exerciseId}_${itemNumber}`;

      // Check if we're using Turso or Firestore
      if (useTurso()) {
        const { updateMarkedWords: tursoUpdate } = await import(
          '@/lib/services/turso/studentAnswerService'
        );
        await tursoUpdate(studentId, exerciseId, itemNumber, markedWords);
      } else {
        const { updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        await updateDoc(doc(db, 'studentAnswers', submissionId), { markedWords });
      }

      setIsSaving(false);
      return true;
    } catch (err) {
      console.error('Error updating marked words:', err);
      setError(err instanceof Error ? err.message : 'Failed to save marked words');
      setIsSaving(false);
      return false;
    }
  };

  return { saveAnswer, deleteAnswer, updateMarkedWords, isSaving, error };
}

/**
 * Hook to fetch all student answers for an exercise
 */
export function useStudentAnswers(exerciseId: string | null) {
  const [answers, setAnswers] = useState<StudentExerciseAnswers[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswers = useCallback(async (silent = false) => {
    if (!exerciseId) {
      setAnswers([]);
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Check if we're using Turso or Firestore
      if (useTurso()) {
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

/**
 * Hook to fetch all student answers for a list of exercises (teacher view)
 */
export function useAllLessonAnswers(exerciseIds: string[], isTeacher: boolean = false) {
  const [answers, setAnswers] = useState<StudentAnswerSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswers = useCallback(async () => {
    if (!isTeacher || exerciseIds.length === 0) {
      setAnswers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (useTurso()) {
        const { getAllAnswersForExercises } = await import('@/lib/services/turso/studentAnswerService');
        const results = await getAllAnswersForExercises(exerciseIds);
        setAnswers(results);
      } else {
        const { query, collection, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        // Firestore batching for 'in' query
        const chunks = [];
        for (let i = 0; i < exerciseIds.length; i += 10) {
            chunks.push(exerciseIds.slice(i, i + 10));
        }

        let allAnswers: StudentAnswerSubmission[] = [];

        for (const chunk of chunks) {
            const q = query(
                collection(db, 'studentAnswers'),
                where('exerciseId', 'in', chunk)
            );
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => {
                allAnswers.push(doc.data() as StudentAnswerSubmission);
            });
        }
        
        setAnswers(allAnswers);
      }
    } catch (err) {
      console.error('Error fetching all lesson answers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch answers');
    } finally {
      setIsLoading(false);
    }
  }, [isTeacher, JSON.stringify(exerciseIds)]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  return { answers, isLoading, error, refresh: fetchAnswers };
}

/**
 * Hook to fetch all student answers for a list of exercises (e.g. a lesson)
 */
export function useStudentLessonAnswers(studentId: string | undefined, exerciseIds: string[]) {
  const [answers, setAnswers] = useState<StudentAnswerSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnswers = useCallback(async () => {
    if (!studentId || exerciseIds.length === 0) {
      setAnswers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (useTurso()) {
        const { getStudentAnswersForExercises } = await import('@/lib/services/turso/studentAnswerService');
        const results = await getStudentAnswersForExercises(studentId, exerciseIds);
        setAnswers(results);
      } else {
        const { query, collection, where, getDocs, documentId } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        // Firestore 'in' query supports max 10 values. 
        // We'll fetch in batches or just fetch all student answers if list is long.
        // For simplicity and lesson size (usually < 50), we'll do parallel requests if needed
        // or just fetch all answers for student if that's easier.
        // Let's try batching by 10.
        
        const chunks = [];
        for (let i = 0; i < exerciseIds.length; i += 10) {
            chunks.push(exerciseIds.slice(i, i + 10));
        }

        let allAnswers: StudentAnswerSubmission[] = [];

        for (const chunk of chunks) {
            const q = query(
                collection(db, 'studentAnswers'),
                where('studentId', '==', studentId),
                where('exerciseId', 'in', chunk)
            );
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => {
                allAnswers.push(doc.data() as StudentAnswerSubmission);
            });
        }
        
        setAnswers(allAnswers);
      }
    } catch (err) {
      console.error('Error fetching student lesson answers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch answers');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, JSON.stringify(exerciseIds)]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  return { answers, isLoading, error, refresh: fetchAnswers };
}
