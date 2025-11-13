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
