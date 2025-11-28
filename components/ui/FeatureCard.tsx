/**
 * FeatureCard Component
 * Reusable card component inspired by modern pricing card patterns
 * Can be used for exercises, features, plans, etc.
 */

import { ReactNode } from 'react';

export type CardVariant = 'default' | 'highlighted';

export interface FeatureCardProps {
  icon?: string;
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  };
  variant?: CardVariant;
  button?: {
    text: string;
    onClick: () => void;
  };
  features?: string[];
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  className?: string;
}

function getBadgeClasses(variant: 'default' | 'success' | 'warning' | 'danger' = 'default'): string {
  switch (variant) {
    case 'success':
      return 'bg-[#c6ff7c] text-[#070515]';
    case 'warning':
      return 'bg-[#ff5f2e] text-white';
    case 'danger':
      return 'bg-red-500 text-white';
    default:
      return 'bg-[#b4dbff] text-[#070515]';
  }
}

function getButtonClasses(variant: CardVariant): string {
  if (variant === 'highlighted') {
    return 'bg-[#c6ff7c] hover:bg-[#b4dbff] text-[#070515]';
  }
  return 'bg-white hover:bg-[#b4dbff] text-[#070515]';
}

export function FeatureCard({
  icon,
  title,
  subtitle,
  badge,
  variant = 'default',
  button,
  features,
  footerLeft,
  footerRight,
  className = '',
}: FeatureCardProps) {
  const isHighlighted = variant === 'highlighted';

  return (
    <div
      className={`
        relative rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8
        flex flex-col gap-4 md:gap-5 lg:gap-8
        ${isHighlighted ? 'bg-white' : 'bg-white'}
        transition-all duration-300
        w-full
        ${className}
      `}
    >
      {/* Header Section with Badge */}
      <div className="flex items-start justify-between gap-2 md:gap-3">
        <div className="flex flex-col gap-3 md:gap-4 lg:gap-5 flex-1">
          {icon && (
            <img
              src={icon}
              alt=""
              className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 object-cover"
            />
          )}
          <div className="flex flex-col gap-1">
            <div className="text-[#070515]">
              <h3 className="font-bold text-base md:text-lg lg:text-xl uppercase tracking-[-0.02em] leading-[1.5]">
                {title}
              </h3>
            </div>
            {subtitle && (
              <div className="text-[#6d6c6c] text-xs md:text-sm leading-[1.45]">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Badge aligned with title */}
        {badge && (
          <div
            className={`
              ${getBadgeClasses(badge.variant)}
              rounded-full px-2.5 py-1.5 md:px-3 md:py-1.5 lg:px-4 lg:py-2 text-xs md:text-sm font-semibold
              inline-flex items-center justify-center
              flex-shrink-0
            `}
          >
            {badge.text}
          </div>
        )}
      </div>

      {/* Footer Section - Badge Style */}
      {(footerLeft || footerRight) && (
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {footerLeft && (
            <div className="bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 md:px-3 md:py-1.5 text-xs font-semibold inline-flex items-center">
              {footerLeft}
            </div>
          )}
          {footerRight && (
            <div className="bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 md:px-3 md:py-1.5 text-xs font-semibold inline-flex items-center">
              {footerRight}
            </div>
          )}
        </div>
      )}

      {/* Features List */}
      {features && features.length > 0 && (
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="text-[#070515] font-normal text-sm md:text-base">
            Sample sentences:
          </div>
          <div className="flex flex-col gap-2 md:gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="currentColor"
                    className="text-[#070515]"
                  />
                </svg>
                <div className="text-[#6d6c6c] text-sm md:text-base leading-[1.45] flex-1">
                  {feature}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
