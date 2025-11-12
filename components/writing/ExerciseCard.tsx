/**
 * ExerciseCard Component
 * Reusable card for displaying exercises/templates
 * Inspired by Intercom's pricing card design for a professional look
 */

import { ReactNode } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ExerciseCardProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  difficulty: Difficulty;
  footer?: ReactNode;
  onClick: () => void;
  className?: string;
}

export function getDifficultyBadgeClasses(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-emerald-100 text-emerald-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    case 'hard':
      return 'bg-red-100 text-red-700';
  }
}

export function ExerciseCard({
  icon,
  title,
  description,
  difficulty,
  footer,
  onClick,
  className = ''
}: ExerciseCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white p-4 md:p-5 lg:p-6 flex flex-col gap-6 lg:gap-8
        border border-gray-200
        cursor-pointer transition-all duration-200 ease-out hover:shadow-lg hover:border-gray-300
        ${className}
      `}
    >
      {/* Header Section with Title and Badge */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="text-[18px] md:text-[22px] font-semibold tracking-[-0.01em] md:tracking-[-0.22px] leading-[115%] text-[#17100e]">
              {title}
            </h3>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 shrink-0 ${getDifficultyBadgeClasses(difficulty)}`}>
            {difficulty}
          </span>
        </div>
        <div className="text-base font-normal leading-[1.25] text-[#17100e]">
          {description}
        </div>
      </div>

      {/* Footer Section (if provided) */}
      {footer && (
        <div className="border-t border-[#17100e1a] pt-3 lg:pt-4 text-sm text-[#17100e]">
          {footer}
        </div>
      )}
    </div>
  );
}
