/**
 * Video Service - Turso Implementation
 * Handles learning video uploads and management
 *
 * Features:
 * - Teacher-only video uploads
 * - Support for TikTok-style videos (9:16 ratio)
 * - Support for photo slideshows
 * - Category and level filtering
 * - Thumbnail generation
 * - Video metadata management
 */

import { db } from '@/turso/client';
import type { LearningVideo, VideoUploadData, VideoCategory, CEFRLevel } from '@/lib/models/video';

// Re-export types for convenience
export type { LearningVideo, VideoUploadData, VideoCategory, CEFRLevel };

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToVideo(row: any): LearningVideo {
  return {
    videoId: row.video_id as string,
    title: row.title as string,
    description: row.description as string,
    videoUrl: row.video_url as string,
    thumbnailUrl: row.thumbnail_url as string | undefined,
    category: row.category as VideoCategory,
    level: row.level as CEFRLevel | undefined,
    isSlideshow: Boolean(row.is_slideshow),
    uploadedBy: row.uploaded_by as string,
    uploaderName: row.uploader_name as string | undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

/**
 * Check if user is a teacher (has permission to upload)
 */
async function isTeacher(userId: string): Promise<boolean> {
  try {
    const result = await db.execute({
      sql: 'SELECT role FROM users WHERE user_id = ? LIMIT 1',
      args: [userId],
    });

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0].role === 'TEACHER';
  } catch (error) {
    console.error('[videoService:turso] Error checking teacher role:', error);
    return false;
  }
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Upload a new learning video (teacher only)
 */
export async function uploadVideo(
  userId: string,
  videoData: VideoUploadData
): Promise<string> {
  // Check if user is a teacher
  const hasPermission = await isTeacher(userId);
  if (!hasPermission) {
    throw new Error('Only teachers can upload videos');
  }

  const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  try {
    await db.execute({
      sql: `INSERT INTO learning_videos (
        video_id, title, description, video_url, thumbnail_url,
        category, level, is_slideshow, uploaded_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        videoId,
        videoData.title,
        videoData.description,
        videoData.videoUrl,
        videoData.thumbnailUrl || null,
        videoData.category,
        videoData.level || null,
        videoData.isSlideshow ? 1 : 0,
        userId,
        now,
        now,
      ],
    });

    console.log('[videoService:turso] Video uploaded successfully:', videoId);
    return videoId;
  } catch (error) {
    console.error('[videoService:turso] Error uploading video:', error);
    throw error;
  }
}

/**
 * Get all learning videos
 */
export async function getAllVideos(): Promise<LearningVideo[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          v.*,
          u.first_name || ' ' || u.last_name as uploader_name
        FROM learning_videos v
        LEFT JOIN users u ON v.uploaded_by = u.user_id
        ORDER BY v.created_at DESC
      `,
      args: [],
    });

    return result.rows.map(rowToVideo);
  } catch (error) {
    console.error('[videoService:turso] Error fetching all videos:', error);
    throw error;
  }
}

/**
 * Get videos by category
 */
export async function getVideosByCategory(category: VideoCategory): Promise<LearningVideo[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          v.*,
          u.first_name || ' ' || u.last_name as uploader_name
        FROM learning_videos v
        LEFT JOIN users u ON v.uploaded_by = u.user_id
        WHERE v.category = ?
        ORDER BY v.created_at DESC
      `,
      args: [category],
    });

    return result.rows.map(rowToVideo);
  } catch (error) {
    console.error('[videoService:turso] Error fetching videos by category:', error);
    throw error;
  }
}

/**
 * Get videos by CEFR level
 */
export async function getVideosByLevel(level: CEFRLevel): Promise<LearningVideo[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          v.*,
          u.first_name || ' ' || u.last_name as uploader_name
        FROM learning_videos v
        LEFT JOIN users u ON v.uploaded_by = u.user_id
        WHERE v.level = ?
        ORDER BY v.created_at DESC
      `,
      args: [level],
    });

    return result.rows.map(rowToVideo);
  } catch (error) {
    console.error('[videoService:turso] Error fetching videos by level:', error);
    throw error;
  }
}

/**
 * Get videos by category and level
 */
export async function getVideosByCategoryAndLevel(
  category: VideoCategory,
  level: CEFRLevel
): Promise<LearningVideo[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          v.*,
          u.first_name || ' ' || u.last_name as uploader_name
        FROM learning_videos v
        LEFT JOIN users u ON v.uploaded_by = u.user_id
        WHERE v.category = ? AND v.level = ?
        ORDER BY v.created_at DESC
      `,
      args: [category, level],
    });

    return result.rows.map(rowToVideo);
  } catch (error) {
    console.error('[videoService:turso] Error fetching videos by category and level:', error);
    throw error;
  }
}

/**
 * Get a single video by ID
 */
export async function getVideoById(videoId: string): Promise<LearningVideo | null> {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          v.*,
          u.first_name || ' ' || u.last_name as uploader_name
        FROM learning_videos v
        LEFT JOIN users u ON v.uploaded_by = u.user_id
        WHERE v.video_id = ?
        LIMIT 1
      `,
      args: [videoId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToVideo(result.rows[0]);
  } catch (error) {
    console.error('[videoService:turso] Error fetching video by ID:', error);
    throw error;
  }
}

