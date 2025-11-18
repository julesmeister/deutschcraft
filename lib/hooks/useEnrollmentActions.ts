import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/models/user';
import { CEFRLevel } from '@/lib/models/cefr';
import { updateUser } from '@/lib/services/userService';

export function useEnrollmentActions(teacherEmail: string | null | undefined) {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (user: User) => {
    if (!teacherEmail || !user.desiredCefrLevel) {
      alert('Cannot approve: Missing CEFR level selection');
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
    } catch (error) {
      alert('Failed to approve enrollment. Please try again.');
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
    } catch (error) {
      alert('Failed to reject enrollment. Please try again.');
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
    } catch (error) {
      alert('Failed to update CEFR level. Please try again.');
    }
  };

  return {
    processingId,
    handleApprove,
    handleReject,
    handleUpdateLevel,
  };
}
