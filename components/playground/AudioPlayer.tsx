/**
 * AudioPlayer Component
 * Displays audio files in playground rooms
 */

"use client";

import { useRef, useState, useEffect } from "react";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { useToast } from "@/components/ui/toast";
import { getPlayableUrl } from "@/lib/utils/urlHelpers";
import { formatTime } from "@/lib/utils/audioHelpers";

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
  const triedBlobFallbackRef = useRef(false);
  const blobLoadSuccessRef = useRef(false);
  const toast = useToast();

  const playableUrl = getPlayableUrl(materialUrl);

  // Debug log on mount (only once)
  useEffect(() => {
    console.log("[AudioPlayer] Initialized with:", {
      materialTitle,
      materialUrl,
      audioId,
      playableUrl,
    });
  }, []);

  // Reset blob fallback state when URL changes
  useEffect(() => {
    triedBlobFallbackRef.current = false;
    blobLoadSuccessRef.current = false;
    setIsPlaying(false);
  }, [playableUrl, audioId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      // Show success toast if this is the blob fallback loading successfully
      if (triedBlobFallbackRef.current && !blobLoadSuccessRef.current) {
        console.log("[AudioPlayer] ✅ Backup blob loaded successfully");
        toast.success("Playing from backup", 2000);
        blobLoadSuccessRef.current = true;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      console.log("[AudioPlayer] Error event fired. Current state:", {
        src: audio.src,
        audioId,
        triedBlobFallback: triedBlobFallbackRef.current,
      });

      // Try blob fallback if available and not already tried
      if (audioId && !triedBlobFallbackRef.current && audio) {
        console.log("[AudioPlayer] Switching to backup blob for:", audioId);
        triedBlobFallbackRef.current = true;
        const blobUrl = `/api/materials/audio/${audioId}/blob`;
        console.log("[AudioPlayer] Blob URL:", blobUrl);
        audio.src = blobUrl;
        audio.load();
        // The audio element will fire loadedmetadata event if blob loads successfully
        return;
      }

      // Only show error if no blob fallback available or it also failed
      if (!audioId) {
        console.error("[AudioPlayer] ❌ Audio failed to load (no backup available):", materialUrl);
      } else {
        console.error("[AudioPlayer] ❌ Both primary and backup sources failed");
      }

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
  }, [playableUrl, audioId]);

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
        if (audioId && !triedBlobFallbackRef.current) {
          console.log("[AudioPlayer] Primary source failed, trying backup blob...");
          triedBlobFallbackRef.current = true;
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

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200/50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
      <audio ref={audioRef} src={playableUrl} />

      <div className="p-3">
        {/* Header with title */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
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
            className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            {isPlaying ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1zm8 0a1 1 0 011 1v10a1 1 0 11-2 0V5a1 1 0 011-1z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>

          {/* Time */}
          <span className="text-xs font-semibold text-indigo-700 flex-shrink-0 min-w-[32px] text-center">
            {formatTime(currentTime)}
          </span>

          {/* Progress Bar */}
          <div className="flex-1 relative group">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-indigo-500 [&::-webkit-slider-thumb]:to-purple-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
              style={{
                background: `linear-gradient(to right, rgb(129 140 248) 0%, rgb(129 140 248) ${(currentTime / (duration || 1)) * 100}%, rgb(224 231 255) ${(currentTime / (duration || 1)) * 100}%, rgb(224 231 255) 100%)`
              }}
            />
          </div>

          {/* Duration */}
          <span className="text-xs font-semibold text-indigo-700 flex-shrink-0 min-w-[32px] text-center">
            {formatTime(duration)}
          </span>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-6 h-6 flex items-center justify-center">
              {volume === 0 ? (
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-indigo-500 [&::-webkit-slider-thumb]:to-purple-600 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(129 140 248) 0%, rgb(129 140 248) ${volume * 100}%, rgb(224 231 255) ${volume * 100}%, rgb(224 231 255) 100%)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
