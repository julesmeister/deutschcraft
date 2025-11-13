/**
 * Playground Messages Service
 * Manages chat/messaging functionality for playground rooms
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlaygroundMessage } from '@/lib/models/playground';

// Collection names
const COLLECTIONS = {
  MESSAGES: 'playground_messages',
};

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
