/**
 * Student Activity Tracking
 * Records all student learning activities for analytics
 */

export enum ActivityType {
  FLASHCARD_CREATED = 'flashcard_created',
  FLASHCARD_REVIEWED = 'flashcard_reviewed',
  WRITING_SUBMITTED = 'writing_submitted',
  WRITING_REVIEWED = 'writing_reviewed',
  LEVEL_CHANGED = 'level_changed',
  STREAK_MILESTONE = 'streak_milestone',
  LOGIN = 'login',
  PRACTICE_SESSION = 'practice_session',
}

export interface Activity {
  activityId: string;
  studentEmail: string;
  studentName?: string;
  type: ActivityType;
  timestamp: Date;
  metadata?: {
    // For flashcards
    flashcardId?: string;
    wordCount?: number;

    // For writing
    writingType?: string;
    wordLength?: number;
    score?: number;

    // For level changes
    oldLevel?: string;
    newLevel?: string;

    // For streaks
    streakDays?: number;

    // General
    description?: string;
  };
}

export interface ActivitySummary {
  totalActivities: number;
  flashcardsCreated: number;
  flashcardsReviewed: number;
  writingSubmitted: number;
  practiceHours: number;
  lastActive: Date;
}
