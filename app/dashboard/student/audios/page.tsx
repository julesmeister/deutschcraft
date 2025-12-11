'use client';

import { useState } from 'react';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { useSession } from 'next-auth/react';
import { CEFRLevel } from '@/lib/models';
import { SAMPLE_AUDIO_BOOKS, AudioBook, AudioSection } from '@/lib/models/audio';
import { AudioSectionCard } from '@/components/audio/AudioSectionCard';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { CatLoader } from '@/components/ui/CatLoader';

export default function AudiosPage() {
  const { data: session } = useSession();
  const { student: currentStudent, isLoading } = useCurrentStudent(session?.user?.email || null);

  const [selectedBook, setSelectedBook] = useState<AudioBook | null>(null);
  const [selectedSection, setSelectedSection] = useState<AudioSection | null>(null);

  // Get student's CEFR level
  const studentLevel = currentStudent?.cefrLevel || CEFRLevel.A1;

  // Filter books by student's level
  const availableBooks = SAMPLE_AUDIO_BOOKS.filter(
    book => book.cefrLevel === studentLevel && book.isActive
  );

  // Auto-select first book if none selected
  if (!selectedBook && availableBooks.length > 0) {
    setSelectedBook(availableBooks[0]);
  }

  if (isLoading) {
    return <CatLoader message="Loading audio library..." size="lg" fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            🎧 Audio Library
          </h1>
          <p className="text-gray-600">
            Listen to audio tracks from your German textbook - Level: <span className="font-bold text-blue-600">{studentLevel}</span>
          </p>
        </div>

        {/* Book Selector */}
        {availableBooks.length > 0 && (
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Select Book:
            </label>
            <div className="flex flex-wrap gap-3">
              {availableBooks.map(book => (
                <button
                  key={book.bookId}
                  onClick={() => {
                    setSelectedBook(book);
                    setSelectedSection(null);
                  }}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    selectedBook?.bookId === book.bookId
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>📚</span>
                    <div className="text-left">
                      <div>{book.name}</div>
                      <div className="text-xs opacity-80">{book.publisher}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No books available */}
        {availableBooks.length === 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Audio Books Available
            </h3>
            <p className="text-gray-600">
              Audio materials for level <span className="font-bold">{studentLevel}</span> will be added soon.
            </p>
          </div>
        )}

        {/* Sections Grid */}
        {selectedBook && (
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              {selectedBook.name} - Sections
            </h2>

            {/* Placeholder: Will be replaced with actual sections from database */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: Math.min(selectedBook.totalSections, 6) }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => {
                    // TODO: Load actual section data
                    console.log(`Loading section ${index + 1}`);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-black text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        Lektion {index + 1}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Coming soon: Audio tracks will be added here
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>🎵 0 tracks</span>
                        <span>•</span>
                        <span>⏱️ 0 min</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming Soon Message */}
            <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🎧</span>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Audio Tracks Coming Soon!</h4>
                  <p className="text-gray-600 text-sm">
                    We're currently preparing high-quality audio materials for each section.
                    You'll be able to listen to dialogs, pronunciation exercises, and more.
                    <br />
                    <span className="font-semibold mt-2 inline-block">Features planned:</span>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    <li>• 🎤 Dialog recordings with native speakers</li>
                    <li>• 📝 Transcripts for each audio track</li>
                    <li>• ⏯️ Playback speed control</li>
                    <li>• 🔁 Loop and repeat functions</li>
                    <li>• 📊 Track your listening progress</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Section Audio Player */}
        {selectedSection && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedSection.title}
            </h3>
            {/* Audio player component will be rendered here */}
            <p className="text-gray-600 text-sm">Audio player component coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
