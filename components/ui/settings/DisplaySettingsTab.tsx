/**
 * DisplaySettingsTab Component
 * Allows teachers to control display preferences like navbar visibility
 */

'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { updateUser } from '@/lib/services/user';
import { useToast } from '@/lib/hooks/useToast';

interface DisplaySettingsTabProps {
  userEmail: string | null;
  userRole: 'STUDENT' | 'TEACHER' | 'PENDING_APPROVAL' | undefined;
  currentSettings?: {
    showTeacherTabToStudents?: boolean;
  };
}

export function DisplaySettingsTab({
  userEmail,
  userRole,
  currentSettings,
}: DisplaySettingsTabProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showTeacherTab, setShowTeacherTab] = useState(
    currentSettings?.showTeacherTabToStudents ?? true
  );

  // Sync local state when currentSettings changes
  useEffect(() => {
    const value = currentSettings?.showTeacherTabToStudents ?? true;
    console.log('[DisplaySettings] Loading setting from database:', {
      currentSettings,
      value,
    });
    setShowTeacherTab(value);
  }, [currentSettings?.showTeacherTabToStudents]);

  const handleToggle = async () => {
    const newValue = !showTeacherTab;
    setShowTeacherTab(newValue);

    if (!userEmail) {
      showToast('Not authenticated', 'error');
      return;
    }

    console.log('[DisplaySettings] Saving setting:', {
      userEmail,
      showTeacherTabToStudents: newValue,
    });

    try {
      await updateUser(userEmail, {
        displaySettings: {
          showTeacherTabToStudents: newValue,
        },
      });
      console.log('[DisplaySettings] Successfully saved');

      // Invalidate user query to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['user', userEmail] });
      console.log('[DisplaySettings] Cache invalidated, data will refresh');

      showToast('Settings saved', 'success', 2000);
    } catch (error) {
      console.error('[DisplaySettings] Save failed:', error);
      showToast('Failed to save settings', 'error');
      // Revert on error
      setShowTeacherTab(!newValue);
    }
  };

  // Only teachers can see this tab
  if (userRole !== 'TEACHER') {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Display settings are only available for teachers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Display Settings</h2>
        <p className="text-gray-600 mt-1">
          Control what students can see in the navigation
        </p>
      </div>

      {/* Navbar Visibility Settings */}
      <div className="space-y-6">
        {/* Teacher Tab Toggle */}
        <div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Show Teacher Tab to Students
              </label>
              <p className="text-sm text-gray-600">
                When enabled, students can access teacher resources and pages
              </p>
            </div>
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showTeacherTab ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showTeacherTab ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Info message */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Navigation Access Control
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {showTeacherTab
                  ? 'Students will see the Teacher navigation menu and can access all teacher pages.'
                  : 'The Teacher navigation menu will be hidden from students. They will only see Student-related pages.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
