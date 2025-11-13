/**
 * Playground Writings Service
 * Manages writing content creation, updates, and visibility
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlaygroundWriting } from '@/lib/models/playground';

// Collection names
const COLLECTIONS = {
  WRITINGS: 'playground_writings',
};

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
