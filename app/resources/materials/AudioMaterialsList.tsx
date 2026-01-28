/**
 * Audio Materials List Component
 * Displays audio files organized by level, book type, and lesson
 */

"use client";

import type { AudioMaterial } from "@/lib/services/turso/materialsService";

interface AudioMaterialsListProps {
  materials: AudioMaterial[];
  currentlyPlaying: string | null;
  onPlay: (audio: AudioMaterial) => void;
}

// Extract lesson number from title/filename
function extractLessonNumber(text: string): number {
  const match = text.match(/L(\d+)/i);
  return match ? parseInt(match[1]) : 0;
}

// Extract track number from end of filename or title
function extractTrackNumber(filenameOrTitle: string): number {
  // Pattern: "301082 AB L01 1" or "301082_AB_L01_1.mp3"
  // We want the "1" at the very end

  // Remove .mp3 extension
  let text = filenameOrTitle.replace(/\.mp3$/i, "");

  // Split by spaces, underscores, or hyphens
  const parts = text.split(/[\s_-]+/);

  // Get the very last part
  const lastPart = parts[parts.length - 1];

  // Parse as integer (this will get "1" from "1", not "301082" from "301082_AB_L01_1")
  const trackNum = parseInt(lastPart, 10);

  // Return if it's a valid single or double digit number (1-99)
  if (!isNaN(trackNum) && trackNum > 0 && trackNum < 100) {
    return trackNum;
  }

  return 0;
}

export function AudioMaterialsList({
  materials,
  currentlyPlaying,
  onPlay,
}: AudioMaterialsListProps) {
  // Group by level, then book type, then lesson
  const organized = materials.reduce(
    (acc, audio) => {
      const level = audio.level;
      const bookType = audio.bookType;
      const lessonNum = extractLessonNumber(audio.title);

      if (!acc[level]) acc[level] = {};
      if (!acc[level][bookType]) acc[level][bookType] = {};
      if (!acc[level][bookType][lessonNum]) acc[level][bookType][lessonNum] = [];

      acc[level][bookType][lessonNum].push(audio);
      return acc;
    },
    {} as Record<string, Record<string, Record<number, AudioMaterial[]>>>
  );

  // Sort tracks within each lesson
  Object.keys(organized).forEach((level) => {
    Object.keys(organized[level]).forEach((bookType) => {
      Object.keys(organized[level][bookType]).forEach((lessonNum) => {
        organized[level][bookType][Number(lessonNum)].sort((a, b) => {
          const trackA = extractTrackNumber(a.fileName);
          const trackB = extractTrackNumber(b.fileName);
          return trackA - trackB;
        });
      });
    });
  });

  if (materials.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 p-6">
        <div className="text-center py-12 text-neutral-400">
          <div className="text-4xl mb-2">🎵</div>
          <div className="text-sm">No audio files found</div>
          <div className="text-xs mt-1">
            Try adjusting your search or filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Levels sorted */}
      {Object.entries(organized)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([level, bookTypes]) => (
          <div key={level} className="space-y-6">
            {/* Book Types (KB and AB) */}
            {Object.entries(bookTypes)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([bookType, lessons]) => {
                const totalTracks = Object.values(lessons).reduce(
                  (sum, tracks) => sum + tracks.length,
                  0
                );

                return (
                  <div
                    key={bookType}
                    className="bg-white border-2 border-neutral-200 shadow-md overflow-hidden"
                  >
                    {/* Book Type Header */}
                    <div
                      className={`px-6 py-3 ${
                        bookType === "KB"
                          ? "bg-gradient-to-r from-purple-500 to-purple-600"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                      }`}
                    >
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-xl">
                          {bookType === "KB" ? "📖" : "📝"}
                        </span>
                        {bookType === "KB" ? "Kursbuch" : "Arbeitsbuch"}
                        <span className="ml-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                          {totalTracks} tracks
                        </span>
                      </h3>
                    </div>

                    {/* Lessons */}
                    <div className="divide-y-2 divide-neutral-200">
                      {Object.entries(lessons)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([lessonNum, tracks]) => (
                          <div key={lessonNum}>
                            {/* Lesson Header */}
                            <div className="bg-neutral-100 px-6 py-2 border-b border-neutral-300">
                              <h4 className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                <span>📚</span>
                                Lektion {lessonNum}
                                <span className="text-xs text-neutral-500">
                                  ({tracks.length}{" "}
                                  {tracks.length === 1 ? "track" : "tracks"})
                                </span>
                              </h4>
                            </div>

                            {/* Tracks */}
                            <div className="divide-y divide-neutral-200">
                              {tracks.map((audio, index) => (
                                <AudioTrackRow
                                  key={audio.audioId}
                                  audio={audio}
                                  index={index}
                                  isPlaying={currentlyPlaying === audio.audioId}
                                  onPlay={onPlay}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
    </div>
  );
}

// Audio Track Row Component
function AudioTrackRow({
  audio,
  index,
  isPlaying,
  onPlay,
}: {
  audio: AudioMaterial;
  index: number;
  isPlaying: boolean;
  onPlay: (audio: AudioMaterial) => void;
}) {
  const trackNum = extractTrackNumber(audio.fileName);

  return (
    <div
      className={`group p-4 transition-all duration-200 ${
        isPlaying
          ? "bg-blue-50 border-l-4 border-blue-500"
          : "bg-white hover:bg-neutral-50"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Track Number */}
        <div className="flex-shrink-0 w-12 text-center">
          <span
            className={`text-sm font-bold ${
              isPlaying ? "text-blue-600" : "text-neutral-400"
            }`}
          >
            #{trackNum || index + 1}
          </span>
        </div>

        {/* Play Button */}
        <button
          onClick={() => onPlay(audio)}
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
            isPlaying
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          }`}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Audio Info */}
        <div className="flex-1 min-w-0">
          <h4
            className={`font-medium text-sm mb-1 truncate ${
              isPlaying ? "text-blue-700" : "text-neutral-900"
            }`}
          >
            {audio.title.split(" - ").slice(2).join(" - ")}
          </h4>

          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            {audio.cdNumber && (
              <span className="inline-flex items-center">
                <span className="mr-1">💿</span>
                {audio.cdNumber}
              </span>
            )}
            {audio.fileSize && (
              <span>
                {(audio.fileSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            )}
            <span className="inline-flex items-center">
              <span className="mr-1">▶️</span>
              {audio.playCount}
            </span>
          </div>
        </div>

        {/* Playing Indicator */}
        {isPlaying && (
          <div className="flex-shrink-0 flex gap-1 items-end h-8">
            <div
              className="w-1 bg-blue-500 rounded-full animate-wave"
              style={{ height: "40%", animationDelay: "0ms" }}
            />
            <div
              className="w-1 bg-blue-500 rounded-full animate-wave"
              style={{ height: "60%", animationDelay: "150ms" }}
            />
            <div
              className="w-1 bg-blue-500 rounded-full animate-wave"
              style={{ height: "80%", animationDelay: "300ms" }}
            />
            <div
              className="w-1 bg-blue-500 rounded-full animate-wave"
              style={{ height: "50%", animationDelay: "450ms" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
