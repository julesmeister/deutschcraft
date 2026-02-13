/**
 * Playground Room Content Panel
 * Right side content: Material viewer, Exercise viewer, or Writing board
 * Students can toggle between exercise and writing board when exercise is active
 */

"use client";

import { useState } from "react";
import { WritingBoard } from "@/components/playground/WritingBoard";
import { ExerciseViewer } from "@/components/playground/ExerciseViewer";
import { PDFViewer } from "@/components/playground/PDFViewer";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import type {
  PlaygroundRoom,
  PlaygroundWriting,
} from "@/lib/models/playground";

interface PlaygroundRoomContentProps {
  currentRoom: PlaygroundRoom;
  writings: PlaygroundWriting[];
  myWriting?: PlaygroundWriting;
  userId: string;
  userRole: "teacher" | "student";
  participantCount: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSaveWriting: (content: string) => Promise<void>;
  onToggleWritingVisibility: (writingId: string, isPublic: boolean) => Promise<void>;
  onToggleRoomPublicWriting?: (isPublic: boolean) => Promise<void>;
  onCloseMaterial?: () => Promise<void>;
  onCloseExercise?: () => Promise<void>;
}

export function PlaygroundRoomContent({
  currentRoom,
  writings,
  myWriting,
  userId,
  userRole,
  participantCount,
  isSidebarOpen,
  onToggleSidebar,
  onSaveWriting,
  onToggleWritingVisibility,
  onToggleRoomPublicWriting,
  onCloseMaterial,
  onCloseExercise,
}: PlaygroundRoomContentProps) {
  // Local view state - allows switching between exercise and writing board
  const [activeView, setActiveView] = useState<"exercise" | "writing">("exercise");

  const hasExercise = !!currentRoom.currentExerciseId;

  // When sidebar is toggled open on tablet, close the active content view indicator
  // so the sidebar takes visual priority
  const showPanel = isSidebarOpen;

  return (
    <>
      {/* Material Viewer (PDF or Audio - shown when material is selected) */}
      {currentRoom.currentMaterialUrl && currentRoom.currentMaterialTitle && (
        <div className={currentRoom.currentMaterialType === "audio" ? "" : "h-[600px]"}>
          {currentRoom.currentMaterialType === "audio" ? (
            <AudioPlayer
              materialTitle={currentRoom.currentMaterialTitle}
              materialUrl={currentRoom.currentMaterialUrl}
              audioId={currentRoom.currentMaterialId || undefined}
              onClose={userRole === "teacher" ? onCloseMaterial : undefined}
              showCloseButton={userRole === "teacher"}
            />
          ) : (
            <PDFViewer
              materialTitle={currentRoom.currentMaterialTitle}
              materialUrl={currentRoom.currentMaterialUrl}
              onClose={userRole === "teacher" ? onCloseMaterial : undefined}
              showCloseButton={userRole === "teacher"}
            />
          )}
        </div>
      )}

      {/* View Toggle Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg mb-4">
        {/* Panel tab - only visible below xl */}
        <button
          onClick={onToggleSidebar}
          className={`xl:hidden flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            showPanel
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Panel
          <span className="text-[10px] text-gray-400 bg-gray-200 rounded-full px-1.5 py-0.5 leading-none">
            {participantCount}
          </span>
        </button>

        {hasExercise && (
          <button
            onClick={() => { setActiveView("exercise"); if (isSidebarOpen) onToggleSidebar(); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              !showPanel && activeView === "exercise"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Exercise
          </button>
        )}
        <button
          onClick={() => { setActiveView("writing"); if (isSidebarOpen) onToggleSidebar(); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            !showPanel && (activeView === "writing" || !hasExercise)
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Writing Board
        </button>
      </div>

      {/* Content Area */}
      {hasExercise && activeView === "exercise" ? (
        <ExerciseViewer
          exerciseId={currentRoom.currentExerciseId!}
          exerciseNumber={currentRoom.currentExerciseNumber || ""}
          level={currentRoom.currentExerciseLevel || "B1"}
          lessonNumber={currentRoom.currentExerciseLessonNumber || 1}
          bookType={currentRoom.currentExerciseBookType || "AB"}
          onClose={userRole === "teacher" ? onCloseExercise : undefined}
          showCloseButton={userRole === "teacher"}
        />
      ) : (
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
      )}
    </>
  );
}
