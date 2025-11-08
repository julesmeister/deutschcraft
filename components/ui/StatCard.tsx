import { ReactNode } from 'react';
import { useAnimatedCounter } from '@/lib/hooks/useAnimatedCounter';
import { Card, CardContent } from '@/components/ui/Card';

interface StatCardProps {
  /** Title/label for the stat */
  title: string;
  /** The target value to display */
  value: number;
  /** Icon to display (emoji or ReactNode) */
  icon?: ReactNode;
  /** Icon background color (Tailwind class) */
  iconBgColor?: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional trend indicator */
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** Whether to animate the counter (default: true) */
  animate?: boolean;
  /** Custom formatter for the value */
  formatValue?: (value: number) => string;
  /** Whether to show hover effect (default: true) */
  hover?: boolean;
  /** Optional suffix (e.g., '%', 'words', 'days') */
  suffix?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconBgColor = 'bg-piku-purple-light',
  subtitle,
  trend,
  animate = true,
  formatValue,
  hover = true,
  suffix = '',
}: StatCardProps) {
  const animatedValue = useAnimatedCounter({
    target: value,
    initialValue: 0,
    interval: 20,
  });

  const displayValue = animate ? animatedValue : value;
  const formattedValue = formatValue
    ? formatValue(displayValue)
    : displayValue.toLocaleString();

  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-200/50 ${hover ? 'hover:shadow-md hover:border-gray-300/50' : 'shadow-sm'} transition-all duration-300`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div
            className={`w-14 h-14 rounded-xl ${iconBgColor} flex items-center justify-center flex-shrink-0 shadow-sm`}
          >
            {typeof icon === 'string' ? (
              <span className="text-2xl">{icon}</span>
            ) : (
              icon
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-sm font-medium truncate mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-gray-900">
              {formattedValue}
              {suffix && <span className="text-lg ml-1 text-gray-600">{suffix}</span>}
            </h3>
            {trend && (
              <span
                className={`text-sm font-bold ${
                  trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Preset stat card variants for common use cases
export function WordsLearnedCard({ value, hover = true }: { value: number; hover?: boolean }) {
  return (
    <StatCard
      title="Words Learned"
      value={value}
      icon="📚"
      iconBgColor="bg-piku-purple-light"
      hover={hover}
    />
  );
}

export function WordsMasteredCard({ value, hover = true }: { value: number; hover?: boolean }) {
  return (
    <StatCard
      title="Words Mastered"
      value={value}
      icon="✨"
      iconBgColor="bg-piku-mint"
      hover={hover}
    />
  );
}

export function StreakCard({ value, hover = true }: { value: number; hover?: boolean }) {
  return (
    <StatCard
      title="Current Streak"
      value={value}
      icon="🔥"
      iconBgColor="bg-piku-orange"
      suffix="days"
      hover={hover}
    />
  );
}

export function SuccessRateCard({ value, hover = true }: { value: number; hover?: boolean }) {
  return (
    <StatCard
      title="Success Rate"
      value={value}
      icon="🎯"
      iconBgColor="bg-piku-yellow-light"
      suffix="%"
      hover={hover}
      formatValue={(v) => v.toFixed(0)}
    />
  );
}
