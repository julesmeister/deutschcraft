/**
 * VideoGridView Component
 * Displays video feeds in a responsive grid layout
 */

'use client';

import { useEffect, useRef } from 'react';

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
  currentUserId: string;
  currentUserName: string;
  isMuted: boolean;
}

export function VideoGridView({
  isVideoActive,
  localStream,
  participants,
  videoStreams,
  currentUserId,
  currentUserName,
  isMuted,
}: VideoGridViewProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

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

  // Attach remote streams to video elements
  useEffect(() => {
    videoStreams.forEach((stream, userId) => {
      const videoElement = remoteVideoRefs.current.get(userId);
      if (videoElement && videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
      }
    });
  }, [videoStreams]);

  // Calculate grid layout based on number of participants
  const totalParticipants = participants.length + 1; // +1 for local user

  // Responsive grid: 1 col on mobile, 2 cols on tablet, dynamic on desktop
  const getGridCols = () => {
    if (totalParticipants === 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-1 sm:grid-cols-2';
    if (totalParticipants <= 9) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  return (
    <>
      <div className={`grid ${getGridCols()} gap-2 sm:gap-3 md:gap-4`}>
        {/* Local Video */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {isVideoActive ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple to-pastel-ocean">
              <div className="text-center text-white">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold">
                  {currentUserName.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs sm:text-sm font-medium">{currentUserName}</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
            You {isMuted && '(muted)'}
          </div>
        </div>

        {/* Remote Videos */}
        {participants.map((participant) => {
          const hasVideo = videoStreams.has(participant.userId);

          return (
            <div key={participant.userId} className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {hasVideo ? (
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideoRefs.current.set(participant.userId, el);
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pastel-blossom to-pastel-coral">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold">
                      {participant.userName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs sm:text-sm font-medium">{participant.userName}</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                {participant.userName} {participant.isMuted && '(muted)'}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
