'use client';

import { Suggestion } from '@/lib/models/social';

interface SuggestionCardProps {
  suggestion: Suggestion;
  suggesterName: string;
  isAuthor: boolean;
  onAccept: (suggestionId: string) => void;
  onVote: (suggestionId: string, voteType: 'up' | 'down') => void;
}

export default function SuggestionCard({
  suggestion,
  suggesterName,
  isAuthor,
  onAccept,
  onVote
}: SuggestionCardProps) {
  return (
    <div className="bg-white p-2 rounded border border-amber-100">
      {/* Text Comparison - Compact */}
      <div className="space-y-1 mb-2">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-0.5">Was:</span>
          <p className="text-xs text-gray-600 line-through flex-1">{suggestion.originalText}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mt-0.5">Now:</span>
          <p className="text-xs text-green-700 font-medium flex-1">{suggestion.suggestedText}</p>
        </div>
        {suggestion.explanation && (
          <p className="text-xs text-gray-600 pl-9 italic">{suggestion.explanation}</p>
        )}
      </div>

      {/* Actions Row - Compact */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {suggestion.status === 'pending' && (
            <span className="px-1.5 py-0.5 text-[10px] rounded-full font-medium bg-gray-100 text-gray-600">
              pending
            </span>
          )}
          <span className="text-xs text-gray-700 font-medium">
            {suggesterName}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            {new Date(suggestion.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date(suggestion.createdAt).toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit', hour12: true})}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Voting */}
          {suggestion.status === 'pending' && !isAuthor && (
            <>
              <button
                onClick={() => onVote(suggestion.suggestionId, 'up')}
                className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                title="Helpful"
              >
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                </svg>
              </button>
              <span className="text-[10px] text-gray-600 min-w-[12px] text-center">{suggestion.upvotes}</span>
              <button
                onClick={() => onVote(suggestion.suggestionId, 'down')}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                title="Not helpful"
              >
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                  <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                </svg>
              </button>
              <span className="text-[10px] text-gray-600 min-w-[12px] text-center">{suggestion.downvotes}</span>
            </>
          )}

          {/* Accept Button */}
          {isAuthor && suggestion.status === 'pending' && (
            <button
              onClick={() => onAccept(suggestion.suggestionId)}
              className="px-2 py-1 text-[10px] font-semibold text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              Apply
            </button>
          )}

          {suggestion.status === 'accepted' && (
            <span className="text-[10px] text-green-600 font-semibold">✓ Applied</span>
          )}
        </div>
      </div>
    </div>
  );
}
