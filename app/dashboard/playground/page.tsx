/**
 * Playground Page
 * Collaborative voice + writing space for teachers and students
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlaygroundLobby } from '@/components/playground/PlaygroundLobby';
import { PlaygroundRoom as PlaygroundRoomComponent } from '@/components/playground/PlaygroundRoom';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { useWebRTCMedia } from '@/lib/hooks/useWebRTCMedia';
import { usePlaygroundHandlers } from '@/lib/hooks/usePlaygroundHandlers';
import { usePlaygroundInitialization } from '@/lib/hooks/usePlaygroundInitialization';
import { usePlaygroundSubscriptions } from '@/lib/hooks/usePlaygroundSubscriptions';
import { usePlaygroundSessionSync } from '@/lib/hooks/usePlaygroundSessionSync';
import { getUserInfo } from '@/lib/utils/userHelpers';
import { CatLoader } from '@/components/ui/CatLoader';
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
  const { student: currentUser, isLoading: userLoading } = useCurrentStudent(session?.user?.email || null);

  // Use centralized helper to get user info (prevents email display issues)
  const { userId, userName, userEmail, userRole } = getUserInfo(currentUser, session);

  // Initialize and load rooms
  const { loadActiveRooms } = usePlaygroundInitialization({
    userId,
    setActiveRooms,
    setCurrentRoom,
    setMyParticipantId,
  });

  // Media chat hook (using native WebRTC with video support)
  const {
    isVoiceActive,
    isVideoActive,
    isMuted,
    participants: mediaParticipants,
    audioStreams,
    videoStreams,
    audioAnalysers,
    localStream,
    startVoice,
    startVideo,
    stopVoice,
    toggleMute,
    toggleVideo,
  } = useWebRTCMedia({
    userId,
    userName,
    roomId: currentRoom?.roomId || '',
    enableVideo: false, // Start with video disabled by default
    onError: (error) => {
      setDialogState({
        isOpen: true,
        title: 'Media Chat Error',
        message: error.message || 'Failed to connect media chat',
      });
    },
  });

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
    handleStartVideo,
    handleStopVoice,
    handleToggleMute,
    handleToggleVideo,
  } = usePlaygroundHandlers({
    userId,
    userName,
    userEmail,
    userRole,
    myParticipantId,
    currentRoom,
    isVoiceActive,
    isVideoActive,
    isMuted,
    setDialogState,
    setMyParticipantId,
    setCurrentRoom,
    setParticipants,
    setWritings,
    stopVoice,
    startVoice,
    startVideo,
    toggleMute,
    toggleVideo,
    loadActiveRooms,
  });

  // Subscribe to room, participants, and writings
  usePlaygroundSubscriptions({
    currentRoom,
    userId,
    userRole,
    handleLeaveRoom,
    setParticipants,
    setWritings,
  });

  // Sync with session context
  const { playgroundSession } = usePlaygroundSessionSync({
    currentRoom,
    participants,
    writings,
    myParticipantId,
    userId,
    userName,
    userEmail,
    userRole,
    isVoiceActive,
    isVideoActive,
    isMuted,
  });

  // End session when leaving room
  const wrappedHandleLeaveRoom = async () => {
    await handleLeaveRoom();
    playgroundSession.endSession();
  };

  // Minimize handler
  const handleMinimize = () => {
    playgroundSession.minimize();
    // Navigate away from playground to show minimized widget
    router.push('/dashboard/student');
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

  // Auto-maximize when navigating to playground page while minimized
  // Only runs once on mount if already minimized
  useEffect(() => {
    if (playgroundSession.session?.isMinimized) {
      playgroundSession.maximize();
    }
  }, []); // Empty deps - only run on mount

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

  // If session is minimized, show loading while maximizing (handled by useEffect above)
  if (playgroundSession.session?.isMinimized) {
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
    <PlaygroundRoomComponent
      currentRoom={currentRoom}
      participants={participants}
      writings={writings}
      myWriting={myWriting}
      userId={userId}
      userName={userName}
      userRole={userRole}
      isVoiceActive={isVoiceActive}
      isVideoActive={isVideoActive}
      isMuted={isMuted}
      localStream={localStream}
      mediaParticipants={mediaParticipants}
      audioStreams={audioStreams}
      videoStreams={videoStreams}
      audioAnalysers={audioAnalysers}
      dialogState={dialogState}
      onLeaveRoom={wrappedHandleLeaveRoom}
      onEndRoom={handleEndRoom}
      onStartVoice={handleStartVoice}
      onStartVideo={handleStartVideo}
      onStopVoice={handleStopVoice}
      onToggleMute={handleToggleMute}
      onToggleVideo={handleToggleVideo}
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
