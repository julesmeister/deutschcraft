'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import UserAvatar from './UserAvatar';
import CommentSuggestions from './CommentSuggestions';
import { getUser } from '@/lib/services/userService';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { useToast } from '@/components/ui/toast';

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  currentUser?: User;
}

export default function CommentItem({ comment, currentUserId, currentUser }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likesCount || 0);

  const { toggleLike, createComment } = useSocialService();
  const toast = useToast();

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

  const handleLikeComment = async () => {
    try {
      const nowLiked = await toggleLike(currentUserId, comment.commentId, 'comment');
      setIsLiked(nowLiked);
      setLikeCount(prev => nowLiked ? prev + 1 : prev - 1);

      if (nowLiked) {
        toast.success('Comment liked!', { duration: 2000 });
      }
    } catch (error) {
      toast.error('Failed to like comment', { duration: 2000 });
      console.error('Error liking comment:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await createComment({
        postId: comment.postId,
        userId: currentUserId,
        content: replyText.trim(),
        parentCommentId: comment.commentId,
        likesCount: 0,
      });

      toast.success('Reply posted!', { duration: 2000 });
      setReplyText('');
      setShowReplyForm(false);
    } catch (error) {
      toast.error('Failed to post reply', { duration: 2000 });
      console.error('Error posting reply:', error);
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
          <button
            className={`text-xs font-medium transition-colors ${
              isLiked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={handleLikeComment}
          >
            {isLiked ? 'Liked' : 'Like'}
          </button>
          <button
            className="text-xs text-gray-600 hover:text-blue-600 font-medium transition-colors"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Reply
          </button>
          {likeCount > 0 && (
            <span className="text-xs text-gray-500">{likeCount} likes</span>
          )}
        </div>

        {/* Compact Corrections */}
        <CommentSuggestions
          commentId={comment.commentId}
          commentContent={comment.content}
          commentUserId={comment.userId}
          currentUserId={currentUserId}
          currentUser={currentUser}
          isAuthor={currentUserId === comment.userId}
        />

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-2 flex gap-2">
            <form className="flex-1 relative" onSubmit={handleSubmitReply}>
              <textarea
                className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={1}
                placeholder="Reply to this comment..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && replyText.trim()) {
                    e.preventDefault();
                    handleSubmitReply(e as any);
                  }
                }}
              />
              <button
                className="absolute right-2 top-2 p-1.5 text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                type="submit"
                disabled={!replyText.trim()}
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
