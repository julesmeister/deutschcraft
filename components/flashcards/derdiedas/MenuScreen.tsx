import { Button } from "@/components/ui/Button";
import { ENDING_DATA } from "./data";

interface MenuScreenProps {
  onStart: () => void;
  onReview: () => void;
}

export function MenuScreen({ onStart, onReview }: MenuScreenProps) {
  return (
    <div className="max-w-lg mx-auto text-center py-4 sm:py-8 space-y-4">
      <div className="bg-gray-800 rounded-2xl p-5 sm:p-8">
        <div className="text-5xl sm:text-7xl mb-4">🎯</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Der Die Das</h2>
        <p className="text-gray-400 text-sm sm:text-base mb-6">
          Learn which article goes with each German noun ending!
        </p>

        <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4 mb-6 text-left">
          <h3 className="font-bold text-white mb-2 text-sm sm:text-base">How to Play:</h3>
          <ul className="text-gray-300 text-xs sm:text-sm space-y-1">
            <li><span className="text-yellow-400">Arrow Keys / W/S</span> or <span className="text-yellow-400">drag</span> to move</li>
            <li>See the noun ending shown on screen (e.g. &quot;-ung&quot;)</li>
            <li>Catch the <span className="text-green-400">correct article</span> (<span className="text-blue-400">der</span> / <span className="text-pink-400">die</span> / <span className="text-green-400">das</span>)</li>
            <li>Avoid the <span className="text-gray-400">wrong articles</span>!</li>
          </ul>
        </div>

        <div className="text-gray-400 text-sm mb-4">
          {ENDING_DATA.length} noun endings to master
        </div>

        <div className="space-y-3">
          <Button onClick={onStart} variant="primary" className="w-full">
            Start Game
          </Button>
          <Button onClick={onReview} variant="secondary" className="w-full">
            Review Endings
          </Button>
        </div>
      </div>
    </div>
  );
}
