/**
 * AudioPlayer Component
 * Displays audio files in playground rooms
 */

"use client";

import { useRef, useState, useEffect } from "react";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { useToast } from "@/components/ui/toast";
import { getPlayableUrl } from "@/lib/utils/urlHelpers";

interface AudioPlayerProps {
  materialTitle: string;
  materialUrl: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function AudioPlayer({
  materialTitle,
  materialUrl,
  onClose,
  showCloseButton = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const toast = useToast();

  const playableUrl = getPlayableUrl(materialUrl);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      console.error("[AudioPlayer] Audio load error");
      toast.error(
        "Failed to load audio file. Please check your R2 bucket configuration.",
        5000,
        "Load Error"
      );
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playableUrl]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("[AudioPlayer] Playback error:", error);

        // Show user-friendly error message
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (
          errorMessage.includes("not suitable") ||
          errorMessage.includes("CORS")
        ) {
          toast.error(
            "Audio file cannot be played. Please enable public access and CORS on your R2 bucket.",
            5000,
            "Playback Error"
          );
        } else if (errorMessage.includes("network")) {
          toast.error(
            "Network error. Please check your internet connection.",
            3000,
            "Connection Error"
          );
        } else {
          toast.error(
            "Failed to play audio. The file may be unavailable or corrupted.",
            3000,
            "Playback Error"
          );
        }

        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
            🎵
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              {materialTitle}
            </h3>
            <p className="text-xs text-neutral-600">Shared Audio Material</p>
          </div>
        </div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ActionButtonIcons.Close />
          </button>
        )}
      </div>

      {/* Audio Player */}
      <div className="p-8 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <audio ref={audioRef} src={playableUrl} />

        {/* Progress Bar */}
        <div className="mb-6">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-700"
          />
          <div className="flex items-center justify-between text-xs text-neutral-500 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center justify-between">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zm8 0a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-neutral-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-gray-700"
            />
            <span className="text-xs text-neutral-500 w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
