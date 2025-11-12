/**
 * Email Template Types
 * Shared type definitions for email writing templates
 */

import { CEFRLevel } from '@/lib/models/cefr';

export interface EmailTemplate {
  id: string;
  title: string;
  icon: string;
  level: CEFRLevel;
  scenario: string;
  recipient: string;
  subject: string;
  structure: string[];
  keyPhrases: string[];
  minWords: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
