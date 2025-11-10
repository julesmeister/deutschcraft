interface DailyGoalCardProps {
  current: number;
  target: number;
}

export function DailyGoalCard({ current, target }: DailyGoalCardProps) {
  const percentage = (current / target) * 100;

  return (
    <div className="bg-white border border-gray-200 p-6">
      <p className="text-violet-600 text-lg font-bold uppercase mb-2">Daily Goal</p>
      <p className="text-3xl font-bold text-gray-900 mb-3">{current} / {target}</p>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-emerald-100 flex items-center justify-center">
          <span className="text-emerald-600 text-sm font-bold">↑</span>
        </div>
        <span className="text-emerald-600 font-bold text-sm">{percentage.toFixed(0)}%</span>
        <span className="text-gray-500 text-sm">of daily goal</span>
      </div>

      <div className="bg-gray-200 h-2 mb-3">
        <div
          className="bg-violet-600 h-full transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <p className="text-sm text-gray-500">
        {percentage >= 100 ? 'Excellent work! Goal completed.' : 'Keep going to reach your daily target.'}
      </p>
    </div>
  );
}
