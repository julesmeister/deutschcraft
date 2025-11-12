import { ReactNode } from 'react';

interface DashboardHeaderProps {
  /** Main title of the page */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional actions to display on the right side (e.g., BatchSelector) */
  actions?: ReactNode;
  /** Optional back button configuration */
  backButton?: {
    label: string;
    onClick: () => void;
  };
  /** Optional avatar/profile section */
  avatar?: {
    src?: string;
    initial: string;
    subtitle?: string;
  };
}

/**
 * Reusable Dashboard Header Component
 *
 * Provides consistent header styling across all dashboard pages:
 * - Transparent background (no bg-white!)
 * - Bottom border separator
 * - Container with consistent padding
 * - Supports back button, avatar, and action buttons
 *
 * @example
 * // Teacher Dashboard
 * <DashboardHeader
 *   title="Teacher Dashboard 👨‍🏫"
 *   subtitle="Monitor and manage your students' progress"
 *   actions={<BatchSelector ... />}
 * />
 *
 * @example
 * // Student Dashboard
 * <DashboardHeader
 *   title={`Welcome back, ${userName}!`}
 *   subtitle="Continue your German learning journey"
 * />
 *
 * @example
 * // Student Profile
 * <DashboardHeader
 *   title="John Doe"
 *   subtitle="Current Level: B1"
 *   backButton={{ label: "Back to Dashboard", onClick: () => router.push(...) }}
 *   avatar={{ initial: "J", subtitle: "john@example.com" }}
 * />
 */
export function DashboardHeader({
  title,
  subtitle,
  actions,
  backButton,
  avatar,
}: DashboardHeaderProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="container mx-auto px-6 py-6">
        {/* Back Button */}
        {backButton && (
          <button
            onClick={backButton.onClick}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {backButton.label}
          </button>
        )}

        {/* Header Content */}
        <div className="flex items-center justify-between">
          {/* Left Side: Title/Avatar */}
          <div className="flex items-center gap-4">
            {/* Avatar (optional) */}
            {avatar && (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-piku-purple to-piku-cyan flex items-center justify-center text-3xl font-black text-white overflow-hidden">
                {avatar.src ? (
                  <img
                    src={avatar.src}
                    alt={avatar.initial}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatar.initial
                )}
              </div>
            )}

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
              {avatar?.subtitle && (
                <p className="text-sm text-gray-500">{avatar.subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Side: Actions */}
          {actions && <div>{actions}</div>}
        </div>
      </div>
    </div>
  );
}
