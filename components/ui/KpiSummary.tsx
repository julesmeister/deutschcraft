import { ReactNode } from 'react';

export interface KpiSummaryProps {
  /** Title of the KPI summary section */
  title?: string;
  /** KPI cards to display */
  children: ReactNode;
  /** Optional action button/element in header */
  action?: ReactNode;
}

export function KpiSummary({ title = 'KPI Summary', children, action }: KpiSummaryProps) {
  return (
    <div
      className="text-neutral-500 text-sm font-medium leading-snug bg-white rounded-2xl border border-solid border-neutral-200"
      role="presentation"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-neutral-900 text-xl font-bold leading-snug">{title}</h4>
          {action && <div>{action}</div>}
        </div>

        {/* KPI Cards Grid */}
        <div className="md:grid-cols-2 xl:grid-cols-4 mt-6 grid gap-y-4 gap-x-4">
          {children}
        </div>
      </div>
    </div>
  );
}
