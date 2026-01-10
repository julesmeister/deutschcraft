/**
 * Media Stream Manager
 * Handles getUserMedia requests and stream lifecycle
 */

export interface MediaConstraints {
  audio: boolean | MediaTrackConstraints;
  video: boolean | MediaTrackConstraints;
}

export async function getMediaStream(withVideo: boolean): Promise<MediaStream> {
  const audioConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
  };

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user",
    frameRate: { ideal: 30 },
  };

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
      video: withVideo ? videoConstraints : false,
    });
  } catch (error) {
    console.warn(
      "[Media Stream] First attempt failed, trying fallback constraints:",
      error
    );

    // Wait a bit to let OS/hardware release the device if it was busy
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fallback 1: Try without specific audio constraints and simpler video
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: true, // Simple audio
        video: withVideo
          ? {
              width: { ideal: 640 }, // Lower resolution
              height: { ideal: 480 },
              frameRate: { ideal: 30 },
              // No facingMode to be safer
            }
          : false,
      });
    } catch (err2) {
      console.warn(
        "[Media Stream] Second attempt failed, trying minimal constraints:",
        err2
      );

      // Wait a bit more
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fallback 2: Minimal constraints (works on most devices)
      return await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: withVideo ? true : false,
      });
    }
  }
}

export async function addVideoToStream(
  stream: MediaStream
): Promise<MediaStream> {
  const videoStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "user",
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

export function toggleAudioTracks(
  stream: MediaStream,
  currentMuted: boolean
): boolean {
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) return currentMuted;

  const newMutedState = !currentMuted;
  audioTracks.forEach((track) => {
    track.enabled = !newMutedState;
  });

  return newMutedState;
}

export function toggleVideoTracks(
  stream: MediaStream,
  currentVideoActive: boolean
): boolean {
  const videoTracks = stream.getVideoTracks();
  if (videoTracks.length === 0) return false;

  const newVideoState = !currentVideoActive;
  videoTracks.forEach((track) => {
    track.enabled = newVideoState;
  });

  return newVideoState;
}
