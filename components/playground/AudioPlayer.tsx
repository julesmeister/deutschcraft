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
  audioId?: string; // Optional audio ID for blob fallback
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function AudioPlayer({
  materialTitle,
  materialUrl,
  audioId,
  onClose,
  showCloseButton = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [triedBlobFallback, setTriedBlobFallback] = useState(false);
  const toast = useToast();

  const playableUrl = getPlayableUrl(materialUrl);

  // Debug log on mount
  console.log("[AudioPlayer] Initialized with:", {
    materialTitle,
    materialUrl,
    audioId,
    playableUrl,
  });

  // Reset blob fallback state when URL changes
  useEffect(() => {
    setTriedBlobFallback(false);
    setIsPlaying(false);
  }, [playableUrl, audioId]);

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

    const handleError = async () => {
      // Try blob fallback if available and not already tried
      if (audioId && !triedBlobFallback && audio) {
        console.log("[AudioPlayer] Primary source failed, trying backup blob for:", audioId);
        setTriedBlobFallback(true);
        const blobUrl = `/api/materials/audio/${audioId}/blob`;
        console.log("[AudioPlayer] Blob URL:", blobUrl);
        audio.src = blobUrl;
        try {
          await audio.load();
          console.log("[AudioPlayer] ✅ Backup blob loaded successfully");
          toast.success("Playing from backup", 2000);
          return; // Don't show error if fallback works
        } catch (blobError) {
          console.error("[AudioPlayer] ❌ Both primary and backup sources failed");
        }
      }

      // Only show error if no blob fallback available or it also failed
      console.error("[AudioPlayer] ❌ Audio failed to load:", {
        url: materialUrl,
        hasBackup: !!audioId,
      });

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

        // Try blob fallback if available and not already tried
        if (audioId && !triedBlobFallback) {
          console.log("[AudioPlayer] Primary source failed, trying backup blob...");
          setTriedBlobFallback(true);
          audio.src = `/api/materials/audio/${audioId}/blob`;
          audio.load(); // Important: load the new source before playing
          try {
            await audio.play();
            setIsPlaying(true);
            toast.success("Playing from backup", 2000);
            return;
          } catch (blobError) {
            console.error("[AudioPlayer] ❌ Blob fallback also failed:", blobError);
          }
        }

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
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-300 rounded-lg overflow-hidden">
      <audio ref={audioRef} src={playableUrl} />

      <div className="p-3">
        {/* Header with title */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg">🎵</span>
            <h3 className="text-xs font-semibold text-gray-800 truncate">
              {materialTitle}
            </h3>
          </div>
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              <ActionButtonIcons.Close />
            </button>
          )}
        </div>

        {/* Controls and Progress in one row */}
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="flex-shrink-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            {isPlaying ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zm8 0a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" />
              </svg>
            ) : (
              <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>

          {/* Time */}
          <span className="text-xs text-gray-600 flex-shrink-0">
            {formatTime(currentTime)}
          </span>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-300 rounded-full appearance-none cursor-pointer accent-blue-600"
          />

          {/* Duration */}
          <span className="text-xs text-gray-600 flex-shrink-0">
            {formatTime(duration)}
          </span>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
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
              className="w-16 h-1 bg-gray-300 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
