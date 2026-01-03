import { SettingsMenuItem } from "./SettingsSidebar";
import { SettingsTab } from "@/lib/hooks/useSettingsData";

/**
 * Build settings menu items based on enrollment status
 */
export function getSettingsMenuItems(
  isPending: boolean,
  activeTab: SettingsTab,
  setActiveTab: (tab: SettingsTab) => void
): SettingsMenuItem[] {
  return [
    // Enrollment tab - only for pending users
    ...(isPending
      ? [
          {
            id: "enrollment",
            label: "Enrollment",
            icon: (
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
            ),
            active: activeTab === "enrollment",
            onClick: () => setActiveTab("enrollment"),
          },
        ]
      : []),
    // Profile tab - always visible
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="1em"
          width="1em"
        >
          <path d="M9 10a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
          <path d="M6 21v-1a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v1"></path>
          <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"></path>
        </svg>
      ),
      active: activeTab === "profile",
      onClick: () => setActiveTab("profile"),
    },
    // Security tab - always visible
    {
      id: "security",
      label: "Security",
      icon: (
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="1em"
          width="1em"
        >
          <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"></path>
          <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
          <path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>
        </svg>
      ),
      active: activeTab === "security",
      onClick: () => setActiveTab("security"),
    },
    // Database Migration - always visible (for recovery)
    {
      id: "migration",
      label: "Database",
      icon: (
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="1em"
          width="1em"
        >
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
        </svg>
      ),
      active: activeTab === "migration",
      onClick: () => setActiveTab("migration"),
    },
    // Notification, Flashcards, Integration - only for approved users
    ...(!isPending
      ? [
          {
            id: "notification",
            label: "Notification",
            icon: (
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
              >
                <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"></path>
                <path d="M9 17v1a3 3 0 0 0 6 0v-1"></path>
              </svg>
            ),
            active: activeTab === "notification",
            onClick: () => setActiveTab("notification"),
          },
          {
            id: "flashcards",
            label: "Flashcards",
            icon: (
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
              >
                <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
                <path d="M7 21h10"></path>
                <path d="M9 18v3"></path>
                <path d="M15 18v3"></path>
              </svg>
            ),
            active: activeTab === "flashcards",
            onClick: () => setActiveTab("flashcards"),
          },
          {
            id: "integration",
            label: "Integration",
            icon: (
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
              >
                <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
                <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
              </svg>
            ),
            active: activeTab === "integration",
            onClick: () => setActiveTab("integration"),
          },
        ]
      : []),
  ];
}
