/**
 * Letter Template Types
 * Shared type definitions for letter writing templates
 */

import { CEFRLevel } from '@/lib/models/cefr';

export interface LetterTemplate {
  id: string;
  title: string;
  icon: string;
  type: 'formal' | 'informal';
  level: CEFRLevel;
  scenario: string;
  format: string;
  structure: string[];
  keyPhrases: string[];
  minWords: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
