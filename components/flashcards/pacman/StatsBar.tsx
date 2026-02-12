import { GameStats } from "./data";

interface StatsBarProps {
  stats: GameStats;
  level: number;
  onPause: () => void;
}

export function StatsBar({ stats, level, onPause }: StatsBarProps) {
  return (
    <div className="flex items-center justify-between mb-3 sm:mb-4 bg-gray-800 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onPause}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 active:bg-gray-500 transition-colors text-gray-300 text-sm"
          title="Pause (ESC)"
        >
          ⏸
        </button>
        <div className="bg-gray-700 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold text-gray-300">
          Lv. {level}
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-green-500/20 text-green-400 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-bold">
            ✓ {stats.correct}
          </span>
          <span className="bg-red-500/20 text-red-400 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-bold">
            ✗ {stats.incorrect}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`flex items-center gap-1 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold transition-all ${
          stats.streak >= 3
            ? 'bg-orange-500/20 text-orange-400 scale-110'
            : stats.streak > 0
              ? 'bg-orange-500/10 text-orange-400'
              : 'bg-gray-700 text-gray-500'
        }`}>
          🔥 {stats.streak}
        </div>
        <div className="bg-yellow-500/20 text-yellow-400 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-black">
          {stats.score} pts
        </div>
      </div>
    </div>
  );
}
