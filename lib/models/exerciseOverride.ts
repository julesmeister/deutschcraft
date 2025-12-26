import { CEFRLevel } from './cefr';
import { Exercise, ExerciseAnswer } from './exercises';

/**
 * Exercise Override Model
 * Represents teacher customizations to exercises in the Answer Hub
 */

export type OverrideType = 'create' | 'modify' | 'hide';

export interface ExerciseOverride {
  // Identity
  overrideId: string;                 // Document ID: {teacherEmail}_{exerciseId}
  teacherEmail: string;               // Teacher who created this override
  exerciseId: string;                 // Original exercise ID or new ID for created exercises

  // Override Type
  overrideType: OverrideType;

  // Context fields (for filtering)
  level?: CEFRLevel;                  // Level this override applies to
  lessonNumber?: number;              // Lesson number this override applies to

  // Exercise Data (for 'create' type - full exercise)
  exerciseData?: Exercise;

  // Partial Modifications (for 'modify' type - only changed fields)
  modifications?: {
    title?: string;
    question?: string;
    answers?: ExerciseAnswer[];       // Complete replacement of answers array
    difficulty?: 'easy' | 'medium' | 'hard';
    topic?: string;
    section?: string;
    pageNumber?: number;
    exerciseNumber?: string;
  };

  // Ordering
  displayOrder?: number;              // Custom sort position within lesson

  // Hidden Flag
  isHidden?: boolean;                 // True when override type is 'hide'

  // Metadata
  createdAt: number;
  updatedAt: number;
  notes?: string;                     // Teacher notes about this override
}

/**
 * Extended Exercise type with override metadata
 * Used in UI to display badges and indicators
 */
export interface ExerciseWithOverrideMetadata extends Exercise {
  _isModified?: boolean;              // True if exercise was modified by teacher
  _isCreated?: boolean;               // True if exercise was created by teacher
  _isHidden?: boolean;                // True if exercise is hidden
  _displayOrder?: number;             // Custom display order
}

/**
 * Input type for creating a new exercise override
 */
export type CreateExerciseOverrideInput = Omit<
  ExerciseOverride,
  'overrideId' | 'createdAt' | 'updatedAt'
>;

/**
 * Input type for updating an existing override
 */
export type UpdateExerciseOverrideInput = Partial<
  Omit<ExerciseOverride, 'overrideId' | 'teacherEmail' | 'exerciseId' | 'createdAt'>
>;
