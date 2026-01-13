/**
 * Playground Participants Service
 * Manages participant joining, leaving, and status updates
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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlaygroundParticipant } from '@/lib/models/playground';

// Collection names
const COLLECTIONS = {
  ROOMS: 'playground_rooms',
  PARTICIPANTS: 'playground_participants',
  WRITINGS: 'playground_writings',
};

/**
 * Ensures a writing document exists for a user in a room
 * Creates one if it doesn't exist
 */
async function ensureUserWritingExists(
  roomId: string,
  userId: string,
  userName: string,
  role: 'teacher' | 'student'
): Promise<void> {
  // Check if writing already exists
  const q = query(
    collection(db, COLLECTIONS.WRITINGS),
    where('roomId', '==', roomId),
    where('userId', '==', userId)
  );

  const existing = await getDocs(q);
  if (!existing.empty) {
    // Writing already exists, no need to create
    return;
  }

  // Create new empty writing document
  // Teacher/host writings are public by default, student writings are private
  const writingData = {
    roomId,
    userId,
    userName,
    content: '',
    isPublic: role === 'teacher', // Teachers' writings are public by default
    wordCount: 0,
    createdAt: serverTimestamp(),
    lastUpdatedAt: serverTimestamp(),
  };

  await addDoc(collection(db, COLLECTIONS.WRITINGS), writingData);
}

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

  // Find active participants (leftAt == null)
  const activeParticipants = [];
  const oldParticipants = [];

  allUserParticipants.forEach((doc) => {
    const data = doc.data();
    if (data.leftAt === null) {
      activeParticipants.push(doc);
    } else {
      // Old participant that already left - mark for deletion
      oldParticipants.push(doc);
    }
  });

  // Delete old participants that have already left
  const deletePromises = oldParticipants.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  // If multiple active participants exist (shouldn't happen, but handle it)
  // Keep the first one and delete the rest
  if (activeParticipants.length > 1) {
    console.warn(`[joinPlaygroundRoom] Found ${activeParticipants.length} active participants for user ${userId} in room ${roomId}, cleaning up duplicates`);
    const duplicatesToDelete = activeParticipants.slice(1).map((doc) => deleteDoc(doc.ref));
    await Promise.all(duplicatesToDelete);
  }

  // If active participant exists, update and return it
  if (activeParticipants.length > 0) {
    const activeParticipant = activeParticipants[0];
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

  // Auto-create writing document for this user if it doesn't exist
  await ensureUserWritingExists(roomId, userId, userName, role);

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

export async function updateParticipantPeerId(
  participantId: string,
  peerId: string
): Promise<void> {
  const participantRef = doc(db, COLLECTIONS.PARTICIPANTS, participantId);
  await updateDoc(participantRef, {
    peerId,
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
