/**
 * Playground Service
 * Database abstraction layer for Playground features
 * Supports both Firestore (current) and Turso (future migration)
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  PlaygroundRoom,
  PlaygroundParticipant,
  PlaygroundWriting,
  PlaygroundMessage,
  PlaygroundPresence,
} from '@/lib/models/playground';

// Collection names
const COLLECTIONS = {
  ROOMS: 'playground_rooms',
  PARTICIPANTS: 'playground_participants',
  WRITINGS: 'playground_writings',
  MESSAGES: 'playground_messages',
  PRESENCE: 'playground_presence',
};

// ==================== ROOMS ====================

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

// ==================== PARTICIPANTS ====================

/**
 * Clean up old participant records that have already left
 * Useful for removing redundant data from the database
 */
export async function cleanupOldParticipants(roomId?: string): Promise<number> {
  let q;

  if (roomId) {
    // Clean up specific room
    q = query(
      collection(db, COLLECTIONS.PARTICIPANTS),
      where('roomId', '==', roomId)
    );
  } else {
    // Clean up all rooms
    q = collection(db, COLLECTIONS.PARTICIPANTS);
  }

  const snapshot = await getDocs(q);
  const toDelete = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    // Delete if user has left (leftAt is set)
    if (data.leftAt !== null) {
      toDelete.push(deleteDoc(doc.ref));
    }
  });

  await Promise.all(toDelete);
  return toDelete.length;
}

export async function joinPlaygroundRoom(
  roomId: string,
  userId: string,
  userName: string,
  userEmail: string,
  role: 'teacher' | 'student',
  peerId?: string
): Promise<string> {
  // First, clean up any old participant records for this user in this room
  // This handles cases where leftAt was set but records still exist
  const allUserParticipantsQuery = query(
    collection(db, COLLECTIONS.PARTICIPANTS),
    where('roomId', '==', roomId),
    where('userId', '==', userId)
  );

  const allUserParticipants = await getDocs(allUserParticipantsQuery);

  // Find active participant (leftAt == null)
  let activeParticipant = null;
  const oldParticipants = [];

  allUserParticipants.forEach((doc) => {
    const data = doc.data();
    if (data.leftAt === null) {
      activeParticipant = doc;
    } else {
      // Old participant that already left - mark for deletion
      oldParticipants.push(doc);
    }
  });

  // Delete old participants that have already left
  const deletePromises = oldParticipants.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // If active participant exists, update and return it
  if (activeParticipant) {
    await updateDoc(activeParticipant.ref, {
      joinedAt: serverTimestamp(), // Update join time
      peerId: peerId || null,
      isVoiceActive: false,
      isMuted: false,
    });
    return activeParticipant.id;
  }

  // Otherwise, create new participant
  const participantData = {
    roomId,
    userId,
    userName,
    userEmail,
    role,
    joinedAt: serverTimestamp(),
    leftAt: null, // Must be explicitly null for Firestore query to work
    isVoiceActive: false,
    isMuted: false,
    peerId: peerId || null,
  };

  const docRef = await addDoc(
    collection(db, COLLECTIONS.PARTICIPANTS),
    participantData
  );

  // Increment participant count
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
  const roomSnap = await getDoc(roomRef);
  if (roomSnap.exists()) {
    const currentCount = roomSnap.data().participantCount || 0;
    await updateDoc(roomRef, {
      participantCount: currentCount + 1,
    });
  }

  return docRef.id;
}

export async function leavePlaygroundRoom(
  participantId: string,
  roomId: string
): Promise<void> {
  const participantRef = doc(db, COLLECTIONS.PARTICIPANTS, participantId);
  await updateDoc(participantRef, {
    leftAt: serverTimestamp(),
    isVoiceActive: false,
  });

  // Decrement participant count
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
  const roomSnap = await getDoc(roomRef);
  if (roomSnap.exists()) {
    const currentCount = roomSnap.data().participantCount || 0;
    await updateDoc(roomRef, {
      participantCount: Math.max(0, currentCount - 1),
    });
  }
}

export async function updateParticipantVoiceStatus(
  participantId: string,
  isVoiceActive: boolean,
  isMuted: boolean
): Promise<void> {
  const participantRef = doc(db, COLLECTIONS.PARTICIPANTS, participantId);
  await updateDoc(participantRef, {
    isVoiceActive,
    isMuted,
  });
}

export async function getRoomParticipants(
  roomId: string
): Promise<PlaygroundParticipant[]> {
  const q = query(
    collection(db, COLLECTIONS.PARTICIPANTS),
    where('roomId', '==', roomId),
    where('leftAt', '==', null)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      participantId: doc.id,
      ...data,
      joinedAt: (data.joinedAt as Timestamp)?.toDate() || new Date(),
      leftAt: data.leftAt ? (data.leftAt as Timestamp).toDate() : undefined,
    } as PlaygroundParticipant;
  });
}

