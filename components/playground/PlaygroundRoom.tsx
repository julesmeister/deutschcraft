/**
 * PlaygroundRoom Component
 * Active room view with voice chat and writing board
 */

'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { AlertDialog } from '@/components/ui/Dialog';
import { VoicePanel } from '@/components/playground/VoicePanel';
import { WritingBoard } from '@/components/playground/WritingBoard';
import { ParticipantsList } from '@/components/playground/ParticipantsList';
import type {
  PlaygroundRoom as PlaygroundRoomType,
  PlaygroundParticipant,
  PlaygroundWriting,
} from '@/lib/models/playground';

interface VoiceParticipant {
  peerId: string;
  userId: string;
  userName: string;
  stream?: MediaStream;
}

interface PlaygroundRoomProps {
  currentRoom: PlaygroundRoomType;
  participants: PlaygroundParticipant[];
  writings: PlaygroundWriting[];
  myWriting?: PlaygroundWriting;
  userId: string;
  userRole: 'teacher' | 'student';

  // Voice chat state
  isVoiceActive: boolean;
  isMuted: boolean;
  voiceParticipants: VoiceParticipant[];
  voiceStreams: Map<string, MediaStream>;
  voiceAnalysers: Map<string, AnalyserNode>;

  // Dialog state
  dialogState: {
    isOpen: boolean;
    title: string;
    message: string;
  };

  // Handlers
  onLeaveRoom: () => Promise<void>;
  onEndRoom: () => Promise<void>;
  onStartVoice: () => Promise<void>;
  onStopVoice: () => Promise<void>;
  onToggleMute: () => Promise<void>;
  onSaveWriting: (content: string) => Promise<void>;
  onToggleWritingVisibility: (writingId: string, isPublic: boolean) => Promise<void>;
  onToggleRoomPublicWriting?: (isPublic: boolean) => Promise<void>;
  onCloseDialog: () => void;
}

export function PlaygroundRoom({
  currentRoom,
  participants,
  writings,
  myWriting,
  userId,
  userRole,
  isVoiceActive,
  isMuted,
  voiceParticipants,
  voiceStreams,
  voiceAnalysers,
  dialogState,
  onLeaveRoom,
  onEndRoom,
  onStartVoice,
  onStopVoice,
  onToggleMute,
  onSaveWriting,
  onToggleWritingVisibility,
  onToggleRoomPublicWriting,
  onCloseDialog,
}: PlaygroundRoomProps) {
  // Only the host (room creator) can end the room
  const isHost = userId === currentRoom.hostId;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={currentRoom.title}
        subtitle={`${participants.length} ${
          participants.length === 1 ? 'participant' : 'participants'
        } • Host: ${currentRoom.hostName}`}
        backButton={{
          label: 'Leave Room',
          onClick: onLeaveRoom,
        }}
        actions={
          isHost && (
            <ActionButton
              onClick={onEndRoom}
              variant="red"
              icon={<ActionButtonIcons.Close />}
            >
              End Room
            </ActionButton>
          )
        }
      />

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Voice Panel */}
          <div className="lg:col-span-1">
            <VoicePanel
              isVoiceActive={isVoiceActive}
              isMuted={isMuted}
              participants={voiceParticipants}
              onStartVoice={onStartVoice}
              onStopVoice={onStopVoice}
              onToggleMute={onToggleMute}
            />

            {/* Participants List */}
            <div className="mt-6 bg-white border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Participants ({participants.length})
              </h3>
              <ParticipantsList
                participants={participants}
                voiceStreams={voiceStreams}
                voiceAnalysers={voiceAnalysers}
                currentUserRole={userRole}
                currentUserId={userId}
              />
            </div>
          </div>

          {/* Right: Writing Board */}
          <div className="lg:col-span-2">
            <WritingBoard
              writings={writings}
              currentUserId={userId}
              currentUserRole={userRole}
              myWriting={myWriting}
              isRoomPublicWriting={currentRoom.isPublicWriting}
              onSaveWriting={onSaveWriting}
              onToggleWritingVisibility={onToggleWritingVisibility}
              onToggleRoomPublicWriting={
                userRole === 'teacher' ? onToggleRoomPublicWriting : undefined
              }
            />
          </div>
        </div>
      </div>

      <AlertDialog
        open={dialogState.isOpen}
        onClose={onCloseDialog}
        title={dialogState.title}
        message={dialogState.message}
      />
    </div>
  );
}
