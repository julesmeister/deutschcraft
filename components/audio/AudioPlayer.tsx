/**
 * AudioPlayer Component
 * Reusable audio player with visualizer
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
  const [animationFrame, setAnimationFrame] = useState(0);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const [barCount, setBarCount] = useState(90);
  const [barGap, setBarGap] = useState(2);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const playableUrl = getPlayableUrl(materialUrl);

  // Calculate optimal bar count and gap based on container width
  // Goal: Keep consistent gap (2-3px) by scaling bar count with screen width
  useEffect(() => {
    const updateBarMetrics = () => {
      if (visualizerRef.current) {
        const width = visualizerRef.current.offsetWidth;
        // Subtract padding (24px each side)
        const usableWidth = width - 48;

        // Target consistent gap: 2-3px depending on screen size
        // Wider screens get slightly larger gaps to prevent overcrowding
        const targetGap = width < 600 ? 2 : width < 900 ? 2.5 : width < 1500 ? 3 : 3.5;
        const barWidth = 2;

        // Calculate bar count to maintain consistent gap
        // Formula: barCount = usableWidth / (barWidth + targetGap)
        let optimalBars = Math.floor(usableWidth / (barWidth + targetGap));

        // Clamp for reasonable limits (up to 400 bars for ultra-wide monitors)
        optimalBars = Math.max(50, Math.min(400, optimalBars));

        // Recalculate exact gap to fill any remaining pixels
        const totalBarWidth = optimalBars * barWidth;
        const remainingSpace = usableWidth - totalBarWidth;
        const exactGap = remainingSpace / (optimalBars - 1);

        setBarCount(optimalBars);
        setBarGap(exactGap);
      }
    };

    updateBarMetrics();
    window.addEventListener('resize', updateBarMetrics);
    return () => window.removeEventListener('resize', updateBarMetrics);
  }, []);

  // Setup Web Audio API for frequency analysis
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setupAudioContext = () => {
      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // Higher = more frequency detail

        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
      }
    };

    // Setup on first play
    audio.addEventListener('play', setupAudioContext);

    return () => {
      audio.removeEventListener('play', setupAudioContext);
    };
  }, []);

  // Animate bars when playing
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setAnimationFrame(prev => prev + 1);

      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      }
    };

    const interval = setInterval(animate, 50); // Faster updates for audio reactivity

    return () => clearInterval(interval);
  }, [isPlaying]);

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

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (volume === 0) {
      audio.volume = 1;
      setVolume(1);
    } else {
      audio.volume = 0;
      setVolume(0);
    }
  };

  const handleVisualizerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div
      className="overflow-hidden border-2 border-gray-800 rounded-3xl relative"
      style={{
        background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a202c 100%)'
      }}
    >
      <audio ref={audioRef} src={playableUrl} />

      {/* Top section - Album art and controls */}
      <div
        className="flex items-end justify-center px-4 py-2 lg:px-6 lg:py-3 relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(45, 55, 72, 0.2)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Diagonal stripe pattern background - fades towards center */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Left stripes - fade right */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1/2"
            style={{
              background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 2px, transparent 2px, transparent 12px)',
              maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            }}
          />

          {/* Right stripes - fade left */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/2"
            style={{
              background: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 2px, transparent 2px, transparent 12px)',
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            }}
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 w-full" style={{ transform: 'translateY(8px)' }}>
          {/* Left - Control buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 bg-gray-800/70 hover:bg-gray-700/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="rgba(252, 252, 252, 0.8)" viewBox="0 0 320 512">
                  <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="rgba(252, 252, 252, 0.8)" viewBox="0 0 384 512">
                  <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                </svg>
              )}
            </button>

            <button
              onClick={toggleMute}
              className="w-8 h-8 bg-gray-800/70 hover:bg-gray-700/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            >
              {volume === 0 ? (
                <svg className="w-3.5 h-3.5" fill="rgba(252, 252, 252, 0.8)" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="rgba(252, 252, 252, 0.8)" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-800/70 hover:bg-gray-700/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
              >
                <ActionButtonIcons.Close />
              </button>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right - Audio icon and Track info */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="min-w-0 text-right">
              <div className="text-xs" style={{ color: 'rgba(252, 252, 252, 0.4)' }}>Audio Track</div>
              <h3 className="text-sm font-medium truncate" style={{ color: '#FCFCFC' }}>
                {materialTitle}
              </h3>
            </div>
            <div className="w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0 bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-gray-700/50">
              <svg className="w-7 h-7 lg:w-8 lg:h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - Visualizer and time */}
      <div className="px-6 py-3 flex flex-col gap-2 relative z-10" style={{ backgroundColor: '#2d3748' }}>
        {/* Visualizer bars */}
        <div
          ref={visualizerRef}
          onClick={handleVisualizerClick}
          className="w-full h-10 rounded-full flex items-center justify-center px-3 cursor-pointer relative overflow-hidden"
          style={{
            backgroundColor: 'rgba(252, 252, 252, 0.03)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(252, 252, 252, 0.05)',
          }}
        >
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(252, 252, 252, 0) 0%, rgba(252, 252, 252, 0.02) 50%, rgba(252, 252, 252, 0) 100%)'
            }}
          />

          {/* Inner container with exact width */}
          <div
            className="flex items-center h-full justify-between"
            style={{
              width: '100%',
            }}
          >
            {Array.from({ length: barCount }).map((_, i) => {
            const progress = (currentTime / (duration || 1)) * 100;
            const barProgress = (i / barCount) * 100;
            const isActive = barProgress <= progress;

            // Position from 0 to 1
            const position = i / barCount;

            // Tapered edges only - affects only bars near edges (0-15% and 85-100%)
            let edgeTaper = 1;
            if (position < 0.15) {
              // Left edge taper
              edgeTaper = position / 0.15;
            } else if (position > 0.85) {
              // Right edge taper
              edgeTaper = (1 - position) / 0.15;
            }
            // Ensure edges get shorter (minimum 30% height at edges)
            edgeTaper = 0.3 + (edgeTaper * 0.7);

            let baseHeight;

            // Use real audio data if available, otherwise use random animation
            if (dataArrayRef.current && isPlaying) {
              // Create a mirrored/centered frequency distribution
              // Middle bars should have most activity, edges taper off
              const centerPosition = Math.abs(position - 0.5) * 2; // 0 at center, 1 at edges

              // Use logarithmic mapping for better frequency distribution
              // Focus on mid-range frequencies (where most music content is)
              const freqStart = 10; // Skip very low sub-bass
              const freqEnd = Math.floor(dataArrayRef.current.length * 0.6); // Use first 60% of spectrum
              const freqRange = freqEnd - freqStart;

              // Map bar position to frequency with logarithmic scale
              const logPosition = Math.pow(position, 1.5); // Emphasize mid frequencies
              const dataIndex = Math.floor(freqStart + logPosition * freqRange);
              const frequencyValue = dataArrayRef.current[Math.min(dataIndex, dataArrayRef.current.length - 1)];

              // Boost center frequencies, reduce edges
              const centerBoost = 1 - (centerPosition * 0.4); // 100% in center, 60% at edges

              // Normalize frequency value with center boost
              const normalizedHeight = ((frequencyValue / 255) * 70 + 15) * centerBoost;

              baseHeight = normalizedHeight;
            } else {
              // Fallback to random animation when not playing or audio not ready
              const barSeed1 = Math.sin(i * 17.3 + animationFrame * (0.3 + (i % 7) * 0.1));
              const barSeed2 = Math.cos(i * 23.7 + animationFrame * (0.5 + (i % 11) * 0.08));
              const barSeed3 = Math.sin(i * 31.9 + animationFrame * (0.4 + (i % 13) * 0.12));

              const randomFactor = ((barSeed1 * 0.5 + barSeed2 * 0.3 + barSeed3 * 0.2) + 1) / 2;

              const flatCheck = Math.sin(i * 41.2 + animationFrame * (0.6 + (i % 17) * 0.05));
              const shouldBeFlat = flatCheck < -0.65;

              if (shouldBeFlat) {
                baseHeight = 5 + randomFactor * 15;
              } else {
                baseHeight = 30 + randomFactor * 55;
              }
            }

            const taperedHeight = baseHeight * edgeTaper;

            return (
              <div
                key={i}
                className="transition-all duration-75"
                style={{
                  width: '2px',
                  height: `${taperedHeight}%`,
                  backgroundColor: '#E7D1D3',
                  opacity: isActive ? 0.85 : 0.2,
                  flexShrink: 0,
                }}
              />
            );
          })}
          </div>
        </div>

        {/* Time information */}
        <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(252, 252, 252, 0.4)' }}>
          <span className="pl-2">{formatTime(currentTime)}</span>
          <span className="pr-2">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
