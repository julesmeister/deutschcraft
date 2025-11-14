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

    </div>
  );
}
