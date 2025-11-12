/**
 * TranslationWorkspace Component
 * Translation area with hints and reference answer
 */

import { useState } from 'react';
import { TranslationExercise } from '@/lib/models/writing';

interface TranslationWorkspaceProps {
  exercise: TranslationExercise;
  translationText: string;
  onChange: (text: string) => void;
}

export function TranslationWorkspace({
  exercise,
  translationText,
  onChange
}: TranslationWorkspaceProps) {
  const [showHints, setShowHints] = useState(false);
  const [showReference, setShowReference] = useState(false);

  return (
    <>
      {/* English Text to Translate */}
      <div className="bg-white border-2 border-blue-300 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🇬🇧</span>
          <h3 className="text-lg font-bold text-neutral-900">English Text</h3>
        </div>
        <p className="text-lg text-neutral-800 leading-relaxed">
          {exercise.englishText}
        </p>
      </div>

      {/* Translation Area */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🇩🇪</span>
          <h3 className="text-lg font-bold text-neutral-900">Your German Translation</h3>
        </div>

        <textarea
          value={translationText}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Schreibe deine Übersetzung hier..."
          className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans text-lg"
          style={{ lineHeight: '1.8' }}
        />
      </div>

      {/* Help Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Hints */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="text-sm font-bold text-amber-900">💡 Hints</h4>
            <span className="text-amber-600 font-bold">{showHints ? '−' : '+'}</span>
          </button>

          {showHints && exercise.hints && (
            <ul className="space-y-2 text-sm text-amber-800">
              {exercise.hints.map((hint, idx) => (
                <li key={idx}>• {hint}</li>
              ))}
            </ul>
          )}

          {!showHints && (
            <p className="text-xs text-amber-700 italic">Click to show hints</p>
          )}
        </div>

        {/* Reference Translation */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <button
            onClick={() => setShowReference(!showReference)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="text-sm font-bold text-emerald-900">✅ Reference Answer</h4>
            <span className="text-emerald-600 font-bold">{showReference ? '−' : '+'}</span>
          </button>

          {showReference ? (
            <p className="text-sm text-emerald-800 leading-relaxed">
              {exercise.correctGermanText}
            </p>
          ) : (
            <p className="text-xs text-emerald-700 italic">
              Try translating first, then check the reference
            </p>
          )}
        </div>
      </div>

      {/* Translation Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h4 className="text-sm font-bold text-blue-900 mb-2">📝 Translation Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Translate sentence by sentence for better structure</li>
          <li>• Pay attention to word order (verb position is crucial in German)</li>
          <li>• Don't forget articles (der/die/das) and their cases</li>
          <li>• Use the reference answer to learn, not just to copy</li>
        </ul>
      </div>
    </>
  );
}