// ==================== WRITINGS ====================

export async function savePlaygroundWriting(
  roomId: string,
  userId: string,
  userName: string,
  content: string,
  isPublic: boolean = false
): Promise<string> {
  const wordCount = content.trim().split(/\s+/).filter((w) => w.length > 0)
    .length;

  // Check if user already has a writing in this room
  const q = query(
    collection(db, COLLECTIONS.WRITINGS),
    where('roomId', '==', roomId),
    where('userId', '==', userId)
  );

  const existing = await getDocs(q);

  if (!existing.empty) {
    // Update existing writing
    const writingRef = existing.docs[0].ref;
    await updateDoc(writingRef, {
      content,
      wordCount,
      isPublic,
      lastUpdatedAt: serverTimestamp(),
    });
    return existing.docs[0].id;
  }

  // Create new writing
  const writingData = {
    roomId,
    userId,
    userName,
    content,
    isPublic,
    wordCount,
    createdAt: serverTimestamp(),
    lastUpdatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.WRITINGS), writingData);
  return docRef.id;
}

export async function toggleWritingVisibility(
  writingId: string,
  isPublic: boolean
): Promise<void> {
  const writingRef = doc(db, COLLECTIONS.WRITINGS, writingId);
  await updateDoc(writingRef, {
    isPublic,
  });
}

export async function getRoomWritings(
  roomId: string,
  viewerUserId: string,
  viewerRole: 'teacher' | 'student'
): Promise<PlaygroundWriting[]> {
  const q = query(
    collection(db, COLLECTIONS.WRITINGS),
    where('roomId', '==', roomId),
    orderBy('lastUpdatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const writings = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      writingId: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      lastUpdatedAt: (data.lastUpdatedAt as Timestamp)?.toDate() || new Date(),
    } as PlaygroundWriting;
  });

  // Filter based on role
  if (viewerRole === 'teacher') {
    // Teachers can see all writings
    return writings;
  } else {
    // Students can only see their own + public writings
    return writings.filter(
      (w) => w.userId === viewerUserId || w.isPublic
    );
  }
}

// ==================== MESSAGES (Chat) ====================

export async function sendPlaygroundMessage(
  roomId: string,
  userId: string,
  userName: string,
  message: string,
  type: 'text' | 'system' = 'text'
): Promise<string> {
  const messageData = {
    roomId,
    userId,
    userName,
    message,
    type,
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), messageData);
  return docRef.id;
}

export async function getRoomMessages(
  roomId: string
): Promise<PlaygroundMessage[]> {
  const q = query(
    collection(db, COLLECTIONS.MESSAGES),
    where('roomId', '==', roomId),
    orderBy('timestamp', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      messageId: doc.id,
      ...data,
      timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
    } as PlaygroundMessage;
  });
}

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export function subscribeToRoom(
  roomId: string,
  callback: (room: PlaygroundRoom | null) => void
): Unsubscribe {
  const roomRef = doc(db, COLLECTIONS.ROOMS, roomId);
  return onSnapshot(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const data = snapshot.data();
    callback({
      roomId: snapshot.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      endedAt: data.endedAt ? (data.endedAt as Timestamp).toDate() : undefined,
    } as PlaygroundRoom);
  });
}

export function subscribeToParticipants(
  roomId: string,
  callback: (participants: PlaygroundParticipant[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.PARTICIPANTS),
    where('roomId', '==', roomId),
    where('leftAt', '==', null)
  );

  return onSnapshot(q, (snapshot) => {
    const participants = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        participantId: doc.id,
        ...data,
        joinedAt: (data.joinedAt as Timestamp)?.toDate() || new Date(),
        leftAt: data.leftAt ? (data.leftAt as Timestamp).toDate() : undefined,
      } as PlaygroundParticipant;
    });
    callback(participants);
  });
}

export function subscribeToWritings(
  roomId: string,
  viewerUserId: string,
  viewerRole: 'teacher' | 'student',
  callback: (writings: PlaygroundWriting[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.WRITINGS),
    where('roomId', '==', roomId),
    orderBy('lastUpdatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const writings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        writingId: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        lastUpdatedAt: (data.lastUpdatedAt as Timestamp)?.toDate() || new Date(),
      } as PlaygroundWriting;
    });

    // Filter based on role
    const filtered =
      viewerRole === 'teacher'
        ? writings
        : writings.filter((w) => w.userId === viewerUserId || w.isPublic);

    callback(filtered);
  });
}

export function subscribeToMessages(
  roomId: string,
  callback: (messages: PlaygroundMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.MESSAGES),
    where('roomId', '==', roomId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        messageId: doc.id,
        ...data,
        timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
      } as PlaygroundMessage;
    });
    callback(messages);
  });
}
