/**
 * PlaygroundRoom Component
 * Active room view with flexible resizable/draggable panel layout
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AlertDialog } from "@/components/ui/Dialog";
import { FloatingRedemittelWidget } from "@/components/writing/FloatingRedemittelWidget";
import { MaterialSelector } from "@/components/playground/MaterialSelector";
import { ExerciseSelector } from "@/components/playground/ExerciseSelector";
import { FloatingPlaygroundControls } from "@/components/playground/FloatingPlaygroundControls";
import { VideoGalleryOverlay } from "@/components/playground/VideoGalleryOverlay";
import { useAudioController } from "@/components/playground/useAudioController";
import { PlaygroundWidgetProvider, type WidgetContextValue } from "./layout/PlaygroundWidgetContext";
import { ResizablePanelLayout } from "./layout/ResizablePanelLayout";
import { usePlaygroundLayout } from "./layout/usePlaygroundLayout";
import { setCurrentMaterialPage } from "@/lib/services/playground/rooms";
import { formatDuration } from "@/lib/utils/dateHelpers";
import type { VideoLayout } from "@/components/playground/VideoPanel";
import type { GroupIsolationState } from "@/components/playground/audioTypes";
import type {
  PlaygroundRoom as PlaygroundRoomType,
  PlaygroundParticipant,
  PlaygroundWriting,
} from "@/lib/models/playground";

interface MediaParticipant {
  userId: string;
  userName: string;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

interface PlaygroundRoomProps {
  currentRoom: PlaygroundRoomType;
  participants: PlaygroundParticipant[];
  writings: PlaygroundWriting[];
  myWriting?: PlaygroundWriting;
  userId: string;
  userName: string;
  userRole: "teacher" | "student";
  isVoiceActive: boolean;
  isVideoActive: boolean;
  isMuted: boolean;
  localStream: MediaStream | null;
  mediaParticipants: MediaParticipant[];
  audioStreams: Map<string, MediaStream>;
  videoStreams: Map<string, MediaStream>;
  audioAnalysers: Map<string, AnalyserNode>;
  audioElements: Map<string, HTMLAudioElement>;
  dialogState: { isOpen: boolean; title: string; message: string };
  onLeaveRoom: () => Promise<void>;
  onEndRoom: () => Promise<void>;
  onStartVoice: () => Promise<void>;
  onStartVideo: () => Promise<void>;
  onStopVoice: () => Promise<void>;
  onToggleMute: () => Promise<void>;
  onToggleVideo: () => Promise<void>;
  onSaveWriting: (content: string) => Promise<void>;
  onToggleWritingVisibility: (writingId: string, isPublic: boolean) => Promise<void>;
  onToggleRoomPublicWriting?: (isPublic: boolean) => Promise<void>;
  onSetCurrentMaterial?: (
    materialId: string | null,
    materialTitle: string | null,
    materialUrl: string | null,
    materialType?: "pdf" | "audio" | null
  ) => Promise<void>;
  onSetCurrentExercise?: (
    exerciseId: string | null,
    exerciseNumber: string | null,
    level: string | null,
    lessonNumber: number | null,
    bookType: "AB" | "KB" | null
  ) => Promise<void>;
  onUpdateRoomTitle?: (newTitle: string) => Promise<void>;
  onMinimize?: () => void;
  onCloseDialog: () => void;
}

export function PlaygroundRoom({
  currentRoom,
  participants,
  writings,
  myWriting,
  userId,
  userName,
  userRole,
  isVoiceActive,
  isVideoActive,
  isMuted,
  localStream,
  mediaParticipants,
  audioStreams,
  videoStreams,
  audioAnalysers,
  audioElements,
  dialogState,
  onLeaveRoom,
  onEndRoom,
  onStartVoice,
  onStartVideo,
  onStopVoice,
  onToggleMute,
  onToggleVideo,
  onSaveWriting,
  onToggleWritingVisibility,
  onToggleRoomPublicWriting,
  onSetCurrentMaterial,
  onSetCurrentExercise,
  onUpdateRoomTitle,
  onMinimize,
  onCloseDialog,
}: PlaygroundRoomProps) {
  const isHost = userId === currentRoom.hostId;
  const [videoLayout, setVideoLayout] = useState<VideoLayout>("teacher");
  const [duration, setDuration] = useState<string>("00:00");
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isMaterialSelectorOpen, setIsMaterialSelectorOpen] = useState(false);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);

  // Flexible layout state
  const { layout, moveWidget, toggleLeftPanel, setPanelSizes, setColumnCount, resetLayout } = usePlaygroundLayout();

  // Centralized audio control
  const [isolation, setIsolation] = useState<GroupIsolationState>({
    isIsolated: false,
    mutedUserIds: new Set(),
    myGroupIndex: -1,
  });
  const audioControl = useAudioController(audioElements, isolation);
  const handleIsolationChange = useCallback((state: GroupIsolationState) => {
    setIsolation(prev => {
      if (
        prev.isIsolated === state.isIsolated &&
        prev.myGroupIndex === state.myGroupIndex &&
        prev.mutedUserIds.size === state.mutedUserIds.size &&
        [...prev.mutedUserIds].every(id => state.mutedUserIds.has(id))
      ) {
        return prev;
      }
      return state;
    });
  }, []);

  useEffect(() => {
    if (!currentRoom?.createdAt) return;
    const startTime = currentRoom.createdAt instanceof Date
      ? currentRoom.createdAt
      : new Date(currentRoom.createdAt);
    setFormattedDate(
      startTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    );
    const updateDuration = () => setDuration(formatDuration(startTime));
    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [currentRoom?.createdAt]);

  const handleSelectMaterial = async (
    materialId: string, materialTitle: string, materialUrl: string, materialType: "pdf" | "audio"
  ) => {
    if (onSetCurrentMaterial) await onSetCurrentMaterial(materialId, materialTitle, materialUrl, materialType);
  };

  const handleCloseMaterial = async () => {
    if (onSetCurrentMaterial) await onSetCurrentMaterial(null, null, null);
  };

  const handleSelectExercise = async (
    exerciseId: string, exerciseNumber: string, level: string, lessonNumber: number, bookType: "AB" | "KB"
  ) => {
    if (onSetCurrentExercise) await onSetCurrentExercise(exerciseId, exerciseNumber, level, lessonNumber, bookType);
  };

  const handleCloseExercise = async () => {
    if (onSetCurrentExercise) await onSetCurrentExercise(null, null, null, null, null);
  };

  const handleReconnectAudio = useCallback(async () => {
    if (!isVoiceActive) return;
    await onStopVoice();
    // Brief delay to let cleanup complete before rejoining
    await new Promise(r => setTimeout(r, 500));
    await onStartVoice();
  }, [isVoiceActive, onStopVoice, onStartVoice]);

  const handleSetMaterialPage = useCallback(async (page: number) => {
    if (!currentRoom?.roomId) return;
    await setCurrentMaterialPage(currentRoom.roomId, page);
  }, [currentRoom?.roomId]);

  // Build widget context value
  const widgetCtx: WidgetContextValue = useMemo(() => ({
    currentRoom, participants, writings, myWriting,
    userId, userName, userRole,
    isVoiceActive, isVideoActive, isMuted, localStream,
    mediaParticipants, audioStreams, videoStreams, audioAnalysers, audioControl,
    videoLayout, onSetVideoLayout: setVideoLayout,
    onStartVoice, onStartVideo, onStopVoice, onToggleMute, onToggleVideo,
    onSaveWriting, onToggleWritingVisibility, onToggleRoomPublicWriting,
    onCloseMaterial: onSetCurrentMaterial ? handleCloseMaterial : undefined,
    onCloseExercise: onSetCurrentExercise ? handleCloseExercise : undefined,
    onSetMaterialPage: userRole === "teacher" ? handleSetMaterialPage : undefined,
    onIsolationChange: handleIsolationChange,
  }), [
    currentRoom, participants, writings, myWriting,
    userId, userName, userRole,
    isVoiceActive, isVideoActive, isMuted, localStream,
    mediaParticipants, audioStreams, videoStreams, audioAnalysers, audioControl,
    videoLayout, onStartVoice, onStartVideo, onStopVoice, onToggleMute, onToggleVideo,
    onSaveWriting, onToggleWritingVisibility, onToggleRoomPublicWriting,
    onSetCurrentMaterial, onSetCurrentExercise, handleSetMaterialPage, handleIsolationChange,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={currentRoom.title}
        subtitle={`${formattedDate} • ${participants.length} ${
          participants.length === 1 ? "participant" : "participants"
        } • Host: ${currentRoom.hostName} • ${duration}`}
        backButton={{ label: "Leave Room", onClick: onLeaveRoom }}
        onTitleEdit={isHost ? onUpdateRoomTitle : undefined}
      />

      <div className={layout.columnCount === 3 ? "w-full px-4 py-6" : "container mx-auto px-4 sm:px-6 py-6"}>
        <PlaygroundWidgetProvider value={widgetCtx}>
          <ResizablePanelLayout
            layout={layout}
            onMoveWidget={moveWidget}
            onPanelResize={setPanelSizes}
          />
        </PlaygroundWidgetProvider>
      </div>

      <AlertDialog
        open={dialogState.isOpen}
        onClose={onCloseDialog}
        title={dialogState.title}
        message={dialogState.message}
      />

      <FloatingPlaygroundControls
        userRole={userRole}
        isHost={isHost}
        isLeftPanelVisible={layout.isLeftPanelVisible}
        columnCount={layout.columnCount}
        onToggleLeftPanel={toggleLeftPanel}
        onSetColumnCount={setColumnCount}
        onResetLayout={resetLayout}
        onOpenExerciseSelector={onSetCurrentExercise ? () => setIsExerciseSelectorOpen(true) : undefined}
        onOpenMaterialSelector={onSetCurrentMaterial ? () => setIsMaterialSelectorOpen(true) : undefined}
        onReconnectAudio={isVoiceActive ? handleReconnectAudio : undefined}
        onMinimize={onMinimize}
        onEndRoom={onEndRoom}
      />

      <FloatingRedemittelWidget />

      {userRole === "teacher" && onSetCurrentMaterial && (
        <MaterialSelector
          isOpen={isMaterialSelectorOpen}
          onClose={() => setIsMaterialSelectorOpen(false)}
          onSelectMaterial={handleSelectMaterial}
          currentMaterialId={currentRoom.currentMaterialId}
        />
      )}

      {userRole === "teacher" && onSetCurrentExercise && (
        <ExerciseSelector
          isOpen={isExerciseSelectorOpen}
          onClose={() => setIsExerciseSelectorOpen(false)}
          onSelectExercise={handleSelectExercise}
          currentExerciseId={currentRoom.currentExerciseId}
        />
      )}

      {videoLayout === "gallery" && isVoiceActive && (
        <VideoGalleryOverlay
          isVideoActive={isVideoActive}
          localStream={localStream}
          participants={mediaParticipants}
          videoStreams={videoStreams}
          audioStreams={audioStreams}
          currentUserId={userId}
          currentUserName={userName}
          isMuted={isMuted}
          isTeacher={userRole === "teacher"}
          onExit={() => setVideoLayout("teacher")}
        />
      )}
    </div>
  );
}
