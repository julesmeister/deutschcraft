'use client';

import { useState } from 'react';
import { useSimpleUsers } from '@/lib/hooks/useSimpleUsers';

interface GanttPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantPermission: (userId: string, expiresAt: number) => Promise<void>;
  onRevokePermission: (userId: string) => Promise<void>;
  currentPermissions: Array<{ userId: string; expiresAt: number }>;
}

const DURATION_OPTIONS = [
  { label: '12 hours', hours: 12 },
  { label: '24 hours', hours: 24 },
  { label: '72 hours', hours: 72 },
  { label: '1 week', hours: 168 },
];

export function GanttPermissionDialog({
  isOpen,
  onClose,
  onGrantPermission,
  onRevokePermission,
  currentPermissions,
}: GanttPermissionDialogProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(24);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all students
  const { data: users = [] } = useSimpleUsers();
  const students = users.filter(u => u.role === 'STUDENT');

  const handleGrant = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const expiresAt = Date.now() + selectedDuration * 60 * 60 * 1000;
      await onGrantPermission(selectedUser, expiresAt);
      setSelectedUser('');
      setSelectedDuration(24);
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-piku-purple focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select a student...</option>
                  {students.map((student) => (
                    <option key={student.userId} value={student.userId}>
                      {student.name || student.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-piku-purple focus:border-transparent"
                  disabled={isLoading}
                >
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option.hours} value={option.hours}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGrant}
              disabled={!selectedUser || isLoading}
              className="mt-3 px-4 py-2 bg-piku-purple text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Granting...' : 'Grant Permission'}
            </button>
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
                  const user = students.find(s => s.userId === permission.userId);
                  const expiresIn = Math.max(0, permission.expiresAt - Date.now());
                  const hoursLeft = Math.floor(expiresIn / (1000 * 60 * 60));
                  const minutesLeft = Math.floor((expiresIn % (1000 * 60 * 60)) / (1000 * 60));

                  return (
                    <div
                      key={permission.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {user?.name || user?.email || permission.userId}
                        </div>
                        <div className="text-sm text-gray-600">
                          Expires in: {hoursLeft}h {minutesLeft}m
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevoke(permission.userId)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
