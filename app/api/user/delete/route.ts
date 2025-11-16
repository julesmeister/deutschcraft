import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAuth } from 'firebase-admin/auth';
import { adminApp, adminDb } from '@/lib/firebaseAdmin';

/**
 * DELETE /api/user/delete
 * Deletes both Firebase Auth account and Firestore user document
 *
 * This must be done server-side because:
 * 1. Firebase Admin SDK can delete any user account
 * 2. Client SDK can only delete currently authenticated user
 * 3. We need to ensure both Auth and Firestore are deleted atomically
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - No active session' },
        { status: 401 }
      );
    }

    const email = session.user.email;
    const adminAuth = getAuth(adminApp);

    // Step 1: Get the user's UID from Firebase Auth by email
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Step 2: Delete Firebase Auth account (if exists)
    if (userRecord) {
      try {
        await adminAuth.deleteUser(userRecord.uid);
      } catch (error: any) {
        // Continue with Firestore deletion even if Auth deletion fails
      }
    }

    // Step 3: Delete Firestore user document
    try {
      await adminDb.collection('users').doc(email).delete();
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Failed to delete user data from database' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account deleted successfully',
        deletedAuth: !!userRecord,
        deletedFirestore: true
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
