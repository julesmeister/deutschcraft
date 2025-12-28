'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { EnrollmentFormData } from '@/components/ui/settings/EnrollmentTab';
import { updateUser } from '../services/user';
import { createTransaction } from '../services/transactionService';

/**
 * Hook to manage enrollment form submission and account deletion
 */
export function useEnrollmentForm(session: Session | null) {
  const [isSaving, setIsSaving] = useState(false);

  const handleEnrollmentSubmit = async (
    data: EnrollmentFormData,
    onSuccess: (message: string) => void,
    onError: (message: string) => void,
    onTabChange: () => void
  ) => {
    if (!session?.user?.email) {
      onError('Error: You must be logged in');
      return;
    }

    setIsSaving(true);

    try {
      const amount = parseFloat(data.gcashAmount);

      // Get name from session or use default
      const displayName = session.user.name || session.user.email?.split('@')[0] || 'Student';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create/update user document with enrollment data
      await updateUser(session.user.email, {
        userId: session.user.email,
        email: session.user.email,
        name: displayName, // Combined name for backwards compatibility
        firstName: firstName,
        lastName: lastName,
        role: 'PENDING_APPROVAL',
        enrollmentStatus: 'pending',
        desiredCefrLevel: data.desiredCefrLevel,
        gcashReferenceNumber: data.gcashReferenceNumber.trim(),
        gcashAmount: amount,
        enrollmentSubmittedAt: Date.now(),
        photoURL: session.user.image || null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Create a transaction record for the payment
      await createTransaction({
        userId: session.user.email,
        userEmail: session.user.email,
        paymentMethod: 'gcash',
        amount: amount,
        referenceNumber: data.gcashReferenceNumber.trim(),
        status: 'pending',
        notes: `Enrollment payment - ${data.desiredCefrLevel} level`,
      });

      onSuccess('Enrollment submitted successfully! Your teacher will review it soon.');

      // Switch to enrollment tab to show pending state
      onTabChange();
    } catch (error) {
      onError('Failed to submit enrollment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (
    onError: (message: string) => void
  ) => {
    if (!session?.user?.email) {
      onError('Error: You must be logged in');
      return;
    }

    setIsSaving(true);

    try {
      // Call API route to delete both Firebase Auth and Firestore user
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Sign out the user after successful deletion
      await signOut({ callbackUrl: '/' });
    } catch (error: any) {
      onError(error.message || 'Failed to delete account. Please try again.');
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleEnrollmentSubmit,
    handleDeleteAccount,
  };
}
