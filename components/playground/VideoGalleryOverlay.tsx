/**
 * VideoGalleryOverlay
 * Fullscreen overlay showing only camera feeds in a grid.
 * Teacher can spotlight a participant (bigger tile); click again to unspotlight.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface MediaParticipant {
  userId: string;
  userName: string;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

interface VideoGalleryOverlayProps {
  isVideoActive: boolean;
  localStream: MediaStream | null;
  participants: MediaParticipant[];
  videoStreams: Map<string, MediaStream>;
  audioStreams?: Map<string, MediaStream>;
  currentUserId: string;
  currentUserName: string;
  isMuted: boolean;
  isTeacher: boolean;
  onExit: () => void;
}

export function VideoGalleryOverlay({
  isVideoActive,
  localStream,
  participants,
  videoStreams,
  audioStreams,
  currentUserId,
  currentUserName,
  isMuted,
  isTeacher,
  onExit,
}: VideoGalleryOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = null;
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, isVideoActive]);

  // Attach remote streams
  useEffect(() => {
    participants.forEach((p) => {
      const el = remoteVideoRefs.current.get(p.userId);
      if (!el) return;

      const videoStream = videoStreams.get(p.userId);
      const audioStream = audioStreams?.get(p.userId);
      const combined = new MediaStream();
      if (videoStream) videoStream.getVideoTracks().forEach((t) => combined.addTrack(t));
      if (audioStream) audioStream.getAudioTracks().forEach((t) => combined.addTrack(t));

      if (combined.getTracks().length > 0) {
        const current = el.srcObject as MediaStream | null;
        const currentIds = current?.getTracks().map((t) => t.id).sort().join(",") || "";
        const newIds = combined.getTracks().map((t) => t.id).sort().join(",");
        if (currentIds !== newIds) {
          el.srcObject = combined;
          el.play().catch(() => {});
        }
      }
    });
  }, [videoStreams, audioStreams, participants]);

  const handleSpotlight = useCallback((userId: string) => {
    if (!isTeacher) return;
    setSpotlightId((prev) => (prev === userId ? null : userId));
  }, [isTeacher]);

  // All people: local user + remote participants
  const allPeople = [
    { userId: currentUserId, userName: currentUserName, isLocal: true },
    ...participants.map((p) => ({ ...p, isLocal: false })),
  ];

  const hasSpotlight = spotlightId !== null;
  const spotlightPerson = hasSpotlight ? allPeople.find((p) => p.userId === spotlightId) : null;
  const otherPeople = hasSpotlight ? allPeople.filter((p) => p.userId !== spotlightId) : allPeople;

  // Compute optimal grid dimensions based on participant count
  const getGridClass = (count: number) => {
    if (count <= 1) return "grid-cols-1 grid-rows-1";
    if (count <= 2) return "grid-cols-2 grid-rows-1";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    if (count <= 12) return "grid-cols-4 grid-rows-3";
    if (count <= 16) return "grid-cols-4 grid-rows-4";
    return "grid-cols-5 grid-rows-4";
  };

  const renderTile = (person: { userId: string; userName: string; isLocal: boolean }, large: boolean) => {
    const isLocal = person.isLocal;
    const hasVideo = isLocal ? isVideoActive : videoStreams.has(person.userId);
    const personMuted = isLocal ? isMuted : participants.find((p) => p.userId === person.userId)?.isMuted;

    return (
      <div
        key={person.userId}
        onClick={() => handleSpotlight(person.userId)}
        className={`relative bg-gray-900 rounded-2xl overflow-hidden ${
          isTeacher ? "cursor-pointer" : ""
        } ${large ? "" : "min-h-0"}`}
      >
        {hasVideo ? (
          <video
            ref={(el) => {
              if (!el) return;
              if (isLocal) {
                (localVideoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                if (localStream) {
                  el.srcObject = localStream;
                  el.play().catch(() => {});
                }
              } else {
                remoteVideoRefs.current.set(person.userId, el);
              }
            }}
            autoPlay
            muted={isLocal}
            playsInline
            disablePictureInPicture
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isLocal
              ? "bg-gradient-to-br from-brand-purple to-pastel-ocean"
              : "bg-gradient-to-br from-pastel-blossom to-pastel-coral"
          }`}>
            <div className="text-center text-white">
              <div className={`mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center font-bold ${
                large ? "w-20 h-20 text-3xl" : "w-12 h-12 text-lg"
              }`}>
                {person.userName.charAt(0).toUpperCase()}
              </div>
              <p className={large ? "text-base font-medium" : "text-xs font-medium"}>
                {person.userName}
              </p>
            </div>
          </div>
        )}
        <div className="absolute bottom-1.5 left-1.5 bg-black/60 px-2 py-0.5 rounded text-[11px] text-white">
          {isLocal ? "You" : person.userName} {personMuted ? "(muted)" : ""}
        </div>
        {isTeacher && spotlightId === person.userId && (
          <div className="absolute top-1.5 right-1.5 bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700">
            Spotlight
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-sm">Gallery View</h3>
          <span className="text-gray-400 text-xs">
            {allPeople.length} participant{allPeople.length !== 1 ? "s" : ""}
          </span>
          {isTeacher && (
            <span className="text-gray-500 text-xs">Click to spotlight</span>
          )}
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit
        </button>
      </div>

      {/* Video area — fills remaining height, no overflow */}
      <div className="flex-1 min-h-0 p-2">
        {hasSpotlight && spotlightPerson ? (
          /* Spotlight layout: big tile + side strip */
          <div className="flex gap-2 h-full">
            <div className="flex-1 min-w-0">
              {renderTile(spotlightPerson, true)}
            </div>
            {otherPeople.length > 0 && (
              <div className="w-36 sm:w-44 flex flex-col gap-1.5 overflow-y-auto">
                {otherPeople.map((p) => (
                  <div key={p.userId} className="shrink-0 aspect-video">
                    {renderTile(p, false)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Equal grid — fixed rows+cols so tiles never overflow */
          <div className={`grid ${getGridClass(allPeople.length)} gap-2 h-full`}>
            {allPeople.map((p) => renderTile(p, false))}
          </div>
        )}
      </div>
    </div>
  );
}
