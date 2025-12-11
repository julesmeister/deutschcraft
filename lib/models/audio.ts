import { CEFRLevel } from './cefr';

/**
 * Audio Section Model
 * Represents a section/chapter in the book with multiple audio tracks
 */
export interface AudioSection {
  sectionId: string;
  bookName: string; // e.g., "Menschen A1.1", "Schritte Plus Neu B1"
  cefrLevel: CEFRLevel;
  sectionNumber: number; // Chapter/Lektion number
  title: string; // e.g., "Lektion 1: Hallo!", "Kapitel 3: Familie"
  description?: string;
  audios: AudioTrack[];
  thumbnailUrl?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Individual Audio Track within a section
 */
export interface AudioTrack {
  trackId: string;
  title: string; // e.g., "Übung 1a", "Dialog 1", "Hörtext"
  description?: string;
  audioUrl: string; // URL to audio file (MP3/WAV)
  duration: number; // Duration in seconds
  trackNumber: number; // Order within section
  transcript?: string; // Optional text transcript
  tags?: string[]; // e.g., ["dialog", "übung", "pronunciation"]
}

/**
 * Audio Progress Tracking
 * Path: audio-progress/{userId}/{sectionId}
 */
export interface AudioProgress {
  userId: string;
  sectionId: string;
  trackId: string;
  completed: boolean;
  lastPlayedAt: number;
  playCount: number;
  lastPosition?: number; // Last playback position in seconds
}

/**
 * Supported Books Configuration
 */
export interface AudioBook {
  bookId: string;
  name: string; // e.g., "Menschen A1.1"
  cefrLevel: CEFRLevel;
  publisher: string; // e.g., "Hueber", "Cornelsen"
  coverImageUrl?: string;
  totalSections: number;
  isActive: boolean;
}

/**
 * Sample data structure for audio sections
 */
export const SAMPLE_AUDIO_BOOKS: AudioBook[] = [
  {
    bookId: 'menschen-a1-1',
    name: 'Menschen A1.1',
    cefrLevel: CEFRLevel.A1,
    publisher: 'Hueber',
    totalSections: 12,
    isActive: true,
  },
  {
    bookId: 'schritte-plus-neu-a1-1',
    name: 'Schritte Plus Neu A1.1',
    cefrLevel: CEFRLevel.A1,
    publisher: 'Hueber',
    totalSections: 7,
    isActive: true,
  },
  {
    bookId: 'menschen-b1',
    name: 'Menschen B1',
    cefrLevel: CEFRLevel.B1,
    publisher: 'Hueber',
    totalSections: 24,
    isActive: true,
  },
];
