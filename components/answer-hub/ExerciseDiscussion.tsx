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
    <div className="space-y-0">
      {/* Discussion Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-gray-700"
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
          <h2 className="text-lg font-black text-gray-900">
            Discussion
          </h2>
          <span className="text-sm text-gray-600">
            ({comments.length} comment{comments.length !== 1 ? 's' : ''} • {batchMatesCount} batch-mates)
          </span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="p-6">
        {/* Comments List */}
        {loading && comments.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            Loading comments...
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-3 mb-3">
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
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-4 italic mb-3">
            No comments yet. Be the first to discuss this exercise!
          </div>
        )}

        {/* Show More/Less Button */}
        {!showAll && hasMoreComments && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-sm text-gray-600 hover:text-blue-600 font-medium mb-3 transition-colors"
          >
            View all {comments.length} comments
          </button>
        )}

        {/* Add Comment Form */}
        {canComment && currentUser && (
          <div className="flex gap-2 items-start">
            <UserAvatar user={currentUser} size="sm" />
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg relative">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent text-sm focus:outline-none"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
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
                disabled={submitting || !newComment.trim()}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            Failed to load comments. Please refresh the page.
          </div>
        )}
      </div>
    </div>
  );
}
