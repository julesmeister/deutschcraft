/**
 * PlaygroundLobby Component
 * Shows list of active rooms and allows joining/creating rooms
 */

'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { AlertDialog } from '@/components/ui/Dialog';
import type { PlaygroundRoom } from '@/lib/models/playground';

interface PlaygroundLobbyProps {
  activeRooms: PlaygroundRoom[];
  userRole: 'teacher' | 'student';
  isCreatingRoom: boolean;
  dialogState: {
    isOpen: boolean;
    title: string;
    message: string;
  };
  onCreateRoom: () => Promise<void>;
  onJoinRoom: (room: PlaygroundRoom) => Promise<void>;
  onCloseDialog: () => void;
}

export function PlaygroundLobby({
  activeRooms,
  userRole,
  isCreatingRoom,
  dialogState,
  onCreateRoom,
  onJoinRoom,
  onCloseDialog,
}: PlaygroundLobbyProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Playground"
        subtitle="Collaborate with voice chat and writing exercises"
        actions={
          userRole === 'teacher' ? (
            <ActionButton
              onClick={onCreateRoom}
              disabled={isCreatingRoom}
              variant="purple"
              icon={<ActionButtonIcons.Plus />}
            >
              {isCreatingRoom ? 'Creating Room...' : 'Create New Room'}
            </ActionButton>
          ) : undefined
        }
      />

      <div className="container mx-auto px-6 py-8">
        {/* Active Rooms */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-900">Active Rooms</h2>

          {activeRooms.length === 0 ? (
            <div className="bg-white border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No active rooms available</p>
              {userRole === 'teacher' && (
                <p className="text-sm text-gray-400 mt-2">
                  Create a room to get started
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {activeRooms.map((room) => (
                <div
                  key={room.roomId}
                  className="bg-white border border-gray-200 p-4 flex items-center justify-between hover:border-blue-300 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      {room.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Host: {room.hostName} • {room.participantCount}{' '}
                      {room.participantCount === 1 ? 'participant' : 'participants'}
                    </p>
                  </div>
                  <div className="w-40">
                    <ActionButton
                      onClick={() => onJoinRoom(room)}
                      variant="cyan"
                      icon={<ActionButtonIcons.Play />}
                    >
                      Join Room
                    </ActionButton>
                  </div>
                </div>
              ))}
            </div>
          )}
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
