import { ReactNode } from 'react';
import { ActionButton, ActionButtonIcons } from './ActionButton';

interface DataCardProps {
  /** Large value/number at top */
  value: string | number;
  /** Title/label */
  title: string;
  /** Description text (shows on hover) */
  description?: string;
  /** Mastery percentage (0-100) */
  mastery?: number;
  /** Click handler */
  onClick?: () => void;
  /** Accent color for border and text */
  accentColor?: string;
}

export function DataCard({
  value,
  title,
  description,
  mastery,
  onClick,
  accentColor = '#753BBD',
}: DataCardProps) {
  // Determine button variant based on mastery
  const getButtonVariant = () => {
    if (!mastery) return 'purple';
    if (mastery >= 70) return 'mint';
    if (mastery >= 40) return 'yellow';
    return 'purple'; // Changed from red to purple for low mastery
  };

  return (
    <button
      onClick={onClick}
      className="group flex flex-col w-full overflow-hidden rounded-lg bg-white p-4 shadow-md transition-all duration-[450ms] ease-out hover:scale-[1.02] hover:bg-[#753BBD] cursor-pointer text-left"
      style={{
        boxShadow: '0 0.5em 1em -0.25em rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Value */}
      <h3
        className="text-2xl font-bold leading-none pb-2 mb-2 border-b-2 transition-all duration-[450ms] text-[#2E3C40] group-hover:text-white group-hover:!border-white truncate"
        style={{
          borderBottomColor: accentColor,
        }}
      >
        {value}
      </h3>

      {/* Title */}
      <h4 className="text-[#627084] uppercase text-xs font-bold leading-tight tracking-wider mb-3 transition-colors duration-[450ms] group-hover:text-white truncate">
        {title}
      </h4>

      {/* Description (shows on hover) */}
      {description && (
        <p className="opacity-0 text-white text-xs font-medium leading-tight mb-2 transform translate-y-[-0.5em] transition-all duration-[450ms] group-hover:opacity-100 group-hover:translate-y-0 truncate">
          {description}
        </p>
      )}

      {/* Action Button - Normal state */}
      <div className="mt-auto opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
        <ActionButton
          variant={getButtonVariant()}
          icon={<ActionButtonIcons.ArrowRight />}
        >
          {mastery !== undefined ? `${mastery}%` : 'Practice'}
        </ActionButton>
      </div>

      {/* Action Button - Hover state (white) */}
      <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-4 left-4 right-4">
        <button className="w-full inline-flex items-center font-bold text-xs py-1.5 pl-3 pr-1.5 rounded-full bg-white text-gray-900 transition-all duration-300 hover:bg-white/90">
          <span className="flex-1 text-left">
            {mastery !== undefined ? `${mastery}% Mastery` : 'Practice'}
          </span>
          <span className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-900/10">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </button>
  );
}

interface DataCardGridProps {
  children: ReactNode;
}

export function DataCardGrid({ children }: DataCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-8">
      {children}
    </div>
  );
}
