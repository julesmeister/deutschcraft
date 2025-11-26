import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/models/user';
import { CEFRLevel } from '@/lib/models/cefr';
import { updateUser } from '@/lib/services/userService';
import { useToast } from '@/components/ui/toast';

export function useEnrollmentActions(teacherEmail: string | null | undefined) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (user: User) => {
    if (!teacherEmail || !user.desiredCefrLevel) {
      showToast({
        title: 'Cannot Approve',
        message: 'Missing CEFR level selection',
        variant: 'error',
      });
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

      showToast({
        title: 'Enrollment Approved',
        message: `${user.name || user.email} has been approved`,
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to approve enrollment. Please try again.',
        variant: 'error',
      });
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

      showToast({
        title: 'Enrollment Rejected',
        message: `${user.name || user.email} has been rejected`,
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to reject enrollment. Please try again.',
        variant: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateLevel = async (user: User, level: CEFRLevel) => {
    try {
      await updateUser(user.email, {
        desiredCefrLevel: level,
        updatedAt: Date.now(),
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-enrollments-paginated'] });

      showToast({
        title: 'Level Updated',
        message: `CEFR level updated to ${level}`,
        variant: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Failed to update CEFR level. Please try again.',
        variant: 'error',
      });
    }
  };

  return {
    processingId,
    handleApprove,
    handleReject,
    handleUpdateLevel,
  };
}
