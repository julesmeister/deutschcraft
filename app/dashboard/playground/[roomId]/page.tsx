/**
 * Playground Room Page
 * Handles the specific room view
 */

"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlaygroundRoom as PlaygroundRoomComponent } from "@/components/playground/PlaygroundRoom";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { useWebRTCMedia } from "@/lib/hooks/useWebRTCMedia";
import { usePlaygroundHandlers } from "@/lib/hooks/usePlaygroundHandlers";
import { usePlaygroundSubscriptions } from "@/lib/hooks/usePlaygroundSubscriptions";
import { usePlaygroundSessionSync } from "@/lib/hooks/usePlaygroundSessionSync";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { CatLoader } from "@/components/ui/CatLoader";
import {
  getPlaygroundRoom,
  getRoomParticipants,
  joinPlaygroundRoom,
  setCurrentMaterial,
} from "@/lib/services/playgroundService";
import type {
  PlaygroundRoom,
  PlaygroundParticipant,
  PlaygroundWriting,
} from "@/lib/models/playground";

export default function PlaygroundRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const { session } = useFirebaseAuth();

  const [currentRoom, setCurrentRoom] = useState<PlaygroundRoom | null>(null);
  const [participants, setParticipants] = useState<PlaygroundParticipant[]>([]);
  const [writings, setWritings] = useState<PlaygroundWriting[]>([]);
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch current user
  const { student: currentUser, isLoading: userLoading } = useCurrentStudent(
    session?.user?.email || null,
  );
  const { userId, userName, userEmail, userRole } = getUserInfo(
    currentUser,
    session,
  );

  // Stable error handler
  const handleMediaError = useCallback((error: Error) => {
    setDialogState({
      isOpen: true,
      title: "Media Chat Error",
      message: error.message || "Failed to connect media chat",
    });
  }, []);

  // Media chat hook
  const {
    isVoiceActive,
    isVideoActive,
    isMuted,
    participants: mediaParticipants,
    audioStreams,
    videoStreams,
    audioAnalysers,
    audioElements,
    localStream,
    startVoice,
    startVideo,
    stopVoice,
    toggleMute,
    toggleVideo,
  } = useWebRTCMedia({
    userId,
    userName,
    roomId: roomId,
    enableVideo: false,
    onError: handleMediaError,
  });

  // Load active rooms (needed for handlers)
  const loadActiveRooms = async () => {
    // In individual room page, we might not need to load ALL active rooms,
    // but the handler expects this function. We can leave it empty or implement minimal check.
    // For now, we'll just check the current room status.
    const room = await getPlaygroundRoom(roomId);
    if (room && room.status === "active") {
      setCurrentRoom(room);
    } else if (room && room.status === "ended") {
      router.push("/dashboard/playground");
    }
  };

  // Playground handlers hook
  const {
    handleLeaveRoom,
    handleEndRoom,
    handleToggleRoomPublicWriting,
    handleSaveWriting,
    handleToggleWritingVisibility,
    handleStartVoice,
    handleStartVideo,
    handleStopVoice,
    handleToggleMute,
    handleToggleVideo,
  } = usePlaygroundHandlers({
    userId,
    userName,
    userEmail,
    userRole,
    myParticipantId,
    currentRoom,
    isVoiceActive,
    isVideoActive,
    isMuted,
    setDialogState,
    setMyParticipantId,
    setCurrentRoom,
    setParticipants,
    setWritings,
    stopVoice,
    startVoice,
    startVideo,
    toggleMute,
    toggleVideo,
    loadActiveRooms,
  });

  // Subscribe to room, participants, and writings
  usePlaygroundSubscriptions({
    currentRoom,
    userId,
    userRole,
    handleLeaveRoom: async () => {
      await handleLeaveRoom();
      router.push("/dashboard/playground");
    },
    setCurrentRoom,
    setParticipants,
    setWritings,
  });

  // Sync with session context
  const { playgroundSession } = usePlaygroundSessionSync({
    currentRoom,
    participants,
    writings,
    myParticipantId,
    userId,
    userName,
    userEmail,
    userRole,
    isVoiceActive,
    isVideoActive,
    isMuted,
  });

  // Initialize Room
  useEffect(() => {
    const initializeRoom = async () => {
      if (!userId || !roomId) return;

      try {
        setIsInitializing(true);
        const room = await getPlaygroundRoom(roomId);

        if (!room) {
          setDialogState({
            isOpen: true,
            title: "Room Not Found",
            message: "This room does not exist or has been deleted.",
          });
          setTimeout(() => router.push("/dashboard/playground"), 2000);
          return;
        }

        if (room.status !== "active") {
          setDialogState({
            isOpen: true,
            title: "Room Ended",
            message: "This room has ended.",
          });
          setTimeout(() => router.push("/dashboard/playground"), 2000);
          return;
        }

        setCurrentRoom(room);

        // Check if already a participant
        const roomParticipants = await getRoomParticipants(roomId);
        const myParticipant = roomParticipants.find(
          (p) => p.userId === userId && !p.leftAt,
        );

        if (myParticipant) {
          console.log(
            "[Room Init] Found existing participant:",
            myParticipant.participantId,
          );
          setMyParticipantId(myParticipant.participantId);
          // Auto-start voice for returning participant
          startVoice();
        } else {
          // Auto-join
          console.log("[Room Init] Auto-joining room...");
          const participantId = await joinPlaygroundRoom(
            roomId,
            userId,
            userName,
            userEmail,
            userRole,
          );
          setMyParticipantId(participantId);
          // Auto-start voice for new participant
          startVoice();
        }
      } catch (error) {
        console.error("[Room Init] Error:", error);
        setDialogState({
          isOpen: true,
          title: "Error",
          message: "Failed to join room.",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    if (userId && !userLoading) {
      initializeRoom();
    }
  }, [
    userId,
    userLoading,
    roomId,
    userName,
    userEmail,
    userRole,
    router,
    startVoice,
  ]);

  // Wrapped leave handler
  const wrappedHandleLeaveRoom = async () => {
    await handleLeaveRoom();
    playgroundSession.endSession();
    router.push("/dashboard/playground?left=true");
  };

  const handleMinimize = () => {
    playgroundSession.minimize();
  };

  const myWriting = writings.find((w) => w.userId === userId);

  const handleSetCurrentMaterial = async (
    materialId: string | null,
    materialTitle: string | null,
    materialUrl: string | null,
    materialType?: "pdf" | "audio" | null,
  ) => {
    if (!currentRoom) return;
    try {
      await setCurrentMaterial(
        currentRoom.roomId,
        materialId,
        materialTitle,
        materialUrl,
        materialType,
      );
    } catch (error) {
      console.error("[Room] Error setting material:", error);
      setDialogState({
        isOpen: true,
        title: "Error",
        message: "Failed to set material",
      });
    }
  };

  if (!session || userLoading || isInitializing || !currentRoom) {
    return (
      <CatLoader
        fullScreen
        message={isInitializing ? "Joining room..." : "Loading..."}
      />
    );
  }

  // When minimized, hide the full UI but keep hooks alive
  if (playgroundSession.session?.isMinimized) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          <p className="text-sm font-medium">Session minimized</p>
          <p className="text-xs mt-1">Use the floating widget to restore</p>
          <button
            onClick={() => playgroundSession.maximize()}
            className="mt-4 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Restore Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-4rem)]"
    >
      <PlaygroundRoomComponent
        currentRoom={currentRoom}
        participants={participants}
        writings={writings}
        myWriting={myWriting}
        userId={userId}
        userName={userName}
        userRole={userRole}
        isVoiceActive={isVoiceActive}
        isVideoActive={isVideoActive}
        isMuted={isMuted}
        localStream={localStream}
        mediaParticipants={mediaParticipants}
        audioStreams={audioStreams}
        videoStreams={videoStreams}
        audioAnalysers={audioAnalysers}
        audioElements={audioElements}
        dialogState={dialogState}
        onLeaveRoom={wrappedHandleLeaveRoom}
        onEndRoom={async () => {
          await handleEndRoom();
          router.push("/dashboard/playground");
        }}
        onStartVoice={handleStartVoice}
        onStartVideo={handleStartVideo}
        onStopVoice={handleStopVoice}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onSaveWriting={handleSaveWriting}
        onToggleWritingVisibility={handleToggleWritingVisibility}
        onToggleRoomPublicWriting={
          userRole === "teacher" ? handleToggleRoomPublicWriting : undefined
        }
        onSetCurrentMaterial={
          userRole === "teacher" ? handleSetCurrentMaterial : undefined
        }
        onMinimize={handleMinimize}
        onCloseDialog={() => setDialogState({ ...dialogState, isOpen: false })}
      />
    </motion.div>
  );
}
