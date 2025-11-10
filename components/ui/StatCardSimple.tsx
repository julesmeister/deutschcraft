import { ReactNode } from 'react';

export interface StatCardSimpleProps {
  /** Label text above the value */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Icon element or emoji */
  icon: ReactNode;
  /** Background color for card (e.g., 'bg-sky-100', 'bg-emerald-100') */
  bgColor?: string;
  /** Icon background color (defaults to dark) */
  iconBgColor?: string;
  /** Icon text color (defaults to white) */
  iconTextColor?: string;
}

export function StatCardSimple({
  label,
  value,
  icon,
  bgColor = 'bg-gray-100',
  iconBgColor = 'bg-neutral-900',
  iconTextColor = 'text-white',
}: StatCardSimpleProps) {
  return (
    <div className={`flex flex-col justify-center rounded-2xl ${bgColor} p-4`}>
      <div className="relative flex items-center justify-between">
        <div>
          <div className="mb-4 font-bold text-neutral-900">{label}</div>
          <h1 className="text-4xl font-bold leading-none mb-1 text-neutral-900">{value}</h1>
        </div>
        <div
          className={`flex max-h-12 min-h-12 max-w-12 min-w-12 items-center justify-center rounded-full ${iconBgColor} ${iconTextColor} text-2xl leading-snug`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
