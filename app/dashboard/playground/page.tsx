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
import { useWebRTCAudio } from '@/lib/hooks/useWebRTCAudio-v2';
import { usePlaygroundHandlers } from '@/lib/hooks/usePlaygroundHandlers';
import { getUserInfo } from '@/lib/utils/userHelpers';
import { CatLoader } from '@/components/ui/CatLoader';
import {
  subscribeToRoom,
  subscribeToParticipants,
  subscribeToWritings,
  getActiveRooms,
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
  const { student: currentUser, loading: userLoading } = useCurrentStudent(session?.user?.email || null);

  // Use centralized helper to get user info (prevents email display issues)
  const { userId, userName, userEmail, userRole } = getUserInfo(currentUser, session);

  // Voice chat hook (using native WebRTC)
  const {
    isVoiceActive,
    isMuted,
    participants: audioParticipants,
    audioStreams,
    startVoice,
    stopVoice,
    toggleMute,
  } = useWebRTCAudio({
    userId,
    userName,
    roomId: currentRoom?.roomId || '',
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

  // Note: Native WebRTC handles peer connections automatically
  // No need for manual peerId management or connectToPeer calls

  const myWriting = writings.find((w) => w.userId === userId);

  // Show loading state while checking authentication and loading user data
  if (!session || userLoading) {
    return <CatLoader fullScreen message="Loading playground..." />;
  }

  // Not authenticated - redirect to login
  if (!session.user) {
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
      voiceParticipants={audioParticipants}
      voiceStreams={audioStreams}
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
