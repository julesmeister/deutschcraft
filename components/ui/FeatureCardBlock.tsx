/**
 * FeatureCardBlock Component
 * Container that displays FeatureCard components in a horizontal layout
 * Mimics the pricing-card-block pattern
 */

import { ReactNode } from 'react';

export interface FeatureCardBlockProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function getMaxWidthClass(maxWidth: 'sm' | 'md' | 'lg' | 'xl'): string {
  switch (maxWidth) {
    case 'sm':
      return 'max-w-2xl';
    case 'md':
      return 'max-w-4xl';
    case 'lg':
      return 'max-w-6xl';
    case 'xl':
      return 'max-w-7xl';
  }
}

export function FeatureCardBlock({
  children,
  maxWidth = 'lg',
  className = '',
}: FeatureCardBlockProps) {
  return (
    <div
      className={`
        bg-[#f8f8f8] rounded-2xl
        p-4
        ${getMaxWidthClass(maxWidth)}
        mx-auto
        ${className}
      `}
      style={{
        opacity: 1,
        filter: 'blur(0px)',
        transform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)',
        transformStyle: 'preserve-3d'
      }}
    >
      <div className="flex flex-col md:flex-row gap-4 justify-start items-stretch w-full">
        {children}
      </div>
    </div>
  );
}
