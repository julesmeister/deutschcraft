/**
 * ExerciseCard Component
 * Reusable card for displaying exercises/templates
 * Uses FeatureCard component with modern pricing card pattern
 */

import { ReactNode } from 'react';
import { FeatureCard } from '@/components/ui/FeatureCard';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ExerciseCardProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  difficulty: Difficulty;
  footer?: ReactNode;
  footerLeft?: string;
  footerRight?: string;
  onClick: () => void;
  className?: string;
  isAttempted?: boolean;
  sampleSentences?: string[];
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

function getDifficultyBadgeVariant(difficulty: Difficulty): 'default' | 'success' | 'warning' | 'danger' {
  switch (difficulty) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'warning';
    case 'hard':
      return 'danger';
  }
}

export function ExerciseCard({
  icon,
  title,
  description,
  difficulty,
  footer,
  footerLeft,
  footerRight,
  onClick,
  className = '',
  isAttempted = false,
  sampleSentences
}: ExerciseCardProps) {
  // Use new footer props if provided, otherwise fall back to old footer
  const leftContent = footerLeft || (footer ? (
    <div className="text-sm text-[#6d6c6c]">
      {footer}
    </div>
  ) : undefined);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 p-0.5 ${className}`}
    >
      <FeatureCard
        title={title}
        subtitle={typeof description === 'string' ? description : undefined}
        badge={{
          text: isAttempted ? '✓ Attempted' : difficulty,
          variant: isAttempted ? 'default' : getDifficultyBadgeVariant(difficulty)
        }}
        variant={isAttempted ? 'highlighted' : 'default'}
        features={sampleSentences}
        footerLeft={leftContent}
        footerRight={footerRight}
        className={`${isAttempted ? 'ring-2 ring-[#b4dbff]' : ''} hover:shadow-lg`}
      />
    </div>
  );
}
