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

  console.log('[MIC] requesting audio stream...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: constraints, video: false });
    const track = stream.getAudioTracks()[0];
    console.log('[MIC] got audio track:', track.label, 'enabled:', track.enabled, 'readyState:', track.readyState, 'muted:', track.muted);
    return stream;
  } catch (err) {
    console.warn('[MIC] advanced constraints failed, retrying basic...', err);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const track = stream.getAudioTracks()[0];
      console.log('[MIC] got audio track (basic):', track.label, 'enabled:', track.enabled, 'readyState:', track.readyState);
      return stream;
    } catch (err2) {
      console.warn('[MIC] retry 1 failed, final attempt...', err2);
      await new Promise(resolve => setTimeout(resolve, 500));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      console.log('[MIC] got audio track (final):', stream.getAudioTracks()[0]?.label);
      return stream;
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

  console.log('[CAM] requesting video stream...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: constraints });
    const track = stream.getVideoTracks()[0];
    console.log('[CAM] got video track:', track.label, 'enabled:', track.enabled, 'readyState:', track.readyState);
    return stream;
  } catch (err) {
    console.warn('[CAM] HD constraints failed, retrying lower...', err);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
      });
      console.log('[CAM] got video track (480p):', stream.getVideoTracks()[0]?.label);
      return stream;
    } catch {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      console.log('[CAM] got video track (basic):', stream.getVideoTracks()[0]?.label);
      return stream;
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
