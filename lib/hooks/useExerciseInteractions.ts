import { useQuery } from '@tanstack/react-query';
import { getLessonInteractionStats } from '@/lib/services/turso/studentAnswerService';
import { getExerciseDiscussionStats } from '@/lib/services/turso/socialService';

export function useExerciseInteractions(studentId: string | undefined, exerciseIds: string[]) {
  const { data, isLoading } = useQuery({
    queryKey: ['exercise-interactions', studentId, exerciseIds],
    queryFn: async () => {
      if (!studentId || exerciseIds.length === 0) {
        return { interactions: {}, discussions: {} };
      }

      const [interactions, discussions] = await Promise.all([
        getLessonInteractionStats(studentId, exerciseIds),
        getExerciseDiscussionStats(exerciseIds)
      ]);
      
      return { interactions, discussions };
    },
    enabled: !!studentId && exerciseIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { 
    interactions: data?.interactions || {}, 
    discussions: data?.discussions || {}, 
    isLoading 
  };
}
