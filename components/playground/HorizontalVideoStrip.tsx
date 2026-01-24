/**
 * HorizontalVideoStrip Component
 * Displays video feeds in a horizontal strip layout with pagination
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface MediaParticipant {
  userId: string;
  userName: string;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

interface HorizontalVideoStripProps {
  isVideoActive: boolean;
  localStream: MediaStream | null;
  participants: MediaParticipant[];
  videoStreams: Map<string, MediaStream>;
  currentUserId: string;
  currentUserName: string;
  isMuted: boolean;
}

export function HorizontalVideoStrip({
  isVideoActive,
  localStream,
  participants,
  videoStreams,
  currentUserId,
  currentUserName,
  isMuted,
}: HorizontalVideoStripProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // Pagination state - responsive items per page
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Update items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(2); // Mobile: 2 videos
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(3); // Tablet: 3 videos
      } else {
        setItemsPerPage(4); // Desktop: 4 videos
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Calculate total participants (including local user)
  const totalParticipants = participants.length + 1;
  const totalPages = Math.ceil(totalParticipants / itemsPerPage);

  // Get current page items
  const allParticipants = [
    { userId: currentUserId, userName: currentUserName, isLocal: true },
    ...participants.map(p => ({ ...p, isLocal: false }))
  ];

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = allParticipants.slice(startIndex, endIndex);

  // Calculate how many placeholders to show (fill remaining slots in current page)
  const placeholdersCount = participants.length === 0
    ? Math.max(0, itemsPerPage - currentPageItems.length)
    : 0;

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

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

  return (
    <div className="bg-white border border-gray-200 p-2 sm:p-3">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Previous Button */}
        {totalPages > 1 && (
          <button
            onClick={handlePrevPage}
            className="flex-shrink-0 w-6 sm:w-8 h-20 sm:h-28 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            aria-label="Previous page"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Video Grid */}
        <div className="flex gap-2 sm:gap-3 flex-1 overflow-hidden">
          {currentPageItems.map((participant) => {
            const isLocal = participant.isLocal;
            const hasVideo = isLocal ? isVideoActive : videoStreams.has(participant.userId);

            return (
              <div key={participant.userId} className="relative flex-shrink-0 w-32 sm:w-36 md:w-40 h-20 sm:h-24 md:h-28 bg-gray-900 rounded overflow-hidden">
                {hasVideo ? (
                  <video
                    ref={(el) => {
                      if (el) {
                        if (isLocal) {
                          localVideoRef.current = el;
                        } else {
                          remoteVideoRefs.current.set(participant.userId, el);
                        }
                      }
                    }}
                    autoPlay
                    muted
                    playsInline
                    disablePictureInPicture
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    isLocal
                      ? 'bg-gradient-to-br from-brand-purple to-pastel-ocean'
                      : 'bg-gradient-to-br from-pastel-blossom to-pastel-coral'
                  }`}>
                    <div className="text-center text-white">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full bg-white/20 flex items-center justify-center text-sm sm:text-lg font-bold">
                        {participant.userName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0.5 sm:bottom-1 left-0.5 sm:left-1 bg-black/60 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] text-white truncate max-w-[calc(100%-8px)]">
                  {isLocal ? `You ${isMuted ? '(muted)' : ''}` : `${participant.userName} ${participant.isMuted ? '(muted)' : ''}`}
                </div>
              </div>
            );
          })}

          {/* Placeholder camera views when no other participants - fill remaining slots */}
          {Array.from({ length: placeholdersCount }).map((_, idx) => (
            <div key={`placeholder-${idx}`} className="relative flex-shrink-0 w-32 sm:w-36 md:w-40 h-20 sm:h-24 md:h-28 bg-gray-900 rounded overflow-hidden border-2 border-dashed border-gray-700">
              <div className="w-full h-full flex items-center justify-center bg-gray-800/50">
                <div className="text-center text-gray-500">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[9px] sm:text-[10px] font-medium">Waiting...</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        {totalPages > 1 && (
          <button
            onClick={handleNextPage}
            className="flex-shrink-0 w-6 sm:w-8 h-20 sm:h-28 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            aria-label="Next page"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Page Indicator */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-1 sm:mt-2 gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentPage ? 'bg-gray-700 w-4' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
