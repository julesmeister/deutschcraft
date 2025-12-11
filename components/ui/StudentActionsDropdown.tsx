'use client';

import { CompactButtonDropdown, DropdownOption } from './CompactButtonDropdown';
import { CEFRLevel } from '@/lib/models';

interface StudentActionsDropdownProps {
  studentId: string;
  currentLevel?: string;
  onRemoveStudent: (studentId: string) => void;
  onChangeLevel?: (studentId: string, newLevel: CEFRLevel) => void;
  isRemoving: boolean;
}

export function StudentActionsDropdown({
  studentId,
  currentLevel,
  onRemoveStudent,
  onChangeLevel,
  isRemoving,
}: StudentActionsDropdownProps) {
  const handleAction = (value: string | string[]) => {
    if (value === 'remove' && !isRemoving) {
      onRemoveStudent(studentId);
    } else if (value.startsWith('level-') && onChangeLevel) {
      const newLevel = value.replace('level-', '') as CEFRLevel;
      onChangeLevel(studentId, newLevel);
    }
  };

  const actionOptions: DropdownOption[] = [
    {
      value: 'change-level',
      label: 'Change Level',
      icon: (
        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      ),
      children: [
        {
          value: 'level-A1',
          label: 'A1',
          disabled: currentLevel === 'A1',
        },
        {
          value: 'level-A2',
          label: 'A2',
          disabled: currentLevel === 'A2',
        },
        {
          value: 'level-B1',
          label: 'B1',
          disabled: currentLevel === 'B1',
        },
        {
          value: 'level-B2',
          label: 'B2',
          disabled: currentLevel === 'B2',
        },
        {
          value: 'level-C1',
          label: 'C1',
          disabled: currentLevel === 'C1',
        },
        {
          value: 'level-C2',
          label: 'C2',
          disabled: currentLevel === 'C2',
        },
      ],
    },
    {
      value: 'remove',
      label: isRemoving ? 'Removing...' : 'Remove',
      icon: isRemoving ? (
        <svg
          className="w-3.5 h-3.5 animate-spin text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="student-actions-dropdown">
      <CompactButtonDropdown
        label="Actions"
        options={actionOptions}
        onChange={handleAction}
        disabled={isRemoving}
        usePortal={true}
        buttonClassName="!text-xs !py-1 !px-2.5 !bg-gray-100 hover:!bg-gray-200"
      />
    </div>
  );
}
