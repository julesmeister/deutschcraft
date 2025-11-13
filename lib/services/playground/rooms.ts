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

// Collection names
const COLLECTIONS = {
  ROOMS: 'playground_rooms',
  PARTICIPANTS: 'playground_participants',
};

/**
 * End all active rooms hosted by a specific user
 */
export async function endAllHostRooms(hostId: string): Promise<void> {
  const q = query(
    collection(db, COLLECTIONS.ROOMS),
    where('hostId', '==', hostId),
    where('status', '==', 'active')
  );

  const snapshot = await getDocs(q);
  const endPromises = snapshot.docs.map((doc) =>
    updateDoc(doc.ref, {
      status: 'ended',
      endedAt: serverTimestamp(),
    })
  );

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
  return docRef.id;
}

export async function endPlaygroundRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
  await updateDoc(roomRef, {
    status: 'ended',
    endedAt: serverTimestamp(),
  });

  // Clean up old participant records when room ends
  await cleanupOldParticipants(roomId);
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
