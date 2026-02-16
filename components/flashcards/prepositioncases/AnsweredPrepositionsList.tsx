import { PrepositionEntry, getCaseTextColor, getCaseBgColor } from "./data";

interface AnsweredPrepositionsListProps {
  answeredPrepositions: PrepositionEntry[];
  progressMap?: Record<string, number>;
}

export function AnsweredPrepositionsList({ answeredPrepositions, progressMap = {} }: AnsweredPrepositionsListProps) {
  if (answeredPrepositions.length === 0) return null;

  return (
    <div className="mt-4 sm:mt-6 bg-gray-800 rounded-2xl p-3 sm:p-4">
      <h3 className="text-white font-bold mb-2 sm:mb-3 text-xs sm:text-sm">
        Prepositions Learned ({answeredPrepositions.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5 sm:gap-2">
        {answeredPrepositions.map((entry) => {
          const count = progressMap[entry.german] || 0;
          return (
            <div key={entry.german} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className={`text-xs font-bold shrink-0 ${getCaseTextColor(entry.case)}`}>
                  {entry.case}
                </span>
                <span className="text-yellow-400 font-bold text-xs sm:text-sm shrink-0">{entry.german}</span>
                <span className="text-gray-400 text-xs truncate">{entry.english}</span>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                {count > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getCaseBgColor(entry.case)} ${getCaseTextColor(entry.case)}`}>
                    {count}x
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
