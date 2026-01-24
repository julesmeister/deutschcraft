/**
 * WebRTC Configuration
 * ICE servers and connection settings
 */

// Build TURN server URLs from env vars (supports UDP, TCP, and TLS transports)
function getTurnServers(): RTCIceServer[] {
  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  const username = process.env.NEXT_PUBLIC_TURN_USERNAME || '';
  const credential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || '';

  if (!turnUrl) return [];

  // Extract host:port from the TURN URL (e.g., "turn:host:3478" → "host:3478")
  const hostPort = turnUrl.replace(/^turns?:/, '');

  return [{
    urls: [
      `turn:${hostPort}`,              // UDP (default)
      `turn:${hostPort}?transport=tcp`, // TCP fallback (for UDP-blocking firewalls)
    ],
    username,
    credential,
  }];
}

// ICE servers for NAT/firewall traversal
export const ICE_SERVERS: RTCIceServer[] = [
  // Google STUN servers (max 2 to avoid slow discovery)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TURN server (configured via environment variables)
  ...getTurnServers(),
];

