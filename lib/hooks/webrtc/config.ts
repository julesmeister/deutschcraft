/**
 * WebRTC Configuration
 * ICE servers and connection settings
 */

// ICE servers for NAT/firewall traversal
// Note: For cross-network calls (users behind symmetric NATs), a TURN server is required.
// Set NEXT_PUBLIC_TURN_URL, NEXT_PUBLIC_TURN_USERNAME, NEXT_PUBLIC_TURN_CREDENTIAL
// environment variables to enable TURN relay.
export const ICE_SERVERS: RTCIceServer[] = [
  // Google STUN servers (max 2 to avoid slow discovery)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TURN server (configured via environment variables)
  ...(process.env.NEXT_PUBLIC_TURN_URL
    ? [{
        urls: process.env.NEXT_PUBLIC_TURN_URL,
        username: process.env.NEXT_PUBLIC_TURN_USERNAME || '',
        credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || '',
      }]
    : []),
];

// Sanitize userId for Firebase paths (remove invalid characters)
export function sanitizeUserId(id: string): string {
  return id.replace(/[.#$[\]@]/g, '_');
}
