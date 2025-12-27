'use client';

import { SavedVocabulary } from '@/lib/models/savedVocabulary';
import { Copy, Check, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

interface SavedVocabCardProps {
  vocab: SavedVocabulary;
  onRemove: () => void;
  onCopy: () => void;
  onIncrement?: () => void; // Optional increment handler
  showProgress: boolean; // Hide progress for completed words
}

export function SavedVocabCard({ vocab, onRemove, onCopy, onIncrement, showProgress }: SavedVocabCardProps) {
  const [showCopied, setShowCopied] = useState(false);
  const [showIncremented, setShowIncremented] = useState(false);
  const progressPercentage = Math.min((vocab.timesUsed / vocab.targetUses) * 100, 100);

  const handleCopy = () => {
    onCopy();
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleIncrement = () => {
    if (onIncrement) {
      onIncrement();
      setShowIncremented(true);
      setTimeout(() => setShowIncremented(false), 2000);
    }
  };

  return (
    <div className="py-2 px-3 hover:bg-gray-50 transition-colors">
      {/* Header: German word + progress badge + level */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <div className="text-sm font-bold text-gray-900 truncate">
              {vocab.german}
            </div>
            {vocab.completed ? (
              <span className="px-1.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded flex-shrink-0">
                ✓ {vocab.timesUsed}/{vocab.targetUses}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded flex-shrink-0">
                {vocab.timesUsed}/{vocab.targetUses}
              </span>
            )}
            <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded flex-shrink-0">
              {vocab.level}
            </span>
          </div>
          <div className="text-xs text-gray-600">{vocab.english}</div>
          {vocab.category && (
            <div className="text-xs text-gray-500 mt-0.5">
              {vocab.category}
            </div>
          )}
        </div>

        {/* Copy + Increment + Delete Buttons */}
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Copy to clipboard"
          >
            {showCopied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          {onIncrement && !vocab.completed && (
            <button
              onClick={handleIncrement}
              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              title="Mark as used (+1)"
            >
              {showIncremented ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Remove from saved vocabulary"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar (only for incomplete) */}
      {showProgress && !vocab.completed && (
        <div className="mt-2">
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Use {vocab.targetUses - vocab.timesUsed} more time{vocab.targetUses - vocab.timesUsed !== 1 ? 's' : ''} to complete
          </div>
        </div>
      )}

      {/* Completion Message */}
      {showProgress && vocab.completed && (
        <div className="mt-2 text-xs text-green-600 font-medium">
          🎉 Completed! Great job!
        </div>
      )}

      {/* Example Sentence (first example only) */}
      {vocab.examples && vocab.examples.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 italic">
            &quot;{vocab.examples[0]}&quot;
          </div>
        </div>
      )}
    </div>
  );
}
