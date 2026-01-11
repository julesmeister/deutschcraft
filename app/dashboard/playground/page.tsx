/**
 * Playground Page (Lobby)
 * Displays available rooms and allows creating new ones
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PlaygroundLobby } from "@/components/playground/PlaygroundLobby";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { usePlaygroundInitialization } from "@/lib/hooks/usePlaygroundInitialization";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { CatLoader } from "@/components/ui/CatLoader";
import { createPlaygroundRoom } from "@/lib/services/playgroundService";
import type { PlaygroundRoom } from "@/lib/models/playground";

function PlaygroundLobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useFirebaseAuth();
  const hasLeft = searchParams.get("left") === "true";

  const [activeRooms, setActiveRooms] = useState<PlaygroundRoom[]>([]);

  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // Fetch current user
  const { student: currentUser, isLoading: userLoading } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId, userName, userRole } = getUserInfo(currentUser, session);

  // Initialize and load rooms
  usePlaygroundInitialization({
    userId,
    setActiveRooms,
    setCurrentRoom: (room) => {
      // Only redirect if user didn't just leave
      if (room && !hasLeft) {
        console.log(
          "[Playground Lobby] Restoring session, redirecting to room:",
          room.roomId
        );
        router.push(`/dashboard/playground/${room.roomId}`);
      }
    },
    setMyParticipantId: () => {}, // No-op
  });

  const handleCreateRoom = async () => {
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);
    try {
      const roomTitle = `${userName}'s Room`;
      const roomId = await createPlaygroundRoom(userId, userName, roomTitle);
      router.push(`/dashboard/playground/${roomId}`);
    } catch (error) {
      console.error("[Playground] Error creating room:", error);
      setDialogState({
        isOpen: true,
        title: "Error",
        message: "Failed to create room. Please try again.",
      });
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (room: PlaygroundRoom) => {
    router.push(`/dashboard/playground/${room.roomId}`);
  };

  if (!session || userLoading) {
    return <CatLoader fullScreen message="Loading playground..." />;
  }

  if (!session.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Please sign in to access the playground
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <PlaygroundLobby
        activeRooms={activeRooms}
        userId={userId}
        userRole={userRole}
        isCreatingRoom={isCreatingRoom}
        dialogState={dialogState}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onCloseDialog={() => setDialogState({ ...dialogState, isOpen: false })}
      />
    </motion.div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<CatLoader fullScreen message="Loading..." />}>
      <PlaygroundLobbyContent />
    </Suspense>
  );
}
