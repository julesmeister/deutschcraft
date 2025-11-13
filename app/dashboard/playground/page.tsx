/**
 * Playground Page
 * Collaborative voice + writing space for teachers and students
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { AlertDialog } from '@/components/ui/Dialog';
import { VoicePanel } from '@/components/playground/VoicePanel';
import { WritingBoard } from '@/components/playground/WritingBoard';
import { ParticipantsList } from '@/components/playground/ParticipantsList';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { useVoiceChat } from '@/lib/hooks/useVoiceChat';
import { getUserInfo } from '@/lib/utils/userHelpers';
import {
  createPlaygroundRoom,
  endPlaygroundRoom,
  joinPlaygroundRoom,
  leavePlaygroundRoom,
  updateParticipantVoiceStatus,
  togglePublicWriting as toggleRoomPublicWriting,
  savePlaygroundWriting,
  toggleWritingVisibility,
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToWritings,
  getActiveRooms,
} from '@/lib/services/playgroundService';
import type {
  PlaygroundRoom,
  PlaygroundParticipant,
  PlaygroundWriting,
} from '@/lib/models/playground';

export default function PlaygroundPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();

  const [activeRooms, setActiveRooms] = useState<PlaygroundRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<PlaygroundRoom | null>(null);
  const [participants, setParticipants] = useState<PlaygroundParticipant[]>([]);
  const [writings, setWritings] = useState<PlaygroundWriting[]>([]);
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [dialogState, setDialogState] = useState({ isOpen: false, title: '', message: '' });

  // Fetch current user from Firestore to get accurate role
  const { student: currentUser } = useCurrentStudent(session?.user?.email || null);

  // Use centralized helper to get user info (prevents email display issues)
  const { userId, userName, userEmail, userRole } = getUserInfo(currentUser, session);

  // Voice chat hook
  const {
    myPeerId,
    isVoiceActive,
    isMuted,
    participants: voiceParticipants,
    voiceStreams,
    startVoice,
    stopVoice,
    toggleMute,
    connectToPeer,
  } = useVoiceChat({
    userId,
    userName,
    roomId: currentRoom?.roomId || '',
    onPeerConnected: (peerId, userName) => {},
    onPeerDisconnected: (peerId) => {},
    onError: (error) => {
      setDialogState({
        isOpen: true,
        title: 'Voice Chat Error',
        message: error.message || 'Failed to connect voice chat',
      });
    },
  });

  // Load active rooms on mount
  useEffect(() => {
    loadActiveRooms();
  }, []);

  // Subscribe to current room
  useEffect(() => {
    if (!currentRoom?.roomId) return;

    const roomId = currentRoom.roomId;
    let isSubscriptionActive = true;

    const unsubRoom = subscribeToRoom(roomId, (room) => {
      if (!isSubscriptionActive) return;

      if (room) {
        // Only update if status changed to avoid infinite loops
        if (room.status !== currentRoom.status) {
          if (room.status === 'ended') {
            // Room ended - cleanup immediately without updating state
            isSubscriptionActive = false;
            handleLeaveRoom();
          } else {
            setCurrentRoom(room);
          }
        }
      }
    });

    const unsubParticipants = subscribeToParticipants(roomId, (parts) => {
      if (!isSubscriptionActive) return;
      console.log('[Playground] Participants updated:', parts);
      setParticipants(parts);
    });

    const unsubWritings = subscribeToWritings(
      roomId,
      userId,
      userRole,
      setWritings
    );

    return () => {
      isSubscriptionActive = false;
      unsubRoom();
      unsubParticipants();
      unsubWritings();
    };
  }, [currentRoom?.roomId, userId, userRole]);

  // Handle voice peer connections when participants change
  useEffect(() => {
    if (!isVoiceActive || participants.length === 0) return;

    participants.forEach((p) => {
      if (p.peerId && p.userId !== userId && p.isVoiceActive) {
        connectToPeer(p.peerId, p.userId, p.userName);
      }
    });
  }, [participants, isVoiceActive, userId, connectToPeer]);

  const loadActiveRooms = async () => {
    try {
      const rooms = await getActiveRooms();
      setActiveRooms(rooms);
    } catch (error) {
      // Silent error handling
    }
  };

  const handleCreateRoom = async () => {
    if (!session?.user || isCreatingRoom) return;

    setIsCreatingRoom(true);
    try {
      const roomTitle = `${userName}'s Room`;
      console.log('[Playground] Creating room:', { userId, userName, roomTitle });
      const roomId = await createPlaygroundRoom(userId, userName, roomTitle);
      console.log('[Playground] Room created:', roomId);

      console.log('[Playground] Joining created room as participant...');
      const participantId = await joinPlaygroundRoom(
        roomId,
        userId,
        userName,
        userEmail,
        userRole,
        myPeerId || undefined
      );
      console.log('[Playground] Joined as participant:', participantId);

      setMyParticipantId(participantId);

      const rooms = await getActiveRooms();
      const room = rooms.find((r) => r.roomId === roomId);

      if (room) {
        console.log('[Playground] Setting current room:', room);
        setCurrentRoom(room);
      }

      setDialogState({
        isOpen: true,
        title: 'Room Created',
        message: 'Your playground room has been created successfully!',
      });
    } catch (error) {
      console.error('[Playground] Error creating room:', error);
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to create room. Please try again.',
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (room: PlaygroundRoom) => {
    if (!session?.user) return;

    try {
      console.log('[Playground] Joining room:', room.roomId, { userId, userName, userEmail, userRole });
      const participantId = await joinPlaygroundRoom(
        room.roomId,
        userId,
        userName,
        userEmail,
        userRole,
        myPeerId || undefined
      );

      console.log('[Playground] Joined as participant:', participantId);
      setMyParticipantId(participantId);
      setCurrentRoom(room);
    } catch (error) {
      console.error('[Playground] Error joining room:', error);
      setDialogState({
        isOpen: true,
        title: 'Error',
        message: 'Failed to join room. Please try again.',
      });
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoom || !myParticipantId) return;

    try {
      await leavePlaygroundRoom(myParticipantId, currentRoom.roomId);
    } catch (error) {
      // Silent error handling
    } finally {
      stopVoice();
      setCurrentRoom(null);
      setMyParticipantId(null);
      setParticipants([]);
      setWritings([]);
      loadActiveRooms();
    }
  };

  const handleEndRoom = async () => {
    if (!currentRoom || userRole !== 'teacher') return;

    const roomIdToEnd = currentRoom.roomId;
    const participantIdToLeave = myParticipantId;

    try {
      // First cleanup local state immediately
      stopVoice();
      setCurrentRoom(null);
      setMyParticipantId(null);
      setParticipants([]);
      setWritings([]);

      // Then update Firestore
      await endPlaygroundRoom(roomIdToEnd);

      if (participantIdToLeave) {
        await leavePlaygroundRoom(participantIdToLeave, roomIdToEnd);
      }

      loadActiveRooms();
    } catch (error) {
      // Silent error handling
    }
  };

  const handleToggleRoomPublicWriting = async (isPublic: boolean) => {
    if (!currentRoom) return;

    try {
      await toggleRoomPublicWriting(currentRoom.roomId, isPublic);
    } catch (error) {
      // Silent error handling
    }
  };

  const handleSaveWriting = async (content: string) => {
    if (!currentRoom) return;

    try {
      await savePlaygroundWriting(
        currentRoom.roomId,
        userId,
        userName,
        content,
        false
      );
    } catch (error) {
      throw error;
    }
  };

  const handleToggleWritingVisibility = async (
    writingId: string,
    isPublic: boolean
  ) => {
    try {
      await toggleWritingVisibility(writingId, isPublic);
    } catch (error) {
      // Silent error handling
    }
  };

  // Wrapped voice handlers to update Firestore
  const handleStartVoice = async () => {
    if (!myParticipantId || !currentRoom) return;

    try {
      await startVoice();

      // Update Firestore with voice active status and current peer ID
      await updateParticipantVoiceStatus(myParticipantId, true, false);

      // Update peer ID if we have one
      if (myPeerId) {
        const participantRef = doc(db, 'playground_participants', myParticipantId);
        await updateDoc(participantRef, { peerId: myPeerId });
      }
    } catch (error) {
      console.error('[Voice] Failed to start voice:', error);
      setDialogState({
        isOpen: true,
        title: 'Voice Error',
        message: 'Failed to start voice. Please check microphone permissions.',
      });
    }
  };

  const handleStopVoice = async () => {
    if (!myParticipantId) return;

    try {
      stopVoice();
      await updateParticipantVoiceStatus(myParticipantId, false, false);
    } catch (error) {
      // Silent error
    }
  };

  const handleToggleMute = async () => {
    if (!myParticipantId) return;

    try {
      toggleMute();
      await updateParticipantVoiceStatus(myParticipantId, isVoiceActive, !isMuted);
    } catch (error) {
      // Silent error
    }
  };

  const myWriting = writings.find((w) => w.userId === userId);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to access the playground</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Lobby view (no room joined)
  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Playground"
          subtitle="Collaborate with voice chat and writing exercises"
          actions={
            userRole === 'teacher' ? (
              <ActionButton
                onClick={handleCreateRoom}
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
                        onClick={() => handleJoinRoom(room)}
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
          onClose={() => setDialogState({ ...dialogState, isOpen: false })}
          title={dialogState.title}
          message={dialogState.message}
        />
      </div>
    );
  }

  // Room view (joined a room)
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={currentRoom.title}
        subtitle={`${participants.length} ${
          participants.length === 1 ? 'participant' : 'participants'
        } • Host: ${currentRoom.hostName}`}
        backButton={{
          label: 'Leave Room',
          onClick: handleLeaveRoom,
        }}
        actions={
          userRole === 'teacher' && (
            <ActionButton
              onClick={handleEndRoom}
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
              onStartVoice={handleStartVoice}
              onStopVoice={handleStopVoice}
              onToggleMute={handleToggleMute}
            />

            {/* Participants List */}
            <div className="mt-6 bg-white border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Participants ({participants.length})
              </h3>
              <ParticipantsList
                participants={participants}
                voiceStreams={voiceStreams}
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
              onSaveWriting={handleSaveWriting}
              onToggleWritingVisibility={handleToggleWritingVisibility}
              onToggleRoomPublicWriting={
                userRole === 'teacher' ? handleToggleRoomPublicWriting : undefined
              }
            />
          </div>
        </div>
      </div>

      <AlertDialog
        open={dialogState.isOpen}
        onClose={() => setDialogState({ ...dialogState, isOpen: false })}
        title={dialogState.title}
        message={dialogState.message}
      />
    </div>
  );
}
