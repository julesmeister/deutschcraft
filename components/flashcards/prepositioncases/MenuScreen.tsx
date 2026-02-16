import { Button } from "@/components/ui/Button";
import { PREPOSITION_DATA } from "./data";

interface MenuScreenProps {
  onStart: () => void;
  onStartQuiz: () => void;
  onReview: () => void;
}

export function MenuScreen({ onStart, onStartQuiz, onReview }: MenuScreenProps) {
  return (
    <div className="max-w-lg mx-auto text-center py-4 sm:py-8 space-y-4">
      <div className="bg-gray-800 rounded-2xl p-5 sm:p-8">
        <div className="text-5xl sm:text-7xl mb-4">🔤</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Preposition Cases</h2>
        <p className="text-gray-400 text-sm sm:text-base mb-6">
          Learn which grammatical case each German preposition takes!
        </p>

        <div className="text-gray-400 text-sm mb-4">
          {PREPOSITION_DATA.length} prepositions to master
        </div>

        {/* Game modes */}
        <div className="space-y-3 mb-4">
          <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="font-bold text-white mb-1 text-sm sm:text-base flex items-center justify-center gap-2">
              <span className="text-xl">👾</span> Pacman Mode
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-3">
              Move Pacman to catch the correct case as they float across the screen.
            </p>
            <Button onClick={onStart} variant="primary" className="w-full">
              Start Pacman
            </Button>
          </div>

          <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4">
            <h3 className="font-bold text-white mb-1 text-sm sm:text-base flex items-center justify-center gap-2">
              <span className="text-xl">📝</span> Quiz Mode
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-3">
              See a preposition and pick the right case from four choices.
            </p>
            <Button onClick={onStartQuiz} variant="cyan" className="w-full">
              Start Quiz
            </Button>
          </div>
        </div>

        <Button onClick={onReview} variant="secondary" className="w-full">
          Review Prepositions
        </Button>
      </div>
    </div>
  );
}
