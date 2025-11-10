/**
 * CEFR Language Levels (A1-C2)
 * Common European Framework of Reference for Languages
 */

// CEFR Language Levels (A1-C2)
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export const CEFRLevelInfo = {
  [CEFRLevel.A1]: {
    displayName: 'A1 - Beginner',
    description: 'Simple everyday phrases',
  },
  [CEFRLevel.A2]: {
    displayName: 'A2 - Elementary',
    description: 'Basic conversations',
  },
  [CEFRLevel.B1]: {
    displayName: 'B1 - Intermediate',
    description: 'Clear standard language',
  },
  [CEFRLevel.B2]: {
    displayName: 'B2 - Upper Intermediate',
    description: 'Complex texts and topics',
  },
  [CEFRLevel.C1]: {
    displayName: 'C1 - Advanced',
    description: 'Flexible and effective language',
  },
  [CEFRLevel.C2]: {
    displayName: 'C2 - Mastery',
    description: 'Near-native proficiency',
  },
} as const;
