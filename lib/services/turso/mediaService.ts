/**
 * Media Service - Turso Implementation
 * Handles image and video uploads using base64 storage
 *
 * Features:
 * - Image compression before storage
 * - Video thumbnail generation
 * - Base64 encoding/decoding
 * - File size limits
 * - Mime type validation
 */

import { db } from '@/turso/client';

// ============================================================================
// TYPES
// ============================================================================

export interface MediaFile {
  mediaId: string;
  postId: string;
  userId: string;
  mediaType: 'image' | 'video';
  mimeType: string;
  fileName: string;
  fileSize: number;
  data: string; // Base64 encoded
  thumbnailData?: string; // Base64 encoded thumbnail
  width?: number;
  height?: number;
  duration?: number; // For videos
  createdAt: number;
}

export interface UploadOptions {
  maxImageSize?: number; // Max size in bytes (default: 5MB)
  maxVideoSize?: number; // Max size in bytes (default: 50MB)
  imageQuality?: number; // 0-1 (default: 0.8)
  maxImageDimension?: number; // Max width/height (default: 1920px)
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_OPTIONS: UploadOptions = {
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  imageQuality: 0.8,
  maxImageDimension: 1920,
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToMediaFile(row: any): MediaFile {
  return {
    mediaId: row.media_id as string,
    postId: row.post_id as string,
    userId: row.user_id as string,
    mediaType: row.media_type as 'image' | 'video',
    mimeType: row.mime_type as string,
    fileName: row.file_name as string,
    fileSize: row.file_size as number,
    data: row.data as string,
    thumbnailData: row.thumbnail_data as string | undefined,
    width: row.width as number | undefined,
    height: row.height as number | undefined,
    duration: row.duration as number | undefined,
    createdAt: row.created_at as number,
  };
}

/**
 * Compress an image to reduce file size
 * This is a browser-side function - should be called client-side
 */
export function compressImage(
  file: File,
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<{ dataUrl: string; width: number; height: number; size: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions
        let { width, height } = img;
        const maxDim = options.maxImageDimension || DEFAULT_OPTIONS.maxImageDimension!;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const quality = options.imageQuality || DEFAULT_OPTIONS.imageQuality!;
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Calculate compressed size
        const base64Length = dataUrl.split(',')[1].length;
        const size = Math.ceil(base64Length * 0.75); // Approximate size in bytes

        resolve({ dataUrl, width, height, size });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a thumbnail from a video file
 * This is a browser-side function - should be called client-side
 */
export function generateVideoThumbnail(
  file: File
): Promise<{ thumbnailDataUrl: string; duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('File is not a video'));
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration / 2); // Seek to middle or 1 second
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);

      resolve({
        thumbnailDataUrl,
        duration: Math.round(video.duration),
        width: video.videoWidth,
        height: video.videoHeight,
      });

      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  mediaType: 'image' | 'video',
  options: UploadOptions = DEFAULT_OPTIONS
): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = mediaType === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  const maxSize = mediaType === 'image'
    ? (options.maxImageSize || DEFAULT_OPTIONS.maxImageSize!)
    : (options.maxVideoSize || DEFAULT_OPTIONS.maxVideoSize!);

  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds ${maxMB}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Convert File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Extract base64 part (remove "data:image/jpeg;base64," prefix)
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 to data URL for display
 */
export function base64ToDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Upload media file to database
 */
export async function uploadMedia(
  postId: string,
  userId: string,
  file: File,
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<string> {
  const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

  // Validate file
  const validation = validateFile(file, mediaType, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const mediaId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    if (mediaType === 'image') {
      // Compress image
      const compressed = await compressImage(file, options);
      const base64 = compressed.dataUrl.split(',')[1];

      await db.execute({
        sql: `INSERT INTO social_media (
          media_id, post_id, user_id, media_type, mime_type,
          file_name, file_size, data, width, height, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          mediaId,
          postId,
          userId,
          'image',
          'image/jpeg', // Always save as JPEG after compression
          file.name,
          compressed.size,
          base64,
          compressed.width,
          compressed.height,
          Date.now(),
        ],
      });
    } else {
      // Handle video
      const base64 = await fileToBase64(file);
      const thumbnail = await generateVideoThumbnail(file);
      const thumbnailBase64 = thumbnail.thumbnailDataUrl.split(',')[1];

      await db.execute({
        sql: `INSERT INTO social_media (
          media_id, post_id, user_id, media_type, mime_type,
          file_name, file_size, data, thumbnail_data,
          width, height, duration, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          mediaId,
          postId,
          userId,
          'video',
          file.type,
          file.name,
          file.size,
          base64,
          thumbnailBase64,
          thumbnail.width,
          thumbnail.height,
          thumbnail.duration,
          Date.now(),
        ],
      });
    }

    return mediaId;
  } catch (error) {
    console.error('[mediaService:turso] Error uploading media:', error);
    throw error;
  }
}

/**
 * Get media file by ID
 */
export async function getMedia(mediaId: string): Promise<MediaFile | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM social_media WHERE media_id = ? LIMIT 1',
      args: [mediaId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToMediaFile(result.rows[0]);
  } catch (error) {
    console.error('[mediaService:turso] Error fetching media:', error);
    throw error;
  }
}

/**
 * Get all media files for a post
 */
export async function getPostMedia(postId: string): Promise<MediaFile[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM social_media WHERE post_id = ? ORDER BY created_at ASC',
      args: [postId],
    });

    return result.rows.map(rowToMediaFile);
  } catch (error) {
    console.error('[mediaService:turso] Error fetching post media:', error);
    throw error;
  }
}

