'use client';

import { useState, useEffect } from 'react';
import { Post, Suggestion } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import UserAvatar from './UserAvatar';
import PostActions from './PostActions';
import PostMedia from './PostMedia';
import CommentSection from './CommentSection';
import SuggestionForm from './SuggestionForm';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { useToast } from '@/components/ui/toast';

interface PostCardProps {
  post: Post;
  author: User;
  currentUserId: string;
  currentUser?: User;
  onLike?: () => void;
  onComment?: () => void;
  onSuggest?: () => void;
  onShare?: () => void;
}

export default function PostCard({
  post,
  author,
  currentUserId,
  currentUser,
  onLike,
  onComment,
  onSuggest,
  onShare
}: PostCardProps) {
  const [showComments, setShowComments] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { getSuggestions, acceptSuggestion, voteSuggestion } = useSocialService();
  const { success, error: showError } = useToast();

  const isAuthor = currentUserId === post.userId;

  // Load suggestions when toggling suggestions view
  useEffect(() => {
    if (showSuggestions) {
      loadSuggestions();
    }
  }, [showSuggestions]);

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const data = await getSuggestions(post.postId);
      setSuggestions(data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAcceptSuggestion = async (suggestionId: string) => {
    try {
      await acceptSuggestion(suggestionId);
      success('Suggestion accepted!', {
        description: 'Your post has been updated with the correction.',
        duration: 4000
      });
      // Reload suggestions
      await loadSuggestions();
    } catch (err) {
      showError('Failed to accept suggestion', {
        description: 'Please try again later.',
        duration: 4000
      });
    }
  };

  const handleVoteSuggestion = async (suggestionId: string, voteType: 'up' | 'down') => {
    try {
      await voteSuggestion(suggestionId, voteType);
      // Reload suggestions to show updated votes
      await loadSuggestions();
    } catch (err) {
      showError('Failed to vote', {
        description: 'Please try again later.',
        duration: 3000
      });
    }
  };

  const handleSuggestionCreated = () => {
    // Reload suggestions after creating a new one
    if (showSuggestions) {
      loadSuggestions();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}hr${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-white border border-gray-200">
      {/* Header */}
      <div className="px-4 pt-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserAvatar user={author} size="md" className="mr-3" />
            <div>
              <h6 className="text-sm font-bold mb-0 text-gray-800">
                <span role="button" className="hover:text-blue-600 cursor-pointer transition-colors">
                  {author.name || `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email}
                </span>
              </h6>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span>Level: {post.cefrLevel}</span>
                <span>·</span>
                <span>{formatTimestamp(post.createdAt)}</span>
                {post.isEdited && <span className="text-gray-500">· (edited)</span>}
              </div>
            </div>
          </div>

          {/* Post Menu */}
          <div className="relative">
            <button
              className="text-gray-600 hover:bg-gray-100 py-1 px-2 rounded transition-colors"
              type="button"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-3">
        <p className="text-gray-700 mb-3">{post.content}</p>

        {/* Suggestion Badge - Show count if there are suggestions */}
        {post.suggestionsCount > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
              </svg>
              {post.suggestionsCount} {post.suggestionsCount === 1 ? 'Suggestion' : 'Suggestions'}
              {showSuggestions ? ' (Hide)' : ' (Show)'}
            </button>
          </div>
        )}

        {/* Suggestions List */}
        {showSuggestions && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h6 className="text-sm font-semibold text-gray-900">Corrections & Suggestions</h6>
              {loadingSuggestions && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
              )}
            </div>

            {suggestions.length === 0 && !loadingSuggestions && (
              <p className="text-sm text-gray-600">No suggestions yet.</p>
            )}

            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.suggestionId} className="bg-white p-3 rounded border border-amber-200">
                  {/* Original vs Suggested */}
                  <div className="space-y-2 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-600 uppercase">Original:</span>
                      <p className="text-sm text-gray-700 line-through">{suggestion.originalText}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-green-600 uppercase">Suggested:</span>
                      <p className="text-sm text-green-700 font-medium">{suggestion.suggestedText}</p>
                    </div>
                    {suggestion.explanation && (
                      <div>
                        <span className="text-xs font-semibold text-gray-600 uppercase">Explanation:</span>
                        <p className="text-sm text-gray-600">{suggestion.explanation}</p>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        suggestion.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        suggestion.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {suggestion.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        by {suggestion.suggestedBy.split('@')[0]}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Vote buttons (for everyone) */}
                      {suggestion.status === 'pending' && !isAuthor && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleVoteSuggestion(suggestion.suggestionId, 'up')}
                            className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                            title="Upvote"
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                            </svg>
                          </button>
                          <span className="text-xs text-gray-600">{suggestion.upvotes}</span>
                          <button
                            onClick={() => handleVoteSuggestion(suggestion.suggestionId, 'down')}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                            title="Downvote"
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                            </svg>
                          </button>
                          <span className="text-xs text-gray-600">{suggestion.downvotes}</span>
                        </div>
                      )}

                      {/* Accept button (only for post author) */}
                      {isAuthor && suggestion.status === 'pending' && (
                        <button
                          onClick={() => handleAcceptSuggestion(suggestion.suggestionId)}
                          className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                        >
                          Accept
                        </button>
                      )}

                      {suggestion.status === 'accepted' && (
                        <span className="text-xs text-green-600 font-medium">✓ Accepted</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestion Form - Inline */}
        {showSuggestionForm && (
          <SuggestionForm
            postId={post.postId}
            postContent={post.content}
            postUserId={post.userId}
            currentUserId={currentUserId}
            currentUser={currentUser}
            onClose={() => setShowSuggestionForm(false)}
            onSuggestionCreated={handleSuggestionCreated}
          />
        )}

        {/* Grammar Focus Tags */}
        {post.grammarFocus && post.grammarFocus.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.grammarFocus.map((focus, index) => (
              <span key={index} className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded">
                {focus}
              </span>
            ))}
          </div>
        )}

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <PostMedia urls={post.mediaUrls} type={post.mediaType} />
        )}

        {/* Actions */}
        <PostActions
          postId={post.postId}
          currentUserId={currentUserId}
          authorId={post.userId}
          onLike={onLike}
          onComment={onComment}
          onSuggest={() => setShowSuggestionForm(!showSuggestionForm)}
          onShare={onShare}
          onToggleComments={() => setShowComments(!showComments)}
          onToggleSuggestions={() => setShowSuggestionForm(!showSuggestionForm)}
        />

        {/* Comments Section - Always render */}
        <CommentSection
          postId={post.postId}
          currentUserId={currentUserId}
          currentUser={currentUser}
          isExpanded={showComments}
        />
      </div>
    </div>
  );
}
