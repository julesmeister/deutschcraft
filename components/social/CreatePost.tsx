'use client';

import { useState } from 'react';
import { CEFRLevel } from '@/lib/models/cefr';
import { User } from '@/lib/models/user';
import UserAvatar from './UserAvatar';

interface CreatePostProps {
  currentUserId: string;
  userLevel: CEFRLevel;
  currentUser?: User;
  onSubmit?: (content: string, mediaUrls?: string[]) => void;
}

export default function CreatePost({ currentUserId, userLevel, currentUser, onSubmit }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(content, selectedMedia);
      }
      // Reset form
      setContent('');
      setSelectedMedia([]);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In production, upload files and get URLs
    // For now, just create object URLs
    const urls = Array.from(files).map(file => URL.createObjectURL(file));
    setSelectedMedia([...selectedMedia, ...urls]);
  };

  return (
    <div className="bg-white border border-gray-200 p-4 transform transition-all duration-300 hover:shadow-lg">
      <div className="flex mb-3">
        <div className="mr-2 flex-shrink-0">
          {currentUser ? (
            <UserAvatar user={currentUser} size="md" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          )}
        </div>
        <div className="flex-1">
          <textarea
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            placeholder={`Share your German practice... (Level: ${userLevel})`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Media Preview */}
      {selectedMedia.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {selectedMedia.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Selected ${index + 1}`}
                  className="rounded w-24 h-24 object-cover"
                />
                <button
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                  onClick={() => setSelectedMedia(selectedMedia.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded cursor-pointer text-sm">
          <svg width="20" height="20" fill="currentColor" className="text-green-600" viewBox="0 0 16 16">
            <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
          </svg>
          <span>Photo</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
        <label className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded cursor-pointer text-sm">
          <svg width="20" height="20" fill="currentColor" className="text-cyan-600" viewBox="0 0 16 16">
            <path d="M6 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <path d="M9 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
            <path d="M9 6h.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 7.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 16H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
          </svg>
          <span>Video</span>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
        <button
          className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
