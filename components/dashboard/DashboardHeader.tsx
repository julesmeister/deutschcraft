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
    subtitleAsBadge?: boolean; // Display subtitle as a badge
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
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Back Button */}
        {backButton && (
          <button
            onClick={backButton.onClick}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {backButton.label}
          </button>
        )}

        {/* Header Content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left Side: Title/Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar (optional) */}
            {avatar && (
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-piku-purple to-piku-cyan flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-black text-white overflow-hidden flex-shrink-0">
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
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm sm:text-base text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">{subtitle}</p>
              )}
              {avatar?.subtitle && (
                avatar.subtitleAsBadge ? (
                  <span className="inline-block px-2 py-0.5 bg-piku-mint text-green-800 text-xs font-medium rounded">
                    {avatar.subtitle}
                  </span>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{avatar.subtitle}</p>
                )
              )}
            </div>
          </div>

          {/* Right Side: Actions */}
          {actions && <div className="flex-shrink-0 w-full sm:w-auto relative z-20">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
