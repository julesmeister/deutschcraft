import { ReactNode } from 'react';

export interface StatCardProps {
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

export function StatCard({
  icon,
  iconBgColor = 'bg-gray-200',
  label,
  value,
  change,
  comparisonText = 'vs last month',
  isPositive = true,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-200 px-4 py-3 md:border-b-0 md:border-r [border-right-style:solid] [border-bottom-style:solid] last:border-r-0 flex-1">
      {/* Icon */}
      <div
        className={`flex max-h-10 min-h-10 max-w-10 min-w-10 items-center justify-center ${iconBgColor} text-xl leading-snug text-neutral-900`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="mt-2">
        <div className="mb-0.5 text-neutral-500 text-xs">{label}</div>
        <h3 className="text-neutral-900 text-xl font-bold leading-snug mb-0.5">
          {value}
        </h3>
        {change && (
          <div className="inline-flex flex-wrap items-center gap-1 text-xs">
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
