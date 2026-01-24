/**
 * VideoGridView Component
 * Displays video feeds in a responsive grid layout
 */

"use client";

import { useEffect, useRef } from "react";
import { useAudioOutput } from "@/lib/hooks/useAudioOutput";
import { CompactButtonDropdown } from "@/components/ui/CompactButtonDropdown";

interface MediaParticipant {
  userId: string;
  userName: string;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

interface VideoGridViewProps {
  isVideoActive: boolean;
  localStream: MediaStream | null;
  participants: MediaParticipant[];
  videoStreams: Map<string, MediaStream>;
  audioStreams?: Map<string, MediaStream>;
  currentUserId: string;
  currentUserName: string;
  hostId?: string;
  isMuted: boolean;
  audioElements?: Map<string, HTMLAudioElement>;
}

export function VideoGridView({
  isVideoActive,
  localStream,
  participants,
  videoStreams,
  audioStreams,
  currentUserId,
  currentUserName,
  hostId,
  isMuted,
  audioElements,
}: VideoGridViewProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    isSupported,
    setAudioOutput,
  } = useAudioOutput();

  // Handle setting audio output when device or elements change
  useEffect(() => {
    if (isSupported && selectedDeviceId && audioElements) {
      audioElements.forEach((audioEl) => {
        setAudioOutput(audioEl, selectedDeviceId);
      });
    }
  }, [selectedDeviceId, audioElements, isSupported, setAudioOutput]);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      // Force re-attach when video state changes to fix toggle bug
      localVideoRef.current.srcObject = null;
      localVideoRef.current.srcObject = localStream;

      // Ensure video plays
      localVideoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [localStream, isVideoActive]);

  // Attach remote streams (combined audio+video) to video elements
  useEffect(() => {
    participants.forEach((participant) => {
      const videoElement = remoteVideoRefs.current.get(participant.userId);
      if (!videoElement) return;

      const videoStream = videoStreams.get(participant.userId);
      const audioStream = audioStreams?.get(participant.userId);

      // Combine audio + video tracks into one stream for the video element
      const combined = new MediaStream();
      if (videoStream) {
        videoStream.getVideoTracks().forEach((t) => combined.addTrack(t));
      }
      if (audioStream) {
        audioStream.getAudioTracks().forEach((t) => combined.addTrack(t));
      }

      if (combined.getTracks().length > 0) {
        // Only reassign if tracks changed
        const current = videoElement.srcObject as MediaStream | null;
        const currentIds = current?.getTracks().map((t) => t.id).sort().join(',') || '';
        const newIds = combined.getTracks().map((t) => t.id).sort().join(',');
        if (currentIds !== newIds) {
          videoElement.srcObject = combined;
          videoElement.play().catch(() => {
            // Retry on next user interaction if autoplay blocked
            const retry = () => {
              videoElement.play().then(() => {
                document.removeEventListener('click', retry);
                document.removeEventListener('touchstart', retry);
              }).catch(() => {});
            };
            document.addEventListener('click', retry);
            document.addEventListener('touchstart', retry);
          });
        }
      }
    });
  }, [videoStreams, audioStreams, participants]);

  // In teacher mode (hostId set): only show the host's camera
  const isTeacherMode = !!hostId;
  const isHost = currentUserId === hostId;

  // Determine which participants to show
  const visibleParticipants = isTeacherMode
    ? participants.filter((p) => p.userId === hostId) // Students see only host
    : participants;

  // Show local video only if: not teacher mode, or current user IS the host
  const showLocalVideo = !isTeacherMode || isHost;

  const totalVisible = visibleParticipants.length + (showLocalVideo ? 1 : 0);

  // Responsive grid
  const getGridCols = () => {
    if (totalVisible <= 1) return "grid-cols-1";
    if (totalVisible === 2) return "grid-cols-1 md:grid-cols-2";
    if (totalVisible <= 4) return "grid-cols-1 sm:grid-cols-2";
    if (totalVisible <= 9) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  return (
    <>
      <div className={`grid ${getGridCols()} gap-2 sm:gap-3 md:gap-4`}>
        {/* Local Video - shown if host in teacher mode, or always in grid mode */}
        {showLocalVideo && (
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {isVideoActive ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                disablePictureInPicture
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple to-pastel-ocean">
                <div className="text-center text-white">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold">
                    {currentUserName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs sm:text-sm font-medium">
                    {currentUserName}
                  </p>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
              You {isMuted && "(muted)"}
            </div>

            {/* Audio Output Selector - Overlaid on local video */}
            {isSupported && devices.length > 0 && (
              <div className="absolute top-2 right-2 z-10">
                <CompactButtonDropdown
                  label=""
                  options={devices.map((d) => ({
                    value: d.deviceId,
                    label: d.label,
                  }))}
                  onChange={(val) => setSelectedDeviceId(val as string)}
                  buttonClassName="bg-neutral-800/90 hover:bg-neutral-800 text-white border border-white/10 px-3 py-1.5 h-auto rounded-md shadow-sm backdrop-blur-sm transition-colors"
                  icon={
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  }
                  usePortal={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Remote Participants */}
        {visibleParticipants.map((participant) => {
          const hasVideo = videoStreams.has(participant.userId);
          const hasAudio = audioStreams?.has(participant.userId);

          return (
            <div
              key={participant.userId}
              className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden"
            >
              {/* Always render video element for audio+video playback */}
              {(hasVideo || hasAudio) && (
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideoRefs.current.set(participant.userId, el);
                    }
                  }}
                  autoPlay
                  playsInline
                  disablePictureInPicture
                  className={`w-full h-full object-cover scale-x-[-1] ${!hasVideo ? 'hidden' : ''}`}
                />
              )}
              {/* Avatar overlay when no video */}
              {!hasVideo && (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pastel-blossom to-pastel-coral">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold">
                      {participant.userName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs sm:text-sm font-medium">
                      {participant.userName}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                {participant.userName} {participant.isMuted && "(muted)"}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
