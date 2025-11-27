/**
 * GradientFeatureCard Component
 * Reusable card with dark gradient background, title, description, button, and stats
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface Stat {
  icon: LucideIcon;
  iconColor: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  value: string;
  label: string;
}

interface GradientFeatureCardProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  stats?: Stat[];
  gradient?: string; // Custom gradient, defaults to dark gradient
  overlayOpacity?: number; // 0-100, defaults to 70
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
  },
};

export function GradientFeatureCard({
  title,
  description,
  buttonText,
  buttonHref,
  onButtonClick,
  stats,
  gradient = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  overlayOpacity = 70,
}: GradientFeatureCardProps) {
  const ButtonWrapper = buttonHref ? 'a' : 'button';

  return (
    <div className="relative rounded-lg overflow-hidden">
      {/* Gradient Background */}
      <div
        className="absolute inset-0"
        style={{ background: gradient }}
      />

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className="relative p-6 lg:p-8">
        {/* Title */}
        <h4 className="text-lg font-bold text-white uppercase mb-2">
          {title}
        </h4>

        {/* Description */}
        <p className="text-white/75 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Button */}
        {buttonText && (
          <div className="mb-4">
            <ButtonWrapper
              {...(buttonHref ? { href: buttonHref } : {})}
              onClick={onButtonClick}
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {buttonText}
            </ButtonWrapper>
          </div>
        )}

        {/* Stats Section */}
        {stats && stats.length > 0 && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const colors = colorClasses[stat.iconColor];

                  return (
                    <div key={index} className="p-4 text-center">
                      {/* Icon */}
                      <div className="w-9 h-9 mx-auto mb-2 flex items-center justify-center rounded-full">
                        <span className={`w-9 h-9 flex items-center justify-center rounded-full ${colors.bg}`}>
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                        </span>
                      </div>

                      {/* Value */}
                      <h4 className="text-xl font-semibold text-gray-900 mb-1">
                        {stat.value}
                      </h4>

                      {/* Label */}
                      <h5 className="text-sm text-gray-600">
                        {stat.label}
                      </h5>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
