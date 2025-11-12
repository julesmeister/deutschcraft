/**
 * Creative Writing Exercise Types
 * Shared type definitions for creative writing exercises
 */

import { CEFRLevel } from '@/lib/models/cefr';

export interface CreativeWritingExercise {
  exerciseId: string;
  type: 'creative' | 'descriptive' | 'dialogue';
  level: CEFRLevel;
  title: string;
  prompt: string;
  minWords: number;
  maxWords: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  targetGrammar: string[];
  suggestedVocabulary: string[];
  completionCount: number;
  averageWordCount: number;
  createdAt: number;
  updatedAt: number;
}
