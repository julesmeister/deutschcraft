'use client';

import { useState } from 'react';
import UserAvatar from './UserAvatar';
import { User } from '@/lib/models/user';

interface SuggestionFormProps {
  postId: string;
  postContent: string;
  postUserId: string;
  currentUserId: string;
  currentUser?: User;
  onClose: () => void;
}

export default function SuggestionForm({
  postId,
  postContent,
  postUserId,
  currentUserId,
  currentUser,
  onClose
}: SuggestionFormProps) {
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;

    setIsSubmitting(true);
    try {
      const { createSuggestion } = await import('@/lib/services/socialService');

      await createSuggestion({
        postId,
        suggestedBy: currentUserId,
        suggestedTo: postUserId,
        originalText: postContent,
        suggestedText: suggestionText,
        type: 'grammar',
        severity: 'suggestion',
        status: 'pending',
        upvotes: 0,
        downvotes: 0
      });

      setSuggestionText('');
      onClose();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <h6 className="text-sm font-semibold text-gray-900 mb-2">Suggest a Correction</h6>
      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        {currentUser && <UserAvatar user={currentUser} size="sm" />}
        <div className="flex-1 relative">
          <textarea
            className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            rows={2}
            placeholder="Write your corrected version here..."
            value={suggestionText}
            onChange={(e) => setSuggestionText(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            className="absolute right-2 top-2 p-1.5 text-amber-600 hover:text-amber-700 disabled:opacity-50 transition-colors"
            type="submit"
            disabled={isSubmitting || !suggestionText.trim()}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
            </svg>
          </button>
        </div>
      </form>
      <button
        className="text-xs text-gray-600 hover:text-gray-800 mt-2 ml-10"
        onClick={onClose}
      >
        Cancel
      </button>
    </div>
  );
}
