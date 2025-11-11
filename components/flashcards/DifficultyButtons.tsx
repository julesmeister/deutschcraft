'use client';

import { SplitButtonGroup, SplitButtonOption } from '@/components/ui/SplitButtonGroup';
import { useState } from 'react';

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
  // Track selected difficulty for visual feedback (resets on each card)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const difficultyOptions: SplitButtonOption[] = [
    {
      value: 'again',
      label: (
        <div>
          <div className="text-base font-black">Forgotten</div>
          <div className="text-xs opacity-70 mt-0.5">Press 1</div>
        </div>
      ),
    },
    {
      value: 'hard',
      label: (
        <div>
          <div className="text-base font-black">Hard</div>
          <div className="text-xs opacity-70 mt-0.5">Press 2</div>
        </div>
      ),
    },
    {
      value: 'good',
      label: (
        <div>
          <div className="text-base font-black">Good</div>
          <div className="text-xs opacity-70 mt-0.5">Press 3</div>
        </div>
      ),
    },
    {
      value: 'easy',
      label: (
        <div>
          <div className="text-base font-black">Easy</div>
          <div className="text-xs opacity-70 mt-0.5">Press 4</div>
        </div>
      ),
    },
  ];

  const handleDifficultySelect = (value: string) => {
    setSelectedDifficulty(value);
    onDifficulty(value as DifficultyLevel);
    // Reset selection after a brief moment for visual feedback
    setTimeout(() => setSelectedDifficulty(''), 300);
  };

  if (isFlipped) {
    return (
      <SplitButtonGroup
        options={difficultyOptions}
        value={selectedDifficulty}
        onChange={handleDifficultySelect}
        colorScheme="teal"
        size="lg"
      />
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
