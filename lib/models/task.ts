/**
 * Writing Task Models
 * FLAT STRUCTURE - Top-level collections only
 *
 * Collections:
 * - tasks/{taskId}
 * - submissions/{submissionId}
 */

import { CEFRLevel } from './cefr';

/**
 * Writing Task Model
 * Path: tasks/{taskId}
 * Top-level collection
 */
export interface WritingTask {
  taskId: string;
  batchId: string; // Which batch this task belongs to
  teacherId: string; // Email of teacher who created it

  // Task details
  title: string;
  description?: string;
  instructions: string;

  // Classification
  category: 'essay' | 'letter' | 'email' | 'story' | 'article' | 'report' | 'review' | 'other';
  level: CEFRLevel;

  // Status and priority
  status: 'draft' | 'assigned' | 'completed';
  priority: 'low' | 'medium' | 'high';

  // Timing
  assignedDate: number | null;
  dueDate: number;
  estimatedDuration?: number; // minutes

  // Assignment
  assignedStudents: string[]; // Array of student emails
  completedStudents: string[]; // Array of student emails who completed

  // Requirements
  minWords?: number;
  maxWords?: number;
  minParagraphs?: number;
  maxParagraphs?: number;
  requiredVocabulary?: string[];
  totalPoints?: number;

  // Writing criteria (optional)
  requireIntroduction?: boolean;
  requireConclusion?: boolean;
  requireExamples?: boolean;
  tone?: 'formell' | 'informell' | 'sachlich' | 'persönlich' | 'offiziell'; // German writing tones
  perspective?: 'first-person' | 'second-person' | 'third-person';

  createdAt: number;
  updatedAt: number;
}

/**
 * Task Submission Model
 * Path: submissions/{submissionId}
 * Top-level collection
 */
export interface TaskSubmission {
  submissionId: string;
  taskId: string; // Reference to task
  studentId: string; // Student's email
  batchId: string; // For easier querying

  // Submission content
  content: string; // The actual writing
  wordCount: number;

  // Status
  status: 'draft' | 'submitted' | 'graded' | 'returned';

  // Timestamps
  startedAt?: number | null;
  submittedAt?: number | null;
  gradedAt?: number | null;

  // Grading
  score?: number | null;
  maxScore?: number;
  feedback?: string;
  gradedBy?: string | null; // Teacher's email

  // Version tracking
  version: number;
  revisions: TaskRevision[];

  createdAt: number;
  updatedAt: number;
}

export interface TaskRevision {
  version: number;
  content: string;
  wordCount: number;
  savedAt: number;
}
