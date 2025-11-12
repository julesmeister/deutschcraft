/**
 * Email Writing Templates
 * Main export file for all email templates organized by CEFR level
 */

import { CEFRLevel } from '@/lib/models/cefr';
import { EmailTemplate } from './types';
import { A1_EMAIL_TEMPLATES } from './A1';
import { A2_EMAIL_TEMPLATES } from './A2';
import { B1_EMAIL_TEMPLATES } from './B1';
import { B2_EMAIL_TEMPLATES } from './B2';

// Export types
export type { EmailTemplate } from './types';

// Export all templates combined
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  ...A1_EMAIL_TEMPLATES,
  ...A2_EMAIL_TEMPLATES,
  ...B1_EMAIL_TEMPLATES,
  ...B2_EMAIL_TEMPLATES,
];

// Export templates by level
export {
  A1_EMAIL_TEMPLATES,
  A2_EMAIL_TEMPLATES,
  B1_EMAIL_TEMPLATES,
  B2_EMAIL_TEMPLATES,
};

/**
 * Get email templates filtered by CEFR level
 */
export function getTemplatesByLevel(level: CEFRLevel): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter(template => template.level === level);
}

/**
 * Get a specific email template by ID
 */
export function getTemplateById(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(template => template.id === id);
}
