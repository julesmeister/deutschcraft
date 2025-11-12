/**
 * C1 Level Letter Templates
 * Advanced formal letters
 */

import { CEFRLevel } from '@/lib/models/cefr';
import { LetterTemplate } from './types';

export const C1_LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'scholarship-application',
    title: 'Scholarship Application Letter',
    icon: '🎓',
    type: 'formal',
    level: CEFRLevel.C1,
    scenario: 'Apply for a scholarship or study grant.',
    format: 'Formal academic letter',
    structure: [
      'Address blocks',
      'Date',
      'Subject: Stipendiumsbewerbung',
      'Greeting',
      'Introduction and purpose',
      'Academic background',
      'Motivation and goals',
      'Financial need',
      'Conclusion',
      'Formal closing',
    ],
    keyPhrases: [
      'Sehr geehrte Damen und Herren',
      'Hiermit bewerbe ich mich um',
      'Mein besonderes Interesse gilt',
      'Mit ausgezeichneten Leistungen',
      'Hochachtungsvoll',
    ],
    minWords: 250,
    difficulty: 'hard',
  },
];
