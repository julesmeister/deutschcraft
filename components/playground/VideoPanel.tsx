/**
 * VideoPanel Component
 * Displays video feeds for all participants with multiple layout options
 */

"use client";

import { useState } from "react";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { VideoLayoutSelector, type VideoLayout } from "./VideoLayoutSelector";
import { VideoGridView } from "./VideoGridView";

export type { VideoLayout };

interface MediaParticipant {
  userId: string;
  userName: string;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

interface VideoPanelProps {
  isVoiceActive: boolean;
  isVideoActive: boolean;
  isMuted: boolean;
  localStream: MediaStream | null;
  participants: MediaParticipant[];
  videoStreams: Map<string, MediaStream>;
  audioStreams?: Map<string, MediaStream>;
  audioAnalysers: Map<string, AnalyserNode>;
  audioElements?: Map<string, HTMLAudioElement>;
  currentUserId: string;
  currentUserName: string;
  hostId: string;
  layout?: VideoLayout;
  onStartVoice: () => void;
  onStartVideo: () => void;
  onStopVoice: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onLayoutChange?: (layout: VideoLayout) => void;
}

export function VideoPanel({
  isVoiceActive,
  isVideoActive,
  isMuted,
  localStream,
  participants,
  videoStreams,
  audioStreams,
  audioAnalysers,
  audioElements,
  currentUserId,
  currentUserName,
  hostId,
  layout: externalLayout,
  onStartVoice,
  onStartVideo,
  onStopVoice,
  onToggleMute,
  onToggleVideo,
  onLayoutChange,
}: VideoPanelProps) {
  const [internalLayout, setInternalLayout] = useState<VideoLayout>("teacher");

  // Use external layout if provided, otherwise use internal state
  const layout = externalLayout || internalLayout;

  const handleLayoutChange = (newLayout: VideoLayout) => {
    if (onLayoutChange) {
      onLayoutChange(newLayout);
    } else {
      setInternalLayout(newLayout);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-4 space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Voice & Video{" "}
          {participants.length > 0 && `(${participants.length + 1})`}
        </h3>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 flex-wrap">
        {!isVoiceActive ? (
          <>
            <ActionButton
              onClick={onStartVoice}
              variant="purple"
              icon={<ActionButtonIcons.Microphone />}
              size="compact"
              className="flex-1"
            >
              Voice
            </ActionButton>
            <ActionButton
              onClick={onStartVideo}
              variant="cyan"
              icon={
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              }
              size="compact"
              className="flex-1"
            >
              Video
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton
              onClick={onToggleMute}
              variant={isMuted ? "gray" : "cyan"}
              icon={<ActionButtonIcons.Microphone />}
              size="compact"
              className="flex-1"
            >
              {isMuted ? "Unmute" : "Mute"}
            </ActionButton>
            <ActionButton
              onClick={onToggleVideo}
              variant={isVideoActive ? "purple" : "gray"}
              icon={
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  {isVideoActive ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  ) : (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  )}
                </svg>
              }
              size="compact"
              className="flex-1"
            >
              {isVideoActive ? "Cam" : "Cam"}
            </ActionButton>
            <ActionButton
              onClick={onStopVoice}
              variant="red"
              icon={<ActionButtonIcons.Close />}
              size="compact"
              className="flex-1"
            >
              Stop
            </ActionButton>
          </>
        )}
      </div>

      {/* View Selector - Show when voice is active (camera can be off) */}
      {isVoiceActive && (
        <VideoLayoutSelector
          layout={layout}
          onLayoutChange={handleLayoutChange}
        />
      )}

      {/* Video Grid - Show remote streams when voice is active regardless of local camera */}
      {isVoiceActive && layout === "teacher" && (
        <VideoGridView
          isVideoActive={isVideoActive}
          localStream={localStream}
          participants={participants}
          videoStreams={videoStreams}
          audioStreams={audioStreams}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          hostId={hostId}
          isMuted={isMuted}
          audioElements={audioElements}
        />
      )}
    </div>
  );
}
