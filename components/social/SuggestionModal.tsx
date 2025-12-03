'use client';

import { useState } from 'react';
import { Post, Suggestion } from '@/lib/models/social';

interface SuggestionModalProps {
  post: Post;
  currentUserId: string;
  onClose: () => void;
  onSubmit?: (suggestion: Partial<Suggestion>) => void;
}

export default function SuggestionModal({
  post,
  currentUserId,
  onClose,
  onSubmit
}: SuggestionModalProps) {
  const [suggestedText, setSuggestedText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestedText.trim()) return;

    setIsSubmitting(true);
    try {
      const suggestion: Partial<Suggestion> = {
        postId: post.postId,
        suggestedBy: currentUserId,
        suggestedTo: post.userId,
        originalText: post.content,
        suggestedText: suggestedText,
        type: 'grammar',
        severity: 'suggestion',
        status: 'pending',
        upvotes: 0,
        downvotes: 0
      };

      if (onSubmit) {
        await onSubmit(suggestion);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h5 className="text-lg font-semibold text-gray-900">Suggest a Correction</h5>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Original Post Content */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h6 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Original Post</h6>
              <p className="text-gray-800">{post.content}</p>
            </div>

            {/* Your Suggestion */}
            <div>
              <label htmlFor="suggestedText" className="block text-sm font-semibold text-gray-900 mb-2">
                Your Suggestion <span className="text-red-600">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="suggestedText"
                rows={4}
                value={suggestedText}
                onChange={(e) => setSuggestedText(e.target.value)}
                placeholder="Write your corrected version here..."
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Suggest how the post should be written correctly in German.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!suggestedText.trim() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
