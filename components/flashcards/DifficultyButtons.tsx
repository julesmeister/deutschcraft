'use client';

type DifficultyLevel = 'again' | 'hard' | 'good' | 'easy';

interface DifficultyButtonsProps {
  isFlipped: boolean;
  onDifficulty: (difficulty: DifficultyLevel) => void;
  onShowAnswer: () => void;
}

export function DifficultyButtons({
  isFlipped,
  onDifficulty,
  onShowAnswer
}: DifficultyButtonsProps) {
  if (isFlipped) {
    return (
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => onDifficulty('again')}
          className="bg-red-500 hover:bg-red-600 text-white rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-lg font-black">Forgotten</div>
          <div className="text-xs opacity-90 mt-1">Press 1</div>
        </button>
        <button
          onClick={() => onDifficulty('hard')}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-lg font-black">Hard</div>
          <div className="text-xs opacity-90 mt-1">Press 2</div>
        </button>
        <button
          onClick={() => onDifficulty('good')}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-lg font-black">Good</div>
          <div className="text-xs opacity-90 mt-1">Press 3</div>
        </button>
        <button
          onClick={() => onDifficulty('easy')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-lg font-black">Easy</div>
          <div className="text-xs opacity-90 mt-1">Press 4</div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <button
        onClick={onShowAnswer}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-xl px-8 py-3 text-sm font-semibold transition-all hover:border-gray-400"
      >
        Show Answer <span className="text-xs opacity-60 ml-2">(Space/Enter)</span>
      </button>
    </div>
  );
}
