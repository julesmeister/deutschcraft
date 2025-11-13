/**
 * VoicePanel Component
 * Voice chat controls and participant list
 */

'use client';

import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

interface VoiceParticipant {
  userId: string;
  userName: string;
  isMuted?: boolean;
  audioLevel?: number;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'disconnected';
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
                  <div
                    key={participant.userId}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {participant.userName}
                      </p>
                      {participant.isMuted && (
                        <p className="text-xs text-red-500">Muted</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {participant.connectionQuality || 'connecting...'}
                    </div>
                  </div>
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
