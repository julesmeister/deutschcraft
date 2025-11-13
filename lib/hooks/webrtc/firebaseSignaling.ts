/**
 * Firebase WebRTC Signaling (Best Practices)
 * Based on official Firebase WebRTC codelab
 * Uses broadcast-style signaling with proper candidate handling
 */

import { ref as dbRef, onValue, onChildAdded, set, push, query, orderByChild, limitToLast } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

// Sanitize userId for Firebase paths (remove invalid characters)
function sanitizeUserId(id: string): string {
  return id.replace(/[.#$[\]@]/g, '_');
}

export interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'participant-joined' | 'participant-left';
  fromUserId: string;
  toUserId?: string; // undefined = broadcast to all
  data?: any;
  timestamp: number;
}

/**
 * Broadcast a signal to all participants in a room
 * Uses single channel path for all messages (Supabase-style)
 */
export async function broadcastSignal(
  roomId: string,
  message: SignalMessage
): Promise<void> {
  try {
    const signalsRef = dbRef(rtdb, `playground_voice/${roomId}/signals`);
    const newSignalRef = push(signalsRef);

    await set(newSignalRef, {
      ...message,
      timestamp: Date.now(),
    });

    console.log('[Signaling] Broadcast:', message.type, 'from:', message.fromUserId, 'to:', message.toUserId || 'all');
  } catch (error) {
    console.error('[Signaling] Broadcast failed:', error);
    throw error;
  }
}

/**
 * Listen for all signals in a room using onChildAdded
 * Better for realtime updates - triggers immediately when new signal arrives
 */
export function listenForSignals(
  roomId: string,
  myUserId: string,
  onSignal: (signal: SignalMessage) => void
): () => void {
  const signalsRef = dbRef(rtdb, `playground_voice/${roomId}/signals`);

  // Only listen to recent signals (last 50)
  const signalsQuery = query(signalsRef, orderByChild('timestamp'), limitToLast(50));

  console.log('[Signaling] Setting up onChildAdded listener for room:', roomId);

  // Use onChildAdded - triggers for each existing child AND each new child added
  const unsubscribe = onChildAdded(signalsQuery, (snapshot) => {
    const signal = snapshot.val() as SignalMessage;
    if (!signal) return;

    // Skip own messages
    if (signal.fromUserId === myUserId) {
      console.log('[Signaling] Skipping own message:', signal.type);
      return;
    }

    // Filter: only process if message is for me or broadcast
    const isForMe = !signal.toUserId || signal.toUserId === myUserId;
    if (!isForMe) {
      console.log('[Signaling] Message not for me:', signal.type, 'toUserId:', signal.toUserId);
      return;
    }

    // Skip old messages (more than 10 seconds old)
    const age = Date.now() - (signal.timestamp || 0);
    if (age > 10000) {
      console.log('[Signaling] Skipping old message:', signal.type, 'age:', age, 'ms');
      return;
    }

    console.log('[Signaling] ✅ NEW SIGNAL:', signal.type, 'from:', signal.fromUserId);
    onSignal(signal);
  });

  return unsubscribe;
}

/**
 * Register participant in room
 */
export async function registerParticipant(
  roomId: string,
  userId: string,
  userName: string,
  isMuted: boolean
): Promise<void> {
  try {
    const sanitizedUserId = sanitizeUserId(userId);
    const participantRef = dbRef(rtdb, `playground_voice/${roomId}/participants/${sanitizedUserId}`);

    await set(participantRef, {
      userId,
      userName,
      isMuted,
      timestamp: Date.now(),
    });

    console.log('[Signaling] Registered participant:', userName);

    // Broadcast join announcement
    await broadcastSignal(roomId, {
      type: 'participant-joined',
      fromUserId: userId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Signaling] Failed to register participant:', error);
    throw error;
  }
}

/**
 * Unregister participant from room
 */
export async function unregisterParticipant(
  roomId: string,
  userId: string
): Promise<void> {
  try {
    // Broadcast leave announcement first
    await broadcastSignal(roomId, {
      type: 'participant-left',
      fromUserId: userId,
      timestamp: Date.now(),
    });

    const sanitizedUserId = sanitizeUserId(userId);
    const participantRef = dbRef(rtdb, `playground_voice/${roomId}/participants/${sanitizedUserId}`);
    await set(participantRef, null);

    console.log('[Signaling] Unregistered participant:', userId);
  } catch (error) {
    console.error('[Signaling] Failed to unregister participant:', error);
  }
}

/**
 * Update participant mute status
 */
export async function updateMuteStatus(
  roomId: string,
  userId: string,
  userName: string,
  isMuted: boolean
): Promise<void> {
  try {
    const sanitizedUserId = sanitizeUserId(userId);
    const participantRef = dbRef(rtdb, `playground_voice/${roomId}/participants/${sanitizedUserId}`);

    await set(participantRef, {
      userId,
      userName,
      isMuted,
      timestamp: Date.now(),
    });

    console.log('[Signaling] Updated mute status:', userName, isMuted ? 'MUTED' : 'UNMUTED');
  } catch (error) {
    console.error('[Signaling] Failed to update mute status:', error);
  }
}

/**
 * Listen for participant changes
 */
export function listenForParticipants(
  roomId: string,
  myUserId: string,
  onParticipantsChange: (participants: any[]) => void
): () => void {
  const participantsRef = dbRef(rtdb, `playground_voice/${roomId}/participants`);
  const sanitizedMyUserId = sanitizeUserId(myUserId);

  const unsubscribe = onValue(participantsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      onParticipantsChange([]);
      return;
    }

    const participants = Object.entries(data)
      .filter(([id]) => id !== sanitizedMyUserId)
      .map(([id, info]: [string, any]) => ({
        userId: info.userId || id,
        userName: info.userName || 'Unknown',
        isMuted: info.isMuted || false,
        audioLevel: 0,
        connectionQuality: 'disconnected' as const,
      }));

    onParticipantsChange(participants);
  });

  return unsubscribe;
}

/**
 * Send WebRTC offer to a specific peer
 */
export async function sendOffer(
  roomId: string,
  fromUserId: string,
  toUserId: string,
  offer: RTCSessionDescriptionInit
): Promise<void> {
  await broadcastSignal(roomId, {
    type: 'offer',
    fromUserId,
    toUserId,
    data: {
      type: offer.type,
      sdp: offer.sdp,
    },
    timestamp: Date.now(),
  });
}

/**
 * Send WebRTC answer to a specific peer
 */
export async function sendAnswer(
  roomId: string,
  fromUserId: string,
  toUserId: string,
  answer: RTCSessionDescriptionInit
): Promise<void> {
  await broadcastSignal(roomId, {
    type: 'answer',
    fromUserId,
    toUserId,
    data: {
      type: answer.type,
      sdp: answer.sdp,
    },
    timestamp: Date.now(),
  });
}

/**
 * Send ICE candidate to a specific peer
 */
export async function sendIceCandidate(
  roomId: string,
  fromUserId: string,
  toUserId: string,
  candidate: RTCIceCandidateInit
): Promise<void> {
  await broadcastSignal(roomId, {
    type: 'ice-candidate',
    fromUserId,
    toUserId,
    data: candidate,
    timestamp: Date.now(),
  });
}
