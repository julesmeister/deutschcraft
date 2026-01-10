/**
 * useTeacherDisplaySettings Hook
 * Fetches teacher's display settings to determine what students can see
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getUser } from '../services/user';

export function useTeacherDisplaySettings(
  teacherId: string | null | undefined,
  userRole: 'STUDENT' | 'TEACHER' | 'PENDING_APPROVAL' | undefined
) {
  const { data: teacherData, isLoading } = useQuery({
    queryKey: ['teacher-display-settings', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;
      return await getUser(teacherId);
    },
    enabled: !!teacherId && userRole === 'STUDENT',
    staleTime: 60000, // 1 minute
  });

  // Default to true if no setting is found (backwards compatibility)
  const showTeacherTab = teacherData?.displaySettings?.showTeacherTabToStudents ?? true;

  return {
    showTeacherTab,
    isLoading,
  };
}
