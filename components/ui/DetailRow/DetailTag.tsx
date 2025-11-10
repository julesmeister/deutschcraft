'use client';

interface DetailTagProps {
  label: string;
  color?: 'amber' | 'rose' | 'sky' | 'emerald' | 'purple' | 'blue' | 'neutral';
  className?: string;
}

/**
 * A colored tag/badge for displaying status, priority, labels, etc.
 * Matches the design system from the activity components
 */
export function DetailTag({ label, color = 'neutral', className = '' }: DetailTagProps) {
  const colorClasses = {
    amber: 'bg-amber-200 text-neutral-900 border-neutral-100',
    rose: 'bg-rose-200 text-neutral-900 border-neutral-100',
    sky: 'bg-sky-200 text-neutral-900 border-neutral-100',
    emerald: 'bg-emerald-200 text-neutral-900 border-neutral-100',
    purple: 'bg-purple-200 text-neutral-900 border-neutral-100',
    blue: 'bg-blue-200 text-neutral-900 border-neutral-100',
    neutral: 'bg-neutral-200 text-neutral-900 border-neutral-100',
  };

  return (
    <div
      className={`whitespace-nowrap items-center text-xs font-semibold leading-snug inline-flex px-2.5 py-1 rounded-lg border-solid border ${colorClasses[color]} ${className}`}
    >
      {label}
    </div>
  );
}
