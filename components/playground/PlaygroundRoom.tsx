/**
 * PlaygroundRoom Component
 * Active room view with voice chat and writing board
 */

"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { AlertDialog } from "@/components/ui/Dialog";
import {
  VideoPanel,
  type VideoLayout,
} from "@/components/playground/VideoPanel";
import { HorizontalVideoStrip } from "@/components/playground/HorizontalVideoStrip";
import { WritingBoard } from "@/components/playground/WritingBoard";
import { ParticipantsList } from "@/components/playground/ParticipantsList";
import { FloatingRedemittelWidget } from "@/components/writing/FloatingRedemittelWidget";
import { MaterialSelector } from "@/components/playground/MaterialSelector";
import { PDFViewer } from "@/components/playground/PDFViewer";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
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

  // Media chat state
  isVoiceActive: boolean;
  isVideoActive: boolean;
  isMuted: boolean;
  localStream: MediaStream | null;
  mediaParticipants: MediaParticipant[];
  audioStreams: Map<string, MediaStream>;
  videoStreams: Map<string, MediaStream>;
  audioAnalysers: Map<string, AnalyserNode>;
  audioElements: Map<string, HTMLAudioElement>;

  // Dialog state
  dialogState: {
    isOpen: boolean;
    title: string;
    message: string;
  };

  // Handlers
  onLeaveRoom: () => Promise<void>;
  onEndRoom: () => Promise<void>;
  onStartVoice: () => Promise<void>;
  onStartVideo: () => Promise<void>;
  onStopVoice: () => Promise<void>;
  onToggleMute: () => Promise<void>;
  onToggleVideo: () => Promise<void>;
  onSaveWriting: (content: string) => Promise<void>;
  onToggleWritingVisibility: (
    writingId: string,
    isPublic: boolean
  ) => Promise<void>;
  onToggleRoomPublicWriting?: (isPublic: boolean) => Promise<void>;
  onSetCurrentMaterial?: (
    materialId: string | null,
    materialTitle: string | null,
    materialUrl: string | null,
    materialType?: "pdf" | "audio" | null
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
  onMinimize,
  onCloseDialog,
}: PlaygroundRoomProps) {
  // Only the host (room creator) can end the room
  const isHost = userId === currentRoom.hostId;

  // Video layout state
  const [videoLayout, setVideoLayout] = useState<VideoLayout>("teacher");
  const [duration, setDuration] = useState<string>("00:00");
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isMaterialSelectorOpen, setIsMaterialSelectorOpen] = useState(false);

  useEffect(() => {
    if (!currentRoom?.createdAt) return;

    // Convert to Date object if it's not already
    const startTime =
      currentRoom.createdAt instanceof Date
        ? currentRoom.createdAt
        : new Date(currentRoom.createdAt);

    // Format date: e.g. "Oct 24, 2024"
    setFormattedDate(
      startTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );

    const updateDuration = () => {
      setDuration(formatDuration(startTime));
    };

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
    if (onSetCurrentMaterial) {
      await onSetCurrentMaterial(null, null, null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={currentRoom.title}
        subtitle={`${formattedDate} • ${participants.length} ${
          participants.length === 1 ? "participant" : "participants"
        } • Host: ${currentRoom.hostName} • ${duration}`}
        backButton={{
          label: "Leave Room",
          onClick: onLeaveRoom,
        }}
        actions={
          <div className="flex items-center gap-2">
            {userRole === "teacher" && onSetCurrentMaterial && (
              <ActionButton
                onClick={() => setIsMaterialSelectorOpen(true)}
                variant="cyan"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              >
                Materials
              </ActionButton>
            )}
            {onMinimize && (
              <ActionButton
                onClick={onMinimize}
                variant="gray"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                }
              >
                Minimize
              </ActionButton>
            )}
            {isHost && (
              <ActionButton
                onClick={onEndRoom}
                variant="red"
                icon={<ActionButtonIcons.Close />}
              >
                End
              </ActionButton>
            )}
          </div>
        }
      />

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Video Panel */}
          <div className="lg:col-span-1">
            {/* Horizontal Video Strip on Top (if top-left layout) */}
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

            {/* Participants List */}
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
          </div>

          {/* Right: Writing Board and PDF Viewer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Horizontal Video Strip on Top (if top-right layout) */}
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

            {/* Material Viewer (PDF or Audio - shown when material is selected) */}
            {currentRoom.currentMaterialUrl && currentRoom.currentMaterialTitle && (
              <div className={currentRoom.currentMaterialType === "audio" ? "" : "h-[600px]"}>
                {currentRoom.currentMaterialType === "audio" ? (
                  <AudioPlayer
                    materialTitle={currentRoom.currentMaterialTitle}
                    materialUrl={currentRoom.currentMaterialUrl}
                    audioId={currentRoom.currentMaterialId || undefined}
                    onClose={userRole === "teacher" ? handleCloseMaterial : undefined}
                    showCloseButton={userRole === "teacher"}
                  />
                ) : (
                  <PDFViewer
                    materialTitle={currentRoom.currentMaterialTitle}
                    materialUrl={currentRoom.currentMaterialUrl}
                    onClose={userRole === "teacher" ? handleCloseMaterial : undefined}
                    showCloseButton={userRole === "teacher"}
                  />
                )}
              </div>
            )}

            {/* Writing Board */}
            <WritingBoard
              writings={writings}
              currentUserId={userId}
              currentUserRole={userRole}
              myWriting={myWriting}
              isRoomPublicWriting={currentRoom.isPublicWriting}
              hostId={currentRoom.hostId}
              onSaveWriting={onSaveWriting}
              onToggleWritingVisibility={onToggleWritingVisibility}
              onToggleRoomPublicWriting={
                userRole === "teacher" ? onToggleRoomPublicWriting : undefined
              }
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

      {/* Floating Redemittel Widget */}
      <FloatingRedemittelWidget />

      {/* Material Selector (Teacher Only) */}
      {userRole === "teacher" && onSetCurrentMaterial && (
        <MaterialSelector
          isOpen={isMaterialSelectorOpen}
          onClose={() => setIsMaterialSelectorOpen(false)}
          onSelectMaterial={handleSelectMaterial}
          currentMaterialId={currentRoom.currentMaterialId}
        />
      )}
    </div>
  );
}
