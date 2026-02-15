'use client';

import { useState } from 'react';
import { CompactButtonDropdown, DropdownOption } from './CompactButtonDropdown';
import { ConfirmDialog } from './Dialog';

type PendingAction = { type: 'remove' | 'expire' | 'approve' } | null;

const confirmConfig = {
  remove: {
    title: 'Remove Student',
    message: 'Are you sure you want to remove this student? They will be unassigned from your class.',
    confirmText: 'Remove',
    variant: 'danger' as const,
  },
  expire: {
    title: 'Expire Student',
    message: 'Are you sure you want to expire this student? Their status will change to pending approval.',
    confirmText: 'Expire',
    variant: 'danger' as const,
  },
  approve: {
    title: 'Approve Student',
    message: 'Are you sure you want to approve this student? They will gain full access.',
    confirmText: 'Approve',
    variant: 'primary' as const,
  },
};

interface StudentActionsDropdownProps {
  studentId: string;
  studentRole?: 'STUDENT' | 'TEACHER' | 'PENDING_APPROVAL';
  onRemoveStudent: (studentId: string) => void;
  onChangeRole?: (studentId: string, newRole: 'STUDENT' | 'PENDING_APPROVAL') => void;
  isRemoving: boolean;
  isChangingRole?: boolean;
}

export function StudentActionsDropdown({
  studentId,
  studentRole,
  onRemoveStudent,
  onChangeRole,
  isRemoving,
  isChangingRole = false,
}: StudentActionsDropdownProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const handleAction = (value: string | string[]) => {
    if (isRemoving || isChangingRole) return;

    if (value === 'remove' || value === 'expire' || value === 'approve') {
      setPendingAction({ type: value });
    }
  };

  const handleConfirm = () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'remove') {
      onRemoveStudent(studentId);
    } else if (pendingAction.type === 'expire' && onChangeRole) {
      onChangeRole(studentId, 'PENDING_APPROVAL');
    } else if (pendingAction.type === 'approve' && onChangeRole) {
      onChangeRole(studentId, 'STUDENT');
    }

    setPendingAction(null);
  };

  const actionOptions: DropdownOption[] = [];

  // Show "Approve Student" if role is PENDING_APPROVAL
  if (studentRole === 'PENDING_APPROVAL' && onChangeRole) {
    actionOptions.push({
      value: 'approve',
      label: isChangingRole ? 'Approving...' : 'Approve Student',
      icon: isChangingRole ? (
        <svg
          className="w-3.5 h-3.5 animate-spin text-green-600"
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
        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    });
  }

  // Show "Expire Student" if role is STUDENT
  if (studentRole === 'STUDENT' && onChangeRole) {
    actionOptions.push({
      value: 'expire',
      label: isChangingRole ? 'Expiring...' : 'Expire Student',
      icon: isChangingRole ? (
        <svg
          className="w-3.5 h-3.5 animate-spin text-orange-600"
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
        <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    });
  }

  // Always show Remove action
  actionOptions.push({
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
  });

  return (
    <div className="student-actions-dropdown">
      <CompactButtonDropdown
        label="Actions"
        options={actionOptions}
        onChange={handleAction}
        disabled={isRemoving || isChangingRole}
        usePortal={true}
        buttonClassName="!text-xs !py-1 !px-2.5 !bg-gray-100 hover:!bg-gray-200"
      />

      {pendingAction && (
        <ConfirmDialog
          open={true}
          onClose={() => setPendingAction(null)}
          onConfirm={handleConfirm}
          title={confirmConfig[pendingAction.type].title}
          message={confirmConfig[pendingAction.type].message}
          confirmText={confirmConfig[pendingAction.type].confirmText}
          variant={confirmConfig[pendingAction.type].variant}
        />
      )}
    </div>
  );
}
