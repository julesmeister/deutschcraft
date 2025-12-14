/**
 * Video Models
 * Data models for learning videos
 */

export type VideoCategory = 'grammar' | 'vocabulary' | 'pronunciation' | 'culture' | 'tips' | 'other';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LearningVideo {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string; // Can be external URL or base64 for local storage
  thumbnailUrl?: string;
  category: VideoCategory;
  level?: CEFRLevel;
  isSlideshow: boolean;
  uploadedBy: string; // User ID (must be teacher)
  uploaderName?: string; // For display purposes
  createdAt: number;
  updatedAt: number;
}

export interface VideoUploadData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: VideoCategory;
  level?: CEFRLevel;
  isSlideshow?: boolean;
}
