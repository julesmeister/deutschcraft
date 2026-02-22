/**
 * WidgetRenderer
 * Maps WidgetId to actual component, consuming context for props
 */

"use client";

import { VideoPanel } from "@/components/playground/VideoPanel";
import { ParticipantsList } from "@/components/playground/ParticipantsList";
import { ClassroomTools } from "@/components/playground/ClassroomTools";
import { WritingBoard } from "@/components/playground/WritingBoard";
import { ExerciseViewer } from "@/components/playground/ExerciseViewer";
import { PDFViewer } from "@/components/playground/PDFViewer";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { useWidgetContext } from "./PlaygroundWidgetContext";
import type { WidgetId } from "./types";

/** Check if a widget would render content (vs null) */
export function useIsWidgetActive(widgetId: WidgetId): boolean {
  const ctx = useWidgetContext();
  switch (widgetId) {
    case "material-viewer":
      return !!(ctx.currentRoom.currentMaterialUrl && ctx.currentRoom.currentMaterialTitle);
    case "exercise-viewer":
      return !!ctx.currentRoom.currentExerciseId;
    default:
      return true;
  }
}

interface WidgetRendererProps {
  widgetId: WidgetId;
}

export function WidgetRenderer({ widgetId }: WidgetRendererProps) {
  const ctx = useWidgetContext();

  switch (widgetId) {
    case "video-panel":
      return (
        <VideoPanel
          isVoiceActive={ctx.isVoiceActive}
          isVideoActive={ctx.isVideoActive}
          isMuted={ctx.isMuted}
          localStream={ctx.localStream}
          participants={ctx.mediaParticipants}
          videoStreams={ctx.videoStreams}
          audioStreams={ctx.audioStreams}
          audioAnalysers={ctx.audioAnalysers}
          audioControl={ctx.audioControl}
          currentUserId={ctx.userId}
          currentUserName={ctx.userName}
          hostId={ctx.currentRoom.hostId}
          layout={ctx.videoLayout}
          onStartVoice={ctx.onStartVoice}
          onStartVideo={ctx.onStartVideo}
          onStopVoice={ctx.onStopVoice}
          onToggleMute={ctx.onToggleMute}
          onToggleVideo={ctx.onToggleVideo}
          onLayoutChange={ctx.onSetVideoLayout}
        />
      );

    case "participants":
      return (
        <div className="bg-white rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900">Participants</h3>
            <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-pastel-ocean/15 text-pastel-ocean text-xs font-bold">
              {ctx.participants.length}
            </span>
          </div>
          <ParticipantsList
            participants={ctx.participants}
            audioStreams={ctx.audioStreams}
            audioAnalysers={ctx.audioAnalysers}
            audioControl={ctx.audioControl}
            userRole={ctx.userRole}
            userId={ctx.userId}
          />
        </div>
      );

    case "classroom-tools":
      return (
        <div className="bg-white rounded-3xl p-5">
        <ClassroomTools
          participants={ctx.participants}
          audioControl={ctx.audioControl}
          currentUserId={ctx.userId}
          userRole={ctx.userRole}
          roomId={ctx.currentRoom.roomId}
          onIsolationChange={ctx.onIsolationChange}
        />
        </div>
      );

    case "material-viewer": {
      const room = ctx.currentRoom;
      if (!room.currentMaterialUrl || !room.currentMaterialTitle) return null;
      return (
        <div className={room.currentMaterialType === "audio" ? "rounded-3xl overflow-hidden" : "h-[600px] rounded-3xl overflow-hidden"}>
          {room.currentMaterialType === "audio" ? (
            <AudioPlayer
              materialTitle={room.currentMaterialTitle}
              materialUrl={room.currentMaterialUrl}
              audioId={room.currentMaterialId || undefined}
              onClose={ctx.userRole === "teacher" ? ctx.onCloseMaterial : undefined}
              showCloseButton={ctx.userRole === "teacher"}
            />
          ) : (
            <PDFViewer
              materialTitle={room.currentMaterialTitle}
              materialUrl={room.currentMaterialUrl}
              onClose={ctx.userRole === "teacher" ? ctx.onCloseMaterial : undefined}
              showCloseButton={ctx.userRole === "teacher"}
              currentPage={room.currentMaterialPage}
              onPageChange={ctx.onSetMaterialPage}
            />
          )}
        </div>
      );
    }

    case "exercise-viewer": {
      const room = ctx.currentRoom;
      if (!room.currentExerciseId) return null;
      return (
        <ExerciseViewer
          exerciseId={room.currentExerciseId}
          exerciseNumber={room.currentExerciseNumber || ""}
          level={room.currentExerciseLevel || "B1"}
          lessonNumber={room.currentExerciseLessonNumber || 1}
          bookType={room.currentExerciseBookType || "AB"}
          onClose={ctx.userRole === "teacher" ? ctx.onCloseExercise : undefined}
          showCloseButton={ctx.userRole === "teacher"}
        />
      );
    }

    case "writing-board":
      return (
        <WritingBoard
          writings={ctx.writings}
          currentUserId={ctx.userId}
          currentUserRole={ctx.userRole}
          myWriting={ctx.myWriting}
          isRoomPublicWriting={ctx.currentRoom.isPublicWriting}
          hostId={ctx.currentRoom.hostId}
          onSaveWriting={ctx.onSaveWriting}
          onToggleWritingVisibility={ctx.onToggleWritingVisibility}
          onToggleRoomPublicWriting={
            ctx.userRole === "teacher" ? ctx.onToggleRoomPublicWriting : undefined
          }
        />
      );

    default:
      return null;
  }
}
