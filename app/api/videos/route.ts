import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAllVideos,
  uploadVideo,
  getVideosByCategory,
  getVideosByLevel,
  getVideosByCategoryAndLevel,
  type VideoUploadData,
} from '@/lib/services/turso';

/**
 * GET /api/videos
 * Fetch all learning videos or filter by category/level
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');

    let videos;

    if (category && level && category !== 'all' && level !== 'all') {
      videos = await getVideosByCategoryAndLevel(
        category as any,
        level as any
      );
    } else if (category && category !== 'all') {
      videos = await getVideosByCategory(category as any);
    } else if (level && level !== 'all') {
      videos = await getVideosByLevel(level as any);
    } else {
      videos = await getAllVideos();
    }

    return NextResponse.json({ success: true, videos });
  } catch (error) {
    console.error('[API] Error fetching videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/videos
 * Upload a new video (teacher only)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const videoData: VideoUploadData = await request.json();

    // uploadVideo will check if user is a teacher internally
    const videoId = await uploadVideo(session.user.email, videoData);

    return NextResponse.json({ success: true, videoId });
  } catch (error: any) {
    console.error('[API] Error uploading video:', error);

    // Check if it's a permission error
    if (error.message?.includes('Only teachers')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}
