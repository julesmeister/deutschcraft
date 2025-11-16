'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { User } from '../models/user';
import { updateUser } from '../services/userService';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dialCode: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
}

/**
 * Hook to manage profile form state and submission
 */
export function useProfileForm(currentUser: User | null, session: Session | null) {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dialCode: '+1',
    country: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load user data from Firestore
  useEffect(() => {
    if (currentUser) {
      // Handle both formats: single 'name' field from OAuth OR 'firstName'/'lastName' from enrollment
      const userName = (currentUser as any).name || session?.user?.name || '';
      const [firstNameFromName = '', lastNameFromName = ''] = userName ? userName.split(' ', 2) : ['', ''];

      setFormData({
        firstName: currentUser.firstName || firstNameFromName || '',
        lastName: currentUser.lastName || lastNameFromName || '',
        email: currentUser.email || session?.user?.email || '',
        phoneNumber: (currentUser as any).phoneNumber || '',
        dialCode: (currentUser as any).dialCode || '+1',
        country: (currentUser as any).country || '',
        address: (currentUser as any).address || '',
        city: (currentUser as any).city || '',
        postalCode: (currentUser as any).postalCode || '',
      });
    }
  }, [currentUser, session]);

  const handleSubmit = async (
    e: React.FormEvent,
    onSuccess: (message: string) => void,
    onError: (message: string) => void
  ) => {
    e.preventDefault();

    if (!currentUser) {
      onError('Error: User not found');
      return;
    }

    setIsSaving(true);

    try {
      // Update Firestore with new data using email as identifier
      await updateUser(formData.email, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dialCode: formData.dialCode,
        country: formData.country,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
      } as any);

      onSuccess('Settings saved successfully!');

      // Clear message after 3 seconds
      setTimeout(() => onSuccess(''), 3000);
    } catch (error) {
      onError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    isSaving,
    handleSubmit,
  };
}
