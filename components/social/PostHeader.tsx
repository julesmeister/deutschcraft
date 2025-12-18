'use client';

import { useState } from 'react';
import { User } from '@/lib/models/user';
import UserAvatar from './UserAvatar';

interface PostHeaderProps {
  author: User;
  cefrLevel: string;
  createdAt: number;
  isEdited: boolean;
  currentUserId?: string;
  currentUserRole?: 'STUDENT' | 'TEACHER' | 'PENDING_APPROVAL';
  postId?: string;
  onDelete?: () => void;
}

export default function PostHeader({ author, cefrLevel, createdAt, isEdited, currentUserId, currentUserRole, postId, onDelete }: PostHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isAuthor = currentUserId && author.userId === currentUserId;

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
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <UserAvatar user={author} size="md" className="mr-3" />
        <div>
          <h6 className="text-sm font-bold mb-0 text-gray-800">
            {currentUserRole === 'TEACHER' ? (
              <a
                href={`/dashboard/teacher/students/${encodeURIComponent(author.email)}`}
                className="hover:text-blue-600 cursor-pointer transition-colors"
              >
                {author.name || `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email}
              </a>
            ) : (
              <span className="hover:text-blue-600 cursor-pointer transition-colors">
                {author.name || `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.email}
              </span>
            )}
          </h6>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span>Level: {cefrLevel}</span>
            <span>·</span>
            <span>{formatTimestamp(createdAt)}</span>
            {isEdited && <span className="text-gray-500">· (edited)</span>}
          </div>
        </div>
      </div>

      {/* Post Menu */}
      {isAuthor && onDelete && (
        <div className="relative">
          <button
            className="text-gray-600 hover:bg-gray-100 py-1 px-2 rounded transition-colors"
            type="button"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
            </svg>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-20">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                >
                  Delete Post
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
