'use client';

import { Card } from '@/components/ui/Card';

interface Flashcard {
  id: string;
  german: string;
  english: string;
  examples?: string[];
}

interface FlashcardCardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  showExamples?: boolean;
  showEnglishFirst?: boolean;
}

export function FlashcardCard({ card, isFlipped, onFlip, showExamples = true, showEnglishFirst = false }: FlashcardCardProps) {
  // Determine which side to show based on showEnglishFirst preference
  const showFront = showEnglishFirst ? isFlipped : !isFlipped;
  const showBack = showEnglishFirst ? !isFlipped : isFlipped;

  return (
    <Card padding="none" rounded="2xl" className="overflow-hidden">
      <div
        className="relative min-h-[400px] cursor-pointer"
        onClick={onFlip}
      >
        {/* Front side - German (or English if showEnglishFirst) */}
        <div
          className={`absolute inset-0 flex items-center justify-center p-12 transition-all duration-200 ${
            showFront ? 'opacity-0 rotate-y-180' : 'opacity-100'
          }`}
        >
          <div className="text-center">
            <div className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">
              {showEnglishFirst ? 'English' : 'German'}
            </div>
            <div className="text-5xl font-black text-gray-900 mb-8">
              {showEnglishFirst ? card.english : card.german}
            </div>
            <div className="text-gray-500">
              Click to reveal translation
            </div>
          </div>
        </div>

        {/* Back side - English (or German if showEnglishFirst) */}
        <div
          className={`absolute inset-0 flex items-center justify-center p-12 transition-all duration-200 ${
            showBack ? 'opacity-100' : 'opacity-0 rotate-y-180'
          }`}
        >
          <div className="text-center">
            <div className="text-sm font-bold text-blue-500 mb-4 uppercase tracking-wide">
              {showEnglishFirst ? 'German' : 'English'}
            </div>
            <div className="text-5xl font-black text-gray-900 mb-4">
              {showEnglishFirst ? card.german : card.english}
            </div>
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
    </Card>
  );
}
