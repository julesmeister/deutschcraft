import { ReactNode } from 'react';

export interface KpiCardProps {
  /** Icon element or emoji */
  icon: ReactNode;
  /** Background color for icon (e.g., 'bg-rose-200', 'bg-sky-200') */
  iconBgColor?: string;
  /** Label text above the value */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Change percentage (e.g., '+5.3%' or '-2.1%') */
  change?: string;
  /** Comparison text (e.g., 'vs last month') */
  comparisonText?: string;
  /** Whether change is positive (green) or negative (red) */
  isPositive?: boolean;
}

export function KpiCard({
  icon,
  iconBgColor = 'bg-gray-200',
  label,
  value,
  change,
  comparisonText = 'vs last month',
  isPositive = true,
}: KpiCardProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-neutral-200 px-6 py-4 md:border-b-0 md:border-r [border-right-style:solid] [border-bottom-style:solid] last:border-r-0">
      {/* Icon */}
      <div
        className={`flex max-h-12 min-h-12 max-w-12 min-w-12 items-center justify-center rounded-full ${iconBgColor} text-2xl leading-snug text-neutral-900`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="mt-4">
        <div className="mb-1 text-neutral-500 text-sm">{label}</div>
        <h3 className="text-neutral-900 text-2xl font-bold leading-snug mb-1">
          {value}
        </h3>
        {change && (
          <div className="inline-flex flex-wrap items-center gap-1 text-sm">
            <span
              className={`flex items-center font-bold ${
                isPositive ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {change}
            </span>
            <span className="text-neutral-500">{comparisonText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
