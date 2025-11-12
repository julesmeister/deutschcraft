/**
 * Translation Exercise Types
 * Shared type definitions for translation exercises
 */

import { CEFRLevel } from '@/lib/models/cefr';

export interface TranslationExercise {
  exerciseId: string;
  type: 'translation';
  level: CEFRLevel;
  title: string;
  englishText: string;
  correctGermanText: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  targetGrammar: string[];
  targetVocabulary: string[];
  hints: string[];
  completionCount: number;
  averageScore: number;
  createdAt: number;
  updatedAt: number;
}
