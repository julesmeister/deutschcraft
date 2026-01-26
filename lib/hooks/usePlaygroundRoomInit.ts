/**
 * usePlaygroundRoomInit Hook
 * Handles room initialization, joining, and state management for playground room page
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getPlaygroundRoom,
  getRoomParticipants,
  joinPlaygroundRoom,
  setCurrentMaterial,
  setCurrentExercise,
} from "@/lib/services/playgroundService";
import type {
  PlaygroundRoom,
  PlaygroundParticipant,
  PlaygroundWriting,
} from "@/lib/models/playground";

interface UsePlaygroundRoomInitProps {
  roomId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: "teacher" | "student";
  userLoading: boolean;
  startVoice: () => void;
}

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
}

export function usePlaygroundRoomInit({
  roomId,
  userId,
  userName,
  userEmail,
  userRole,
  userLoading,
  startVoice,
}: UsePlaygroundRoomInitProps) {
  const router = useRouter();

  const [currentRoom, setCurrentRoom] = useState<PlaygroundRoom | null>(null);
  const [participants, setParticipants] = useState<PlaygroundParticipant[]>([]);
  const [writings, setWritings] = useState<PlaygroundWriting[]>([]);
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
  });
  const [isInitializing, setIsInitializing] = useState(true);

  // Load active rooms (needed for handlers)
  const loadActiveRooms = useCallback(async () => {
    const room = await getPlaygroundRoom(roomId);
    if (room && room.status === "active") {
      setCurrentRoom(room);
    } else if (room && room.status === "ended") {
      router.push("/dashboard/playground");
    }
  }, [roomId, router]);

  // Initialize Room
  useEffect(() => {
    const initializeRoom = async () => {
      if (!userId || !roomId) return;

      try {
        setIsInitializing(true);
        const room = await getPlaygroundRoom(roomId);

        if (!room) {
          setDialogState({
            isOpen: true,
            title: "Room Not Found",
            message: "This room does not exist or has been deleted.",
          });
          setTimeout(() => router.push("/dashboard/playground"), 2000);
          return;
        }

        if (room.status !== "active") {
          setDialogState({
            isOpen: true,
            title: "Room Ended",
            message: "This room has ended.",
          });
          setTimeout(() => router.push("/dashboard/playground"), 2000);
          return;
        }

        setCurrentRoom(room);

        // Check if already a participant
        const roomParticipants = await getRoomParticipants(roomId);
        const myParticipant = roomParticipants.find(
          (p) => p.userId === userId && !p.leftAt
        );

        if (myParticipant) {
          console.log("[Room Init] Found existing participant:", myParticipant.participantId);
          setMyParticipantId(myParticipant.participantId);
          startVoice();
        } else {
          console.log("[Room Init] Auto-joining room...");
          const participantId = await joinPlaygroundRoom(
            roomId,
            userId,
            userName,
            userEmail,
            userRole
          );
          setMyParticipantId(participantId);
          startVoice();
        }
      } catch (error) {
        console.error("[Room Init] Error:", error);
        setDialogState({
          isOpen: true,
          title: "Error",
          message: "Failed to join room.",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    if (userId && !userLoading) {
      initializeRoom();
    }
  }, [userId, userLoading, roomId, userName, userEmail, userRole, router, startVoice]);

  // Material handler
  const handleSetCurrentMaterial = useCallback(
    async (
      materialId: string | null,
      materialTitle: string | null,
      materialUrl: string | null,
      materialType?: "pdf" | "audio" | null
    ) => {
      if (!currentRoom) return;
      try {
        await setCurrentMaterial(
          currentRoom.roomId,
          materialId,
          materialTitle,
          materialUrl,
          materialType
        );
      } catch (error) {
        console.error("[Room] Error setting material:", error);
        setDialogState({
          isOpen: true,
          title: "Error",
          message: "Failed to set material",
        });
      }
    },
    [currentRoom]
  );

  // Exercise handler
  const handleSetCurrentExercise = useCallback(
    async (
      exerciseId: string | null,
      exerciseNumber: string | null,
      level: string | null,
      lessonNumber: number | null,
      bookType: "AB" | "KB" | null
    ) => {
      if (!currentRoom) return;
      try {
        await setCurrentExercise(
          currentRoom.roomId,
          exerciseId,
          exerciseNumber,
          level,
          lessonNumber,
          bookType
        );
      } catch (error) {
        console.error("[Room] Error setting exercise:", error);
        setDialogState({
          isOpen: true,
          title: "Error",
          message: "Failed to set exercise",
        });
      }
    },
    [currentRoom]
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    currentRoom,
    setCurrentRoom,
    participants,
    setParticipants,
    writings,
    setWritings,
    myParticipantId,
    setMyParticipantId,
    dialogState,
    setDialogState,
    isInitializing,
    loadActiveRooms,
    handleSetCurrentMaterial,
    handleSetCurrentExercise,
    closeDialog,
  };
}
