import { Button } from "@/components/ui/Button";
import { PREPOSITION_DATA, CASES, getCaseTextColor, getCaseBgColor } from "./data";

interface ReviewScreenProps {
  onBack: () => void;
  onStart: () => void;
}

export function ReviewScreen({ onBack, onStart }: ReviewScreenProps) {
  const grouped = Object.fromEntries(
    CASES.map(c => [c, PREPOSITION_DATA.filter(p => p.case === c)])
  );

  return (
    <div className="py-4 sm:py-8 space-y-4">
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-white">Review Prepositions</h2>
          <Button onClick={onBack} variant="secondary" size="sm">
            Back to Menu
          </Button>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
          {PREPOSITION_DATA.length} prepositions grouped by case
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CASES.map(caseLabel => (
            <div key={caseLabel}>
              <h3 className={`font-black text-lg sm:text-xl mb-3 ${getCaseTextColor(caseLabel)}`}>
                {caseLabel} <span className="text-gray-500 text-sm font-normal">({grouped[caseLabel].length})</span>
              </h3>
              <div className="space-y-2">
                {grouped[caseLabel].map(entry => (
                  <div key={entry.german} className={`rounded-lg px-3 py-2 ${getCaseBgColor(caseLabel)}`}>
                    <div className={`font-bold text-sm ${getCaseTextColor(caseLabel)}`}>
                      {entry.german}
                    </div>
                    <div className="text-gray-300 text-xs mt-0.5">{entry.english}</div>
                    <div className="text-gray-400 text-xs mt-1 italic">{entry.example}</div>
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
