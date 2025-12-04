import { ReactNode } from 'react';

export interface StatGridSimpleProps {
  /** Title of the section */
  title?: string;
  /** Stat cards to display */
  children: ReactNode;
  /** Optional action button/link in header */
  action?: ReactNode;
  /** Number of columns on desktop (2, 3, or 4) */
  columns?: 2 | 3 | 4;
}

export function StatGridSimple({ title, children, action, columns = 3 }: StatGridSimpleProps) {
  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns];

  return (
    <div className="text-neutral-500 text-sm font-medium leading-snug p-5">
      {/* Header */}
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && <h4 className="text-neutral-900 text-xl font-bold leading-snug">{title}</h4>}
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Cards - Flex on mobile, Grid on desktop */}
      <div
        className={`${gridColsClass} mt-4 flex flex-col md:grid gap-y-4 gap-x-4 rounded-2xl md:flex-none`}
      >
        {children}
      </div>
    </div>
  );
}
