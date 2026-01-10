'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

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

interface SortGameProps {
  onExit: () => void;
}

export default function SortGame({ onExit }: SortGameProps) {
  const [prepositions, setPrepositions] = useState<Preposition[]>([]);
  const [unsorted, setUnsorted] = useState<Preposition[]>([]);
  const [sorted, setSorted] = useState<{
    Akkusativ: Preposition[];
    Dativ: Preposition[];
    Both: Preposition[];
    Genitiv: Preposition[];
  }>({
    Akkusativ: [],
    Dativ: [],
    Both: [],
    Genitiv: [],
  });
  const [draggedItem, setDraggedItem] = useState<Preposition | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Use all prepositions, shuffled
    const shuffled = [...allPrepositions].sort(() => Math.random() - 0.5);
    setPrepositions(shuffled);
    setUnsorted(shuffled);
  }, []);

  const handleDragStart = (prep: Preposition) => {
    setDraggedItem(prep);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetCase: 'Akkusativ' | 'Dativ' | 'Both' | 'Genitiv') => {
    if (!draggedItem) return;

    // Remove from unsorted
    setUnsorted(unsorted.filter((p) => p.german !== draggedItem.german));

    // Check if correct
    if (draggedItem.case === targetCase) {
      // Correct!
      setSorted({
        ...sorted,
        [targetCase]: [...sorted[targetCase], draggedItem],
      });
      setScore(score + 1);
      toast.success(`Correct! "${draggedItem.german}" takes ${targetCase}`, {
        duration: 2000,
      });
    } else {
      // Wrong - put back in unsorted
      setMistakes(mistakes + 1);
      toast.error(`Wrong! "${draggedItem.german}" takes ${draggedItem.case}, not ${targetCase}`, {
        duration: 3000,
      });
      setTimeout(() => {
        setUnsorted([...unsorted]);
      }, 500);
    }

    setDraggedItem(null);

    // Check if complete
    if (unsorted.length === 1) {
      setIsComplete(true);
    }
  };

  const handleReset = () => {
    const shuffled = [...allPrepositions].sort(() => Math.random() - 0.5);
    setPrepositions(shuffled);
    setUnsorted(shuffled);
    setSorted({
      Akkusativ: [],
      Dativ: [],
      Both: [],
      Genitiv: [],
    });
    setScore(0);
    setMistakes(0);
    setIsComplete(false);
  };

  const getCaseColor = (caseType: string) => {
    switch (caseType) {
      case 'Akkusativ':
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'Dativ':
        return 'bg-green-100 border-green-300 text-green-700';
      case 'Both':
        return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'Genitiv':
        return 'bg-orange-100 border-orange-300 text-orange-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
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
                Sort by Case
              </h1>
              <p className="text-lg text-gray-600">
                Drag each preposition to its correct case category
              </p>
            </div>
            <div className="bg-white shadow-sm flex w-full lg:w-auto">
              <div className="flex flex-col gap-1 border-r border-neutral-200 px-4 sm:px-6 py-3 flex-1">
                <div className="text-neutral-500 text-xs">Score</div>
                <h3 className="text-neutral-900 text-lg sm:text-xl font-bold leading-snug">{score}</h3>
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
                  Congratulations!
                </h2>
                <p className="text-sm text-gray-700">
                  Score: <strong>{score}</strong> | Mistakes: <strong>{mistakes}</strong>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unsorted Prepositions */}
          <div className="bg-white shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Prepositions to Sort ({unsorted.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {unsorted.map((prep) => (
                <div
                  key={prep.german}
                  draggable
                  onDragStart={() => handleDragStart(prep)}
                  className="px-4 py-3 bg-gray-100 cursor-move hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  <div className="font-bold text-gray-900">{prep.german}</div>
                  <div className="text-xs text-gray-600">{prep.english}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Drop Zones */}
          <div className="space-y-4">
            {(['Akkusativ', 'Dativ', 'Both', 'Genitiv'] as const).map((caseType) => (
              <div
                key={caseType}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(caseType)}
                className={`p-6 border-2 border-dashed min-h-32 ${getCaseColor(
                  caseType
                )}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">
                    {caseType}
                  </h3>
                  <span className="px-2 py-1 bg-gray-900 text-white text-xs font-bold">
                    {sorted[caseType].length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sorted[caseType].map((prep) => (
                    <div
                      key={prep.german}
                      className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-bold text-sm text-gray-900">{prep.german}</div>
                      <div className="text-xs text-gray-600">{prep.english}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📖 How to Play</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 mt-0.5">1.</span>
              <span>Drag each preposition from the left panel</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600 mt-0.5">2.</span>
              <span>Drop it into the correct case category on the right</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-600 mt-0.5">3.</span>
              <span>If correct, it stays. If wrong, it bounces back!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
