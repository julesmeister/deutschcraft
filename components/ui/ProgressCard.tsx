import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface ProgressCardProps {
  /** Title of the progress card */
  title: string;
  /** Current value */
  current: number;
  /** Target/max value */
  target: number;
  /** Icon or emoji */
  icon?: ReactNode;
  /** Progress bar color (Tailwind gradient class) */
  progressColor?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Show percentage (default: true) */
  showPercentage?: boolean;
  /** Custom label formatter */
  formatLabel?: (current: number, target: number) => string;
}

export function ProgressCard({
  title,
  current,
  target,
  icon,
  progressColor = 'bg-gradient-to-r from-piku-purple-dark to-piku-cyan',
  subtitle,
  showPercentage = true,
  formatLabel,
}: ProgressCardProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const defaultLabel = `${current} / ${target}`;
  const label = formatLabel ? formatLabel(current, target) : defaultLabel;

  return (
    <Card shadow="lg">
      <CardHeader>
        <CardTitle size="md">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          {icon && <div className="text-5xl mb-4">{icon}</div>}

          {subtitle && (
            <p className="text-gray-600 text-sm mb-2">{subtitle}</p>
          )}

          <div className="flex items-baseline justify-center gap-1 mb-3">
            <span className="text-4xl font-black text-piku-purple-dark">
              {current}
            </span>
            <span className="text-xl text-gray-600">/ {target}</span>
          </div>

          <div className="bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
            <div
              className={`${progressColor} h-full rounded-full transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {showPercentage && (
            <p className="text-xs text-gray-600">
              {percentage >= 100 ? '🎉 Goal completed!' : `${percentage.toFixed(0)}% complete`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Preset progress card variants
export function DailyGoalCard({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  return (
    <ProgressCard
      title="Daily Goal"
      current={current}
      target={target}
      icon="🎯"
      subtitle="Today's Progress"
      progressColor="bg-gradient-to-r from-piku-purple-dark to-piku-cyan"
    />
  );
}

export function LevelProgressCard({
  current,
  target,
  level,
}: {
  current: number;
  target: number;
  level: string;
}) {
  return (
    <ProgressCard
      title={`Level ${level} Progress`}
      current={current}
      target={target}
      subtitle="Words to next level"
      progressColor="bg-gradient-to-r from-piku-mint to-piku-green"
      formatLabel={(curr, targ) => `${curr} / ${targ} words`}
    />
  );
}
