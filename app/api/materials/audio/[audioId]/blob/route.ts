/**
 * API Route: /api/materials/audio/[audioId]/blob
 * Serves audio blob data from Turso database as backup source
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAudioBlob } from '@/lib/services/turso/materialsService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ audioId: string }> }
) {
  try {
    const { audioId } = await context.params;

    console.log('[API] Fetching audio blob for:', audioId);

    if (!audioId) {
      return NextResponse.json(
        { error: 'Audio ID is required' },
        { status: 400 }
      );
    }

    // Get audio blob from database
    const audioBlob = await getAudioBlob(audioId);

    if (!audioBlob) {
      console.log('[API] No blob found for audio ID:', audioId);
      return NextResponse.json(
        { error: 'Audio not found or no blob data available' },
        { status: 404 }
      );
    }

    // Convert to Buffer if needed
    const buffer = Buffer.isBuffer(audioBlob)
      ? audioBlob
      : Buffer.from(audioBlob);

    console.log('[API] Serving blob:', {
      audioId,
      bufferSize: buffer.length,
      isBuffer: Buffer.isBuffer(buffer),
    });

    // Return audio blob with proper content type
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('[API] Error serving audio blob:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[API] Error details:', { errorMessage, errorStack });

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
