import { SettingsFormField } from './SettingsFormField';
import { ProfileImageUpload } from './ProfileImageUpload';
import { PhoneNumberInput } from './PhoneNumberInput';

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
}

export function ProfileTab({
  formData,
  onFormDataChange,
  onSubmit,
  isSaving = false,
  userPhotoURL
}: ProfileTabProps) {
  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-8">Personal information</h2>
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
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-3 h-12 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </>
  );
}
