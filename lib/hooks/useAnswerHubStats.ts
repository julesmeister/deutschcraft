/**
 * Answer Hub Stats Hook
 * Fetches and aggregates all student answers for Answer Hub tab
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudentAnswerSubmission } from '@/lib/models/studentAnswers';
import {
  AnswerHubStats,
  ExerciseActivitySummary,
  calculateStreak
} from '@/lib/models/answerHub';
import { CEFRLevel } from '@/lib/models/cefr';

/**
 * Hook to fetch all student answers and calculate Answer Hub statistics
 */
export function useAnswerHubStats(studentId: string | null) {
  const [answers, setAnswers] = useState<StudentAnswerSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all answers for this student
  useEffect(() => {
    if (!studentId) {
      setAnswers([]);
      return;
    }

    const fetchAnswers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const q = query(
          collection(db, 'studentAnswers'),
          where('studentId', '==', studentId)
        );

        const querySnapshot = await getDocs(q);
        const submissions: StudentAnswerSubmission[] = [];

        querySnapshot.forEach((doc) => {
          submissions.push(doc.data() as StudentAnswerSubmission);
        });

        setAnswers(submissions);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching student answers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch answers');
        setIsLoading(false);
      }
    };

    fetchAnswers();
  }, [studentId]);

  // Calculate aggregated statistics
  const stats: AnswerHubStats = useMemo(() => {
    if (answers.length === 0) {
      return {
        totalAnswersSubmitted: 0,
        activityStreak: 0,
        exercisesAttempted: 0,
        lastActivityAt: Date.now(),
      };
    }

    const uniqueExercises = new Set(answers.map(a => a.exerciseId));
    const timestamps = answers.map(a => a.submittedAt);
    const streak = calculateStreak(timestamps);
    const lastActivity = Math.max(...timestamps);

    return {
      totalAnswersSubmitted: answers.length,
      activityStreak: streak,
      exercisesAttempted: uniqueExercises.size,
      lastActivityAt: lastActivity,
    };
  }, [answers]);

  // Group answers by exercise for timeline
  const exerciseSummaries: ExerciseActivitySummary[] = useMemo(() => {
    if (answers.length === 0) return [];

    // Group by exerciseId
    const grouped = answers.reduce((acc, answer) => {
      if (!acc[answer.exerciseId]) {
        acc[answer.exerciseId] = [];
      }
      acc[answer.exerciseId].push(answer);
      return acc;
    }, {} as Record<string, StudentAnswerSubmission[]>);

    // Convert to ExerciseActivitySummary array
    const summaries: ExerciseActivitySummary[] = Object.entries(grouped).map(
      ([exerciseId, answerGroup]) => {
        // Parse exerciseId to extract metadata
        // Format examples: "A1.1-L1-AB-Folge1-1", "B1-AB-L1-1", etc.
        const parts = exerciseId.split('-');

        // Try to extract level (first part or second part depending on format)
        let level: CEFRLevel = 'A1';
        let lessonNumber = 1;
        let bookType: 'AB' | 'KB' = 'AB';

        // Parse based on common patterns
        if (parts[0]) {
          const levelMatch = parts[0].match(/^([ABC][12])/);
          if (levelMatch) {
            level = levelMatch[1] as CEFRLevel;
          }
        }

        // Look for lesson number (L1, L2, etc.)
        const lessonPart = parts.find(p => p.startsWith('L'));
        if (lessonPart) {
          lessonNumber = parseInt(lessonPart.replace('L', ''), 10) || 1;
        }

        // Look for book type (AB or KB)
        const bookPart = parts.find(p => p === 'AB' || p === 'KB');
        if (bookPart) {
          bookType = bookPart as 'AB' | 'KB';
        }

        const itemsSubmitted = answerGroup.length;
        const timestamps = answerGroup.map(a => a.submittedAt);
        const lastActivity = Math.max(...timestamps);
        const firstActivity = Math.min(...timestamps);

        // Generate a simplified title from the exercise ID
        // Remove level, lesson, and book type parts to get the exercise name
        const titleParts = parts.filter(
          p => !p.match(/^[ABC][12]/) && !p.startsWith('L') && p !== 'AB' && p !== 'KB'
        );
        const exerciseTitle = titleParts.length > 0
          ? titleParts.join(' ')
          : `Exercise ${parts[parts.length - 1] || ''}`;

        // For now, assume exercises are complete
        // In the future, we can compare itemsSubmitted to actual exercise.answers.length
        const totalItems = itemsSubmitted;
        const completionPercentage = 100;
        const status: 'new' | 'in_progress' | 'completed' = 'completed';

        return {
          exerciseId,
          exerciseTitle,
          level,
          bookType,
          lessonNumber,
          itemsSubmitted,
          totalItems,
          completionPercentage,
          status,
          lastActivityAt: lastActivity,
          firstActivityAt: firstActivity,
        };
      }
    );

    // Sort by most recent activity
    return summaries.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  }, [answers]);

  return {
    stats,
    exerciseSummaries,
    isLoading,
    error,
  };
}
