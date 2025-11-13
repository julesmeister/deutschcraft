/**
 * WebRTC Audio Types
 * Type definitions for voice chat functionality
 */

export interface AudioParticipant {
  userId: string;
  userName: string;
  isMuted: boolean;
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface UseWebRTCAudioOptions {
  roomId: string;
  userId: string;
  userName: string;
  onError?: (error: Error) => void;
}

export interface PeerConnection {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
  retryCount: number;
  lastRetry: number;
}

export const MAX_RETRIES = 3;
export const RETRY_DELAY = 2000;
