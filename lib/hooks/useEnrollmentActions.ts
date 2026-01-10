import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/models/user';
import { CEFRLevel } from '@/lib/models/cefr';
import { updateUser } from '@/lib/services/user';
import { useToast } from '@/lib/hooks/useToast';

export function useEnrollmentActions(teacherEmail: string | null | undefined) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (user: User) => {
    if (!teacherEmail || !user.desiredCefrLevel) {
      error('Missing CEFR level selection', undefined, 'Cannot Approve');
      return;
    }

    setProcessingId(user.userId);
    try {
      await updateUser(user.email, {
        role: 'STUDENT',
        enrollmentStatus: 'approved',
        cefrLevel: user.desiredCefrLevel,
        enrollmentReviewedAt: Date.now(),
        enrollmentReviewedBy: teacherEmail,
        teacherId: teacherEmail,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments-count'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-students'] });

      success(`${user.name || user.email} has been approved`, undefined, 'Enrollment Approved');
    } catch (err) {
      error('Failed to approve enrollment. Please try again.', undefined, 'Error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (user: User) => {
    if (!teacherEmail) return;

    const reason = prompt('Enter rejection reason (optional):');

    setProcessingId(user.userId);
    try {
      await updateUser(user.email, {
        enrollmentStatus: 'rejected',
        enrollmentReviewedAt: Date.now(),
        enrollmentReviewedBy: teacherEmail,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments-count'] });

      success(`${user.name || user.email} has been rejected`, undefined, 'Enrollment Rejected');
    } catch (err) {
      error('Failed to reject enrollment. Please try again.', undefined, 'Error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateLevel = async (user: User, level: CEFRLevel) => {
    try {
      // Update the database first
      await updateUser(user.email, {
        desiredCefrLevel: level,
        updatedAt: Date.now(),
      });

      // After successful update, manually update all cached pages
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll({ queryKey: ['pending-enrollments-paginated'] });

      queries.forEach((query) => {
        const oldData = query.state.data as any;
        if (oldData?.users) {
          queryClient.setQueryData(query.queryKey, {
            ...oldData,
            users: oldData.users.map((u: User) =>
              u.userId === user.userId
                ? { ...u, desiredCefrLevel: level }
                : u
            ),
          });
        }
      });

      success(`CEFR level updated to ${level}`, undefined, 'Level Updated');
    } catch (err) {
      error('Failed to update CEFR level. Please try again.', undefined, 'Error');
    }
  };

  return {
    processingId,
    handleApprove,
    handleReject,
    handleUpdateLevel,
  };
}
