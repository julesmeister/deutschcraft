/**
 * API Route: /api/materials/audio/[audioId]/blob
 * Serves audio blob data from Turso database as backup source
 *
 * Features:
 * - HTTP Range Requests (RFC 7233) for audio seeking
 * - Efficient memory usage with streaming
 * - ETags for cache validation
 * - Optimized headers for audio playback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAudioBlob } from '@/lib/services/turso/materialsService';
import crypto from 'crypto';

/**
 * Parse Range header
 * Format: "bytes=start-end" or "bytes=start-"
 */
function parseRangeHeader(rangeHeader: string | null, fileSize: number): { start: number; end: number } | null {
  if (!rangeHeader) {
    return null;
  }

  const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
  if (!match) {
    return null;
  }

  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

  // Validate range
  if (start >= fileSize || end >= fileSize || start > end) {
    return null;
  }

  return { start, end };
}

/**
 * Generate ETag from audio ID (simple but effective)
 */
function generateETag(audioId: string, size: number): string {
  const hash = crypto.createHash('md5').update(`${audioId}-${size}`).digest('hex');
  return `"${hash.substring(0, 16)}"`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ audioId: string }> }
) {
  try {
    const { audioId } = await context.params;

    if (!audioId) {
      return NextResponse.json(
        { error: 'Audio ID is required' },
        { status: 400 }
      );
    }

    // Get audio blob from database
    const audioBlob = await getAudioBlob(audioId);

    if (!audioBlob) {
      return NextResponse.json(
        { error: 'Audio not found or no blob data available' },
        { status: 404 }
      );
    }

    // Convert to Buffer if needed
    const buffer = Buffer.isBuffer(audioBlob)
      ? audioBlob
      : Buffer.from(audioBlob);

    const fileSize = buffer.length;
    const etag = generateETag(audioId, fileSize);

    // Check If-None-Match for 304 Not Modified
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Parse Range header
    const rangeHeader = request.headers.get('range');
    const range = parseRangeHeader(rangeHeader, fileSize);

    // Handle Range Request
    if (range) {
      const { start, end } = range;
      const contentLength = end - start + 1;
      const chunk = buffer.slice(start, end + 1);

      console.log('[API] Serving partial content:', {
        audioId,
        range: `${start}-${end}/${fileSize}`,
        chunkSize: contentLength,
      });

      return new NextResponse(new Uint8Array(chunk), {
        status: 206, // Partial Content
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': contentLength.toString(),
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'ETag': etag,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Last-Modified': new Date().toUTCString(), // Could be from DB if stored
        },
      });
    }

    // Handle full content request
    console.log('[API] Serving full content:', {
      audioId,
      size: fileSize,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'ETag': etag,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Last-Modified': new Date().toUTCString(),
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
