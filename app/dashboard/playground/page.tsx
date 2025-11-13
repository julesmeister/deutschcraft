/**
 * Playground Page
 * Collaborative voice + writing space for teachers and students
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PlaygroundLobby } from '@/components/playground/PlaygroundLobby';
import { PlaygroundRoom } from '@/components/playground/PlaygroundRoom';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { useVoiceChat } from '@/lib/hooks/useVoiceChat';
import { usePlaygroundHandlers } from '@/lib/hooks/usePlaygroundHandlers';
import { getUserInfo } from '@/lib/utils/userHelpers';
import {
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToWritings,
  getActiveRooms,
  updateParticipantPeerId,
  getRoomParticipants,
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

  // Load active rooms function
  const loadActiveRooms = async () => {
    try {
      const rooms = await getActiveRooms();
      setActiveRooms(rooms);
    } catch (error) {
      // Silent error handling
    }
  };

  // Playground handlers hook
  const {
    isCreatingRoom,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    handleEndRoom,
    handleToggleRoomPublicWriting,
    handleSaveWriting,
    handleToggleWritingVisibility,
    handleStartVoice,
    handleStopVoice,
    handleToggleMute,
  } = usePlaygroundHandlers({
    userId,
    userName,
    userEmail,
    userRole,
    myPeerId,
    myParticipantId,
    currentRoom,
    isVoiceActive,
    isMuted,
    setDialogState,
    setMyParticipantId,
    setCurrentRoom,
    setParticipants,
    setWritings,
    stopVoice,
    startVoice,
    toggleMute,
    loadActiveRooms,
  });

  // Load active rooms and restore session on mount
  useEffect(() => {
    const initializePlayground = async () => {
      if (!userId) return;

      try {
        // Load all active rooms
        const rooms = await getActiveRooms();
        setActiveRooms(rooms);

        // Check if user is already in a room (restore session after refresh)
        for (const room of rooms) {
          const roomParticipants = await getRoomParticipants(room.roomId);
          const myParticipant = roomParticipants.find(p => p.userId === userId && !p.leftAt);

          if (myParticipant) {
            console.log('[Playground] Restoring session - user is in room:', room.title);
            setCurrentRoom(room);
            setMyParticipantId(myParticipant.participantId);
            break; // User can only be in one room at a time
          }
        }
      } catch (error) {
        console.error('[Playground] Failed to initialize:', error);
      }
    };

    initializePlayground();
  }, [userId]);

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

  // Update peerId in Firestore when it becomes available
  useEffect(() => {
    if (myPeerId && myParticipantId && isVoiceActive) {
      console.log('[Playground] Updating peerId in Firestore:', myPeerId);
      updateParticipantPeerId(myParticipantId, myPeerId).catch(err => {
        console.error('[Playground] Failed to update peerId:', err);
      });
    }
  }, [myPeerId, myParticipantId, isVoiceActive]);

  // Handle voice peer connections when participants change
  // Note: We attempt connection to ALL peers with peerIds, regardless of voice status
  // The voice streams will only be active when users enable their microphones
  useEffect(() => {
    if (participants.length === 0) {
      console.log('[Playground] Not connecting - no participants');
      return;
    }

    // Only initiate connections if WE have voice active (we need our stream to call)
    if (!isVoiceActive) {
      console.log('[Playground] Not connecting - my voice is not active (no stream to send)');
      return;
    }

    console.log('[Playground] Checking participants for peer connections...');
    participants.forEach((p) => {
      console.log('[Playground] Participant:', p.userName, {
        hasPeerId: !!p.peerId,
        peerId: p.peerId,
        isMe: p.userId === userId,
        isVoiceActive: p.isVoiceActive,
      });

      // Connect to anyone with a peerId (not just those with voice active)
      // They need to be able to receive our call even if their voice isn't on yet
      if (p.peerId && p.userId !== userId) {
        console.log('[Playground] ✅ Attempting connection to peer:', p.peerId, 'for user:', p.userName);
        connectToPeer(p.peerId, p.userId, p.userName);
      } else if (p.userId !== userId && !p.peerId) {
        console.log('[Playground] ⏭️ Skipping', p.userName, '- no peerId yet');
      }
    });
  }, [participants, isVoiceActive, userId, connectToPeer]);

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
      <PlaygroundLobby
        activeRooms={activeRooms}
        userRole={userRole}
        isCreatingRoom={isCreatingRoom}
        dialogState={dialogState}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onCloseDialog={() => setDialogState({ ...dialogState, isOpen: false })}
      />
    );
  }

  // Room view (joined a room)
  return (
    <PlaygroundRoom
      currentRoom={currentRoom}
      participants={participants}
      writings={writings}
      myWriting={myWriting}
      userId={userId}
      userRole={userRole}
      isVoiceActive={isVoiceActive}
      isMuted={isMuted}
      voiceParticipants={voiceParticipants}
      voiceStreams={voiceStreams}
      dialogState={dialogState}
      onLeaveRoom={handleLeaveRoom}
      onEndRoom={handleEndRoom}
      onStartVoice={handleStartVoice}
      onStopVoice={handleStopVoice}
      onToggleMute={handleToggleMute}
      onSaveWriting={handleSaveWriting}
      onToggleWritingVisibility={handleToggleWritingVisibility}
      onToggleRoomPublicWriting={
        userRole === 'teacher' ? handleToggleRoomPublicWriting : undefined
      }
      onCloseDialog={() => setDialogState({ ...dialogState, isOpen: false })}
    />
  );
}
