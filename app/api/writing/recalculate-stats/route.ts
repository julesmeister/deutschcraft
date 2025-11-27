/**
 * API Route: Recalculate Writing Stats
 * Manually trigger stats recalculation for a student
 *
 * This is useful for:
 * 1. Fixing stats that got out of sync
 * 2. Updating stats for existing graded submissions
 * 3. One-time data migration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recalculateWritingStatsAdmin } from '@/lib/services/writing/stats-calculator.admin';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get userId from request body
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Recalculate stats using admin service
    const stats = await recalculateWritingStatsAdmin(userId);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[recalculate-stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
