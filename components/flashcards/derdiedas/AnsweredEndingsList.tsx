import { EndingEntry, getArticleTextColor, getArticleBgColor } from "./data";

interface AnsweredEndingsListProps {
  answeredEndings: EndingEntry[];
  progressMap?: Record<string, number>;
}

export function AnsweredEndingsList({ answeredEndings, progressMap = {} }: AnsweredEndingsListProps) {
  if (answeredEndings.length === 0) return null;

  return (
    <div className="mt-4 sm:mt-6 bg-gray-800 rounded-2xl p-3 sm:p-4">
      <h3 className="text-white font-bold mb-2 sm:mb-3 text-xs sm:text-sm">
        Endings Learned ({answeredEndings.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5 sm:gap-2">
        {answeredEndings.map((entry) => {
          const count = progressMap[entry.ending] || 0;
          return (
            <div key={entry.ending} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className={`text-xs sm:text-sm font-bold shrink-0 ${getArticleTextColor(entry.article)}`}>
                  {entry.article}
                </span>
                <span className="text-yellow-400 font-bold text-xs sm:text-sm shrink-0">{entry.ending}</span>
                <span className="text-gray-400 text-xs truncate">{entry.examples[0]}</span>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                {count > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getArticleBgColor(entry.article)} ${getArticleTextColor(entry.article)}`}>
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
