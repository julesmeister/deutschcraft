/**
 * VoicePanel Component
 * Voice chat controls and participant list
 */

'use client';

import { useEffect, useRef } from 'react';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

interface VoiceParticipant {
  peerId: string;
  userId: string;
  userName: string;
  stream?: MediaStream;
}

interface VoicePanelProps {
  isVoiceActive: boolean;
  isMuted: boolean;
  participants: VoiceParticipant[];
  onStartVoice: () => void;
  onStopVoice: () => void;
  onToggleMute: () => void;
}

export function VoicePanel({
  isVoiceActive,
  isMuted,
  participants,
  onStartVoice,
  onStopVoice,
  onToggleMute,
}: VoicePanelProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Voice Chat {participants.length > 0 && `(${participants.length})`}
        </h3>
      </div>

      {/* Voice Controls */}
      <div className="flex gap-2">
        {!isVoiceActive ? (
          <ActionButton
            onClick={onStartVoice}
            variant="purple"
            icon={<ActionButtonIcons.Microphone />}
            className="flex-1"
          >
            Start Voice
          </ActionButton>
        ) : (
          <>
            <ActionButton
              onClick={onToggleMute}
              variant={isMuted ? 'gray' : 'cyan'}
              icon={<ActionButtonIcons.Microphone />}
              className="flex-1"
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </ActionButton>
            <ActionButton
              onClick={onStopVoice}
              variant="red"
              icon={<ActionButtonIcons.Close />}
              className="flex-1"
            >
              Stop Voice
            </ActionButton>
          </>
        )}
      </div>

      {/* Participants List or Waiting Message */}
      {isVoiceActive && (
        <div className="space-y-2">
          {participants.length > 0 ? (
            <>
              <p className="text-sm font-medium text-gray-600">
                Connected Participants:
              </p>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <VoiceParticipantItem
                    key={participant.peerId}
                    participant={participant}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded">
              <p className="font-medium">Waiting for others to join...</p>
              <p className="text-xs mt-1">You need at least 2 people in the room to test voice chat</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// Individual participant with audio element
function VoiceParticipantItem({
  participant,
}: {
  participant: VoiceParticipant;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !participant.stream) return;

    // Set srcObject (modern approach, don't use URL.createObjectURL)
    audio.srcObject = participant.stream;

    // Set volume to maximum
    audio.volume = 1.0;

    // Ensure muted is false
    audio.muted = false;

    // Try to play with better error handling
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[Voice] Audio playing for:', participant.userName);
        })
        .catch((err) => {
          console.error('[Voice] Failed to play audio for', participant.userName, ':', err);
          // Try to unmute and play again (some browsers require this)
          audio.muted = false;
          audio.play().catch(e => console.error('[Voice] Retry failed:', e));
        });
    }

    return () => {
      // Cleanup
      if (audio.srcObject) {
        audio.pause();
        audio.srcObject = null;
      }
    };
  }, [participant.stream, participant.userName]);

  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm font-medium text-neutral-800">
        {participant.userName}
      </span>
      {/* Audio element with all necessary attributes */}
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        controls={false}
      />
    </div>
  );
}
