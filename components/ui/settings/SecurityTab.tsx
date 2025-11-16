import { SettingsFormField } from './SettingsFormField';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

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
          <div className="w-auto">
            <ActionButton
              variant="purple"
              icon={<ActionButtonIcons.Check />}
              className="!w-auto"
              onClick={() => console.log('Update password')}
            >
              Update Password
            </ActionButton>
          </div>
        </div>
      </div>
    </>
  );
}
