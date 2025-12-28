import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserAdmin } from '@/lib/services/userServiceAdmin';
import { db } from '@/turso/client';

/**
 * Sync current logged-in user from Firebase to Turso
 * POST /api/database/sync-current-user
 */
export async function POST() {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const email = session.user.email;
    console.log('[Sync User] Syncing user:', email);

    // Get user from Firebase
    const user = await getUserAdmin(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in Firebase' },
        { status: 404 }
      );
    }

    // Insert into Turso
    await db.execute({
      sql: `INSERT OR REPLACE INTO users (
        email, user_id, name, first_name, last_name, photo_url, role,
        cefr_level, teacher_id, batch_id, enrollment_status,
        desired_cefr_level, words_learned, current_streak,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        user.email,
        user.userId || user.email,
        user.name || null,
        user.firstName || null,
        user.lastName || null,
        user.photoURL || null,
        user.role || 'PENDING_APPROVAL',
        user.cefrLevel || null,
        user.teacherId || null,
        user.batchId || null,
        user.enrollmentStatus || null,
        user.desiredCefrLevel || null,
        user.wordsLearned || 0,
        user.currentStreak || 0,
        user.createdAt || Date.now(),
        user.updatedAt || Date.now(),
      ],
    });

    console.log('[Sync User] ✓ User synced to Turso successfully');

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Sync User] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
