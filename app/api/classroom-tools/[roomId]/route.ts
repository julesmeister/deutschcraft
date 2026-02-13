import { NextRequest, NextResponse } from 'next/server';
import { getToolState, getToolStateIfChanged, upsertToolState } from '@/lib/services/turso/classroomToolsService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const since = request.nextUrl.searchParams.get('since');

    if (since) {
      const result = await getToolStateIfChanged(roomId, parseInt(since, 10));
      if (!result) {
        return NextResponse.json({ changed: false });
      }
      return NextResponse.json({ changed: true, state: result.state, updatedAt: result.updatedAt });
    }

    const result = await getToolState(roomId);
    if (!result) {
      return NextResponse.json({ state: {}, updatedAt: 0 });
    }
    return NextResponse.json({ state: result.state, updatedAt: result.updatedAt });
  } catch (error) {
    console.error('[classroom-tools API] GET error:', error);
    return NextResponse.json({ error: 'Failed to get tool state' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { state, updatedBy } = body;

    if (!state || !updatedBy) {
      return NextResponse.json({ error: 'Missing state or updatedBy' }, { status: 400 });
    }

    await upsertToolState(roomId, state, updatedBy);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[classroom-tools API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update tool state' }, { status: 500 });
  }
}
