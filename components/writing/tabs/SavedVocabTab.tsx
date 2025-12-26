'use client';

import { SavedVocabulary } from '@/lib/models/savedVocabulary';
import { SavedVocabCard } from '../SavedVocabCard';

interface SavedVocabTabProps {
  savedVocabulary: SavedVocabulary[];
  isLoading: boolean;
  incompleteWords: SavedVocabulary[];
  completedWords: SavedVocabulary[];
  handleRemove: (wordId: string) => void;
  handleCopySavedWord: (text: string) => void;
}

export function SavedVocabTab({
  savedVocabulary,
  isLoading,
  incompleteWords,
  completedWords,
  handleRemove,
  handleCopySavedWord,
}: SavedVocabTabProps) {
  return (
    <>
      {/* Results */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        ) : incompleteWords.length === 0 && completedWords.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-3xl mb-2">📖</div>
            <p className="text-sm text-gray-600 font-medium">No saved vocabulary</p>
            <p className="text-xs text-gray-500 mt-1">
              Save words from flashcards to track usage
            </p>
          </div>
        ) : (
          <>
            {/* Incomplete Words Section */}
            {incompleteWords.length > 0 && (
              <div className="divide-y divide-gray-200">
                {incompleteWords.map(vocab => (
                  <SavedVocabCard
                    key={vocab.savedVocabId}
                    vocab={vocab}
                    onRemove={() => handleRemove(vocab.wordId)}
                    onCopy={() => handleCopySavedWord(vocab.german)}
                    showProgress
                  />
                ))}
              </div>
            )}

            {/* Completed Words Section (Collapsible) */}
            {completedWords.length > 0 && (
              <details className="border-t-2 border-gray-300 mt-2">
                <summary className="px-3 py-2 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  ✓ Completed ({completedWords.length})
                </summary>
                <div className="divide-y divide-gray-200">
                  {completedWords.map(vocab => (
                    <SavedVocabCard
                      key={vocab.savedVocabId}
                      vocab={vocab}
                      onRemove={() => handleRemove(vocab.wordId)}
                      onCopy={() => handleCopySavedWord(vocab.german)}
                      showProgress={false}
                    />
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex-shrink-0">
        <p className="text-[10px] text-gray-500 text-center">
          {savedVocabulary.length} {savedVocabulary.length === 1 ? 'word' : 'words'} saved
        </p>
      </div>
    </>
  );
}
