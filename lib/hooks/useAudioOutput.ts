
import { useState, useEffect, useCallback } from 'react';

export interface AudioOutputDevice {
  deviceId: string;
  label: string;
}

export function useAudioOutput() {
  const [devices, setDevices] = useState<AudioOutputDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);

  // Check support and load devices
  useEffect(() => {
    // Check if setSinkId is supported (HTMLAudioElement.prototype.setSinkId)
    const audio = new Audio();
    const supported = 'setSinkId' in audio || 'setSinkId' in HTMLMediaElement.prototype;
    setIsSupported(supported);

    if (supported && navigator.mediaDevices) {
      const loadDevices = async () => {
        try {
          // Request permission first (optional, but helps get labels)
          // await navigator.mediaDevices.getUserMedia({ audio: true }); 
          
          const allDevices = await navigator.mediaDevices.enumerateDevices();
          const audioOutputs = allDevices
            .filter(d => d.kind === 'audiooutput')
            .map(d => ({
              deviceId: d.deviceId,
              label: d.label || `Speaker ${d.deviceId.slice(0, 4)}...`
            }));
          
          setDevices(audioOutputs);
          
          // Set default if not set
          if (audioOutputs.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(audioOutputs[0].deviceId);
          }
        } catch (err) {
          console.error('[AudioOutput] Failed to load devices:', err);
        }
      };

      loadDevices();
      navigator.mediaDevices.addEventListener('devicechange', loadDevices);
      return () => navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
    }
  }, [selectedDeviceId]);

  // Function to set sink ID on an element
  const setAudioOutput = useCallback(async (element: HTMLMediaElement, deviceId: string) => {
    if (!element || !deviceId) return;
    
    try {
      // @ts-ignore - setSinkId is experimental/non-standard in some TS lib versions
      if (typeof element.setSinkId === 'function') {
        // @ts-ignore
        await element.setSinkId(deviceId);
        console.log('[AudioOutput] Set output to:', deviceId);
      }
    } catch (err) {
      console.error('[AudioOutput] Failed to set sink ID:', err);
    }
  }, []);

  return {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    isSupported,
    setAudioOutput
  };
}
