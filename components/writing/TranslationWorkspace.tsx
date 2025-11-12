/**
 * TranslationWorkspace Component
 * Uses reusable WritingWorkspace component
 */

import { useState, ReactNode } from 'react';
import { TranslationExercise } from '@/lib/models/writing';
import { WritingWorkspace } from './WritingWorkspace';

interface TranslationWorkspaceProps {
  exercise: TranslationExercise;
  translationText: string;
  onChange: (text: string) => void;
  attemptCount?: number;
  attemptHistory?: ReactNode;
  readOnly?: boolean;
  viewingAttempt?: { attemptNumber: number; status: string };
  onBackToCurrentDraft?: () => void;
}

export function TranslationWorkspace({
  exercise,
  translationText,
  onChange,
  attemptCount,
  attemptHistory,
  readOnly,
  viewingAttempt,
  onBackToCurrentDraft
}: TranslationWorkspaceProps) {
  const [showHints, setShowHints] = useState(false);
  const [showReference, setShowReference] = useState(false);

  const instructions = (
    <>
      {/* English Text to Translate */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🇬🇧</span>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Translate to German</h3>
        </div>
        <p className="text-base text-gray-900 leading-relaxed">
          {exercise.englishText}
        </p>
      </div>

      {/* Hints */}
      <div className="mb-6">
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center justify-between w-full mb-2 group"
        >
          <h4 className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">💡 Hints</h4>
          <span className="text-gray-400 group-hover:text-gray-600 text-xs">
            {showHints ? 'Hide' : 'Show'}
          </span>
        </button>

        {showHints && exercise.hints && (
          <ul className="space-y-2 text-sm text-gray-600 pl-6">
            {exercise.hints.map((hint, idx) => (
              <li key={idx} className="list-disc">{hint}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Reference Translation */}
      <div className="mb-6">
        <button
          onClick={() => setShowReference(!showReference)}
          className="flex items-center justify-between w-full mb-2 group"
        >
          <h4 className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">✅ Reference Answer</h4>
          <span className="text-gray-400 group-hover:text-gray-600 text-xs">
            {showReference ? 'Hide' : 'Show'}
          </span>
        </button>

        {showReference ? (
          <p className="text-sm text-gray-800 leading-relaxed">
            {exercise.correctGermanText}
          </p>
        ) : (
          <p className="text-xs text-gray-500 italic">
            Try translating first, then check
          </p>
        )}
      </div>

      {/* Translation Tips */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">📝 Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Translate sentence by sentence</li>
          <li>• Watch verb position</li>
          <li>• Don't forget articles (der/die/das)</li>
          <li>• Learn from the reference</li>
        </ul>
      </div>
    </>
  );

  return (
    <WritingWorkspace
      value={translationText}
      onChange={onChange}
      placeholder="Schreibe deine Übersetzung hier..."
      instructions={instructions}
      attemptCount={attemptCount}
      attemptHistory={attemptHistory}
      readOnly={readOnly}
      viewingAttempt={viewingAttempt}
    />
  );
}
