/**
 * PlaygroundWidgetContext
 * Passes all widget props from PlaygroundRoom down to WidgetRenderer
 * without prop-drilling through the layout abstraction layer
 */

"use client";

import { createContext, useContext } from "react";
import type { VideoLayout } from "@/components/playground/VideoPanel";
import type { AudioControlState, GroupIsolationState } from "@/components/playground/audioTypes";
import type {
  PlaygroundRoom,
  PlaygroundParticipant,
  PlaygroundWriting,
} from "@/lib/models/playground";

interface MediaParticipant {
  userId: string;
  userName: string;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
}

export interface WidgetContextValue {
  // Room data
  currentRoom: PlaygroundRoom;
  participants: PlaygroundParticipant[];
  writings: PlaygroundWriting[];
  myWriting?: PlaygroundWriting;
  userId: string;
  userName: string;
  userRole: "teacher" | "student";

  // Voice/Video
  isVoiceActive: boolean;
  isVideoActive: boolean;
  isMuted: boolean;
  localStream: MediaStream | null;
  mediaParticipants: MediaParticipant[];
  audioStreams: Map<string, MediaStream>;
  videoStreams: Map<string, MediaStream>;
  audioAnalysers: Map<string, AnalyserNode>;
  audioControl: AudioControlState;
  videoLayout: VideoLayout;
  onSetVideoLayout?: (layout: VideoLayout) => void;

  // Voice/Video controls
  onStartVoice: () => Promise<void>;
  onStartVideo: () => Promise<void>;
  onStopVoice: () => Promise<void>;
  onToggleMute: () => Promise<void>;
  onToggleVideo: () => Promise<void>;

  // Writing
  onSaveWriting: (content: string) => Promise<void>;
  onToggleWritingVisibility: (writingId: string, isPublic: boolean) => Promise<void>;
  onToggleRoomPublicWriting?: (isPublic: boolean) => Promise<void>;

  // Material/Exercise
  onCloseMaterial?: () => Promise<void>;
  onCloseExercise?: () => Promise<void>;
  onSetMaterialPage?: (page: number) => Promise<void>;

  // Notebook
  onSetNotebookPage?: (pageId: string) => Promise<void>;
  onSignalNotebookUpdate?: () => Promise<void>;

  // Isolation
  onIsolationChange: (state: GroupIsolationState) => void;
}

const PlaygroundWidgetContext = createContext<WidgetContextValue | null>(null);

export function PlaygroundWidgetProvider({
  value,
  children,
}: {
  value: WidgetContextValue;
  children: React.ReactNode;
}) {
  return (
    <PlaygroundWidgetContext.Provider value={value}>
      {children}
    </PlaygroundWidgetContext.Provider>
  );
}

export function useWidgetContext(): WidgetContextValue {
  const ctx = useContext(PlaygroundWidgetContext);
  if (!ctx) throw new Error("useWidgetContext must be used within PlaygroundWidgetProvider");
  return ctx;
}

/** Optional variant — returns null when outside PlaygroundWidgetProvider (for standalone usage) */
export function useOptionalWidgetContext(): WidgetContextValue | null {
  return useContext(PlaygroundWidgetContext);
}
