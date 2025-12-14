'use client';

import { useState } from 'react';
import { ActionButton } from '@/components/ui/ActionButton';
import { CompactButtonDropdown, DropdownOption } from '@/components/ui/CompactButtonDropdown';
import type { VideoCategory, CEFRLevel } from '@/lib/models/video';

const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: 'grammar', label: 'Grammar', icon: '📚' },
  { value: 'vocabulary', label: 'Vocabulary', icon: '📖' },
  { value: 'pronunciation', label: 'Pronunciation', icon: '🗣️' },
  { value: 'culture', label: 'Culture', icon: '🌍' },
  { value: 'tips', label: 'Tips & Tricks', icon: '💡' },
  { value: 'other', label: 'Other', icon: '📌' },
];

const LEVEL_OPTIONS: DropdownOption[] = [
  { value: '', label: 'No Level (Optional)', icon: '⭕' },
  { value: 'A1', label: 'A1 - Beginner', icon: '🔤' },
  { value: 'A2', label: 'A2 - Elementary', icon: '🔡' },
  { value: 'B1', label: 'B1 - Intermediate', icon: '📗' },
  { value: 'B2', label: 'B2 - Upper Intermediate', icon: '📘' },
  { value: 'C1', label: 'C1 - Advanced', icon: '📙' },
  { value: 'C2', label: 'C2 - Proficient', icon: '📕' },
];

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VideoUploadModal({ isOpen, onClose, onSuccess }: VideoUploadModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState<VideoCategory>('grammar');
  const [level, setLevel] = useState<string>('');
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          thumbnailUrl: thumbnailUrl || undefined,
          category,
          level: level || undefined,
          isSlideshow,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload video');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setThumbnailUrl('');
      setCategory('grammar');
      setLevel('');
      setIsSlideshow(false);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedCategoryLabel = CATEGORY_OPTIONS.find(opt => opt.value === category)?.label || 'Category';
  const selectedLevelLabel = LEVEL_OPTIONS.find(opt => opt.value === level)?.label || 'No Level (Optional)';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[10px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-[10px]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Upload Video 🎬</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-[10px]">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-900 mb-2">
              Video Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              placeholder="e.g., German Dative Case Explained"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent resize-none"
              placeholder="Describe what students will learn from this video..."
            />
          </div>

          {/* Video URL */}
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-bold text-gray-900 mb-2">
              Video URL *
            </label>
            <input
              type="url"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              placeholder="https://example.com/video.mp4"
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-bold text-gray-900 mb-2">
              Thumbnail URL (Optional)
            </label>
            <input
              type="url"
              id="thumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          {/* Category & Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Category *
              </label>
              <CompactButtonDropdown
                label={selectedCategoryLabel}
                icon="🎯"
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={(value) => setCategory(value as VideoCategory)}
                searchable={false}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                CEFR Level
              </label>
              <CompactButtonDropdown
                label={selectedLevelLabel}
                icon="📊"
                options={LEVEL_OPTIONS}
                value={level}
                onChange={(value) => setLevel(value as string)}
                searchable={false}
              />
            </div>
          </div>

          {/* Is Slideshow */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isSlideshow"
              checked={isSlideshow}
              onChange={(e) => setIsSlideshow(e.target.checked)}
              className="w-4 h-4 text-brand-purple border-gray-300 rounded focus:ring-brand-purple"
            />
            <label htmlFor="isSlideshow" className="text-sm font-medium text-gray-900">
              This is a photo slideshow (not a video)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <ActionButton
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </ActionButton>
            <ActionButton
              type="submit"
              variant="purple"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Uploading...' : 'Upload Video'}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
