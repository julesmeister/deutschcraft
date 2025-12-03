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
import { usePlaygroundSession } from '@/lib/contexts/PlaygroundSessionContext';
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
  const playgroundSession = usePlaygroundSession();

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
    audioAnalysers,
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
  const loadActiveRooms = useCallback(async () => {
    try {
      const rooms = await getActiveRooms();
      setActiveRooms(rooms);
    } catch (error) {
      // Silent error handling
      console.error('[Playground] Failed to load rooms:', error);
    }
  }, []);

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
  }, [currentRoom?.roomId, currentRoom?.status, userId, userRole, handleLeaveRoom]);

  // Note: Native WebRTC handles peer connections automatically
  // No need for manual peerId management or connectToPeer calls

  // Sync with session context when room state changes
  useEffect(() => {
    if (currentRoom && userId && userName && userEmail) {
      playgroundSession.updateSession({
        currentRoom,
        participants,
        writings,
        myParticipantId,
        userId,
        userName,
        userEmail,
        userRole,
        isVoiceActive,
        isMuted,
      });
    }
  }, [currentRoom, participants, writings, myParticipantId, userId, userName, userEmail, userRole, isVoiceActive, isMuted]);

  // Start session when joining a room
  useEffect(() => {
    if (currentRoom && userId && userName && userEmail && !playgroundSession.session) {
      playgroundSession.startSession({
        currentRoom,
        participants,
        writings,
        myParticipantId,
        userId,
        userName,
        userEmail,
        userRole,
        isVoiceActive,
        isMuted,
      });
    }
  }, [currentRoom?.roomId]);

  // End session when leaving room
  const wrappedHandleLeaveRoom = async () => {
    await handleLeaveRoom();
    playgroundSession.endSession();
  };

  // Minimize handler
  const handleMinimize = () => {
    playgroundSession.minimize();
  };

  // Check if user wants to maximize from minimized state
  useEffect(() => {
    if (playgroundSession.session && !playgroundSession.session.isMinimized && currentRoom) {
      // User is maximizing - restore session state
      setCurrentRoom(playgroundSession.session.currentRoom);
      setParticipants(playgroundSession.session.participants);
      setWritings(playgroundSession.session.writings);
      setMyParticipantId(playgroundSession.session.myParticipantId);
    }
  }, [playgroundSession.session?.isMinimized]);

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

  // If session is minimized, show nothing (minimized view is in layout)
  if (playgroundSession.session?.isMinimized) {
    // User navigated to playground while minimized - maximize it
    playgroundSession.maximize();
    return <CatLoader fullScreen message="Restoring playground..." />;
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
      voiceAnalysers={audioAnalysers}
      dialogState={dialogState}
      onLeaveRoom={wrappedHandleLeaveRoom}
      onEndRoom={handleEndRoom}
      onStartVoice={handleStartVoice}
      onStopVoice={handleStopVoice}
      onToggleMute={handleToggleMute}
      onSaveWriting={handleSaveWriting}
      onToggleWritingVisibility={handleToggleWritingVisibility}
      onToggleRoomPublicWriting={
        userRole === 'teacher' ? handleToggleRoomPublicWriting : undefined
      }
      onMinimize={handleMinimize}
      onCloseDialog={() => setDialogState({ ...dialogState, isOpen: false })}
    />
  );
}
