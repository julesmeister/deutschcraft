/**
 * PeerJS Configuration
 * Setup for peer-to-peer voice communication
 */

import type { PeerOptions } from 'peerjs';

// PeerJS server configuration
// Using PeerJS Cloud (0.peerjs.com) - official free server
export const PEER_CONFIG: PeerOptions = {
  // Official PeerJS Cloud server
  host: '0.peerjs.com',
  port: 443,
  path: '/',
  secure: true,

  // Alternative: Run your own PeerServer locally for development
  // npm install -g peer
  // peerjs --port 9000 --path /myapp
  // Then use:
  // host: 'localhost',
  // port: 9000,
  // path: '/myapp',
  // secure: false,

  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
    ],
    // Ensure we're using the standard WebRTC API
    sdpSemantics: 'unified-plan',
  },

  debug: process.env.NODE_ENV === 'development' ? 1 : 0, // Reduced debug level
};

// Generate a unique peer ID for user
// PeerJS requires alphanumeric IDs starting with a letter (no special chars like @ or .)
// Uses a short random suffix to avoid collisions from stale connections
export function generatePeerId(userId: string, roomId: string): string {
  // Sanitize userId by removing special characters
  const sanitizedUserId = userId
    .replace(/[^a-zA-Z0-9]/g, '') // Remove all non-alphanumeric chars
    .toLowerCase()
    .substring(0, 20); // Limit length

  const sanitizedRoomId = roomId
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .substring(0, 20);

  // Add a short random suffix to prevent collisions from stale peer connections
  // Using 4 random chars gives 1.6 million combinations (36^4)
  const randomSuffix = Math.random().toString(36).substring(2, 6);

  // Ensure ID starts with a letter (PeerJS requirement)
  const prefix = 'peer';

  // Build ID with random suffix to avoid "ID taken" errors
  const parts = [prefix, sanitizedRoomId, sanitizedUserId, randomSuffix].filter(p => p);

  return parts.join('-');
}

// Media constraints for audio
export const AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: false,
};
