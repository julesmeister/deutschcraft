/**
 * Playground Rooms Service
 * Manages room creation, ending, and retrieval
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlaygroundRoom } from '@/lib/models/playground';
import { cleanupOldParticipants } from './participants';
import { logPlaygroundRoomHistory } from '@/lib/services/turso';

// Collection names
const COLLECTIONS = {
  ROOMS: 'playground_rooms',
  PARTICIPANTS: 'playground_participants',
};

/**
 * End all active rooms hosted by a specific user
 * This collects statistics and logs to Turso before ending
 */
export async function endAllHostRooms(hostId: string): Promise<void> {
  const q = query(
    collection(db, COLLECTIONS.ROOMS),
    where('hostId', '==', hostId),
    where('status', '==', 'active')
  );

  const snapshot = await getDocs(q);

  // End each room individually to collect statistics
  const endPromises = snapshot.docs.map((doc) => endPlaygroundRoom(doc.id));

  await Promise.all(endPromises);
}

export async function createPlaygroundRoom(
  hostId: string,
  hostName: string,
  title: string
): Promise<string> {
  // First, end any existing rooms hosted by this user
  await endAllHostRooms(hostId);

  const roomData = {
    title,
    hostId,
    hostName,
    status: 'active',
    createdAt: serverTimestamp(),
    participantCount: 0,
    isPublicWriting: false,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.ROOMS), roomData);

  // Auto-create host's writing document (public by default for teachers)
  const roomId = docRef.id;
  await createHostWriting(roomId, hostId, hostName);

  return roomId;
}

/**
 * Create the host's writing document when they create a room
 * Host writings are always public so students can see them
 */
async function createHostWriting(
  roomId: string,
  hostId: string,
  hostName: string
): Promise<void> {
  const writingData = {
    roomId,
    userId: hostId,
    userName: hostName,
    content: '',
    isPublic: true, // Host writing is always public
    wordCount: 0,
    createdAt: serverTimestamp(),
    lastUpdatedAt: serverTimestamp(),
  };

  await addDoc(collection(db, 'playground_writings'), writingData);
}

export async function endPlaygroundRoom(roomId: string): Promise<void> {
  try {
    // 1. Fetch room data
    const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      console.warn(`[endPlaygroundRoom] Room ${roomId} not found`);
      return;
    }

    const roomData = roomSnap.data();
    const createdAt = (roomData.createdAt as Timestamp)?.toDate() || new Date();
    const endedAt = new Date();
    const durationMinutes = Math.round((endedAt.getTime() - createdAt.getTime()) / 60000);

    // 2. Collect statistics
    // Get all participants (both active and left)
    const participantsQuery = query(
      collection(db, COLLECTIONS.PARTICIPANTS),
      where('roomId', '==', roomId)
    );
    const participantsSnap = await getDocs(participantsQuery);

    // Unique participants
    const uniqueParticipants = new Set<string>();
    const participantNames: string[] = [];

    participantsSnap.forEach((doc) => {
      const data = doc.data();
      if (!uniqueParticipants.has(data.userId)) {
        uniqueParticipants.add(data.userId);
        participantNames.push(data.userName);
      }
    });

    // Get messages count
    const messagesQuery = query(
      collection(db, 'playground_messages'),
      where('roomId', '==', roomId)
    );
    const messagesSnap = await getDocs(messagesQuery);
    const totalMessages = messagesSnap.size;

    // Get writings and calculate total words
    const writingsQuery = query(
      collection(db, 'playground_writings'),
      where('roomId', '==', roomId)
    );
    const writingsSnap = await getDocs(writingsQuery);
    let totalWordsWritten = 0;

    writingsSnap.forEach((doc) => {
      const data = doc.data();
      totalWordsWritten += (data.wordCount as number) || 0;
    });

    // 3. Log to Turso history
    try {
      await logPlaygroundRoomHistory({
        roomId,
        roomTitle: roomData.title,
        hostId: roomData.hostId,
        hostName: roomData.hostName,
        createdAt: createdAt.getTime(),
        endedAt: endedAt.getTime(),
        durationMinutes,
        totalParticipants: uniqueParticipants.size,
        maxConcurrentParticipants: roomData.participantCount || 0,
        totalMessages,
        totalWordsWritten,
        voiceActiveDuration: 0, // TODO: Track voice active time in the future
        participantList: participantNames,
      });
    } catch (tursoError) {
      console.error('[endPlaygroundRoom] Failed to log to Turso:', tursoError);
      // Continue even if Turso logging fails
    }

    // 4. End the room in Firestore
    await updateDoc(roomRef, {
      status: 'ended',
      endedAt: serverTimestamp(),
    });

    // 5. Clean up old participant records
    await cleanupOldParticipants(roomId);

    console.log(`[endPlaygroundRoom] Room ${roomId} ended successfully`);
  } catch (error) {
    console.error('[endPlaygroundRoom] Error ending room:', error);
    throw error;
  }
}

export async function updateRoomTitle(
  roomId: string,
  title: string
): Promise<void> {
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
  await updateDoc(roomRef, { title });
}

export async function togglePublicWriting(
  roomId: string,
  isPublic: boolean
): Promise<void> {
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
  await updateDoc(roomRef, {
    isPublicWriting: isPublic,
  });
}

export async function setCurrentMaterial(
  roomId: string,
  materialId: string | null,
  materialTitle: string | null,
  materialUrl: string | null,
  materialType?: "pdf" | "audio" | null
): Promise<void> {
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
  await updateDoc(roomRef, {
    currentMaterialId: materialId || null,
    currentMaterialTitle: materialTitle || null,
    currentMaterialUrl: materialUrl || null,
    currentMaterialType: materialType || null,
  });
}

export async function setCurrentExercise(
  roomId: string,
  exerciseId: string | null,
  exerciseNumber: string | null,
  level: string | null,
  lessonNumber: number | null,
  bookType: "AB" | "KB" | null
): Promise<void> {
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
  await updateDoc(roomRef, {
    currentExerciseId: exerciseId || null,
    currentExerciseNumber: exerciseNumber || null,
    currentExerciseLevel: level || null,
    currentExerciseLessonNumber: lessonNumber || null,
    currentExerciseBookType: bookType || null,
  });
}

export async function getPlaygroundRoom(
  roomId: string
): Promise<PlaygroundRoom | null> {
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) return null;

  const data = roomSnap.data();
  return {
    roomId: roomSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    endedAt: data.endedAt ? (data.endedAt as Timestamp).toDate() : undefined,
  } as PlaygroundRoom;
}

export async function getActiveRooms(): Promise<PlaygroundRoom[]> {
  const q = query(
    collection(db, COLLECTIONS.ROOMS),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      roomId: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      endedAt: data.endedAt ? (data.endedAt as Timestamp).toDate() : undefined,
    } as PlaygroundRoom;
  });
}

/**
 * Get room history for a specific user (rooms they hosted that have ended)
 * Returns rooms ordered by creation date (most recent first)
 */
export async function getRoomHistory(hostId: string, limit: number = 20): Promise<PlaygroundRoom[]> {
  const q = query(
    collection(db, COLLECTIONS.ROOMS),
    where('hostId', '==', hostId),
    where('status', '==', 'ended'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const rooms = snapshot.docs.slice(0, limit).map((doc) => {
    const data = doc.data();
    return {
      roomId: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      endedAt: data.endedAt ? (data.endedAt as Timestamp).toDate() : undefined,
    } as PlaygroundRoom;
  });

  return rooms;
}
