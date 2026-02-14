/**
 * PlaygroundRoom Component
 * Active room view with voice chat and writing board
 */

"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AlertDialog } from "@/components/ui/Dialog";
import { VideoPanel, type VideoLayout } from "@/components/playground/VideoPanel";
import { HorizontalVideoStrip } from "@/components/playground/HorizontalVideoStrip";
import { ParticipantsList } from "@/components/playground/ParticipantsList";
import { ClassroomTools } from "@/components/playground/ClassroomTools";
import { FloatingRedemittelWidget } from "@/components/writing/FloatingRedemittelWidget";
import { MaterialSelector } from "@/components/playground/MaterialSelector";
import { ExerciseSelector } from "@/components/playground/ExerciseSelector";
import { PlaygroundRoomHeaderActions } from "@/components/playground/PlaygroundRoomHeaderActions";
import { PlaygroundRoomContent } from "@/components/playground/PlaygroundRoomContent";
import { formatDuration } from "@/lib/utils/dateHelpers";
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
  onMinimize,
  onCloseDialog,
}: PlaygroundRoomProps) {
  const isHost = userId === currentRoom.hostId;
  const [videoLayout, setVideoLayout] = useState<VideoLayout>("teacher");
  const [duration, setDuration] = useState<string>("00:00");
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isMaterialSelectorOpen, setIsMaterialSelectorOpen] = useState(false);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  // null = CSS-responsive default (hidden on mobile, visible on xl+)
  // true = explicitly shown, false = explicitly hidden
  const [sidebarState, setSidebarState] = useState<boolean | null>(null);

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
    materialId: string,
    materialTitle: string,
    materialUrl: string,
    materialType: "pdf" | "audio"
  ) => {
    if (onSetCurrentMaterial) {
      await onSetCurrentMaterial(materialId, materialTitle, materialUrl, materialType);
    }
  };

  const handleCloseMaterial = async () => {
    if (onSetCurrentMaterial) await onSetCurrentMaterial(null, null, null);
  };

  const handleSelectExercise = async (
    exerciseId: string,
    exerciseNumber: string,
    level: string,
    lessonNumber: number,
    bookType: "AB" | "KB"
  ) => {
    if (onSetCurrentExercise) {
      await onSetCurrentExercise(exerciseId, exerciseNumber, level, lessonNumber, bookType);
    }
  };

  const handleCloseExercise = async () => {
    if (onSetCurrentExercise) await onSetCurrentExercise(null, null, null, null, null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={currentRoom.title}
        subtitle={`${formattedDate} • ${participants.length} ${
          participants.length === 1 ? "participant" : "participants"
        } • Host: ${currentRoom.hostName} • ${duration}`}
        backButton={{ label: "Leave Room", onClick: onLeaveRoom }}
        actions={
          <PlaygroundRoomHeaderActions
            userRole={userRole}
            isHost={isHost}
            onOpenExerciseSelector={onSetCurrentExercise ? () => setIsExerciseSelectorOpen(true) : undefined}
            onOpenMaterialSelector={onSetCurrentMaterial ? () => setIsMaterialSelectorOpen(true) : undefined}
            onMinimize={onMinimize}
            onEndRoom={onEndRoom}
          />
        }
      />

      <div className="container mx-auto px-6 py-8">
        <div className={`grid gap-6 ${
          sidebarState === true ? "grid-cols-3" :
          sidebarState === false ? "grid-cols-1" :
          "grid-cols-1 xl:grid-cols-3"
        }`}>
          {/* Left: Video Panel — always visible on xl, collapsible below */}
          <div className={`col-span-1 ${
            sidebarState === true ? "" :
            sidebarState === false ? "hidden" :
            "hidden xl:block"
          }`}>
            {isVoiceActive && videoLayout === "top-left" && (
              <div className="mb-4">
                <HorizontalVideoStrip
                  isVideoActive={isVideoActive}
                  localStream={localStream}
                  participants={mediaParticipants}
                  videoStreams={videoStreams}
                  currentUserId={userId}
                  currentUserName={userName}
                  isMuted={isMuted}
                />
              </div>
            )}
            <VideoPanel
              isVoiceActive={isVoiceActive}
              isVideoActive={isVideoActive}
              isMuted={isMuted}
              localStream={localStream}
              participants={mediaParticipants}
              videoStreams={videoStreams}
              audioStreams={audioStreams}
              audioAnalysers={audioAnalysers}
              currentUserId={userId}
              currentUserName={userName}
              hostId={currentRoom.hostId}
              layout={videoLayout}
              onStartVoice={onStartVoice}
              onStartVideo={onStartVideo}
              onStopVoice={onStopVoice}
              onToggleMute={onToggleMute}
              onToggleVideo={onToggleVideo}
              onLayoutChange={setVideoLayout}
            />
            <div className="mt-6 bg-white border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Participants ({participants.length})
              </h3>
              <ParticipantsList
                participants={participants}
                voiceStreams={audioStreams}
                voiceAnalysers={audioAnalysers}
                audioElements={audioElements}
                currentUserRole={userRole}
                currentUserId={userId}
              />
            </div>
            <div className="mt-6 bg-white border border-gray-200 p-4">
              <ClassroomTools participants={participants} audioElements={audioElements} currentUserId={userId} userRole={userRole} roomId={currentRoom.roomId} />
            </div>
          </div>

          {/* Right: Content Panel */}
          <div className={`${
            sidebarState === true ? "col-span-2" :
            sidebarState === false ? "" :
            "xl:col-span-2"
          } space-y-6`}>
            {isVoiceActive && videoLayout === "top-right" && (
              <div className="mb-4">
                <HorizontalVideoStrip
                  isVideoActive={isVideoActive}
                  localStream={localStream}
                  participants={mediaParticipants}
                  videoStreams={videoStreams}
                  currentUserId={userId}
                  currentUserName={userName}
                  isMuted={isMuted}
                />
              </div>
            )}
            <PlaygroundRoomContent
              currentRoom={currentRoom}
              writings={writings}
              myWriting={myWriting}
              userId={userId}
              userRole={userRole}
              participantCount={participants.length}
              isSidebarOpen={sidebarState}
              onToggleSidebar={() => {
                if (sidebarState === null) {
                  // First toggle: on xl+ panel is visible so hide it, on mobile it's hidden so show it
                  const isXl = window.matchMedia("(min-width: 1280px)").matches;
                  setSidebarState(isXl ? false : true);
                } else {
                  setSidebarState(null); // Reset to CSS-responsive default
                }
              }}
              onSaveWriting={onSaveWriting}
              onToggleWritingVisibility={onToggleWritingVisibility}
              onToggleRoomPublicWriting={onToggleRoomPublicWriting}
              onCloseMaterial={handleCloseMaterial}
              onCloseExercise={handleCloseExercise}
            />
          </div>
        </div>
      </div>

      <AlertDialog
        open={dialogState.isOpen}
        onClose={onCloseDialog}
        title={dialogState.title}
        message={dialogState.message}
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
    </div>
  );
}
