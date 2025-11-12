/**
 * GradingSection Component
 * Reusable section wrapper for grading form sections
 */

import { ReactNode } from 'react';

interface GradingSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function GradingSection({ title, subtitle, children }: GradingSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}
