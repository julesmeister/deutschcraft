import { useState, useEffect } from 'react';
import { getLessonInteractionStats } from '@/lib/services/turso/studentAnswerService';

export function useExerciseInteractions(studentId: string | undefined, exerciseIds: string[]) {
  const [interactions, setInteractions] = useState<Record<string, { submissionCount: number; lastSubmittedAt: number }>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!studentId || exerciseIds.length === 0) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const stats = await getLessonInteractionStats(studentId, exerciseIds);
        setInteractions(stats);
      } catch (error) {
        console.error('Failed to fetch interactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [studentId, JSON.stringify(exerciseIds)]);

  return { interactions, isLoading };
}
