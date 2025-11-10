/**
 * Extended Types and Query Helpers
 * Augmented models with computed statistics
 */

import { Batch } from './user';
import { User } from './user';
import { WritingTask } from './task';

/**
 * Get batch students (query helper)
 */
export interface BatchWithStats extends Batch {
  students: User[];
  completionRate: number;
  averageProgress: number;
}

/**
 * Get task with stats (query helper)
 */
export interface TaskWithStats extends WritingTask {
  submissionCount: number;
  completionRate: number;
  averageScore?: number;
  pendingGrading: number;
}
