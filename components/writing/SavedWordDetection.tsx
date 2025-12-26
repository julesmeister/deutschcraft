'use client';

import { useState } from 'react';
import { SavedVocabulary } from '@/lib/models/savedVocabulary';
import { Sparkles } from 'lucide-react';

interface SavedWordDetectionProps {
  detectedWords: SavedVocabulary[];
  onConfirm: (wordIds: string[]) => Promise<void>;
  onDismiss: () => void;
}

export function SavedWordDetection({ detectedWords, onConfirm, onDismiss }: SavedWordDetectionProps) {
  const [selectedWords, setSelectedWords] = useState<Set<string>>(
    new Set(detectedWords.map(w => w.wordId)) // Pre-select all detected words
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (selectedWords.size === 0) return;

    setIsSubmitting(true);
    try {
      await onConfirm(Array.from(selectedWords));
    } catch (error) {
      console.error('Error confirming word usage:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleWord = (wordId: string) => {
    const newSelected = new Set(selectedWords);
    if (newSelected.has(wordId)) {
      newSelected.delete(wordId);
    } else {
      newSelected.add(wordId);
    }
    setSelectedWords(newSelected);
  };

  if (detectedWords.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">
          Saved Words Detected!
        </h3>
      </div>

      <p className="text-sm text-blue-800 mb-3">
        We found {detectedWords.length} of your saved vocabulary {detectedWords.length === 1 ? 'word' : 'words'} in your writing.
        Check the ones you intentionally used:
      </p>

      {/* Word List with Checkboxes */}
      <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
        {detectedWords.map(word => {
          const isSelected = selectedWords.has(word.wordId);
          const willComplete = word.timesUsed + 1 >= word.targetUses;

          return (
            <label
              key={word.wordId}
              className={`flex items-start gap-3 p-2 bg-white rounded border cursor-pointer transition-colors ${
                isSelected
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-blue-100 hover:bg-blue-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleWord(word.wordId)}
                className="mt-1 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-bold text-gray-900">{word.german}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded flex-shrink-0">
                    {word.timesUsed}/{word.targetUses}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded flex-shrink-0">
                    {word.level}
                  </span>
                </div>
                <div className="text-xs text-gray-600">{word.english}</div>
                {word.category && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {word.category}
                  </div>
                )}
                {willComplete && isSelected && (
                  <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                    <span>🎉</span>
                    <span>This will complete the word!</span>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={selectedWords.size === 0 || isSubmitting}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            selectedWords.size === 0 || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Updating...' : `Mark ${selectedWords.size} as Used`}
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
