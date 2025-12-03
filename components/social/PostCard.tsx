'use client';

import { useState } from 'react';
import { Post } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import UserAvatar from './UserAvatar';
import PostActions from './PostActions';
import PostMedia from './PostMedia';
import CommentSection from './CommentSection';
import SuggestionForm from './SuggestionForm';

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

        {/* Suggestion Form - Inline */}
        {showSuggestionForm && (
          <SuggestionForm
            postId={post.postId}
            postContent={post.content}
            postUserId={post.userId}
            currentUserId={currentUserId}
            currentUser={currentUser}
            onClose={() => setShowSuggestionForm(false)}
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
