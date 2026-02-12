import { VerbEntry, getPrefixColor } from "./data";

interface AnsweredWordsListProps {
  answeredVerbs: VerbEntry[];
  progressMap?: Record<string, number>;
}

export function AnsweredWordsList({ answeredVerbs, progressMap = {} }: AnsweredWordsListProps) {
  if (answeredVerbs.length === 0) return null;

  return (
    <div className="mt-4 sm:mt-6 bg-gray-800 rounded-2xl p-3 sm:p-4">
      <h3 className="text-white font-bold mb-2 sm:mb-3 text-xs sm:text-sm">
        Words Learned ({answeredVerbs.length})
      </h3>
      <div className="space-y-1.5 sm:space-y-2">
        {answeredVerbs.map((verb) => {
          const count = progressMap[verb.full] || 0;
          return (
            <div key={verb.full} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className={`text-xs sm:text-sm font-bold shrink-0 ${getPrefixColor(verb.prefix).includes('green') ? 'text-green-400' : 'text-purple-400'}`}>
                  {verb.prefix.replace('-', '')}
                </span>
                <span className="text-yellow-400 font-bold text-xs sm:text-sm shrink-0">{verb.root}</span>
                <span className="text-white font-semibold text-xs sm:text-sm truncate">= {verb.full}</span>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                {count > 0 && (
                  <span className="bg-green-500/20 text-green-400 rounded-full px-2 py-0.5 text-xs font-bold">
                    {count}x
                  </span>
                )}
                <span className="text-gray-400 text-xs text-right">{verb.meaning}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
