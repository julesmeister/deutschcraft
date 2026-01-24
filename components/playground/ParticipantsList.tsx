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
  const [draggingUserId, setDraggingUserId] = useState<string | null>(null);
  const pillRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
    const clamped = Math.max(0, Math.min(1, volume));
    const audioEl = audioElements?.get(userId);
    if (audioEl) {
      audioEl.volume = clamped;
    }
    setVolumes((prev) => {
      const updated = new Map(prev);
      updated.set(userId, clamped);
      return updated;
    });
  };

  const getVolumeFromEvent = (userId: string, clientX: number): number => {
    const pill = pillRefs.current.get(userId);
    if (!pill) return 1;
    const rect = pill.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleDragStart = (userId: string, clientX: number) => {
    setDraggingUserId(userId);
    handleVolumeChange(userId, getVolumeFromEvent(userId, clientX));
  };

  const handleDragMove = (clientX: number) => {
    if (!draggingUserId) return;
    handleVolumeChange(draggingUserId, getVolumeFromEvent(draggingUserId, clientX));
  };

  const handleDragEnd = () => {
    setDraggingUserId(null);
  };

  useEffect(() => {
    if (!draggingUserId) return;

    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX);
    const onEnd = () => handleDragEnd();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [draggingUserId]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {participantsWithAudio.map((p) => {
          const isCurrentUser = p.userId === currentUserId;
          const canMute = currentUserRole === "teacher" && !isCurrentUser;

          const volume = volumes.get(p.userId) ?? 1;
          const isDragging = draggingUserId === p.userId;

          return (
            <div
              key={p.participantId}
              ref={(el) => { if (el) pillRefs.current.set(p.userId, el); }}
              className={`
              relative overflow-hidden select-none
              flex items-center gap-2 px-3 py-2 rounded-full
              transition-all duration-200 cursor-ew-resize
              ${
                p.isTalking
                  ? "bg-gradient-to-r from-green-100 to-green-50 border border-green-400 shadow-sm"
                  : isDragging
                    ? "bg-gray-50 border border-amber-200 shadow-sm"
                    : "bg-gray-100 border border-transparent"
              }
            `}
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                handleDragStart(p.userId, e.clientX);
              }}
              onTouchStart={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                handleDragStart(p.userId, e.touches[0].clientX);
              }}
            >
              {/* Volume fill indicator */}
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-[width] ${
                  isDragging ? "duration-0" : "duration-150"
                } ${
                  p.isTalking
                    ? "bg-gradient-to-r from-cyan-300/45 to-blue-200/35"
                    : "bg-gradient-to-r from-amber-200/40 to-rose-200/35"
                }`}
                style={{ width: `${volume * 100}%` }}
              />

              {/* Audio level visualization (layered on top of volume) */}
              {p.isVoiceActive && p.isTalking && (
                <div
                  className="absolute left-0 top-0 h-full bg-green-400 transition-all duration-100 pointer-events-none"
                  style={{
                    width: `${Math.min(p.audioLevel * 100, volume * 100)}%`,
                    opacity: 0.2,
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
                    {p.isTalking && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                        <div
                          className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-50"
                          style={{ animationDelay: "0.15s" }}
                        />
                      </>
                    )}
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

              {/* Volume percentage (shown while dragging) */}
              {isDragging && (
                <span className="relative z-10 text-xs font-medium text-amber-600 tabular-nums">
                  {Math.round(volume * 100)}%
                </span>
              )}

              {/* Talking indicator - pulsing dot */}
              {p.isTalking && !p.isMuted && !isDragging && (
                <div className="relative z-10 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                </div>
              )}

              {/* Muted indicator */}
              {p.isMuted && p.isVoiceActive && !isDragging && (
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
