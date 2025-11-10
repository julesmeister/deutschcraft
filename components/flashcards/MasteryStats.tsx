'use client';

interface MasteryStatsProps {
  stats: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

export function MasteryStats({ stats }: MasteryStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="bg-red-50 rounded-full p-3 text-center">
        <div className="text-xl font-black text-red-600">{stats.again}</div>
        <div className="text-xs font-semibold text-red-700">Forgotten</div>
      </div>
      <div className="bg-amber-50 rounded-full p-3 text-center">
        <div className="text-xl font-black text-amber-600">{stats.hard}</div>
        <div className="text-xs font-semibold text-amber-700">Hard</div>
      </div>
      <div className="bg-blue-50 rounded-full p-3 text-center">
        <div className="text-xl font-black text-blue-600">{stats.good}</div>
        <div className="text-xs font-semibold text-blue-700">Good</div>
      </div>
      <div className="bg-emerald-50 rounded-full p-3 text-center">
        <div className="text-xl font-black text-emerald-600">{stats.easy}</div>
        <div className="text-xs font-semibold text-emerald-700">Easy</div>
      </div>
    </div>
  );
}
