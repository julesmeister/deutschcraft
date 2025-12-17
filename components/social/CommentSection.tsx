'use client';

import { useState, useEffect, useRef } from 'react';
import { Comment } from '@/lib/models/social';
import { User } from '@/lib/models/user';
import UserAvatar from './UserAvatar';
import CommentItem from './CommentItem';
import { useSocialService } from '@/lib/hooks/useSocialService';
import { useToast } from '@/components/ui/toast';
import { GermanCharAutocomplete } from '@/components/writing/GermanCharAutocomplete';

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
  const inputRef = useRef<HTMLInputElement>(null);

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
            <CommentItem
              key={comment.commentId}
              comment={comment}
              currentUserId={currentUserId}
              currentUser={currentUser}
              onCommentDeleted={fetchComments}
            />
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
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg relative">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-sm focus:outline-none"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && newComment.trim()) {
                e.preventDefault();
                handleSubmitComment(e as any);
              }
            }}
          />
          <GermanCharAutocomplete
            textareaRef={inputRef}
            content={newComment}
            onContentChange={setNewComment}
          />
          <button
            className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
            type="button"
            onClick={handleSubmitComment}
            disabled={loading || !newComment.trim()}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
