'use client';

import { useState } from 'react';
import { Post } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import PostHeader from './PostHeader';
import PostActions from './PostActions';
import PostMedia from './PostMedia';
import CommentSection from './CommentSection';
import SuggestionForm from './SuggestionForm';
import SuggestionsList from './SuggestionsList';

interface PostCardProps {
  post: Post;
  author: User;
  currentUserId: string;
  currentUser?: User;
  onLike?: () => void;
  onComment?: () => void;
  onSuggest?: () => void;
  onShare?: () => void;
  onPostUpdated?: () => void;
}

export default function PostCard({
  post,
  author,
  currentUserId,
  currentUser,
  onLike,
  onComment,
  onSuggest,
  onShare,
  onPostUpdated
}: PostCardProps) {
  const [showComments, setShowComments] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [acceptedSuggestion, setAcceptedSuggestion] = useState<string | null>(null);

  const isAuthor = currentUserId === post.userId;

  // Display the most recent accepted correction, or original content
  const displayContent = acceptedSuggestion || post.content;

  const handleSuggestionCreated = () => {
    setShowSuggestionForm(false);
  };

  const handleSuggestionAccepted = (correctedText: string) => {
    // Update the displayed content with the accepted correction
    setAcceptedSuggestion(correctedText);
  };

  return (
    <div className="bg-white border border-gray-200">
      {/* Header */}
      <div className="px-4 pt-4 pb-0">
        <PostHeader
          author={author}
          cefrLevel={post.cefrLevel}
          createdAt={post.createdAt}
          isEdited={post.isEdited}
        />
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-3">
        <p className="text-gray-700 mb-3">{displayContent}</p>

        {/* Suggestions List */}
        <SuggestionsList
          postId={post.postId}
          suggestionsCount={post.suggestionsCount}
          isAuthor={isAuthor}
          onSuggestionAccepted={handleSuggestionAccepted}
        />

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

        {/* Comments Section */}
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
