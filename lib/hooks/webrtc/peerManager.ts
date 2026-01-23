/**
 * WebRTC Peer Connection Manager
 * Handles creation and management of RTCPeerConnections
 */

import { ICE_SERVERS } from './config';
import { sendIceCandidate } from './firebaseSignaling';

export interface PeerConnection {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
  audioElement?: HTMLAudioElement;
  videoElement?: HTMLVideoElement;
  gainNode?: GainNode;
  source?: MediaStreamAudioSourceNode;
  analyser?: AnalyserNode;
}

interface CreatePeerOptions {
  roomId: string;
  userId: string;
  remoteUserId: string;
  localStream: MediaStream | null;
  audioContext: AudioContext | null;
  onTrackReceived: (remoteUserId: string, stream: MediaStream, hasAudio: boolean, hasVideo: boolean) => void;
  onConnectionStateChange: (remoteUserId: string, state: RTCPeerConnectionState) => void;
  onNegotiationNeeded?: (remoteUserId: string, offer: RTCSessionDescriptionInit) => void;
}

export function createPeerConnection({
  roomId,
  userId,
  remoteUserId,
  localStream,
  audioContext,
  onTrackReceived,
  onConnectionStateChange,
  onNegotiationNeeded,
}: CreatePeerOptions): RTCPeerConnection {
  console.log('[WebRTC Peer] Creating peer connection for:', remoteUserId);

  const pc = new RTCPeerConnection({
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10,
  });

  // Add local stream tracks
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
  }

  // Handle ICE candidates
  pc.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log('[WebRTC Peer] Sending ICE candidate to:', remoteUserId);
      await sendIceCandidate(roomId, userId, remoteUserId, event.candidate.toJSON());
    }
  };

  // Handle incoming stream
  pc.ontrack = (event) => {
    console.log('[WebRTC Peer] 🎵 Received track from:', remoteUserId, 'kind:', event.track.kind);
    const [remoteStream] = event.streams;

    if (remoteStream) {
      const hasVideo = remoteStream.getVideoTracks().length > 0;
      const hasAudio = remoteStream.getAudioTracks().length > 0;
      onTrackReceived(remoteUserId, remoteStream, hasAudio, hasVideo);
    }
  };

  // Handle connection state
  pc.onconnectionstatechange = () => {
    console.log('[WebRTC Peer] Connection state with', remoteUserId, ':', pc.connectionState);
    onConnectionStateChange(remoteUserId, pc.connectionState);
  };

  // Handle ICE connection state
  pc.oniceconnectionstatechange = () => {
    console.log('[WebRTC Peer] 🧊 ICE state with', remoteUserId, ':', pc.iceConnectionState);
  };

  // Handle renegotiation (fires when tracks are added/removed after connection)
  let isNegotiating = false;
  pc.onnegotiationneeded = async () => {
    if (isNegotiating) return;

    // Only renegotiate when in stable state (not during initial offer/answer)
    if (pc.signalingState !== 'stable') {
      console.log('[WebRTC Peer] Skipping negotiation - state:', pc.signalingState);
      return;
    }

    isNegotiating = true;

    try {
      console.log('[WebRTC Peer] 🔄 Negotiation needed with:', remoteUserId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (onNegotiationNeeded) {
        onNegotiationNeeded(remoteUserId, offer);
      }
    } catch (error) {
      console.error('[WebRTC Peer] Renegotiation failed:', error);
    } finally {
      isNegotiating = false;
    }
  };

  return pc;
}

export function setupAudioPlayback(
  remoteStream: MediaStream,
  audioContext: AudioContext | null
): {
  audioElement: HTMLAudioElement;
  source?: MediaStreamAudioSourceNode;
  analyser?: AnalyserNode;
  gainNode?: GainNode;
} {
  // Method 1: HTML Audio Element
  const audio = new Audio();
  audio.srcObject = remoteStream;
  audio.autoplay = true;
  audio.volume = 1.0;
  audio.play().catch((err) => {
    console.error('[WebRTC Peer] Audio element failed:', err);
  });

  let source: MediaStreamAudioSourceNode | undefined;
  let analyser: AnalyserNode | undefined;
  let gainNode: GainNode | undefined;

  // Method 2: Web Audio API (more reliable + analyser for speaking detection)
  try {
    if (audioContext) {
      source = audioContext.createMediaStreamSource(remoteStream);
      analyser = audioContext.createAnalyser();
      gainNode = audioContext.createGain();

      // Configure analyser for speech detection
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      gainNode.gain.value = 1.0;

      // Connect audio graph: source -> analyser -> gain -> destination (speakers)
      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);

      console.log('[WebRTC Peer] ✅ Web Audio API with analyser connected');
    }
  } catch (audioApiError) {
    console.error('[WebRTC Peer] Web Audio API setup failed:', audioApiError);
  }

  return { audioElement: audio, source, analyser, gainNode };
}

export function cleanupPeerConnection(peer: PeerConnection) {
  peer.pc.close();

  if (peer.stream) {
    peer.stream.getTracks().forEach((track) => track.stop());
  }

  if (peer.audioElement) {
    peer.audioElement.pause();
    peer.audioElement.srcObject = null;
  }

  if (peer.videoElement) {
    peer.videoElement.pause();
    peer.videoElement.srcObject = null;
  }

  if (peer.source) {
    peer.source.disconnect();
  }

  if (peer.gainNode) {
    peer.gainNode.disconnect();
  }
}