/**
 * Update video metadata (teacher only)
 */
export async function updateVideo(
  userId: string,
  videoId: string,
  updates: Partial<VideoUploadData>
): Promise<void> {
  // Check if user is a teacher
  const hasPermission = await isTeacher(userId);
  if (!hasPermission) {
    throw new Error('Only teachers can update videos');
  }

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.videoUrl !== undefined) {
    fields.push('video_url = ?');
    values.push(updates.videoUrl);
  }
  if (updates.thumbnailUrl !== undefined) {
    fields.push('thumbnail_url = ?');
    values.push(updates.thumbnailUrl);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.level !== undefined) {
    fields.push('level = ?');
    values.push(updates.level);
  }
  if (updates.isSlideshow !== undefined) {
    fields.push('is_slideshow = ?');
    values.push(updates.isSlideshow ? 1 : 0);
  }

  if (fields.length === 0) {
    return; // Nothing to update
  }

  fields.push('updated_at = ?');
  values.push(Date.now());
  values.push(videoId);

  try {
    await db.execute({
      sql: `UPDATE learning_videos SET ${fields.join(', ')} WHERE video_id = ?`,
      args: values,
    });

    console.log('[videoService:turso] Video updated successfully:', videoId);
  } catch (error) {
    console.error('[videoService:turso] Error updating video:', error);
    throw error;
  }
}

/**
 * Delete a video (teacher only)
 */
export async function deleteVideo(userId: string, videoId: string): Promise<void> {
  // Check if user is a teacher
  const hasPermission = await isTeacher(userId);
  if (!hasPermission) {
    throw new Error('Only teachers can delete videos');
  }

  try {
    await db.execute({
      sql: 'DELETE FROM learning_videos WHERE video_id = ?',
      args: [videoId],
    });

    console.log('[videoService:turso] Video deleted successfully:', videoId);
  } catch (error) {
    console.error('[videoService:turso] Error deleting video:', error);
    throw error;
  }
}

/**
 * Get videos uploaded by a specific teacher
 */
export async function getVideosByTeacher(teacherId: string): Promise<LearningVideo[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT
          v.*,
          u.first_name || ' ' || u.last_name as uploader_name
        FROM learning_videos v
        LEFT JOIN users u ON v.uploaded_by = u.user_id
        WHERE v.uploaded_by = ?
        ORDER BY v.created_at DESC
      `,
      args: [teacherId],
    });

    return result.rows.map(rowToVideo);
  } catch (error) {
    console.error('[videoService:turso] Error fetching videos by teacher:', error);
    throw error;
  }
}

/**
 * Get video statistics
 */
export async function getVideoStats(): Promise<{
  totalVideos: number;
  videosByCategory: Record<VideoCategory, number>;
  videosByLevel: Record<CEFRLevel, number>;
  slideshowCount: number;
}> {
  try {
    // Total count
    const totalResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM learning_videos',
      args: [],
    });

    // Count by category
    const categoryResult = await db.execute({
      sql: 'SELECT category, COUNT(*) as count FROM learning_videos GROUP BY category',
      args: [],
    });

    // Count by level
    const levelResult = await db.execute({
      sql: 'SELECT level, COUNT(*) as count FROM learning_videos WHERE level IS NOT NULL GROUP BY level',
      args: [],
    });

    // Slideshow count
    const slideshowResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM learning_videos WHERE is_slideshow = 1',
      args: [],
    });

    const videosByCategory: Record<VideoCategory, number> = {
      grammar: 0,
      vocabulary: 0,
      pronunciation: 0,
      culture: 0,
      tips: 0,
      other: 0,
    };

    categoryResult.rows.forEach(row => {
      videosByCategory[row.category as VideoCategory] = row.count as number;
    });

    const videosByLevel: Record<CEFRLevel, number> = {
      A1: 0,
      A2: 0,
      B1: 0,
      B2: 0,
      C1: 0,
      C2: 0,
    };

    levelResult.rows.forEach(row => {
      if (row.level) {
        videosByLevel[row.level as CEFRLevel] = row.count as number;
      }
    });

    return {
      totalVideos: (totalResult.rows[0]?.count as number) || 0,
      videosByCategory,
      videosByLevel,
      slideshowCount: (slideshowResult.rows[0]?.count as number) || 0,
    };
  } catch (error) {
    console.error('[videoService:turso] Error getting video stats:', error);
    throw error;
  }
}
