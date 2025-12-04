'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast/ToastProvider';

interface Preposition {
  german: string;
  english: string;
  case: 'Akkusativ' | 'Dativ' | 'Both' | 'Genitiv';
}

const allPrepositions: Preposition[] = [
  { german: 'für', english: 'for', case: 'Akkusativ' },
  { german: 'um', english: 'around, at (time)', case: 'Akkusativ' },
  { german: 'durch', english: 'through', case: 'Akkusativ' },
  { german: 'gegen', english: 'against', case: 'Akkusativ' },
  { german: 'ohne', english: 'without', case: 'Akkusativ' },
  { german: 'von', english: 'from, of', case: 'Dativ' },
  { german: 'aus', english: 'out of, from', case: 'Dativ' },
  { german: 'zu', english: 'to', case: 'Dativ' },
  { german: 'mit', english: 'with', case: 'Dativ' },
  { german: 'nach', english: 'after, to', case: 'Dativ' },
  { german: 'bei', english: 'at, near, with', case: 'Dativ' },
  { german: 'seit', english: 'since, for (time)', case: 'Dativ' },
  { german: 'an', english: 'at, on', case: 'Both' },
  { german: 'auf', english: 'on, onto', case: 'Both' },
  { german: 'in', english: 'in, into', case: 'Both' },
  { german: 'über', english: 'over, above', case: 'Both' },
  { german: 'unter', english: 'under, below', case: 'Both' },
  { german: 'vor', english: 'in front of', case: 'Both' },
  { german: 'während', english: 'during', case: 'Genitiv' },
  { german: 'wegen', english: 'because of', case: 'Genitiv' },
  { german: 'trotz', english: 'despite', case: 'Genitiv' },
];

interface Card {
  id: string;
  value: string;
  type: 'german' | 'english';
  preposition: Preposition;
  isMatched: boolean;
}

interface MatchGameProps {
  onExit: () => void;
}

export default function MatchGame({ onExit }: MatchGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const toast = useToast();

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  const initializeGame = () => {
    // Select random 8 prepositions
    const shuffled = [...allPrepositions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 8);

    // Create cards for both German and English
    const newCards: Card[] = [];
    selected.forEach((prep, index) => {
      newCards.push({
        id: `german-${index}`,
        value: prep.german,
        type: 'german',
        preposition: prep,
        isMatched: false,
      });
      newCards.push({
        id: `english-${index}`,
        value: prep.english,
        type: 'english',
        preposition: prep,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffledCards = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setStartTime(Date.now());
  };

  const handleCardClick = (card: Card) => {
    if (card.isMatched || selectedCards.some((c) => c.id === card.id)) {
      return;
    }

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      // Check if match
      const [first, second] = newSelected;

      if (
        first.preposition.german === second.preposition.german &&
        first.type !== second.type
      ) {
        // Match!
        setCards(
          cards.map((c) =>
            c.id === first.id || c.id === second.id
              ? { ...c, isMatched: true }
              : c
          )
        );
        setScore(score + 1);
        setMatchedCount(matchedCount + 1);
        setSelectedCards([]);

        toast.success(`Correct! ${first.preposition.german} = ${first.preposition.english}`, {
          duration: 2000,
        });

        // Check if game complete
        if (matchedCount + 1 === 8) {
          setIsComplete(true);
        }
      } else {
        // No match
        setMistakes(mistakes + 1);
        toast.error('Not a match! Try again.', {
          duration: 2000,
        });
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const handleReset = () => {
    initializeGame();
    setSelectedCards([]);
    setMatchedCount(0);
    setScore(0);
    setMistakes(0);
    setElapsedTime(0);
    setIsComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCaseColor = (caseType: string) => {
    switch (caseType) {
      case 'Akkusativ':
        return 'border-blue-300';
      case 'Dativ':
        return 'border-green-300';
      case 'Both':
        return 'border-purple-300';
      case 'Genitiv':
        return 'border-orange-300';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onExit}
            className="text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            ← Back to Practice Menu
          </button>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Match Pairs
              </h1>
              <p className="text-lg text-gray-600">
                Match German prepositions with their English translations
              </p>
            </div>
            <div className="bg-white shadow-sm flex w-full lg:w-auto">
              <div className="flex flex-col gap-1 border-r border-neutral-200 px-4 sm:px-6 py-3 flex-1">
                <div className="text-neutral-500 text-xs">Time</div>
                <h3 className="text-neutral-900 text-lg sm:text-xl font-bold leading-snug">{formatTime(elapsedTime)}</h3>
              </div>
              <div className="flex flex-col gap-1 border-r border-neutral-200 px-4 sm:px-6 py-3 flex-1">
                <div className="text-neutral-500 text-xs">Matches</div>
                <h3 className="text-neutral-900 text-lg sm:text-xl font-bold leading-snug">{matchedCount}/8</h3>
              </div>
              <div className="flex flex-col gap-1 px-4 sm:px-6 py-3 flex-1">
                <div className="text-neutral-500 text-xs">Mistakes</div>
                <h3 className="text-neutral-900 text-lg sm:text-xl font-bold leading-snug">{mistakes}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Message */}
        {isComplete && (
          <div className="mb-8 bg-green-50 border border-green-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🎉</div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Perfect Match!
                </h2>
                <p className="text-sm text-gray-700">
                  Time: <strong>{formatTime(elapsedTime)}</strong> | Mistakes: <strong>{mistakes}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors w-full sm:w-auto"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {cards.map((card) => {
            const isSelected = selectedCards.some((c) => c.id === card.id);
            const isMatched = card.isMatched;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                disabled={isMatched}
                className={`
                  relative p-6 border-2 transition-all duration-300 min-h-32 flex items-center justify-center
                  ${
                    isMatched
                      ? 'bg-green-50 border-green-400 cursor-not-allowed'
                      : isSelected
                      ? `bg-white ${getCaseColor(card.preposition.case)}`
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-center w-full">
                  {isMatched ? (
                    <>
                      <div className="text-base font-bold text-gray-900 mb-1">
                        {card.preposition.german}
                      </div>
                      <div className="text-sm text-gray-600">
                        {card.preposition.english}
                      </div>
                      <div className="absolute top-2 right-2 text-green-600 text-xl">
                        ✓
                      </div>
                    </>
                  ) : (
                    <div
                      className={`text-xl font-bold ${
                        card.type === 'german' ? 'text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {card.value}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white p-6 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📖 How to Play</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 mt-0.5">1.</span>
              <span>Click on a card to reveal its content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600 mt-0.5">2.</span>
              <span>Click on another card to find its matching pair</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-600 mt-0.5">3.</span>
              <span>If they match, they stay revealed. If not, try again!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-orange-600 mt-0.5">4.</span>
              <span>Match all pairs as fast as you can with minimal mistakes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
