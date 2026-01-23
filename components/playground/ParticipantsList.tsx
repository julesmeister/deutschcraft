"use client";

import { useEffect, useState, useRef } from "react";
import type { PlaygroundParticipant } from "@/lib/models/playground";
import { updateParticipantVoiceStatus } from "@/lib/services/playgroundService";

interface ParticipantsListProps {
  participants: PlaygroundParticipant[];
  voiceStreams?: Map<string, MediaStream>;
  voiceAnalysers?: Map<string, AnalyserNode>;
  audioElements?: Map<string, HTMLAudioElement>;
  currentUserRole?: "teacher" | "student";
  currentUserId?: string;
}

interface ParticipantWithAudio extends PlaygroundParticipant {
  isTalking: boolean;
  audioLevel: number;
}

export function ParticipantsList({
  participants,
  voiceStreams,
  voiceAnalysers,
  audioElements,
  currentUserRole = "student",
  currentUserId = "",
}: ParticipantsListProps) {
  const [participantsWithAudio, setParticipantsWithAudio] = useState<
    ParticipantWithAudio[]
  >([]);
  const [volumes, setVolumes] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!voiceAnalysers || voiceAnalysers.size === 0) {
      // No analysers available, just show participants without audio levels
      setParticipantsWithAudio(
        participants.map((p) => ({
          ...p,
          isTalking: false,
          audioLevel: 0,
        })),
      );
      return;
    }

    // Note: Audio playback and analyser creation now handled in WebRTC hook
    // We just use the provided analysers to monitor audio levels

    let animationFrameId: number;

    // Monitor audio levels using requestAnimationFrame
    let frameCount = 0;
    const checkAudioLevels = () => {
      const updated = participants.map((p) => {
        const analyser = voiceAnalysers?.get(p.userId);

        if (!analyser || !p.isVoiceActive) {
          return {
            ...p,
            isTalking: false,
            audioLevel: 0,
          };
        }

        // Use time domain data for microphone input (recommended for live audio)
        const dataArray = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(dataArray);

        // Calculate RMS (Root Mean Square) for volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const audioLevel = rms; // Already 0-1

        // Lower threshold for better sensitivity
        const isTalking = audioLevel > 0.02;

        return {
          ...p,
          isTalking,
          audioLevel,
        };
      });

      setParticipantsWithAudio(updated);
      frameCount++;
      animationFrameId = requestAnimationFrame(checkAudioLevels);
    };

    // Start monitoring
    checkAudioLevels();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [participants, voiceStreams, voiceAnalysers]);

  if (participants.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">No participants yet</div>
    );
  }

  const handleMuteParticipant = async (
    participantId: string,
    currentIsMuted: boolean,
  ) => {
    try {
      await updateParticipantVoiceStatus(participantId, true, !currentIsMuted);
    } catch (error) {
      console.error("[ParticipantsList] Failed to mute participant:", error);
    }
  };

  const handleVolumeChange = (userId: string, volume: number) => {
    const audioEl = audioElements?.get(userId);
    if (audioEl) {
      audioEl.volume = volume;
    }
    setVolumes((prev) => {
      const updated = new Map(prev);
      updated.set(userId, volume);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {participantsWithAudio.map((p) => {
          const isCurrentUser = p.userId === currentUserId;
          const canMute = currentUserRole === "teacher" && !isCurrentUser;

          return (
            <div
              key={p.participantId}
              className={`
              relative overflow-hidden
              flex items-center gap-2 px-3 py-2 rounded-full
              transition-all duration-200
              ${
                p.isTalking
                  ? "bg-gradient-to-r from-green-100 to-green-50 border border-green-400 shadow-sm"
                  : "bg-gray-100 border border-transparent"
              }
            `}
            >
              {/* Audio level visualization */}
              {p.isVoiceActive && (
                <div
                  className="absolute left-0 top-0 h-full bg-green-200 transition-all duration-100"
                  style={{
                    width: `${p.audioLevel * 100}%`,
                    opacity: 0.3,
                  }}
                />
              )}

              {/* Microphone icon - clickable for teachers */}
              <button
                onClick={() =>
                  canMute &&
                  p.isVoiceActive &&
                  handleMuteParticipant(p.participantId, p.isMuted)
                }
                disabled={!canMute || !p.isVoiceActive}
                className={`relative z-10 flex items-center justify-center w-8 h-8 ${
                  canMute && p.isVoiceActive
                    ? "cursor-pointer hover:opacity-80"
                    : "cursor-default"
                }`}
                title={
                  canMute && p.isVoiceActive
                    ? p.isMuted
                      ? "Click to unmute"
                      : "Click to mute"
                    : ""
                }
              >
                {p.isVoiceActive ? (
                  <div className="relative">
                    {/* Animated rings when talking */}
                    {p.isTalking && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                        <div
                          className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-50"
                          style={{ animationDelay: "0.15s" }}
                        />
                      </>
                    )}
                    {/* Microphone icon - larger with more padding */}
                    <div
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center ${
                        p.isMuted
                          ? "bg-red-600"
                          : p.isTalking
                            ? "bg-green-600"
                            : "bg-green-500"
                      }`}
                    >
                      {p.isMuted ? (
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM13 4a3 3 0 00-6 0v6c0 .556.151 1.077.415 1.524L13 5.939V4z" />
                          <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                          <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                        </svg>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                )}
              </button>

              {/* Name and role */}
              <div className="relative z-10 flex-1 min-w-0">
                <span
                  className={`text-sm font-semibold ${p.isTalking ? "text-green-900" : "text-neutral-800"}`}
                >
                  {p.userName}
                </span>
                {!p.isTalking && !p.isVoiceActive && (
                  <span className="ml-2 text-xs text-gray-500 uppercase tracking-wide">
                    {p.role}
                  </span>
                )}
              </div>

              {/* Volume slider - for remote participants with audio */}
              <div className="relative z-10 flex items-center gap-1.5 w-20">
                <svg
                  className="w-3 h-3 text-gray-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volumes.get(p.userId) ?? 1}
                  onChange={(e) =>
                    handleVolumeChange(p.userId, parseFloat(e.target.value))
                  }
                  className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                  title={`Volume: ${Math.round((volumes.get(p.userId) ?? 1) * 100)}%`}
                />
              </div>

              {/* Talking indicator - pulsing dot */}
              {p.isTalking && !p.isMuted && (
                <div className="relative z-10 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                </div>
              )}

              {/* Muted indicator */}
              {p.isMuted && p.isVoiceActive && (
                <div className="relative z-10 flex items-center gap-1">
                  <span className="text-xs font-medium text-red-600">
                    Muted
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
