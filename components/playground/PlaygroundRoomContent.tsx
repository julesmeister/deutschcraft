/**
 * Playground Room Content Panel
 * Right side content: Material viewer, Exercise viewer, or Writing board
 */

"use client";

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
  onSaveWriting,
  onToggleWritingVisibility,
  onToggleRoomPublicWriting,
  onCloseMaterial,
  onCloseExercise,
}: PlaygroundRoomContentProps) {
  // Debug log to help diagnose sync issues
  if (process.env.NODE_ENV === 'development') {
    console.log('[PlaygroundRoomContent] currentExerciseId:', currentRoom.currentExerciseId);
  }

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

      {/* Exercise Viewer (shown when exercise is selected, replaces Writing Board) */}
      {currentRoom.currentExerciseId ? (
        <ExerciseViewer
          exerciseId={currentRoom.currentExerciseId}
          exerciseNumber={currentRoom.currentExerciseNumber || ""}
          level={currentRoom.currentExerciseLevel || "B1"}
          lessonNumber={currentRoom.currentExerciseLessonNumber || 1}
          bookType={currentRoom.currentExerciseBookType || "AB"}
          onClose={userRole === "teacher" ? onCloseExercise : undefined}
          showCloseButton={userRole === "teacher"}
        />
      ) : (
        /* Writing Board (shown when no exercise is selected) */
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
