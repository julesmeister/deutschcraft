import { useAnimatedCounter } from '@/lib/hooks/useAnimatedCounter';

export interface StudentStatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  suffix?: string;
  displayValue?: string;
  isText?: boolean;
}

export function StudentStatsCard({ label, value, icon, color, suffix = '', displayValue, isText = false }: StudentStatCardProps) {
  const count = useAnimatedCounter({ target: value, interval: 10 });

  return (
    <div className="p-6 flex items-center gap-4">
      <div className={`text-5xl ${color} flex-shrink-0`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className={`${color} text-sm font-bold uppercase tracking-wide`}>{label}</p>
        <p className={`${isText ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 break-words`}>
          {isText ? displayValue : `${count.toLocaleString()}${suffix}`}
        </p>
      </div>
    </div>
  );
}
