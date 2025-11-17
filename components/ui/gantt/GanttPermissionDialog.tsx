'use client';

import { useState } from 'react';
import { useAllStudents } from '@/lib/hooks/useSimpleUsers';
import { Select, SelectOption } from '@/components/ui/Select';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

interface GanttPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantPermission: (userId: string, expiresAt: number) => Promise<void>;
  onRevokePermission: (userId: string) => Promise<void>;
  currentPermissions: Array<{ userId: string; expiresAt: number }>;
}

const DURATION_OPTIONS: SelectOption[] = [
  { value: '12', label: '12 hours' },
  { value: '24', label: '24 hours' },
  { value: '72', label: '72 hours' },
  { value: '168', label: '1 week' },
];

export function GanttPermissionDialog({
  isOpen,
  onClose,
  onGrantPermission,
  onRevokePermission,
  currentPermissions,
}: GanttPermissionDialogProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('24');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all students
  const { students } = useAllStudents();

  // Convert students to select options
  const studentOptions: SelectOption[] = students.map((student) => ({
    value: student.id,
    label: `${student.firstName} ${student.lastName}`,
  }));

  const handleGrant = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const expiresAt = Date.now() + Number(selectedDuration) * 60 * 60 * 1000;
      await onGrantPermission(selectedUser, expiresAt);
      setSelectedUser('');
      setSelectedDuration('24');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    setIsLoading(true);
    try {
      await onRevokePermission(userId);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get users with active permissions
  const activePermissions = currentPermissions.filter(p => p.expiresAt > Date.now());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Schedule Edit Permissions</h3>
            <p className="text-sm text-gray-600 mt-1">Grant temporary editing access to students</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Grant Permission Section */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3">Grant New Permission</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Student Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Student</label>
                <Select
                  value={selectedUser}
                  onChange={setSelectedUser}
                  options={studentOptions}
                  placeholder="Select a student..."
                  disabled={isLoading}
                />
              </div>

              {/* Duration Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Duration</label>
                <Select
                  value={selectedDuration}
                  onChange={setSelectedDuration}
                  options={DURATION_OPTIONS}
                  placeholder="Select duration..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mt-4 max-w-xs">
              <ActionButton
                onClick={handleGrant}
                disabled={!selectedUser || isLoading}
                variant="purple"
                icon={<ActionButtonIcons.Plus />}
              >
                {isLoading ? 'Granting...' : 'Grant Permission'}
              </ActionButton>
            </div>
          </div>

          {/* Active Permissions Section */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3">
              Active Permissions ({activePermissions.length})
            </h4>
            {activePermissions.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No active permissions</p>
            ) : (
              <div className="space-y-2">
                {activePermissions.map((permission) => {
                  const user = students.find(s => s.id === permission.userId);
                  const expiresIn = Math.max(0, permission.expiresAt - Date.now());
                  const hoursLeft = Math.floor(expiresIn / (1000 * 60 * 60));
                  const minutesLeft = Math.floor((expiresIn % (1000 * 60 * 60)) / (1000 * 60));

                  return (
                    <div
                      key={permission.userId}
                      className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {user ? `${user.firstName} ${user.lastName}` : permission.userId}
                        </div>
                        <div className="text-sm text-gray-600">
                          Expires in: {hoursLeft}h {minutesLeft}m
                        </div>
                      </div>
                      <div className="w-32">
                        <ActionButton
                          onClick={() => handleRevoke(permission.userId)}
                          disabled={isLoading}
                          variant="red"
                          icon={<ActionButtonIcons.X />}
                        >
                          Revoke
                        </ActionButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <div className="w-40">
            <ActionButton
              onClick={onClose}
              variant="gray"
              icon={<ActionButtonIcons.Close />}
            >
              Close
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
