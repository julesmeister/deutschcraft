import { useState, useEffect } from 'react';
import { getLessonInteractionStats } from '@/lib/services/turso/studentAnswerService';
import { getExerciseDiscussionStats } from '@/lib/services/turso/socialService';

export function useExerciseInteractions(studentId: string | undefined, exerciseIds: string[]) {
  const [interactions, setInteractions] = useState<Record<string, { submissionCount: number; lastSubmittedAt: number }>>({});
  const [discussions, setDiscussions] = useState<Record<string, { commentCount: number; lastCommentAt: number }>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!studentId || exerciseIds.length === 0) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [interactionStats, discussionStats] = await Promise.all([
          getLessonInteractionStats(studentId, exerciseIds),
          getExerciseDiscussionStats(exerciseIds)
        ]);
        
        setInteractions(interactionStats);
        setDiscussions(discussionStats);
      } catch (error) {
        console.error('Failed to fetch interactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [studentId, JSON.stringify(exerciseIds)]);

  return { interactions, discussions, isLoading };
}
