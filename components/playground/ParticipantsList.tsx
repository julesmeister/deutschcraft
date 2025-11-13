'use client';

import { useEffect, useState, useRef } from 'react';
import type { PlaygroundParticipant } from '@/lib/models/playground';
import { updateParticipantVoiceStatus } from '@/lib/services/playgroundService';

interface ParticipantsListProps {
  participants: PlaygroundParticipant[];
  voiceStreams?: Map<string, MediaStream>; // Map of userId -> MediaStream
  currentUserRole?: 'teacher' | 'student';
  currentUserId?: string;
}

interface ParticipantWithAudio extends PlaygroundParticipant {
  isTalking: boolean;
  audioLevel: number;
}

export function ParticipantsList({
  participants,
  voiceStreams,
  currentUserRole = 'student',
  currentUserId = ''
}: ParticipantsListProps) {
  const [participantsWithAudio, setParticipantsWithAudio] = useState<ParticipantWithAudio[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzersRef = useRef<Map<string, AnalyserNode>>(new Map());

  useEffect(() => {
    console.log('[Audio] voiceStreams Map size:', voiceStreams?.size, 'participants:', participants.length);

    if (!voiceStreams || voiceStreams.size === 0) {
      // No voice streams, just show participants without audio levels
      setParticipantsWithAudio(
        participants.map((p) => ({
          ...p,
          isTalking: false,
          audioLevel: 0,
        }))
      );
      return;
    }

    // Create audio context if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;

    // Setup analyzers for each voice stream
    voiceStreams.forEach((stream, userId) => {
      if (!analyzersRef.current.has(userId)) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; // Larger FFT size for better accuracy
        analyser.smoothingTimeConstant = 0.3; // Smooth out the data
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyzersRef.current.set(userId, analyser);
        console.log('[Audio] Created analyser for userId:', userId);
      }
    });

    let animationFrameId: number;

    // Monitor audio levels using requestAnimationFrame
    let frameCount = 0;
    const checkAudioLevels = () => {
      const updated = participants.map((p) => {
        const analyser = analyzersRef.current.get(p.userId);

        if (!analyser || !p.isVoiceActive) {
          if (frameCount % 60 === 0) {
            console.log('[Audio] No analyser or voice inactive for:', p.userName, { hasAnalyser: !!analyser, isVoiceActive: p.isVoiceActive });
          }
          return {
            ...p,
            isTalking: false,
            audioLevel: 0,
          };
        }

        // Use time domain data for microphone input (recommended for live audio)
        const dataArray = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(dataArray);

        // Calculate RMS (Root Mean Square) for volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const audioLevel = rms; // Already 0-1

        // Lower threshold for better sensitivity
        const isTalking = audioLevel > 0.02;

        // Log every 60 frames (about once per second)
        if (frameCount % 60 === 0) {
          console.log('[Audio] Level for', p.userName, ':', audioLevel.toFixed(4), 'isTalking:', isTalking);
        }

        return {
          ...p,
          isTalking,
          audioLevel,
        };
      });

      setParticipantsWithAudio(updated);
      frameCount++;
      animationFrameId = requestAnimationFrame(checkAudioLevels);
    };

    // Start monitoring
    checkAudioLevels();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [participants, voiceStreams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      analyzersRef.current.forEach((analyser) => {
        analyser.disconnect();
      });
      analyzersRef.current.clear();

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  if (participants.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No participants yet
      </div>
    );
  }

  const handleMuteParticipant = async (participantId: string, currentIsMuted: boolean) => {
    try {
      await updateParticipantVoiceStatus(participantId, true, !currentIsMuted);
    } catch (error) {
      console.error('[ParticipantsList] Failed to mute participant:', error);
    }
  };

  return (
    <div className="space-y-2">
      {participantsWithAudio.map((p) => {
        const isCurrentUser = p.userId === currentUserId;
        const canMute = currentUserRole === 'teacher' && !isCurrentUser;

        return (
          <div
            key={p.participantId}
            className={`
              relative overflow-hidden
              flex items-center gap-3 px-4 py-3 rounded-full
              transition-all duration-200
              ${p.isTalking
                ? 'bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-400 shadow-md'
                : 'bg-gray-100 border-2 border-transparent'
              }
            `}
          >
            {/* Audio level visualization */}
            {p.isVoiceActive && (
              <div
                className="absolute left-0 top-0 h-full bg-green-200 transition-all duration-100"
                style={{
                  width: `${p.audioLevel * 100}%`,
                  opacity: 0.3,
                }}
              />
            )}

            {/* Status indicator */}
            <div className="relative z-10 flex items-center justify-center w-12 h-12">
              {p.isVoiceActive ? (
                <div className="relative">
                  {/* Animated rings when talking */}
                  {p.isTalking && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                      <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-50"
                           style={{ animationDelay: '0.15s' }} />
                    </>
                  )}
                  {/* Microphone icon - larger with more padding */}
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${p.isTalking ? 'bg-green-600' : 'bg-green-500'}`}>
                    {p.isMuted ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM13 4a3 3 0 00-6 0v6c0 .556.151 1.077.415 1.524L13 5.939V4z" />
                        <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                        <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                      </svg>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-gray-400" />
              )}
            </div>

            {/* Name and role */}
            <div className="relative z-10 flex-1 min-w-0">
              <span className={`text-sm font-semibold ${p.isTalking ? 'text-green-900' : 'text-neutral-800'}`}>
                {p.userName}
              </span>
              <span className="ml-2 text-xs text-gray-500 uppercase tracking-wide">
                {p.role}
              </span>
            </div>

            {/* Talking indicator - pulsing dot */}
            {p.isTalking && (
              <div className="relative z-10 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">Speaking</span>
              </div>
            )}

            {/* Mute button for teachers */}
            {canMute && p.isVoiceActive && (
              <button
                onClick={() => handleMuteParticipant(p.participantId, p.isMuted)}
                className="relative z-10 p-2 hover:bg-gray-200 rounded-full transition-colors"
                title={p.isMuted ? 'Unmute participant' : 'Mute participant'}
              >
                {p.isMuted ? (
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" />
                    <path d="M10 3a2 2 0 00-2 2v4a2 2 0 104 0V5a2 2 0 00-2-2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3a2 2 0 00-2 2v4a2 2 0 104 0V5a2 2 0 00-2-2z" />
                    <path d="M16 8v1a6 6 0 01-12 0V8a1 1 0 112 0v1a4 4 0 008 0V8a1 1 0 112 0z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
