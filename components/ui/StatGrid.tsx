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
      className="text-neutral-500 text-sm font-medium leading-snug bg-white rounded-2xl border border-solid border-neutral-200"
      role="presentation"
    >
      <div className="p-5">
        {/* Header */}
        {(title || action) && (
          <div className="flex items-center justify-between">
            {title && <h4 className="text-neutral-900 text-xl font-bold leading-snug">{title}</h4>}
            {action && <div>{action}</div>}
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className={`md:grid-cols-2 xl:grid-cols-4 grid gap-y-4 gap-x-4 ${title || action ? 'mt-6' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
