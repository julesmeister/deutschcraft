'use client';

import { SplitButtonGroup, SplitButtonOption } from '@/components/ui/SplitButtonGroup';
import { useState } from 'react';

type DifficultyLevel = 'again' | 'hard' | 'good' | 'easy' | 'expert';

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
          <div className="text-xs md:text-sm lg:text-base font-black">Forgotten</div>
          <div className="text-[9px] md:text-[10px] lg:text-xs opacity-70 mt-0.5 hidden md:block">Press 1</div>
        </div>
      ),
    },
    {
      value: 'hard',
      label: (
        <div>
          <div className="text-xs md:text-sm lg:text-base font-black">Hard</div>
          <div className="text-[9px] md:text-[10px] lg:text-xs opacity-70 mt-0.5 hidden md:block">Press 2</div>
        </div>
      ),
    },
    {
      value: 'good',
      label: (
        <div>
          <div className="text-xs md:text-sm lg:text-base font-black">Good</div>
          <div className="text-[9px] md:text-[10px] lg:text-xs opacity-70 mt-0.5 hidden md:block">Press 3</div>
        </div>
      ),
    },
    {
      value: 'easy',
      label: (
        <div>
          <div className="text-xs md:text-sm lg:text-base font-black">Easy</div>
          <div className="text-[9px] md:text-[10px] lg:text-xs opacity-70 mt-0.5 hidden md:block">Press 4</div>
        </div>
      ),
    },
    {
      value: 'expert',
      label: (
        <div>
          <div className="text-xs md:text-sm lg:text-base font-black">Expert</div>
          <div className="text-[9px] md:text-[10px] lg:text-xs opacity-70 mt-0.5 hidden md:block">Press 5</div>
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
        className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 border border-gray-300 rounded-xl px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base font-semibold transition-all hover:border-gray-400 w-full sm:w-auto"
      >
        Show Answer <span className="text-xs opacity-60 ml-2 hidden sm:inline">(Space/Enter)</span>
      </button>
    </div>
  );
}
