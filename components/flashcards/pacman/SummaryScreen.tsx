import { Button } from "@/components/ui/Button";
import { GameStats } from "./data";

interface SummaryScreenProps {
  stats: GameStats;
  onPlayAgain: () => void;
  onBack: () => void;
}

export function SummaryScreen({ stats, onPlayAgain, onBack }: SummaryScreenProps) {
  const accuracy = stats.correct + stats.incorrect > 0
    ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
    : 0;

  return (
    <div className="max-w-md mx-auto text-center py-4 sm:py-8">
      <div className="bg-gray-800 rounded-2xl p-5 sm:p-8">
        <div className="text-5xl sm:text-6xl mb-4">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Session Complete!</h2>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 my-6">
          <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-black text-yellow-400">{stats.score}</div>
            <div className="text-gray-400 text-xs sm:text-sm">Score</div>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-black text-green-400">{stats.correct}</div>
            <div className="text-gray-400 text-xs sm:text-sm">Correct</div>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400">{stats.maxStreak}</div>
            <div className="text-gray-400 text-xs sm:text-sm">Best Streak</div>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <div className="text-2xl sm:text-3xl font-black text-purple-400">{accuracy}%</div>
            <div className="text-gray-400 text-xs sm:text-sm">Accuracy</div>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={onPlayAgain} variant="primary" className="w-full">
            Play Again
          </Button>
          <Button onClick={onBack} variant="secondary" className="w-full">
            Back to Flashcards
          </Button>
        </div>
      </div>
    </div>
  );
}
