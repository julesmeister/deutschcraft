'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import UserAvatar from './UserAvatar';
import { getUser } from '@/lib/services/userService';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { useToast } from '@/components/ui/toast';

interface CommentSectionProps {
  postId: string;
  currentUserId: string;
  currentUser?: User;
  isExpanded?: boolean;
}

export default function CommentSection({ postId, currentUserId, currentUser, isExpanded = true }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { createComment, getComments } = useSocialService();
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const commentsData = await getComments(postId);
      // Filter top-level comments (no parent) and sort by created date
      const topLevelComments = commentsData
        .filter(c => !c.parentCommentId)
        .sort((a, b) => b.createdAt - a.createdAt);
      setComments(topLevelComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setLoading(true);
    try {
      await createComment({
        postId,
        userId: currentUserId,
        content: newComment.trim(),
        parentCommentId: null,
        likesCount: 0,
      });

      success('Comment posted!', { duration: 3000 });
      setNewComment('');

      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      showError('Failed to post comment', {
        description: 'Please try again later.',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // Show only first comment by default, or all if showAll is true
  const displayedComments = showAll ? comments : comments.slice(0, 1);
  const hasMoreComments = comments.length > 1;

  if (!isExpanded) {
    return null;
  }

  return (
    <div className="mt-3">
      {/* Comments List */}
      {displayedComments.length > 0 && (
        <div className="space-y-3 mb-3">
          {displayedComments.map((comment) => (
            <CommentItem key={comment.commentId} comment={comment} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {!showAll && hasMoreComments && (
        <button
          type="button"
          className="text-sm text-gray-600 hover:text-blue-600 font-medium mb-3 transition-colors"
          onClick={() => setShowAll(true)}
        >
          View all {comments.length} comments
        </button>
      )}

      {/* Add Comment Form */}
      <div className="flex gap-2 items-start">
        {currentUser && <UserAvatar user={currentUser} size="sm" />}
        <form className="flex-1 relative" onSubmit={handleSubmitComment}>
          <textarea
            className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={1}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
          />
          <button
            className="absolute right-2 top-2 p-1.5 text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
            type="submit"
            disabled={loading || !newComment.trim()}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
}

function CommentItem({ comment, currentUserId }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState<User | null>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await getUser(comment.userId);
        if (userData) {
          setCommentAuthor(userData);
        }
      } catch (error) {
        console.error('Error fetching comment author:', error);
      }
    };
    fetchAuthor();
  }, [comment.userId]);

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}hr${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Fallback user if not loaded yet
  const displayUser = commentAuthor || {
    userId: comment.userId,
    email: comment.userEmail,
    firstName: '',
    lastName: '',
    role: 'STUDENT' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return (
    <div className="flex gap-2">
      <div className="flex-shrink-0">
        <UserAvatar user={displayUser} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h6 className="text-sm font-semibold text-gray-900">
              {commentAuthor?.name ||
               `${commentAuthor?.firstName || ''} ${commentAuthor?.lastName || ''}`.trim() ||
               comment.userEmail?.split('@')[0] ||
               'User'}
            </h6>
            <span className="text-xs text-gray-500">{formatTimestamp(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-2">
          <button className="text-xs text-gray-600 hover:text-blue-600 font-medium transition-colors">
            Like
          </button>
          <button
            className="text-xs text-gray-600 hover:text-blue-600 font-medium transition-colors"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Reply
          </button>
          {comment.likesCount > 0 && (
            <span className="text-xs text-gray-500">{comment.likesCount} likes</span>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-2 flex gap-2">
            <form className="flex-1 relative" onSubmit={(e) => e.preventDefault()}>
              <textarea
                className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={1}
                placeholder="Reply to this comment..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                className="absolute right-2 top-2 p-1.5 text-blue-600 hover:text-blue-700 transition-colors"
                type="submit"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
