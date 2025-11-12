/**
 * StatButtonGroup Component
 * Displays stats as inline button-like elements (similar to flashcard practice UI)
 * Compact and clean design for displaying multiple stats in a row
 */

import { ReactNode } from 'react';

export interface StatButton {
  label: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink' | 'cyan';
}

export interface StatButtonGroupProps {
  stats: StatButton[];
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    iconBg: 'bg-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    iconBg: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    iconBg: 'bg-amber-500',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    iconBg: 'bg-purple-500',
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-900',
    iconBg: 'bg-pink-500',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-900',
    iconBg: 'bg-cyan-500',
  },
};

export function StatButtonGroup({ stats, className = '' }: StatButtonGroupProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {stats.map((stat, index) => {
        const color = stat.color || 'blue';
        const colors = colorClasses[color];

        return (
          <div
            key={index}
            className={`flex items-center gap-3 ${colors.bg} rounded-xl px-4 py-3 transition-all hover:scale-105`}
          >
            {/* Icon */}
            <div className="text-2xl">{stat.icon}</div>

            {/* Label and Value */}
            <div className="flex flex-col">
              <div className={`text-xs font-medium ${colors.text} opacity-70`}>
                {stat.label}
              </div>
              <div className={`text-xl font-black ${colors.text}`}>
                {stat.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
