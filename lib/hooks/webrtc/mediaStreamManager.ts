/**
 * Media Stream Manager
 * Handles separate audio and video streams independently
 */

export async function getAudioStream(): Promise<MediaStream> {
  const constraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
  };

  try {
    return await navigator.mediaDevices.getUserMedia({ audio: constraints, video: false });
  } catch {
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
      await new Promise(resolve => setTimeout(resolve, 500));
      return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    }
  }
}

export async function getVideoStream(): Promise<MediaStream> {
  const constraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
    frameRate: { ideal: 30 },
  };

  try {
    return await navigator.mediaDevices.getUserMedia({ audio: false, video: constraints });
  } catch {
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
      });
    } catch {
      return await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    }
  }
}

export function stopStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach(track => track.stop());
}

export function setAudioEnabled(stream: MediaStream | null, enabled: boolean): void {
  if (!stream) return;
  stream.getAudioTracks().forEach(track => { track.enabled = enabled; });
}

export function setVideoEnabled(stream: MediaStream | null, enabled: boolean): void {
  if (!stream) return;
  stream.getVideoTracks().forEach(track => { track.enabled = enabled; });
}
