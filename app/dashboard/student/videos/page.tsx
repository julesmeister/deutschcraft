'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CompactButtonDropdown, DropdownOption } from '@/components/ui/CompactButtonDropdown';
import { CatLoader } from '@/components/ui/CatLoader';
import type { LearningVideo } from '@/lib/models/video';

const CATEGORY_COLORS = {
  grammar: 'bg-blue-100 text-blue-800',
  vocabulary: 'bg-green-100 text-green-800',
  pronunciation: 'bg-purple-100 text-purple-800',
  culture: 'bg-pink-100 text-pink-800',
  tips: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
};

const CATEGORY_LABELS = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  pronunciation: 'Pronunciation',
  culture: 'Culture',
  tips: 'Tips & Tricks',
  other: 'Other',
};

const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All Categories', icon: '🎬' },
  { value: 'grammar', label: 'Grammar', icon: '📚' },
  { value: 'vocabulary', label: 'Vocabulary', icon: '📖' },
  { value: 'pronunciation', label: 'Pronunciation', icon: '🗣️' },
  { value: 'culture', label: 'Culture', icon: '🌍' },
  { value: 'tips', label: 'Tips & Tricks', icon: '💡' },
  { value: 'other', label: 'Other', icon: '📌' },
];

const LEVEL_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All Levels', icon: '🌟' },
  { value: 'A1', label: 'A1 - Beginner', icon: '🔤' },
  { value: 'A2', label: 'A2 - Elementary', icon: '🔡' },
  { value: 'B1', label: 'B1 - Intermediate', icon: '📗' },
  { value: 'B2', label: 'B2 - Upper Intermediate', icon: '📘' },
  { value: 'C1', label: 'C1 - Advanced', icon: '📙' },
  { value: 'C2', label: 'C2 - Proficient', icon: '📕' },
];

export default function VideosPage() {
  const { data: session } = useSession();
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Fetch videos from API
  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (selectedLevel !== 'all') params.append('level', selectedLevel);

        const response = await fetch(`/api/videos?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setVideos(data.videos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideos();
  }, [selectedCategory, selectedLevel]);

  // Get selected labels for display
  const selectedCategoryLabel = CATEGORY_OPTIONS.find(opt => opt.value === selectedCategory)?.label || 'Category';
  const selectedLevelLabel = LEVEL_OPTIONS.find(opt => opt.value === selectedLevel)?.label || 'Level';

  if (isLoading) {
    return <CatLoader message="Loading videos..." size="lg" fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Learning Videos 🎬"
        subtitle="Curated TikTok videos and slideshows to help you learn German"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          {/* Category Filter */}
          <CompactButtonDropdown
            label={selectedCategoryLabel}
            icon="🎯"
            options={CATEGORY_OPTIONS}
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value as string)}
            searchable={false}
          />

          {/* Level Filter */}
          <CompactButtonDropdown
            label={selectedLevelLabel}
            icon="📊"
            options={LEVEL_OPTIONS}
            value={selectedLevel}
            onChange={(value) => setSelectedLevel(value as string)}
            searchable={false}
          />
        </div>

        {/* Videos Grid - TikTok style */}
        {videos.length === 0 ? (
          <div className="bg-[#f2f2e5] rounded-[10px] p-12 text-center">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Videos Yet
            </h3>
            <p className="text-gray-600">
              Videos will be added soon. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.videoId} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface VideoCardProps {
  video: LearningVideo;
}

function VideoCard({ video }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="group relative bg-white rounded-[10px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      {/* TikTok ratio container (9:16) */}
      <div className="relative aspect-[9/16] bg-gray-900">
        {/* Video/Thumbnail */}
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <div className="text-6xl">
              {video.isSlideshow ? '🖼️' : '🎬'}
            </div>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300"
          >
            <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${CATEGORY_COLORS[video.category]}`}>
            {CATEGORY_LABELS[video.category]}
          </span>
        </div>

        {/* Level badge */}
        {video.level && (
          <div className="absolute top-2 right-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-white text-gray-900">
              {video.level}
            </span>
          </div>
        )}

        {/* Slideshow indicator */}
        {video.isSlideshow && (
          <div className="absolute bottom-2 left-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-500 text-white">
              Slideshow
            </span>
          </div>
        )}
      </div>

      {/* Video info */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2">
          {video.description}
        </p>
      </div>
    </div>
  );
}
