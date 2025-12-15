'use client';

interface Flashcard {
  id: string;
  german: string;
  english: string;
  category: string;
  level: string;
  examples?: string[];
  masteryLevel?: number;
}

interface FlashcardReviewListProps {
  flashcards: Flashcard[];
  categoryName: string;
  level: string;
}

export function FlashcardReviewList({
  flashcards,
  categoryName,
  level,
}: FlashcardReviewListProps) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{categoryName}</h2>
            <p className="text-gray-600 mt-1">
              {level} • {flashcards.length} cards
            </p>
          </div>
          <div className="text-5xl">👁️</div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {flashcards.map((card, index) => (
          <div
            key={card.id || index}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* German Side */}
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  🇩🇪 German
                </div>
                <div className="text-xl font-bold text-gray-900">{card.german}</div>
              </div>

              {/* English Side */}
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  🇬🇧 English
                </div>
                <div className="text-xl font-bold text-gray-900">{card.english}</div>
              </div>
            </div>

            {/* Examples */}
            {card.examples && card.examples.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Examples
                </div>
                <div className="space-y-1">
                  {card.examples.map((example, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      • {example}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Mastery Level */}
            {card.masteryLevel !== undefined && card.masteryLevel > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Mastery:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-6 h-2 rounded-full ${
                        level <= (card.masteryLevel || 0)
                          ? 'bg-emerald-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 text-center">
        <p className="text-gray-700">
          <span className="font-bold text-gray-900">{flashcards.length} cards</span> in {categoryName}
        </p>
      </div>
    </div>
  );
}
