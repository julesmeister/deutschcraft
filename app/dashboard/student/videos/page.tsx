'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

// TikTok video data structure
interface TikTokVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'culture' | 'tips' | 'other';
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  isSlideshow?: boolean;
}

// Sample data - replace with actual video paths
const SAMPLE_VIDEOS: TikTokVideo[] = [
  {
    id: '1',
    title: 'German Pronunciation Tips',
    description: 'Common pronunciation mistakes and how to fix them',
    videoUrl: '/videos/sample1.mp4',
    category: 'pronunciation',
    level: 'A1',
  },
  {
    id: '2',
    title: 'B1 Grammar Explained',
    description: 'Understanding complex German sentence structures',
    videoUrl: '/videos/sample2.mp4',
    category: 'grammar',
    level: 'B1',
    isSlideshow: true,
  },
  // Add more videos here
];

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

export default function VideosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const filteredVideos = SAMPLE_VIDEOS.filter((video) => {
    const categoryMatch = selectedCategory === 'all' || video.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || video.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Learning Videos 🎬"
        subtitle="Curated TikTok videos and slideshows to help you learn German"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#11316e]"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#11316e]"
            >
              <option value="all">All Levels</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
          </div>
        </div>

        {/* Videos Grid - TikTok style */}
        {filteredVideos.length === 0 ? (
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
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface VideoCardProps {
  video: TikTokVideo;
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
