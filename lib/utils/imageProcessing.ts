/**
 * Image Processing Utilities
 * Handles image cropping, compression, and validation
 */

import { Area } from 'react-easy-crop';

/**
 * Helper function to load an image from a URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = src;
  });
}

/**
 * Creates a cropped image from the source image and crop area
 * @param imageSrc - Source image URL
 * @param croppedAreaPixels - Crop area coordinates from react-easy-crop
 * @param rotation - Rotation in degrees (default 0)
 * @returns Promise<Blob> - Cropped image as blob
 */
export async function createCroppedImage(
  imageSrc: string,
  croppedAreaPixels: Area,
  rotation = 0
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas size to cropped area
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  // Draw cropped image
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  // Convert to blob with high quality for intermediate step
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob failed'));
        }
      },
      'image/jpeg',
      0.95
    );
  });
}

/**
 * Compresses an image to maximum width and quality
 * @param blob - Image blob to compress
 * @param maxWidth - Maximum width in pixels (default 1920)
 * @param quality - JPEG quality 0-1 (default 0.85)
 * @returns Promise<Blob> - Compressed image blob
 */
export async function compressImage(
  blob: Blob,
  maxWidth = 1920,
  quality = 0.85
): Promise<Blob> {
  const imageUrl = URL.createObjectURL(blob);
  const image = await loadImage(imageUrl);
  URL.revokeObjectURL(imageUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Calculate dimensions maintaining aspect ratio
  let width = image.width;
  let height = image.height;

  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  canvas.width = width;
  canvas.height = height;

  // Draw and compress
  ctx.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob failed'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Combined crop and compress operation
 * @param imageSrc - Source image URL
 * @param croppedAreaPixels - Crop area from react-easy-crop
 * @param rotation - Rotation in degrees (default 0)
 * @param maxWidth - Maximum width for compression (default 1920)
 * @param quality - JPEG quality 0-1 (default 0.85)
 * @returns Promise<Blob> - Cropped and compressed image blob
 */
export async function cropAndCompress(
  imageSrc: string,
  croppedAreaPixels: Area,
  rotation = 0,
  maxWidth = 1920,
  quality = 0.85
): Promise<Blob> {
  const croppedBlob = await createCroppedImage(imageSrc, croppedAreaPixels, rotation);
  const compressedBlob = await compressImage(croppedBlob, maxWidth, quality);
  return compressedBlob;
}

/**
 * Formats file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Validates an image file
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 10MB' };
  }

  return { valid: true };
}

/**
 * Converts a Blob to a base64 data URL
 * @param blob - Blob to convert
 * @returns Promise<string> - Base64 data URL
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Interface for processed images
 */
export interface ProcessedImage {
  id: string;
  url: string;
  file: File;
  originalFile?: File;
  size: number;
  isEdited: boolean;
}
