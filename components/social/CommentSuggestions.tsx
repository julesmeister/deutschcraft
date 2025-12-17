'use client';

import { useState, useEffect } from 'react';
import { Suggestion } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { useToast } from '@/components/ui/toast';
import { getUser } from '@/lib/services/userService';

interface CommentSuggestionsProps {
  commentId: string;
  commentContent: string;
  commentUserId: string;
  currentUserId: string;
  currentUser?: User;
  isAuthor: boolean;
  showForm?: boolean;
  onFormToggle?: (show: boolean) => void;
  onSuggestionAccepted?: (correctedText: string) => void;
}

export default function CommentSuggestions({
  commentId,
  commentContent,
  commentUserId,
  currentUserId,
  currentUser,
  isAuthor,
  showForm: externalShowForm,
  onFormToggle,
  onSuggestionAccepted
}: CommentSuggestionsProps) {
  const [showList, setShowList] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggesterNames, setSuggesterNames] = useState<Record<string, string>>({});
  const [correctionText, setCorrectionText] = useState('');
  const [loading, setLoading] = useState(false);

  const { getSuggestions, createSuggestion, acceptSuggestion, voteSuggestion } = useSocialService();
  const { success, error: showError } = useToast();

  const suggestionsCount = suggestions.length;
  const showForm = externalShowForm ?? false;

  useEffect(() => {
    if (showList) {
      loadSuggestions();
    }
  }, [showList]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      // For comments, we need to get suggestions by targetId (commentId)
      const data = await getSuggestions(commentId);
      setSuggestions(data);

      // Fetch suggester names
      const uniqueSuggesters = [...new Set(data.map(s => s.suggestedBy))];
      const names: Record<string, string> = {};

      if (currentUser && uniqueSuggesters.includes(currentUser.userId)) {
        names[currentUser.userId] = currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email.split('@')[0];
      }

      await Promise.all(
        uniqueSuggesters.map(async (email) => {
          if (names[email]) return;
          try {
            const user = await getUser(email);
            if (user) {
              names[email] = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || email.split('@')[0];
            } else {
              names[email] = email.split('@')[0];
            }
          } catch {
            names[email] = email.split('@')[0];
          }
        })
      );

      setSuggesterNames(names);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionText.trim()) return;

    setLoading(true);
    try {
      const suggestionId = await createSuggestion({
        postId: commentId, // Using commentId as the target
        suggestedBy: currentUserId,
        suggestedTo: commentUserId,
        originalText: commentContent,
        suggestedText: correctionText.trim(),
        type: 'grammar',
        upvotes: 0,
        downvotes: 0,
      });

      // Auto-accept the suggestion for comments
      await acceptSuggestion(suggestionId);

      success('Correction applied!', { duration: 2000 });
      setCorrectionText('');
      onFormToggle?.(false);

      // Notify parent to update display
      if (onSuggestionAccepted) {
        onSuggestionAccepted(correctionText.trim());
      }

      await loadSuggestions();
    } catch (err) {
      showError('Failed to submit', { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (suggestionId: string) => {
    try {
      const suggestion = suggestions.find(s => s.suggestionId === suggestionId);
      await acceptSuggestion(suggestionId);
      success('Applied!', { duration: 2000 });
      setShowList(false);
      if (suggestion && onSuggestionAccepted) {
        onSuggestionAccepted(suggestion.suggestedText);
      }
      await loadSuggestions();
    } catch (err) {
      showError('Failed', { duration: 2000 });
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

  return (
    <div className="mt-1">

      {/* Correction Form - Compact */}
      {showForm && (
        <form onSubmit={handleSubmitCorrection} className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <input
            type="text"
            placeholder="Your correction..."
            value={correctionText}
            onChange={(e) => setCorrectionText(e.target.value)}
            className="w-full px-2 py-1 mb-1.5 text-xs border border-amber-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-400"
            disabled={loading}
          />
          <div className="flex items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={() => onFormToggle?.(false)}
              className="px-2 py-1 text-[10px] text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-[10px] bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors disabled:opacity-50"
              disabled={loading || !correctionText.trim()}
            >
              Submit
            </button>
          </div>
        </form>
      )}

      {/* Corrections List - Hidden for comments */}
      {false && showList && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <h6 className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Corrections</h6>
            {loading && (
              <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-amber-600"></div>
            )}
          </div>

          {suggestions.length === 0 && !loading && (
            <p className="text-[10px] text-gray-600">No corrections yet.</p>
          )}

          <div className="space-y-1.5">
            {suggestions.map((suggestion) => (
              <div key={suggestion.suggestionId} className="p-1.5 bg-white border border-amber-100 rounded text-[10px]">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">
                      {suggesterNames[suggestion.suggestedBy] || suggestion.suggestedBy.split('@')[0]}
                    </span>
                    {suggestion.status === 'accepted' && (
                      <span className="text-green-600 font-semibold">✓</span>
                    )}
                  </div>
                  <span className="text-gray-500">
                    {new Date(suggestion.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="text-gray-500">
                    Was: <span className="line-through">{suggestion.originalText}</span>
                  </div>
                  <div className="text-amber-700 font-medium">
                    Now: {suggestion.suggestedText}
                  </div>
                </div>

                {suggestion.status === 'pending' && (
                  <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-amber-100">
                    {isAuthor && (
                      <button
                        onClick={() => handleAccept(suggestion.suggestionId)}
                        className="px-1.5 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Apply
                      </button>
                    )}
                    <button
                      onClick={() => handleVote(suggestion.suggestionId, 'up')}
                      className="px-1 text-gray-600 hover:text-green-600"
                    >
                      👍 {suggestion.upvotes || 0}
                    </button>
                    <button
                      onClick={() => handleVote(suggestion.suggestionId, 'down')}
                      className="px-1 text-gray-600 hover:text-red-600"
                    >
                      👎 {suggestion.downvotes || 0}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
