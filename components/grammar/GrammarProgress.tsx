import { Button } from "@/components/ui/Button";

interface GrammarProgressProps {
  ruleTitle: string;
  currentIndex: number;
  totalSentences: number;
  hasResults: boolean;
  onEndPractice: () => void;
}

export function GrammarProgress({
  ruleTitle,
  currentIndex,
  totalSentences,
  hasResults,
  onEndPractice,
}: GrammarProgressProps) {
  const progress = ((currentIndex + 1) / totalSentences) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span className="font-semibold">{ruleTitle}</span>
        <div className="flex items-center gap-4">
          <span>
            {currentIndex + 1} / {totalSentences}
          </span>
          {hasResults && (
            <Button onClick={onEndPractice} variant="secondary" size="sm">
              End Practice
            </Button>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 h-2">
        <div
          className="bg-blue-600 h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