/**
 * Get all media URLs for a post (as data URLs)
 */
export async function getPostMediaUrls(postId: string): Promise<string[]> {
  try {
    const mediaFiles = await getPostMedia(postId);
    return mediaFiles.map(media => base64ToDataUrl(media.data, media.mimeType));
  } catch (error) {
    console.error('[mediaService:turso] Error fetching post media URLs:', error);
    throw error;
  }
}

/**
 * Delete media file
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM social_media WHERE media_id = ?',
      args: [mediaId],
    });
  } catch (error) {
    console.error('[mediaService:turso] Error deleting media:', error);
    throw error;
  }
}

/**
 * Delete all media for a post
 */
export async function deletePostMedia(postId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM social_media WHERE post_id = ?',
      args: [postId],
    });
  } catch (error) {
    console.error('[mediaService:turso] Error deleting post media:', error);
    throw error;
  }
}

/**
 * Get user's total media storage usage in bytes
 */
export async function getUserStorageUsage(userId: string): Promise<number> {
  try {
    const result = await db.execute({
      sql: 'SELECT SUM(file_size) as total FROM social_media WHERE user_id = ?',
      args: [userId],
    });

    return (result.rows[0]?.total as number) || 0;
  } catch (error) {
    console.error('[mediaService:turso] Error getting storage usage:', error);
    throw error;
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(userId: string): Promise<{
  totalSize: number;
  imageCount: number;
  videoCount: number;
  imageSize: number;
  videoSize: number;
}> {
  try {
    // Get totals
    const totalResult = await db.execute({
      sql: 'SELECT COUNT(*) as count, SUM(file_size) as size FROM social_media WHERE user_id = ?',
      args: [userId],
    });

    // Get image stats
    const imageResult = await db.execute({
      sql: "SELECT COUNT(*) as count, SUM(file_size) as size FROM social_media WHERE user_id = ? AND media_type = 'image'",
      args: [userId],
    });

    // Get video stats
    const videoResult = await db.execute({
      sql: "SELECT COUNT(*) as count, SUM(file_size) as size FROM social_media WHERE user_id = ? AND media_type = 'video'",
      args: [userId],
    });

    return {
      totalSize: (totalResult.rows[0]?.size as number) || 0,
      imageCount: (imageResult.rows[0]?.count as number) || 0,
      videoCount: (videoResult.rows[0]?.count as number) || 0,
      imageSize: (imageResult.rows[0]?.size as number) || 0,
      videoSize: (videoResult.rows[0]?.size as number) || 0,
    };
  } catch (error) {
    console.error('[mediaService:turso] Error getting storage stats:', error);
    throw error;
  }
}
