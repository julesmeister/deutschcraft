/**
 * Exercise Discussion Component
 * Batch-filtered comment section for exercises
 * Only shows comments from batch-mates (privacy layer)
 */

'use client';

import { useState, useRef } from 'react';
import { useBatchFilteredComments } from '@/lib/hooks/useBatchFilteredComments';
import { User } from '@/lib/models/user';
import CommentItem from '@/components/social/CommentItem';
import UserAvatar from '@/components/social/UserAvatar';
import { useToast } from '@/components/ui/toast';
import { GermanCharAutocomplete } from '@/components/writing/GermanCharAutocomplete';

interface ExerciseDiscussionProps {
  exerciseId: string;
  currentUser: User | null;
  currentUserBatchId: string | null | undefined;
}

export function ExerciseDiscussion({
  exerciseId,
  currentUser,
  currentUserBatchId,
}: ExerciseDiscussionProps) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    comments,
    loading,
    error,
    addComment,
    refresh,
    batchMatesCount,
    canComment,
    hasBatch,
  } = useBatchFilteredComments(exerciseId, currentUserBatchId);

  const { success, error: showError } = useToast();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !canComment) return;

    setSubmitting(true);
    try {
      await addComment({
        postId: exerciseId,  // Exercise ID serves as post ID
        userId: currentUser.userId || currentUser.email,
        content: newComment.trim(),
        parentCommentId: null,
        likesCount: 0,
      });

      success('Comment posted!', { duration: 3000 });
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      showError('Failed to post comment', {
        description: 'Please try again later.',
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show only first 3 comments by default
  const displayedComments = showAll ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  // No batch warning
  if (!hasBatch) {
    return (
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-sm text-amber-900">
              No Batch Assigned
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              Join a batch to see and participate in exercise discussions with your classmates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Discussion Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h4 className="font-semibold text-sm text-gray-900">
            Discussion
          </h4>
          <span className="text-xs text-gray-500">
            ({batchMatesCount} batch-mates)
          </span>
        </div>

        {comments.length > 0 && (
          <span className="text-xs font-medium text-gray-600">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">
          Loading comments...
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {displayedComments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              currentUserId={currentUser?.userId || currentUser?.email || ''}
              currentUser={currentUser || undefined}
              currentUserRole={currentUser?.role}
              onCommentDeleted={refresh}
            />
          ))}

          {/* Show More/Less Button */}
          {hasMoreComments && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showAll
                ? 'Show less'
                : `Show ${comments.length - 3} more comment${comments.length - 3 !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-4 italic">
          No comments yet. Be the first to discuss this exercise!
        </div>
      )}

      {/* Comment Form */}
      {canComment && currentUser && (
        <form onSubmit={handleSubmitComment} className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <UserAvatar user={currentUser} size="sm" />
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts or ask a question..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={submitting}
              />
              <GermanCharAutocomplete
                textareaRef={inputRef}
                content={newComment}
                onContentChange={setNewComment}
              />
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewComment('')}
                disabled={!newComment.trim() || submitting}
                className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Error State */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          Failed to load comments. Please refresh the page.
        </div>
      )}
    </div>
  );
}
