/**
 * WebRTC Configuration
 * ICE servers and connection settings
 */

// ICE servers for NAT/firewall traversal
export const ICE_SERVERS = [
  // Google STUN servers
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // Twilio STUN
  { urls: 'stun:global.stun.twilio.com:3478' },
  // OpenRelay TURN servers (public, no auth needed)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

// Sanitize userId for Firebase paths (remove invalid characters)
export function sanitizeUserId(id: string): string {
  return id.replace(/[.#$[\]@]/g, '_');
}
