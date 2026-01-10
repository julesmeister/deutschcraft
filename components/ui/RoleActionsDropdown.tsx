"use client";

import { CompactButtonDropdown, DropdownOption } from "./CompactButtonDropdown";

interface RoleActionsDropdownProps {
  userId: string;
  currentRole: string;
  isCurrentUser: boolean;
  onChangeRole: (
    userId: string,
    newRole: "STUDENT" | "TEACHER" | "PENDING_APPROVAL"
  ) => void;
  isUpdating: boolean;
}

export function RoleActionsDropdown({
  userId,
  currentRole,
  isCurrentUser,
  onChangeRole,
  isUpdating,
}: RoleActionsDropdownProps) {
  const handleAction = (value: string | string[]) => {
    if (isUpdating || isCurrentUser) return;

    if (value === "make-teacher") {
      onChangeRole(userId, "TEACHER");
    } else if (value === "make-student") {
      onChangeRole(userId, "STUDENT");
    } else if (value === "approve-user") {
      onChangeRole(userId, "STUDENT");
    } else if (value === "make-pending") {
      onChangeRole(userId, "PENDING_APPROVAL");
    }
  };

  const actionOptions: DropdownOption[] = [];

  // Add "Make Teacher" option if not already a teacher
  if (currentRole !== "TEACHER") {
    actionOptions.push({
      value: "make-teacher",
      label: isUpdating ? "Updating..." : "Promote to Teacher",
      icon: isUpdating ? (
        <svg
          className="w-3.5 h-3.5 animate-spin text-purple-600"
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
        <svg
          className="w-3.5 h-3.5 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    });
  }

  // Add "Make Student" option if not already a student and not current user
  if (
    currentRole !== "STUDENT" &&
    currentRole !== "PENDING_APPROVAL" &&
    !isCurrentUser
  ) {
    actionOptions.push({
      value: "make-student",
      label: isUpdating ? "Updating..." : "Demote to Student",
      icon: isUpdating ? (
        <svg
          className="w-3.5 h-3.5 animate-spin text-cyan-600"
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
        <svg
          className="w-3.5 h-3.5 text-cyan-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    });
  }

  // Add "Approve User" if pending approval
  if (currentRole === "PENDING_APPROVAL" && !isCurrentUser) {
    actionOptions.push({
      value: "approve-user",
      label: isUpdating ? "Updating..." : "Approve User",
      icon: isUpdating ? (
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
        <svg
          className="w-3.5 h-3.5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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

  // Add "Set to Pending" if currently a student
  if (currentRole === "STUDENT" && !isCurrentUser) {
    actionOptions.push({
      value: "make-pending",
      label: isUpdating ? "Updating..." : "Set to Pending",
      icon: isUpdating ? (
        <svg
          className="w-3.5 h-3.5 animate-spin text-yellow-600"
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
        <svg
          className="w-3.5 h-3.5 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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

  // If no actions available (current user), show disabled message
  if (actionOptions.length === 0) {
    actionOptions.push({
      value: "none",
      label: isCurrentUser ? "Cannot edit self" : "No actions",
      icon: (
        <svg
          className="w-3.5 h-3.5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    });
  }

  return (
    <div className="role-actions-dropdown">
      <CompactButtonDropdown
        label="Actions"
        options={actionOptions}
        onChange={handleAction}
        disabled={
          isUpdating || isCurrentUser || actionOptions[0].value === "none"
        }
        usePortal={true}
        buttonClassName="!text-xs !py-1 !px-2.5 !bg-gray-100 hover:!bg-gray-200"
      />
    </div>
  );
}
