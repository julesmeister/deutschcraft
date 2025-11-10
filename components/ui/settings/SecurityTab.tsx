import { SettingsFormField } from './SettingsFormField';

export function SecurityTab() {
  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-8">Security settings</h2>
      <div className="space-y-6">
        <SettingsFormField
          label="Current Password"
          type="password"
          placeholder="Enter current password"
        />
        <SettingsFormField
          label="New Password"
          type="password"
          placeholder="Enter new password"
        />
        <SettingsFormField
          label="Confirm New Password"
          type="password"
          placeholder="Confirm new password"
        />
        <div className="flex justify-end">
          <button className="px-5 py-3 h-12 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors">
            Update Password
          </button>
        </div>
      </div>
    </>
  );
}
