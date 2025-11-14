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

      {/* Info Message when voice is active */}
      {isVoiceActive && (
        <div className="text-center py-2 text-sm text-gray-500 bg-gray-50 rounded">
          {participants.length === 0 ? (
            <>
              <p className="font-medium">Voice active - waiting for others</p>
              <p className="text-xs mt-1">Others will be able to hear you when they join</p>
            </>
          ) : (
            <p className="font-medium">{participants.length} {participants.length === 1 ? 'person' : 'people'} connected</p>
          )}
        </div>
      )}

    </div>
  );
}
