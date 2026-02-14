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

  // Only show teacher tab if teacher data was actually loaded and setting is enabled
  const showTeacherTab = teacherData ? (teacherData.displaySettings?.showTeacherTabToStudents ?? false) : false;

  return {
    showTeacherTab,
    isLoading,
  };
}
