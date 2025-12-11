'use client';

import { Card } from '@/components/ui/Card';

interface Flashcard {
  id: string;
  german: string;
  english: string;
  examples?: string[];
}

interface FlashcardCardProps {
  card: Flashcard & { masteryLevel?: number };
  isFlipped: boolean;
  onFlip: () => void;
  showExamples?: boolean;
  showEnglishFirst?: boolean;
}

export function FlashcardCard({ card, isFlipped, onFlip, showExamples = true, showEnglishFirst = false }: FlashcardCardProps) {
  const masteryLevel = card.masteryLevel ?? 0;

  // Determine color based on mastery level
  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'bg-emerald-500';
    if (level >= 60) return 'bg-blue-500';
    if (level >= 40) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  return (
    <Card padding="none" rounded="2xl" className="overflow-hidden">
      <div
        className="relative min-h-[400px] cursor-pointer"
        onClick={onFlip}
      >
        {/* Mastery Battery Bar - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative w-20 h-8 bg-white/90 backdrop-blur-sm border-2 border-gray-300 rounded-md shadow-sm overflow-hidden">
            {/* Battery fill */}
            <div
              className={`absolute inset-0 transition-all duration-300 ${getMasteryColor(masteryLevel)}`}
              style={{ width: `${masteryLevel}%` }}
            />
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-end pr-1.5">
              <span className="text-xs font-black text-gray-900 mix-blend-difference">
                {masteryLevel}%
              </span>
            </div>
          </div>
          {/* Battery nub */}
          <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-3 bg-gray-300 rounded-r-sm" />
        </div>

        {/* Card Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="text-center w-full">
            {/* Language Label - Only show before clicked */}
            {!isFlipped && (
              <div className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">
                {showEnglishFirst ? 'English' : 'German'}
              </div>
            )}

            {/* Main Word - Shrinks when flipped */}
            <div
              className={`font-black text-gray-900 transition-all duration-300 ${
                isFlipped ? 'text-xl mb-2' : 'text-5xl mb-4'
              }`}
            >
              {showEnglishFirst ? card.english : card.german}
            </div>

            {/* Hint text - Only show when not flipped */}
            {!isFlipped && (
              <div className="text-gray-500 transition-opacity duration-200">
                Click to reveal translation
              </div>
            )}

            {/* Translation - Slides up from bottom */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isFlipped ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-2 py-2">
                {/* Translation Label */}
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wide">
                  {showEnglishFirst ? 'German' : 'English'}
                </div>

                {/* Translation Text */}
                <div className="text-5xl font-black text-gray-900 pb-2">
                  {showEnglishFirst ? card.german : card.english}
                </div>

                {/* Examples */}
                {!showEnglishFirst && showExamples && card.examples && card.examples.length > 0 && (
                  <div className="mt-8 text-left max-w-2xl mx-auto">
                    <div className="text-sm font-bold text-gray-700 mb-2">Examples:</div>
                    <div className="space-y-2">
                      {card.examples.map((example, idx) => (
                        <div key={idx} className="text-gray-600 text-sm">
                          • {example}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
