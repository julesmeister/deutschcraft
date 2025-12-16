/**
 * Daily Theme Model
 *
 * Represents a writing theme/topic that teachers set for students
 */

export interface DailyTheme {
  themeId: string;
  batchId: string;
  title: string;
  description: string;
  createdBy: string; // Teacher's userId
  createdAt: number;
  updatedAt: number;
  active: boolean;
}

export interface CreateDailyThemeInput {
  batchId: string;
  title: string;
  description: string;
  createdBy: string;
}

export interface UpdateDailyThemeInput {
  title?: string;
  description?: string;
}
