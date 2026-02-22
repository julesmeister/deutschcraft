/**
 * WidgetRenderer
 * Maps WidgetId to actual component, consuming context for props
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { VideoPanel } from "@/components/playground/VideoPanel";
import { ParticipantsList } from "@/components/playground/ParticipantsList";
import { ClassroomTools } from "@/components/playground/ClassroomTools";
import { WritingBoard } from "@/components/playground/WritingBoard";
import { ExerciseViewer } from "@/components/playground/ExerciseViewer";
import { PDFViewer } from "@/components/playground/PDFViewer";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { NotebookWidget } from "@/components/playground/notebook/NotebookWidget";
import { useWidgetContext } from "./PlaygroundWidgetContext";
import type { WidgetId } from "./types";

/** Resizable wrapper with a drag handle at the bottom */
function ResizablePanel({ children, initialHeight = 600 }: { children: React.ReactNode; initialHeight?: number }) {
  const [height, setHeight] = useState(initialHeight);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startH.current = height;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [height]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = e.clientY - startY.current;
    setHeight(Math.max(300, Math.min(1200, startH.current + delta)));
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div className="rounded-3xl overflow-hidden" style={{ height }}>
      {children}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="h-3 bg-transparent hover:bg-gray-300/40 cursor-ns-resize flex items-center justify-center transition-colors -mt-3 relative z-10"
      >
        <div className="w-10 h-1 bg-gray-300/0 hover:bg-gray-400/60 rounded-full transition-colors" />
      </div>
    </div>
  );
}

/** Check if a widget would render content (vs null) */
export function useIsWidgetActive(widgetId: WidgetId): boolean {
  const ctx = useWidgetContext();
  switch (widgetId) {
    case "material-viewer":
      return !!(ctx.currentRoom.currentMaterialUrl && ctx.currentRoom.currentMaterialTitle);
    case "exercise-viewer":
      return !!ctx.currentRoom.currentExerciseId;
    case "notebook":
      return !!ctx.currentRoom.level;
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
          onLayoutChange={ctx.onSetVideoLayout || undefined}
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
      if (room.currentMaterialType === "audio") {
        return (
          <div className="rounded-3xl overflow-hidden">
            <AudioPlayer
              materialTitle={room.currentMaterialTitle}
              materialUrl={room.currentMaterialUrl}
              audioId={room.currentMaterialId || undefined}
              onClose={ctx.userRole === "teacher" ? ctx.onCloseMaterial : undefined}
              showCloseButton={ctx.userRole === "teacher"}
            />
          </div>
        );
      }
      return (
        <ResizablePanel>
          <PDFViewer
            materialTitle={room.currentMaterialTitle}
            materialUrl={room.currentMaterialUrl}
            onClose={ctx.userRole === "teacher" ? ctx.onCloseMaterial : undefined}
            showCloseButton={ctx.userRole === "teacher"}
            currentPage={room.currentMaterialPage}
            onPageChange={ctx.onSetMaterialPage}
          />
        </ResizablePanel>
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
        <ResizablePanel initialHeight={500}>
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
        </ResizablePanel>
      );

    case "notebook": {
      if (!ctx.currentRoom.level) return null;
      return (
        <ResizablePanel initialHeight={500}>
          <NotebookWidget />
        </ResizablePanel>
      );
    }

    default:
      return null;
  }
}
