/**
 * WebRTC Audio & Video Types
 * Type definitions for voice and video chat functionality
 */

export interface AudioParticipant {
  userId: string;
  userName: string;
  isMuted: boolean;
  audioLevel: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface MediaParticipant extends AudioParticipant {
  isVideoEnabled: boolean;
}

export interface UseWebRTCAudioOptions {
  roomId: string;
  userId: string;
  userName: string;
  onError?: (error: Error) => void;
}

export interface UseWebRTCMediaOptions extends UseWebRTCAudioOptions {
  enableVideo?: boolean;
}

export interface PeerConnection {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
  retryCount: number;
  lastRetry: number;
}

export const MAX_RETRIES = 3;
export const RETRY_DELAY = 2000;
