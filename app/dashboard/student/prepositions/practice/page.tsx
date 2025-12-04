'use client';

import { useState } from 'react';
import Link from 'next/link';
import SortGame from './SortGame';
import MatchGame from './MatchGame';

export default function PrepositionsPracticePage() {
  const [gameMode, setGameMode] = useState<'sort' | 'match' | null>(null);

  if (gameMode === 'sort') {
    return <SortGame onExit={() => setGameMode(null)} />;
  }

  if (gameMode === 'match') {
    return <MatchGame onExit={() => setGameMode(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/student/prepositions"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Guide
            </Link>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Practice Mode
          </h1>
          <p className="text-lg text-gray-600">
            Test your preposition knowledge with interactive games
          </p>
        </div>

        {/* Game Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sort Game Card */}
          <button
            onClick={() => setGameMode('sort')}
            className="bg-white p-8 hover:bg-gray-50 transition-all duration-300 text-left group border border-gray-200"
          >
            <div className="text-6xl mb-4 transition-transform duration-300">
              📊
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              Sort by Case
            </h2>
            <p className="text-gray-600 mb-4">
              Drag and drop prepositions into the correct case categories (Akkusativ, Dativ, etc.)
            </p>
            <div className="flex items-center gap-2 text-brand-purple font-bold">
              <span>Start Sorting</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </div>
          </button>

          {/* Match Game Card */}
          <button
            onClick={() => setGameMode('match')}
            className="bg-white p-8 hover:bg-gray-50 transition-all duration-300 text-left group border border-gray-200"
          >
            <div className="text-6xl mb-4 transition-transform duration-300">
              🎯
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              Match Pairs
            </h2>
            <p className="text-gray-600 mb-4">
              Match German prepositions with their English translations as fast as you can
            </p>
            <div className="flex items-center gap-2 text-brand-purple font-bold">
              <span>Start Matching</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </div>
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-white p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Practice Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 mt-0.5">•</span>
              <span>
                Start with the Sort Game to reinforce case patterns
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600 mt-0.5">•</span>
              <span>
                Use the Match Game to test your vocabulary speed
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-600 mt-0.5">•</span>
              <span>
                Try to beat your previous times and improve your accuracy
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
