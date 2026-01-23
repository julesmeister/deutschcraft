/**
 * WebRTC Peer Connection Manager
 * Handles creation and management of RTCPeerConnections
 */

import { ICE_SERVERS } from "./config";
import { sendIceCandidate, sendOffer } from "./firebaseSignaling";

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
  onTrackReceived: (
    remoteUserId: string,
    stream: MediaStream,
    hasAudio: boolean,
    hasVideo: boolean,
  ) => void;
  onConnectionStateChange: (
    remoteUserId: string,
    state: RTCPeerConnectionState,
  ) => void;
  onNegotiationNeeded?: (
    remoteUserId: string,
    offer: RTCSessionDescriptionInit,
  ) => void;
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
  const pc = new RTCPeerConnection({
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 10,
  });

  // Use addTransceiver for reliable bidirectional media setup
  // This ensures transceivers exist for both sending and receiving
  // even before tracks are available (important for the answering side)
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0];
    const videoTrack = localStream.getVideoTracks()[0];

    if (audioTrack) {
      pc.addTransceiver(audioTrack, {
        direction: "sendrecv",
        streams: [localStream],
      });
    } else {
      pc.addTransceiver("audio", { direction: "recvonly" });
    }

    if (videoTrack) {
      pc.addTransceiver(videoTrack, {
        direction: "sendrecv",
        streams: [localStream],
      });
    } else {
      pc.addTransceiver("video", { direction: "recvonly" });
    }
  } else {
    // No local stream - still set up receivers
    pc.addTransceiver("audio", { direction: "recvonly" });
    pc.addTransceiver("video", { direction: "recvonly" });
  }

  // Handle ICE candidates
  pc.onicecandidate = async (event) => {
    if (event.candidate) {
      await sendIceCandidate(
        roomId,
        userId,
        remoteUserId,
        event.candidate.toJSON(),
      );
    }
  };

  // Handle incoming stream
  pc.ontrack = (event) => {
    const [remoteStream] = event.streams;

    if (remoteStream) {
      const hasVideo = remoteStream.getVideoTracks().length > 0;
      const hasAudio = remoteStream.getAudioTracks().length > 0;
      onTrackReceived(remoteUserId, remoteStream, hasAudio, hasVideo);
    }
  };

  // Handle connection state
  pc.onconnectionstatechange = () => {
    onConnectionStateChange(remoteUserId, pc.connectionState);
  };

  // Handle ICE connection state with restart on failure
  let iceRestartAttempts = 0;
  const MAX_ICE_RESTARTS = 3;

  pc.oniceconnectionstatechange = async () => {
    if (
      pc.iceConnectionState === "failed" &&
      iceRestartAttempts < MAX_ICE_RESTARTS
    ) {
      iceRestartAttempts++;
      console.warn(
        `[WebRTC] ICE restart ${iceRestartAttempts}/${MAX_ICE_RESTARTS} for:`,
        remoteUserId,
      );

      try {
        pc.restartIce();
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        await sendOffer(roomId, userId, remoteUserId, offer);
      } catch (error) {
        console.error("[WebRTC Peer] ICE restart failed:", error);
      }
    } else if (
      pc.iceConnectionState === "connected" ||
      pc.iceConnectionState === "completed"
    ) {
      iceRestartAttempts = 0; // Reset on success
    }
  };

  // Handle renegotiation (fires when tracks are added/removed after connection)
  let isNegotiating = false;
  pc.onnegotiationneeded = async () => {
    if (isNegotiating) return;

    // Only renegotiate when in stable state (not during initial offer/answer)
    if (pc.signalingState !== "stable") return;

    isNegotiating = true;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (onNegotiationNeeded) {
        onNegotiationNeeded(remoteUserId, offer);
      }
    } catch (error) {
      console.error("[WebRTC Peer] Renegotiation failed:", error);
    } finally {
      isNegotiating = false;
    }
  };

  return pc;
}

export function setupAudioPlayback(
  remoteStream: MediaStream,
  audioContext: AudioContext | null,
): {
  audioElement: HTMLAudioElement;
  source?: MediaStreamAudioSourceNode;
  analyser?: AnalyserNode;
  gainNode?: GainNode;
} {
  // Create a dedicated MediaStream for audio to avoid interference with video
  const audioTracks = remoteStream.getAudioTracks();
  const audioStream = new MediaStream(audioTracks);

  // HTML Audio Element for reliable playback
  const audio = new Audio();
  audio.srcObject = audioStream;
  audio.autoplay = true;
  audio.volume = 1.0;

  // Attach to DOM to ensure playback works on all browsers
  // Use 1x1 pixel with opacity 0 instead of display:none to avoid autoplay restrictions
  audio.style.position = "fixed";
  audio.style.top = "0";
  audio.style.left = "0";
  audio.style.width = "1px";
  audio.style.height = "1px";
  audio.style.opacity = "0";
  audio.style.pointerEvents = "none";
  audio.style.zIndex = "-1";
  document.body.appendChild(audio);

  audio.play().catch((err) => {
    console.error("[WebRTC Peer] Audio element play failed:", err);
    // Retry once after a short delay (helps with race conditions)
    setTimeout(() => {
      audio
        .play()
        .catch((e) => console.error("[WebRTC Peer] Retry play failed:", e));
    }, 1000);
  });

  let source: MediaStreamAudioSourceNode | undefined;
  let analyser: AnalyserNode | undefined;
  let gainNode: GainNode | undefined;

  // Web Audio API for speaking detection only (NOT for playback)
  // Don't connect to destination - that causes Chrome to mute the Audio element
  try {
    if (audioContext && audioTracks.length > 0) {
      // Use the separated audio stream for analysis too
      source = audioContext.createMediaStreamSource(audioStream);
      analyser = audioContext.createAnalyser();
      gainNode = audioContext.createGain();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      gainNode.gain.value = 0; // Silent - analysis only

      // source -> analyser -> silentGain -> destination (keeps graph alive for analysis)
      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
    }
  } catch (audioApiError) {
    console.error("[WebRTC Peer] Web Audio API setup failed:", audioApiError);
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
    peer.audioElement.remove();
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
