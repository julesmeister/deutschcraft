/**
 * Playground Models
 * Data structures for collaborative voice + writing playground
 */

export interface PlaygroundRoom {
  roomId: string;
  title: string;
  hostId: string; // Teacher who created the room
  hostName: string;
  status: 'active' | 'ended';
  createdAt: Date;
  endedAt?: Date;
  participantCount: number;
  maxParticipants?: number;
  isPublicWriting: boolean; // If true, all students can see each other's writing
  currentMaterialId?: string; // Material being displayed in the room
  currentMaterialTitle?: string;
  currentMaterialUrl?: string;
  currentMaterialType?: 'pdf' | 'audio'; // Type of material currently displayed
  currentMaterialPage?: number; // Synced PDF page (teacher controls)
  currentExerciseId?: string; // Exercise being displayed in the room
  currentExerciseNumber?: string; // Exercise number for display
  currentExerciseLevel?: string; // Level (B1, A2, etc.)
  currentExerciseLessonNumber?: number; // Lesson number
  currentExerciseBookType?: 'AB' | 'KB'; // Arbeitsbuch or Kursbuch
  videoLayout?: 'teacher' | 'gallery' | 'top-left' | 'top-right'; // Synced video layout (teacher controls)
  level?: string; // CEFR level (A1, A2, B1, B2) — determines shared notebook
  currentNotebookPageId?: string; // Synced notebook page (teacher controls navigation)
}

export interface PlaygroundParticipant {
  participantId: string;
  roomId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'teacher' | 'student';
  joinedAt: Date;
  leftAt?: Date;
  isVoiceActive: boolean;
  isMuted: boolean;
  peerId?: string; // PeerJS peer ID for voice connection
}

export interface PlaygroundWriting {
  writingId: string;
  roomId: string;
  userId: string;
  userName: string;
  content: string;
  isPublic: boolean; // Teacher can make specific student's work public
  lastUpdatedAt: Date;
  createdAt: Date;
  wordCount: number;
}

export interface PlaygroundMessage {
  messageId: string;
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system'; // system = "User joined", "User left", etc.
}

// Real-time presence tracking
export interface PlaygroundPresence {
  userId: string;
  userName: string;
  role: 'teacher' | 'student';
  peerId?: string;
  isVoiceActive: boolean;
  isMuted: boolean;
  lastSeen: Date;
}

// Aggregated room state for UI
export interface PlaygroundRoomState {
  room: PlaygroundRoom;
  participants: PlaygroundParticipant[];
  writings: PlaygroundWriting[];
  messages: PlaygroundMessage[];
  presence: Record<string, PlaygroundPresence>; // userId -> presence
}
