import { ReactNode } from 'react';

export interface StatGridProps {
  /** Title of the stats section */
  title?: string;
  /** Stat cards to display */
  children: ReactNode;
  /** Optional action button/element in header */
  action?: ReactNode;
}

export function StatGrid({ title, children, action }: StatGridProps) {
  return (
    <div
      className="text-neutral-500 text-sm font-medium leading-snug bg-white border border-solid border-neutral-200"
      role="presentation"
    >
      <div className="p-4">
        {/* Header */}
        {(title || action) && (
          <div className="flex items-center justify-between mb-4">
            {title && <h4 className="text-neutral-900 text-lg font-bold leading-snug">{title}</h4>}
            {action && <div>{action}</div>}
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className="md:grid-cols-2 xl:grid-cols-4 grid">
          {children}
        </div>
      </div>
    </div>
  );
}
