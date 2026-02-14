"use client";

import { useRef } from "react";

interface ParticipantWithAudio {
  participantId: string;
  userId: string;
  userName: string;
  role: string;
  isVoiceActive: boolean;
  isMuted: boolean;
  isTalking: boolean;
  audioLevel: number;
}

interface ParticipantRowProps {
  participant: ParticipantWithAudio;
  isCurrentUser: boolean;
  canMute: boolean;
  volume: number;
  isDragging: boolean;
  isIsolated?: boolean;
  onMute: (participantId: string, currentIsMuted: boolean) => void;
  onDragStart: (userId: string, clientX: number) => void;
}

export function ParticipantRow({
  participant: p,
  isCurrentUser,
  canMute,
  volume,
  isDragging,
  isIsolated = false,
  onMute,
  onDragStart,
}: ParticipantRowProps) {
  const effectiveTalking = p.isTalking && !isIsolated;

  return (
    <div
      className={`
        relative overflow-hidden select-none
        flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
        transition-all duration-200
        ${isIsolated ? "cursor-default opacity-50" : "cursor-ew-resize"}
        ${
          effectiveTalking
            ? "bg-gradient-to-r from-green-100 to-green-50 border border-green-400 shadow-sm"
            : isDragging
              ? "bg-gray-50 border border-amber-200 shadow-sm"
              : "bg-gray-100 border border-transparent"
        }
      `}
      onMouseDown={(e) => {
        if (isIsolated) return;
        if ((e.target as HTMLElement).closest("button")) return;
        onDragStart(p.userId, e.clientX);
      }}
      onTouchStart={(e) => {
        if (isIsolated) return;
        if ((e.target as HTMLElement).closest("button")) return;
        onDragStart(p.userId, e.touches[0].clientX);
      }}
    >
      {/* Volume fill indicator */}
      {!isIsolated && (
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-[width] ${
            isDragging ? "duration-0" : "duration-150"
          } ${
            effectiveTalking
              ? "bg-gradient-to-r from-cyan-300/45 to-blue-200/35"
              : "bg-gradient-to-r from-amber-200/40 to-rose-200/35"
          }`}
          style={{ width: `${volume * 100}%` }}
        />
      )}

      {/* Audio level visualization */}
      {p.isVoiceActive && effectiveTalking && (
        <div
          className="absolute left-0 top-0 h-full bg-green-400 transition-all duration-100 pointer-events-none"
          style={{
            width: `${Math.min(p.audioLevel * 100, volume * 100)}%`,
            opacity: 0.2,
          }}
        />
      )}

      {/* Microphone icon */}
      <button
        onClick={() =>
          canMute && p.isVoiceActive && !isIsolated && onMute(p.participantId, p.isMuted)
        }
        disabled={!canMute || !p.isVoiceActive || isIsolated}
        className={`relative z-10 flex items-center justify-center w-6 h-6 ${
          canMute && p.isVoiceActive && !isIsolated
            ? "cursor-pointer hover:opacity-80"
            : "cursor-default"
        }`}
        title={
          isIsolated ? "Isolated by group"
          : canMute && p.isVoiceActive
            ? p.isMuted ? "Click to unmute" : "Click to mute"
            : ""
        }
      >
        {p.isVoiceActive ? (
          <div className="relative">
            {effectiveTalking && (
              <>
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                <div
                  className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-50"
                  style={{ animationDelay: "0.15s" }}
                />
              </>
            )}
            <div
              className={`relative w-6 h-6 rounded-full flex items-center justify-center ${
                p.isMuted
                  ? "bg-red-600"
                  : p.isTalking
                    ? "bg-green-600"
                    : "bg-green-500"
              }`}
            >
              {p.isMuted ? (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM13 4a3 3 0 00-6 0v6c0 .556.151 1.077.415 1.524L13 5.939V4z" />
                  <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                  <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                </svg>
              )}
            </div>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-green-400 animate-[pulse_3s_ease-in-out_infinite]" />
        )}
      </button>

      {/* Name and role */}
      <div className="relative z-10 flex-1 min-w-0">
        <span className={`text-xs font-semibold ${effectiveTalking ? "text-green-900" : "text-neutral-800"}`}>
          {p.userName}
        </span>
        {!effectiveTalking && !p.isVoiceActive && (
          <span className="ml-1.5 text-[10px] text-gray-500 uppercase tracking-wide">
            {p.role}
          </span>
        )}
      </div>

      {/* Volume percentage (shown while dragging) */}
      {isDragging && !isIsolated && (
        <span className="relative z-10 text-xs font-medium text-amber-600 tabular-nums">
          {Math.round(volume * 100)}%
        </span>
      )}

      {/* Isolated indicator */}
      {isIsolated && (
        <span className="relative z-10 text-[10px] font-medium text-gray-500">Isolated</span>
      )}

      {/* Muted indicator */}
      {!isDragging && !isIsolated && p.isMuted && p.isVoiceActive && (
        <span className="relative z-10 text-[10px] font-medium text-red-600">Muted</span>
      )}
    </div>
  );
}
