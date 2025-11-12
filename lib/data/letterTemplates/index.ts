/**
 * Letter Writing Templates
 * Main export file for all letter templates organized by CEFR level
 */

import { CEFRLevel } from '@/lib/models/cefr';
import { LetterTemplate } from './types';
import { A1_LETTER_TEMPLATES } from './A1';
import { A2_LETTER_TEMPLATES } from './A2';
import { B1_LETTER_TEMPLATES } from './B1';
import { B2_LETTER_TEMPLATES } from './B2';
import { C1_LETTER_TEMPLATES } from './C1';

// Export types
export type { LetterTemplate } from './types';

// Export all templates combined
export const LETTER_TEMPLATES: LetterTemplate[] = [
  ...A1_LETTER_TEMPLATES,
  ...A2_LETTER_TEMPLATES,
  ...B1_LETTER_TEMPLATES,
  ...B2_LETTER_TEMPLATES,
  ...C1_LETTER_TEMPLATES,
];

// Export templates by level
export {
  A1_LETTER_TEMPLATES,
  A2_LETTER_TEMPLATES,
  B1_LETTER_TEMPLATES,
  B2_LETTER_TEMPLATES,
  C1_LETTER_TEMPLATES,
};

/**
 * Get templates filtered by level
 */
export function getTemplatesByLevel(level: CEFRLevel): LetterTemplate[] {
  return LETTER_TEMPLATES.filter(template => template.level === level);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): LetterTemplate | undefined {
  return LETTER_TEMPLATES.find(template => template.id === id);
}

/**
 * Get templates by type
 */
export function getTemplatesByType(type: 'formal' | 'informal'): LetterTemplate[] {
  return LETTER_TEMPLATES.filter(template => template.type === type);
}
