import { CEFRLevel } from "@/lib/models/cefr";

interface ReviewLevelSelectorProps {
  selectedLevel: CEFRLevel;
  onSelectLevel: (level: CEFRLevel) => void;
  dueCountsByLevel: Record<string, number>;
  currentLevelDueCount: number;
}

export function ReviewLevelSelector({
  selectedLevel,
  onSelectLevel,
  dueCountsByLevel,
  currentLevelDueCount,
}: ReviewLevelSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {(Object.values(CEFRLevel) as CEFRLevel[])
        .filter((level) => {
          const isSelected = selectedLevel === level;
          // Use accurate stats for selected level, fallback to progress data for others
          const count = isSelected
            ? currentLevelDueCount
            : dueCountsByLevel[level] || 0;
          return count > 0 || isSelected;
        })
        .map((level) => {
          const isSelected = selectedLevel === level;
          // Use accurate stats for selected level, fallback to progress data for others
          const count = isSelected
            ? currentLevelDueCount
            : dueCountsByLevel[level] || 0;

          // Color schemes
          const levelColors: Record<
            string,
            { bg: string; text: string; border: string; active: string }
          > = {
            A1: {
              bg: "bg-slate-100",
              text: "text-slate-700",
              border: "border-slate-200",
              active: "bg-slate-800 text-white border-slate-800",
            },
            A2: {
              bg: "bg-gray-100",
              text: "text-gray-700",
              border: "border-gray-200",
              active: "bg-gray-800 text-white border-gray-800",
            },
            B1: {
              bg: "bg-zinc-100",
              text: "text-zinc-700",
              border: "border-zinc-200",
              active: "bg-zinc-800 text-white border-zinc-800",
            },
            B2: {
              bg: "bg-neutral-100",
              text: "text-neutral-700",
              border: "border-neutral-200",
              active: "bg-neutral-800 text-white border-neutral-800",
            },
            C1: {
              bg: "bg-stone-100",
              text: "text-stone-700",
              border: "border-stone-200",
              active: "bg-stone-800 text-white border-stone-800",
            },
            C2: {
              bg: "bg-slate-200",
              text: "text-slate-800",
              border: "border-slate-300",
              active: "bg-slate-900 text-white border-slate-900",
            },
          };

          const colors = levelColors[level] || levelColors.A1;
          const styleClass = isSelected
            ? `${colors.active} shadow-sm ring-2 ring-offset-2 ring-offset-gray-50 ring-gray-200`
            : `${colors.bg} ${colors.text} ${colors.border} border hover:bg-white hover:border-gray-300`;

          return (
            <button
              key={level}
              onClick={() => onSelectLevel(level)}
              className={`
                group relative flex items-center gap-3 px-5 py-3 rounded-xl
                transition-all duration-200 ease-in-out
                ${styleClass}
              `}
            >
              <span
                className={`font-black text-xl tracking-tight ${
                  isSelected ? "text-white" : "text-gray-900"
                }`}
              >
                {level}
              </span>

              {count > 0 && (
                <span
                  className={`
                  text-xs font-bold px-2.5 py-1 rounded-full
                  ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-white text-gray-700 shadow-sm border border-gray-100"
                  }
                `}
                >
                  {count} due
                </span>
              )}

              {/* Active indicator dot */}
              {isSelected && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </button>
          );
        })}
    </div>
  );
}
