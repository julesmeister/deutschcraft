/**
 * Media Stream Manager
 * Handles getUserMedia requests and stream lifecycle
 */

export interface MediaConstraints {
  audio: boolean | MediaTrackConstraints;
  video: boolean | MediaTrackConstraints;
}

export async function getMediaStream(withVideo: boolean): Promise<MediaStream> {
  return await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
    },
    video: withVideo
      ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        }
      : false,
  });
}

export async function addVideoToStream(stream: MediaStream): Promise<MediaStream> {
  const videoStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user',
      frameRate: { ideal: 30 },
    },
  });

  videoStream.getVideoTracks().forEach((track) => {
    stream.addTrack(track);
  });

  return videoStream;
}

export function stopAllTracks(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

export function enableAllTracks(stream: MediaStream, enabled: boolean) {
  stream.getTracks().forEach((track) => {
    track.enabled = enabled;
  });
}

export function toggleAudioTracks(stream: MediaStream, currentMuted: boolean): boolean {
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) return currentMuted;

  const newMutedState = !currentMuted;
  audioTracks.forEach((track) => {
    track.enabled = !newMutedState;
  });

  return newMutedState;
}

export function toggleVideoTracks(stream: MediaStream, currentVideoActive: boolean): boolean {
  const videoTracks = stream.getVideoTracks();
  if (videoTracks.length === 0) return false;

  const newVideoState = !currentVideoActive;
  videoTracks.forEach((track) => {
    track.enabled = newVideoState;
  });

  return newVideoState;
}
