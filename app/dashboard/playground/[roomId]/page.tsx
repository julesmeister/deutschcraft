/**
 * Playground Room Page
 * Handles the specific room view
 */

"use client";

import { useState, useEffect, use } from "react";
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
    session?.user?.email || null
  );
  const { userId, userName, userEmail, userRole } = getUserInfo(
    currentUser,
    session
  );

  // Media chat hook
  const {
    isVoiceActive,
    isVideoActive,
    isMuted,
    participants: mediaParticipants,
    audioStreams,
    videoStreams,
    audioAnalysers,
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
    onError: (error) => {
      setDialogState({
        isOpen: true,
        title: "Media Chat Error",
        message: error.message || "Failed to connect media chat",
      });
    },
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
          (p) => p.userId === userId && !p.leftAt
        );

        if (myParticipant) {
          console.log(
            "[Room Init] Found existing participant:",
            myParticipant.participantId
          );
          setMyParticipantId(myParticipant.participantId);
        } else {
          // Auto-join
          console.log("[Room Init] Auto-joining room...");
          const participantId = await joinPlaygroundRoom(
            roomId,
            userId,
            userName,
            userEmail,
            userRole
          );
          setMyParticipantId(participantId);
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
  }, [userId, userLoading, roomId, userName, userEmail, userRole, router]);

  // Wrapped leave handler
  const wrappedHandleLeaveRoom = async () => {
    await handleLeaveRoom();
    playgroundSession.endSession();
    router.push("/dashboard/playground?left=true");
  };

  const handleMinimize = () => {
    playgroundSession.minimize();
    router.push("/dashboard/student");
  };

  const myWriting = writings.find((w) => w.userId === userId);

  if (!session || userLoading || isInitializing || !currentRoom) {
    return (
      <CatLoader
        fullScreen
        message={isInitializing ? "Joining room..." : "Loading..."}
      />
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
        onMinimize={handleMinimize}
        onCloseDialog={() => setDialogState({ ...dialogState, isOpen: false })}
      />
    </motion.div>
  );
}
