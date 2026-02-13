import { Button } from "@/components/ui/Button";
import { ENDING_DATA, getArticleTextColor, getArticleBgColor } from "./data";

interface ReviewScreenProps {
  onBack: () => void;
  onStart: () => void;
}

export function ReviewScreen({ onBack, onStart }: ReviewScreenProps) {
  const grouped = {
    der: ENDING_DATA.filter(e => e.article === 'der'),
    die: ENDING_DATA.filter(e => e.article === 'die'),
    das: ENDING_DATA.filter(e => e.article === 'das'),
  };

  return (
    <div className="py-4 sm:py-8 space-y-4">
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-white">Review Endings</h2>
          <Button onClick={onBack} variant="secondary" size="sm">
            Back to Menu
          </Button>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
          {ENDING_DATA.length} noun endings grouped by gender
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {(Object.entries(grouped) as [string, typeof ENDING_DATA][]).map(([article, endings]) => (
            <div key={article}>
              <h3 className={`font-black text-lg sm:text-xl mb-3 ${getArticleTextColor(article)}`}>
                {article} <span className="text-gray-500 text-sm font-normal">({endings.length})</span>
              </h3>
              <div className="space-y-2">
                {endings.map(entry => (
                  <div key={entry.ending} className={`rounded-lg px-3 py-2 ${getArticleBgColor(article)}`}>
                    <div className={`font-bold text-sm ${getArticleTextColor(article)}`}>
                      {entry.ending}
                    </div>
                    {entry.rule && (
                      <div className="text-gray-400 text-xs mt-0.5">{entry.rule}</div>
                    )}
                    <div className="text-gray-300 text-xs mt-1">
                      {entry.examples.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onStart} variant="primary" className="w-full">
        Start Game
      </Button>
    </div>
  );
}
