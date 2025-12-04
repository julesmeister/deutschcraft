/**
 * Redemittel (Phrase Patterns) Data
 * Main export file - combines all CEFR levels
 */

// Export types
export type { CEFRLevel, ConversationContext, Redemittel } from './types';
export { contextLabels } from './types';

// Import data from each level
import { a1Redemittel } from './a1';
import { a2Redemittel } from './a2';
import { b1Redemittel } from './b1';
import { b2Redemittel } from './b2';
import { c1Redemittel } from './c1';
import { c2Redemittel } from './c2';

import type { CEFRLevel, ConversationContext, Redemittel } from './types';

// Combine all redemittel data
export const redemittelData: Redemittel[] = [
  ...a1Redemittel,
  ...a2Redemittel,
  ...b1Redemittel,
  ...b2Redemittel,
  ...c1Redemittel,
  ...c2Redemittel,
];

// Helper functions for filtering
export const getRedemittelByLevel = (level: CEFRLevel): Redemittel[] => {
  return redemittelData.filter(r => r.level === level);
};

export const getRedemittelByContext = (context: ConversationContext): Redemittel[] => {
  return redemittelData.filter(r => r.context === context);
};

export const getRedemittelByLevelAndContext = (
  level: CEFRLevel,
  context: ConversationContext
): Redemittel[] => {
  return redemittelData.filter(r => r.level === level && r.context === context);
};

export const searchRedemittel = (query: string): Redemittel[] => {
  const lowerQuery = query.toLowerCase();
  return redemittelData.filter(
    r =>
      r.german.toLowerCase().includes(lowerQuery) ||
      r.english.toLowerCase().includes(lowerQuery) ||
      r.context.toLowerCase().includes(lowerQuery) ||
      r.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
