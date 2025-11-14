/**
 * Playground Subscriptions Service
 * Real-time listeners for rooms, participants, writings, and messages
 */

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  PlaygroundRoom,
  PlaygroundParticipant,
  PlaygroundWriting,
  PlaygroundMessage,
} from '@/lib/models/playground';

// Collection names
const COLLECTIONS = {
  ROOMS: 'playground_rooms',
  PARTICIPANTS: 'playground_participants',
  WRITINGS: 'playground_writings',
  MESSAGES: 'playground_messages',
};

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

    // All users see all writings (collaborative learning environment)
    callback(writings);
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
