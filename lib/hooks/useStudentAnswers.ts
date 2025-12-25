/**
 * Hooks for managing student exercise answers
 */

import { useState, useEffect } from 'react';
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

      await setDoc(
        doc(db, 'studentAnswers', submissionId),
        submission
      );

      setIsSaving(false);
      return true;
    } catch (err) {
      console.error('Error saving student answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to save answer');
      setIsSaving(false);
      return false;
    }
  };

  return { saveAnswer, isSaving, error };
}

/**
 * Hook to fetch all student answers for an exercise
 */
export function useStudentAnswers(exerciseId: string | null) {
  const [answers, setAnswers] = useState<StudentExerciseAnswers[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId) {
      setAnswers([]);
      return;
    }

    const fetchAnswers = async () => {
      setIsLoading(true);
      setError(null);

      try {
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
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching student answers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch answers');
        setIsLoading(false);
      }
    };

    fetchAnswers();
  }, [exerciseId]);

  return { answers, isLoading, error };
}
