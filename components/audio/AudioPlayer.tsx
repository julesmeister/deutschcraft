"use client";

import { useState, useRef, useEffect } from "react";
import { AudioTrack } from "@/lib/models/audio";
import { getPlayableUrl } from "@/lib/utils/urlHelpers";
import { formatTime } from "@/lib/utils/audioHelpers";

interface AudioPlayerProps {
  tracks: AudioTrack[];
  sectionTitle: string;
  onTrackComplete?: (trackId: string) => void;
}

export function AudioPlayer({
  tracks,
  sectionTitle,
  onTrackComplete,
}: AudioPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  // Play/Pause handler
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Next track
  const nextTrack = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Previous track
  const previousTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Playback speed change
  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-200 rounded-2xl p-6">
      {/* Section Title */}
      <div className="mb-6">
        <h3 className="text-2xl font-black text-gray-900 mb-1">
          {sectionTitle}
        </h3>
        <p className="text-sm text-gray-600">
          Track {currentTrackIndex + 1} of {tracks.length}
        </p>
      </div>

      {/* Current Track Info */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <h4 className="text-lg font-bold text-gray-900 mb-2">
          {currentTrack.title}
        </h4>
        {currentTrack.description && (
          <p className="text-sm text-gray-600 mb-4">
            {currentTrack.description}
          </p>
        )}

        {/* Audio Element (hidden) */}
        <audio
          ref={audioRef}
          src={getPlayableUrl(currentTrack.audioUrl)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => {
            setIsPlaying(false);
            onTrackComplete?.(currentTrack.trackId);
            if (currentTrackIndex < tracks.length - 1) {
              setTimeout(nextTrack, 1000);
            }
          }}
        />

        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Previous */}
          <button
            onClick={previousTrack}
            disabled={currentTrackIndex === 0}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors shadow-lg"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            disabled={currentTrackIndex === tracks.length - 1}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          {/* Speed Control */}
          <button
            onClick={changeSpeed}
            className="px-3 py-1.5 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-bold transition-colors"
          >
            {playbackSpeed}x
          </button>
        </div>

        {/* Transcript Toggle */}
        {currentTrack.transcript && (
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold transition-colors"
          >
            {showTranscript ? "Hide" : "Show"} Transcript
          </button>
        )}
      </div>

      {/* Transcript */}
      {showTranscript && currentTrack.transcript && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h5 className="font-bold text-gray-900 mb-3">Transcript</h5>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {currentTrack.transcript}
          </p>
        </div>
      )}

      {/* Track List */}
      <div className="mt-6">
        <h5 className="font-bold text-gray-900 mb-3">All Tracks</h5>
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <button
              key={track.trackId}
              onClick={() => {
                setCurrentTrackIndex(index);
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                index === currentTrackIndex
                  ? "bg-blue-100 border-2 border-blue-400"
                  : "bg-white border-2 border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {index === currentTrackIndex && isPlaying && (
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-blue-600 animate-pulse"></div>
                    <div className="w-1 h-4 bg-blue-600 animate-pulse delay-75"></div>
                    <div className="w-1 h-4 bg-blue-600 animate-pulse delay-150"></div>
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900">
                    {track.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(track.duration)}
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-500">
                  {index + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
