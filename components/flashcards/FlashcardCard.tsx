'use client';

import { Card } from '@/components/ui/Card';
import { Bookmark, BookmarkCheck } from 'lucide-react';

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
  isSaved?: boolean;
  isCompleted?: boolean;
  timesUsed?: number;
  targetUses?: number;
  onToggleSave?: () => void;
}

/**
 * Extract the German article (der/die/das) from the beginning of text
 * @param text - German text that may start with an article
 * @returns 'der' | 'die' | 'das' | null
 */
function extractArticle(text: string): 'der' | 'die' | 'das' | null {
  const trimmed = text.trim().toLowerCase();
  if (trimmed.startsWith('der ')) return 'der';
  if (trimmed.startsWith('die ')) return 'die';
  if (trimmed.startsWith('das ')) return 'das';
  return null;
}

/**
 * Get gradient background class based on German article
 * @param article - German article (der/die/das)
 * @returns Tailwind gradient classes
 */
function getArticleGradient(article: 'der' | 'die' | 'das' | null): string {
  switch (article) {
    case 'der':
      // Blue gradient for masculine (der)
      return 'bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50';
    case 'die':
      // Pink gradient for feminine (die)
      return 'bg-gradient-to-br from-pink-100 via-pink-50 to-rose-50';
    case 'das':
      // Green gradient for neuter (das)
      return 'bg-gradient-to-br from-green-100 via-green-50 to-emerald-50';
    default:
      // White background for other word types
      return 'bg-white';
  }
}

export function FlashcardCard({
  card,
  isFlipped,
  onFlip,
  showExamples = true,
  showEnglishFirst = false,
  isSaved = false,
  isCompleted = false,
  timesUsed = 0,
  targetUses = 5,
  onToggleSave,
}: FlashcardCardProps) {
  const masteryLevel = card.masteryLevel ?? 0;

  // Determine color based on mastery level
  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'bg-emerald-500';
    if (level >= 60) return 'bg-blue-500';
    if (level >= 40) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  // Detect German article for color-coding
  // Apply gradient whenever German text is displayed (front or back):
  // - German first mode + not flipped = showing German front → apply gradient
  // - English first mode + flipped = showing German back → apply gradient
  const germanArticle = extractArticle(card.german);
  const isShowingGerman = isFlipped === showEnglishFirst;
  const shouldApplyGradient = isShowingGerman && germanArticle !== null;
  const cardGradient = shouldApplyGradient
    ? getArticleGradient(germanArticle)
    : 'bg-white';

  return (
    <Card padding="none" rounded="2xl" className="overflow-hidden">
      <div
        className={`relative min-h-[400px] cursor-pointer transition-colors duration-500 ${cardGradient}`}
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

        {/* Save for Later Button - Top Left */}
        {onToggleSave && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card flip
                onToggleSave();
              }}
              className={`relative px-3 py-2 rounded-lg shadow-sm transition-all hover:scale-105 ${
                isCompleted
                  ? 'bg-green-500 text-white'
                  : isSaved
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/90 backdrop-blur-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isCompleted ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : isSaved ? (
                  <Bookmark className="w-4 h-4 fill-current" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                {isSaved && (
                  <span className="text-xs font-bold">
                    {timesUsed}/{targetUses}
                  </span>
                )}
              </div>
            </button>
          </div>
        )}

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
