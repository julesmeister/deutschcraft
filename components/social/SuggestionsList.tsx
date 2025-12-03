'use client';

import { useState, useEffect } from 'react';
import { Suggestion } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { useToast } from '@/components/ui/toast';
import { getUser } from '@/lib/services/userService';
import SuggestionCard from './SuggestionCard';

interface SuggestionsListProps {
  postId: string;
  suggestionsCount: number;
  isAuthor: boolean;
  currentUser?: User;
  onSuggestionAccepted?: (correctedText: string) => void;
  onAcceptedSuggestionLoaded?: (correctedText: string) => void;
}

export default function SuggestionsList({
  postId,
  suggestionsCount,
  isAuthor,
  currentUser,
  onSuggestionAccepted,
  onAcceptedSuggestionLoaded
}: SuggestionsListProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggesterNames, setSuggesterNames] = useState<Record<string, string>>({});

  const { getSuggestions, acceptSuggestion, voteSuggestion } = useSocialService();
  const { success, error: showError } = useToast();

  // Load accepted suggestion on mount
  useEffect(() => {
    if (suggestionsCount > 0) {
      loadSuggestions();
    }
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getSuggestions(postId);
      setSuggestions(data);

      // Fetch suggester names
      const uniqueSuggesters = [...new Set(data.map(s => s.suggestedBy))];
      const names: Record<string, string> = {};

      // Add current user if they're a suggester
      if (currentUser && uniqueSuggesters.includes(currentUser.userId)) {
        names[currentUser.userId] = currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email.split('@')[0];
      }

      await Promise.all(
        uniqueSuggesters.map(async (email) => {
          // Skip if already have this name
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

      // Find the most recent accepted suggestion and pass it to parent
      const accepted = data
        .filter(s => s.status === 'accepted')
        .sort((a, b) => (b.acceptedAt || 0) - (a.acceptedAt || 0))[0];

      if (accepted && onAcceptedSuggestionLoaded) {
        onAcceptedSuggestionLoaded(accepted.suggestedText);
      }
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
      // Find the suggestion being accepted
      const suggestion = suggestions.find(s => s.suggestionId === suggestionId);
      if (!suggestion) return;

      await acceptSuggestion(suggestionId);
      success('Correction applied!', { duration: 3000 });

      // Close the suggestions panel
      setShowSuggestions(false);

      // Pass the corrected text to parent
      onSuggestionAccepted?.(suggestion.suggestedText);
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
              <SuggestionCard
                key={suggestion.suggestionId}
                suggestion={suggestion}
                suggesterName={suggesterNames[suggestion.suggestedBy] || suggestion.suggestedBy.split('@')[0]}
                isAuthor={isAuthor}
                onAccept={handleAccept}
                onVote={handleVote}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
