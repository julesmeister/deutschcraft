'use client';

import { useState } from 'react';
import { Suggestion } from '@/lib/models/social';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { useToast } from '@/components/ui/toast';

interface SuggestionsListProps {
  postId: string;
  suggestionsCount: number;
  isAuthor: boolean;
  onSuggestionAccepted?: () => void;
}

export default function SuggestionsList({
  postId,
  suggestionsCount,
  isAuthor,
  onSuggestionAccepted
}: SuggestionsListProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const { getSuggestions, acceptSuggestion, voteSuggestion } = useSocialService();
  const { success, error: showError } = useToast();

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getSuggestions(postId);
      setSuggestions(data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const newState = !showSuggestions;
    setShowSuggestions(newState);
    if (newState && suggestions.length === 0) {
      loadSuggestions();
    }
  };

  const handleAccept = async (suggestionId: string) => {
    try {
      await acceptSuggestion(suggestionId);
      success('Correction applied!', { duration: 3000 });
      // Close the suggestions panel
      setShowSuggestions(false);
      // Small delay to ensure database has updated, then notify parent to refresh
      setTimeout(() => {
        onSuggestionAccepted?.();
      }, 300);
    } catch (err) {
      showError('Failed to accept', { duration: 3000 });
    }
  };

  const handleVote = async (suggestionId: string, voteType: 'up' | 'down') => {
    try {
      await voteSuggestion(suggestionId, voteType);
      await loadSuggestions();
    } catch (err) {
      showError('Failed to vote', { duration: 2000 });
    }
  };

  if (suggestionsCount === 0) return null;

  return (
    <div className="mb-3">
      {/* Toggle Badge */}
      <button
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
      >
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
          <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
        </svg>
        <span>{suggestionsCount}</span>
        {showSuggestions ? (
          <svg width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
          </svg>
        ) : (
          <svg width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
            <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
          </svg>
        )}
      </button>

      {/* Suggestions List */}
      {showSuggestions && (
        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h6 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Corrections</h6>
            {loading && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600"></div>
            )}
          </div>

          {suggestions.length === 0 && !loading && (
            <p className="text-xs text-gray-600">No suggestions yet.</p>
          )}

          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div key={suggestion.suggestionId} className="bg-white p-2 rounded border border-amber-100">
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
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium ${
                      suggestion.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      suggestion.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {suggestion.status}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      by {suggestion.suggestedBy.split('@')[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Voting */}
                    {suggestion.status === 'pending' && !isAuthor && (
                      <>
                        <button
                          onClick={() => handleVote(suggestion.suggestionId, 'up')}
                          className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                          title="Helpful"
                        >
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                          </svg>
                        </button>
                        <span className="text-[10px] text-gray-600 min-w-[12px] text-center">{suggestion.upvotes}</span>
                        <button
                          onClick={() => handleVote(suggestion.suggestionId, 'down')}
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
                        onClick={() => handleAccept(suggestion.suggestionId)}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
