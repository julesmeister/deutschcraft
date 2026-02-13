/**
 * Playground Room Page
 * Handles the specific room view
 */

"use client";

import { use, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlaygroundRoom as PlaygroundRoomComponent } from "@/components/playground/PlaygroundRoom";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { useWebRTCMedia } from "@/lib/hooks/useWebRTCMedia";
import { usePlaygroundHandlers } from "@/lib/hooks/usePlaygroundHandlers";
import { usePlaygroundSubscriptions } from "@/lib/hooks/usePlaygroundSubscriptions";
import { usePlaygroundSessionSync } from "@/lib/hooks/usePlaygroundSessionSync";
import { usePlaygroundRoomInit } from "@/lib/hooks/usePlaygroundRoomInit";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { CatLoader } from "@/components/ui/CatLoader";
import { CameraPermissionSnackbar } from "@/components/playground/CameraPermissionSnackbar";
import { MinimizedRoomView } from "./MinimizedRoomView";

const CAMERA_ERROR_NAMES = new Set(['NotAllowedError', 'AbortError', 'NotFoundError', 'NotReadableError']);

export default function PlaygroundRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const { session } = useFirebaseAuth();

  // Fetch current user
  const { student: currentUser, isLoading: userLoading } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId, userName, userEmail, userRole } = getUserInfo(currentUser, session);
  const [cameraError, setCameraError] = useState<{ name: string; message: string } | null>(null);

  // Stable error handler for media
  const handleMediaError = useCallback((error: Error) => {
    if (CAMERA_ERROR_NAMES.has(error.name)) {
      setCameraError({ name: error.name, message: error.message || '' });
      return;
    }
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
    roomId,
    enableVideo: false,
    onError: handleMediaError,
  });

  // Room initialization and state
  const {
    currentRoom,
    setCurrentRoom,
    participants,
    setParticipants,
    writings,
    setWritings,
    myParticipantId,
    setMyParticipantId,
    dialogState,
    setDialogState,
    isInitializing,
    loadActiveRooms,
    handleSetCurrentMaterial,
    handleSetCurrentExercise,
    closeDialog,
  } = usePlaygroundRoomInit({
    roomId,
    userId,
    userName,
    userEmail,
    userRole,
    userLoading,
    startVoice,
  });

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
    onCameraError: setCameraError,
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

  // Wrapped leave handler
  const wrappedHandleLeaveRoom = async () => {
    await handleLeaveRoom();
    playgroundSession.endSession();
    router.push("/dashboard/playground?left=true");
  };

  const wrappedHandleEndRoom = async () => {
    await handleEndRoom();
    router.push("/dashboard/playground");
  };

  const myWriting = writings.find((w) => w.userId === userId);

  // Loading state
  if (!session || userLoading || isInitializing || !currentRoom) {
    return (
      <CatLoader
        fullScreen
        message={isInitializing ? "Joining room..." : "Loading..."}
      />
    );
  }

  // Minimized state
  if (playgroundSession.session?.isMinimized) {
    return (
      <MinimizedRoomView onMaximize={() => playgroundSession.maximize()} />
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
      <CameraPermissionSnackbar
        error={cameraError}
        onRetry={() => {
          setCameraError(null);
          handleStartVideo();
        }}
        onResetCamera={async () => {
          setCameraError(null);
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach((t) => t.stop());
            handleStartVideo();
          } catch (err: any) {
            setCameraError({ name: err.name, message: err.message || "" });
          }
        }}
        onResetMic={async () => {
          setCameraError(null);
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((t) => t.stop());
            handleStartVideo();
          } catch (err: any) {
            setCameraError({ name: err.name, message: err.message || "" });
          }
        }}
        onDismiss={() => setCameraError(null)}
      />
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
        onEndRoom={wrappedHandleEndRoom}
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
        onSetCurrentExercise={
          userRole === "teacher" ? handleSetCurrentExercise : undefined
        }
        onMinimize={() => playgroundSession.minimize()}
        onCloseDialog={closeDialog}
      />
    </motion.div>
  );
}
