/**
 * Playground Service - Main Entry Point
 * Database abstraction layer for Playground features
 * Supports both Firestore (current) and Turso (future migration)
 *
 * This module re-exports all playground service functions from their
 * respective focused modules for backward compatibility.
 */

// Room management
export {
  endAllHostRooms,
  createPlaygroundRoom,
  endPlaygroundRoom,
  togglePublicWriting,
  setCurrentMaterial,
  setCurrentExercise,
  getPlaygroundRoom,
  getActiveRooms,
  getRoomHistory,
} from './rooms';

// Participant management
export {
  cleanupOldParticipants,
  joinPlaygroundRoom,
  leavePlaygroundRoom,
  updateParticipantVoiceStatus,
  updateParticipantPeerId,
  getRoomParticipants,
} from './participants';

// Writing management
export {
  savePlaygroundWriting,
  updateWritingContent,
  toggleWritingVisibility,
  getRoomWritings,
} from './writings';

// Message/chat management
export {
  sendPlaygroundMessage,
  getRoomMessages,
} from './messages';

// Real-time subscriptions
export {
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToWritings,
  subscribeToMessages,
} from './subscriptions';
