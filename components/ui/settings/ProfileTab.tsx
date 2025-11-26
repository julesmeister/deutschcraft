'use client';

import { useState } from 'react';
import { SettingsFormField } from './SettingsFormField';
import { ProfileImageUpload } from './ProfileImageUpload';
import { PhoneNumberInput } from './PhoneNumberInput';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

interface ProfileFormData {
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

interface ProfileTabProps {
  formData: ProfileFormData;
  onFormDataChange: (data: ProfileFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving?: boolean;
  userPhotoURL?: string;
  userRole?: 'student' | 'teacher';
  onDeleteAccount?: () => void;
}

export function ProfileTab({
  formData,
  onFormDataChange,
  onSubmit,
  isSaving = false,
  userPhotoURL,
  userRole,
  onDeleteAccount
}: ProfileTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isTeacher = userRole?.toLowerCase() === 'teacher';

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900">Personal information</h2>
        {/* Role Badge */}
        {userRole && (
          <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
            isTeacher
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isTeacher ? 'Teacher' : 'Student'}
          </span>
        )}
      </div>
      <form onSubmit={onSubmit}>
        {/* Profile Image Upload */}
        <ProfileImageUpload
          currentImage={
            userPhotoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              `${formData.firstName} ${formData.lastName}`
            )}&background=667eea&color=fff&size=180`
          }
          userName={`${formData.firstName} ${formData.lastName}`}
          onUpload={(file) => console.log('Upload file:', file)}
          onRemove={() => console.log('Remove image')}
        />

        {/* Name Fields */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <SettingsFormField
            label="First name"
            value={formData.firstName}
            placeholder="First Name"
            name="firstName"
            onChange={(value) =>
              onFormDataChange({ ...formData, firstName: value })
            }
          />
          <SettingsFormField
            label="Last name"
            value={formData.lastName}
            placeholder="Last Name"
            name="lastName"
            onChange={(value) =>
              onFormDataChange({ ...formData, lastName: value })
            }
          />
        </div>

        {/* Email - Read-only from Google OAuth */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            readOnly
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email is managed by your Google account and cannot be changed here
          </p>
        </div>

        {/* Phone Number */}
        <PhoneNumberInput
          value={formData.phoneNumber}
          dialCode={formData.dialCode}
          onChange={(value) =>
            onFormDataChange({ ...formData, phoneNumber: value })
          }
          onDialCodeChange={(dialCode) =>
            onFormDataChange({ ...formData, dialCode })
          }
        />

        {/* Address Information */}
        <h2 className="text-xl font-bold text-gray-900 mb-6 mt-8">
          Address information
        </h2>

        <SettingsFormField
          label="Country"
          value={formData.country}
          placeholder="Country"
          name="country"
          onChange={(value) => onFormDataChange({ ...formData, country: value })}
        />

        <SettingsFormField
          label="Address"
          value={formData.address}
          placeholder="Address"
          name="address"
          onChange={(value) => onFormDataChange({ ...formData, address: value })}
        />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <SettingsFormField
            label="City"
            value={formData.city}
            placeholder="City"
            name="city"
            onChange={(value) => onFormDataChange({ ...formData, city: value })}
          />
          <SettingsFormField
            label="Postal Code"
            value={formData.postalCode}
            placeholder="Postal Code"
            name="postalCode"
            onChange={(value) =>
              onFormDataChange({ ...formData, postalCode: value })
            }
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <div className="w-auto">
            <ActionButton
              variant="purple"
              icon={<ActionButtonIcons.Check />}
              disabled={isSaving}
              className="!w-auto"
              onClick={(e) => {
                const form = (e.target as HTMLElement).closest('form');
                form?.requestSubmit();
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </ActionButton>
          </div>
        </div>
      </form>

      {/* Delete Account Section */}
      {onDeleteAccount && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Delete Account</h3>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <div className="w-auto">
              <ActionButton
                variant="red"
                icon={<ActionButtonIcons.X />}
                className="!w-auto"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete My Account
              </ActionButton>
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h4 className="font-bold text-red-900 mb-1">Are you absolutely sure?</h4>
                  <p className="text-sm text-red-700 mb-2">
                    This will permanently delete your account and all your data.
                  </p>
                  <p className="text-sm text-red-700">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={onDeleteAccount}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all duration-300"
                >
                  Yes, Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
