/**
 * Firebase Admin SDK for server-side operations
 * Used in NextAuth callbacks and API routes
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

/**
 * Initialize Firebase Admin SDK
 * Safe to call multiple times
 */
export function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error('Firebase Admin credentials not configured');
    }

    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getFirestore(adminApp);
  return { adminApp, adminDb };
}

// Initialize on module load
const { adminApp: app, adminDb: db } = initializeFirebaseAdmin();

export { app as adminApp, db as adminDb };
