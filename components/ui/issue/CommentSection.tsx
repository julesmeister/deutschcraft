'use client';

import { ReactNode, useState } from 'react';

export interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials?: string;
    color?: string;
  };
  time: string;
  content: ReactNode;
}

interface CommentSectionProps {
  comments: Comment[];
  currentUser?: {
    name: string;
    avatar?: string;
    initials?: string;
    color?: string;
  };
  placeholder?: string;
  onAddComment?: (comment: string) => void;
  className?: string;
}

export function CommentSection({
  comments,
  currentUser,
  placeholder = 'Add a comment...',
  onAddComment,
  className = '',
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = () => {
    if (commentText.trim() && onAddComment) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Comment Input */}
      {currentUser && (
        <div className="flex gap-4 mb-6">
          {/* User Avatar */}
          <div>
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-[40px] h-[40px] rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-[40px] h-[40px] rounded-full flex items-center justify-center ${
                  currentUser.color || 'bg-blue-200'
                }`}
              >
                <span className="text-gray-900 font-bold text-sm">
                  {currentUser.initials}
                </span>
              </div>
            )}
          </div>

          {/* Comment Input Area */}
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={placeholder}
              className="w-full min-h-[100px] p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!commentText.trim()}
                className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="flex flex-col gap-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            {/* User Avatar */}
            <div>
              {comment.user.avatar ? (
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="w-[40px] h-[40px] rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-[40px] h-[40px] rounded-full flex items-center justify-center ${
                    comment.user.color || 'bg-blue-200'
                  }`}
                >
                  <span className="text-gray-900 font-bold text-sm">
                    {comment.user.initials}
                  </span>
                </div>
              )}
            </div>

            {/* Comment Content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-gray-900">
                  {comment.user.name}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {comment.time}
                </span>
              </div>
              <div className="text-gray-700">{comment.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}
