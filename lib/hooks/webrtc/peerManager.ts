/**
 * WebRTC Peer Connection Manager
 * Handles creation and management of RTCPeerConnections with separate audio/video streams
 */

import { ICE_SERVERS } from './config';

export interface PeerConnection {
  pc: RTCPeerConnection;
  audioStream: MediaStream | null;
  videoStream: MediaStream | null;
  audioElement?: HTMLAudioElement;
  gainNode?: GainNode;
  source?: MediaStreamAudioSourceNode;
  analyser?: AnalyserNode;
}

interface CreatePeerOptions {
  remoteUserId: string;
  localAudioStream: MediaStream | null;
  localVideoStream: MediaStream | null;
  audioContext: AudioContext | null;
  onAudioTrack: (remoteUserId: string, stream: MediaStream) => void;
  onVideoTrack: (remoteUserId: string, stream: MediaStream) => void;
  onConnectionStateChange: (remoteUserId: string, state: RTCPeerConnectionState) => void;
  onIceCandidate: (remoteUserId: string, candidate: RTCIceCandidateInit) => void;
  onNegotiationNeeded: (remoteUserId: string, offer: RTCSessionDescriptionInit) => void;
}

export function createPeerConnection({
  remoteUserId,
  localAudioStream,
  localVideoStream,
  audioContext,
  onAudioTrack,
  onVideoTrack,
  onConnectionStateChange,
  onIceCandidate,
  onNegotiationNeeded,
}: CreatePeerOptions): RTCPeerConnection {
  const pc = new RTCPeerConnection({
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10,
  });

  // Add audio track with its own stream
  const audioTrack = localAudioStream?.getAudioTracks()[0];
  if (audioTrack && localAudioStream) {
    pc.addTrack(audioTrack, localAudioStream);
    console.log('[RTC]', remoteUserId, '| added local audio track', audioTrack.id, 'enabled:', audioTrack.enabled);
  } else {
    pc.addTransceiver('audio', { direction: 'recvonly' });
    console.log('[RTC]', remoteUserId, '| no local audio — added recvonly transceiver');
  }

  // Add video track with its own stream
  const videoTrack = localVideoStream?.getVideoTracks()[0];
  if (videoTrack && localVideoStream) {
    pc.addTrack(videoTrack, localVideoStream);
    console.log('[RTC]', remoteUserId, '| added local video track', videoTrack.id, 'enabled:', videoTrack.enabled);
  } else {
    pc.addTransceiver('video', { direction: 'recvonly' });
    console.log('[RTC]', remoteUserId, '| no local video — added recvonly transceiver');
  }

  // ICE candidates → callback (relay via socket)
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(remoteUserId, event.candidate.toJSON());
    }
  };

  // Incoming tracks - split by kind
  pc.ontrack = (event) => {
    const track = event.track;
    const stream = event.streams[0] || new MediaStream([track]);
    console.log('[RTC]', remoteUserId, '| ontrack:', track.kind, 'id:', track.id, 'enabled:', track.enabled, 'muted:', track.muted);

    if (track.kind === 'audio') {
      onAudioTrack(remoteUserId, stream);
    } else if (track.kind === 'video') {
      onVideoTrack(remoteUserId, stream);
    }
  };

  // Connection state
  pc.onconnectionstatechange = () => {
    console.log('[RTC]', remoteUserId, '| connection:', pc.connectionState);
    if (pc.connectionState === 'connected') {
      connectionEstablished = true;
    }
    onConnectionStateChange(remoteUserId, pc.connectionState);
  };

  // ICE restart on failure
  let iceRestartAttempts = 0;
  pc.oniceconnectionstatechange = async () => {
    if (pc.iceConnectionState === 'failed' && iceRestartAttempts < 3) {
      iceRestartAttempts++;
      console.warn(`[WebRTC] ICE restart ${iceRestartAttempts}/3 for:`, remoteUserId);
      try {
        pc.restartIce();
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        onNegotiationNeeded(remoteUserId, offer);
      } catch (error) {
        console.error('[WebRTC Peer] ICE restart failed:', error);
      }
    } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
      iceRestartAttempts = 0;
    }
  };

  // Renegotiation — only enabled after connection is established
  let isNegotiating = false;
  let connectionEstablished = false;
  pc.onnegotiationneeded = async () => {
    if (!connectionEstablished) return; // Skip initial setup — first offer is created manually
    if (isNegotiating || pc.signalingState !== 'stable') return;
    isNegotiating = true;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      onNegotiationNeeded(remoteUserId, offer);
    } catch (error) {
      console.error('[WebRTC Peer] Renegotiation failed:', error);
    } finally {
      isNegotiating = false;
    }
  };

  return pc;
}

export function setupAudioPlayback(
  audioStream: MediaStream,
  audioContext: AudioContext | null,
): {
  audioElement: HTMLAudioElement;
  source?: MediaStreamAudioSourceNode;
  analyser?: AnalyserNode;
  gainNode?: GainNode;
} {
  const audio = new Audio();
  audio.srcObject = audioStream;
  audio.autoplay = true;
  audio.volume = 1.0;

  // Attach to DOM for reliable playback
  audio.style.position = 'fixed';
  audio.style.top = '0';
  audio.style.left = '0';
  audio.style.width = '1px';
  audio.style.height = '1px';
  audio.style.opacity = '0';
  audio.style.pointerEvents = 'none';
  audio.style.zIndex = '-1';
  document.body.appendChild(audio);

  audio.play().catch(() => {
    // Browser blocked autoplay — retry on next user interaction
    const playOnInteraction = () => {
      audio.play().then(() => {
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('keydown', playOnInteraction);
      }).catch(() => {});
    };
    document.addEventListener('click', playOnInteraction);
    document.addEventListener('touchstart', playOnInteraction);
    document.addEventListener('keydown', playOnInteraction);
  });

  let source: MediaStreamAudioSourceNode | undefined;
  let analyser: AnalyserNode | undefined;
  let gainNode: GainNode | undefined;

  try {
    if (audioContext && audioStream.getAudioTracks().length > 0) {
      source = audioContext.createMediaStreamSource(audioStream);
      analyser = audioContext.createAnalyser();
      gainNode = audioContext.createGain();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      gainNode.gain.value = 0; // Silent - analysis only

      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
    }
  } catch (error) {
    console.error('[WebRTC Peer] Web Audio API setup failed:', error);
  }

  return { audioElement: audio, source, analyser, gainNode };
}

export function cleanupPeerConnection(peer: PeerConnection): void {
  peer.pc.close();

  if (peer.audioStream) {
    peer.audioStream.getTracks().forEach(track => track.stop());
  }
  if (peer.videoStream) {
    peer.videoStream.getTracks().forEach(track => track.stop());
  }

  if (peer.audioElement) {
    peer.audioElement.pause();
    peer.audioElement.srcObject = null;
    peer.audioElement.remove();
  }

  if (peer.source) {
    peer.source.disconnect();
  }
  if (peer.gainNode) {
    peer.gainNode.disconnect();
  }
}
