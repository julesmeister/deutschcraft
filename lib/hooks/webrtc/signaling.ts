/**
 * WebRTC Signaling
 * Firebase RTDB signaling for WebRTC peer connections
 */

import { ref as dbRef, onValue, set, push } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { sanitizeUserId } from './config';

export async function registerParticipant(
  roomId: string,
  userId: string,
  userName: string,
  isMuted: boolean
): Promise<void> {
  const sanitizedUserId = sanitizeUserId(userId);
  const myParticipantRef = dbRef(rtdb, `playground_voice/${roomId}/participants/${sanitizedUserId}`);

  await set(myParticipantRef, {
    originalUserId: userId,
    userName,
    isMuted,
    timestamp: Date.now(),
  });
}

export async function unregisterParticipant(
  roomId: string,
  userId: string
): Promise<void> {
  const sanitizedUserId = sanitizeUserId(userId);
  const myParticipantRef = dbRef(rtdb, `playground_voice/${roomId}/participants/${sanitizedUserId}`);

  await set(myParticipantRef, null);
}

export async function updateMuteStatus(
  roomId: string,
  userId: string,
  userName: string,
  isMuted: boolean
): Promise<void> {
  const sanitizedUserId = sanitizeUserId(userId);
  const myParticipantRef = dbRef(rtdb, `playground_voice/${roomId}/participants/${sanitizedUserId}`);

  await set(myParticipantRef, {
    originalUserId: userId,
    userName,
    isMuted,
    timestamp: Date.now(),
  });
}

export async function sendOffer(
  roomId: string,
  fromUserId: string,
  toUserId: string,
  offer: RTCSessionDescriptionInit
): Promise<void> {
  const sanitizedFrom = sanitizeUserId(fromUserId);
  const sanitizedTo = sanitizeUserId(toUserId);

  const offerRef = dbRef(
    rtdb,
    `playground_voice/${roomId}/signals/${sanitizedTo}/from_${sanitizedFrom}/offer`
  );

  await set(offerRef, {
    type: offer.type,
    sdp: offer.sdp,
    timestamp: Date.now(),
  });
}

export async function sendAnswer(
  roomId: string,
  fromUserId: string,
  toUserId: string,
  answer: RTCSessionDescriptionInit
): Promise<void> {
  const sanitizedFrom = sanitizeUserId(fromUserId);
  const sanitizedTo = sanitizeUserId(toUserId);

  const answerRef = dbRef(
    rtdb,
    `playground_voice/${roomId}/signals/${sanitizedTo}/from_${sanitizedFrom}/answer`
  );

  await set(answerRef, {
    type: answer.type,
    sdp: answer.sdp,
    timestamp: Date.now(),
  });
}

export async function sendIceCandidate(
  roomId: string,
  fromUserId: string,
  toUserId: string,
  candidate: RTCIceCandidateInit
): Promise<void> {
  const sanitizedFrom = sanitizeUserId(fromUserId);
  const sanitizedTo = sanitizeUserId(toUserId);

  const candidateRef = push(
    dbRef(rtdb, `playground_voice/${roomId}/signals/${sanitizedTo}/from_${sanitizedFrom}/candidates`)
  );

  await set(candidateRef, {
    candidate: candidate,
    timestamp: Date.now(),
  });
}

export function listenForOffer(
  roomId: string,
  myUserId: string,
  remoteUserId: string,
  callback: (offer: RTCSessionDescriptionInit) => void
): () => void {
  const sanitizedMyId = sanitizeUserId(myUserId);
  const sanitizedRemoteId = sanitizeUserId(remoteUserId);

  const offerRef = dbRef(
    rtdb,
    `playground_voice/${roomId}/signals/${sanitizedMyId}/from_${sanitizedRemoteId}/offer`
  );

  return onValue(offerRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.sdp) {
      callback(data);
    }
  });
}

export function listenForAnswer(
  roomId: string,
  myUserId: string,
  remoteUserId: string,
  callback: (answer: RTCSessionDescriptionInit) => void
): () => void {
  const sanitizedMyId = sanitizeUserId(myUserId);
  const sanitizedRemoteId = sanitizeUserId(remoteUserId);

  const answerRef = dbRef(
    rtdb,
    `playground_voice/${roomId}/signals/${sanitizedMyId}/from_${sanitizedRemoteId}/answer`
  );

  return onValue(answerRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.sdp) {
      callback(data);
    }
  });
}

export function listenForIceCandidates(
  roomId: string,
  myUserId: string,
  remoteUserId: string,
  callback: (candidate: RTCIceCandidateInit) => void
): () => void {
  const sanitizedMyId = sanitizeUserId(myUserId);
  const sanitizedRemoteId = sanitizeUserId(remoteUserId);

  const candidatesRef = dbRef(
    rtdb,
    `playground_voice/${roomId}/signals/${sanitizedMyId}/from_${sanitizedRemoteId}/candidates`
  );

  return onValue(candidatesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    Object.values(data).forEach((candidateData: any) => {
      if (candidateData.candidate) {
        callback(candidateData.candidate);
      }
    });
  });
}
