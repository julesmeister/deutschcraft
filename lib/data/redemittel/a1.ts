/**
 * A1 Level Redemittel - Basic phrases
 */

import { Redemittel } from './types';

export const a1Redemittel: Redemittel[] = [
  // ============================================
  // Introduction & Personal Information
  // ============================================
  {
    id: 'a1-intro-1',
    german: 'Ich heiße...',
    english: 'My name is...',
    context: 'introduction',
    level: 'A1',
    example: 'Ich heiße Anna.',
    exampleTranslation: 'My name is Anna.',
    tags: ['basic', 'personal'],
  },
  {
    id: 'a1-intro-2',
    german: 'Ich komme aus...',
    english: 'I come from...',
    context: 'introduction',
    level: 'A1',
    example: 'Ich komme aus Deutschland.',
    exampleTranslation: 'I come from Germany.',
    tags: ['basic', 'personal'],
  },
  {
    id: 'a1-intro-3',
    german: 'Ich bin... Jahre alt',
    english: 'I am... years old',
    context: 'introduction',
    level: 'A1',
    example: 'Ich bin 25 Jahre alt.',
    exampleTranslation: 'I am 25 years old.',
    tags: ['basic', 'personal', 'age'],
  },
  {
    id: 'a1-intro-4',
    german: 'Ich wohne in...',
    english: 'I live in...',
    context: 'introduction',
    level: 'A1',
    example: 'Ich wohne in Berlin.',
    exampleTranslation: 'I live in Berlin.',
    tags: ['basic', 'personal', 'location'],
  },
  {
    id: 'a1-intro-5',
    german: 'Ich arbeite als...',
    english: 'I work as...',
    context: 'introduction',
    level: 'A1',
    example: 'Ich arbeite als Lehrer.',
    exampleTranslation: 'I work as a teacher.',
    tags: ['basic', 'personal', 'profession'],
  },

  // ============================================
  // Thanking
  // ============================================
  {
    id: 'a1-thank-1',
    german: 'Vielen Dank!',
    english: 'Thank you very much!',
    context: 'thanking',
    level: 'A1',
    tags: ['polite', 'basic'],
  },
  {
    id: 'a1-thank-2',
    german: 'Danke schön!',
    english: 'Thank you!',
    context: 'thanking',
    level: 'A1',
    tags: ['polite', 'basic'],
  },
  {
    id: 'a1-thank-3',
    german: 'Danke für...',
    english: 'Thanks for...',
    context: 'thanking',
    level: 'A1',
    example: 'Danke für deine Hilfe.',
    exampleTranslation: 'Thanks for your help.',
    tags: ['polite', 'basic'],
  },
  {
    id: 'a1-thank-4',
    german: 'Bitte!',
    english: "You're welcome!",
    context: 'thanking',
    level: 'A1',
    tags: ['polite', 'basic', 'response'],
  },

  // ============================================
  // Asking
  // ============================================
  {
    id: 'a1-ask-1',
    german: 'Wie geht es dir?',
    english: 'How are you?',
    context: 'asking',
    level: 'A1',
    tags: ['greeting', 'informal'],
  },
  {
    id: 'a1-ask-2',
    german: 'Wie geht es Ihnen?',
    english: 'How are you? (formal)',
    context: 'asking',
    level: 'A1',
    tags: ['greeting', 'formal'],
  },
  {
    id: 'a1-ask-3',
    german: 'Was ist das?',
    english: 'What is that?',
    context: 'asking',
    level: 'A1',
    tags: ['basic', 'question'],
  },
  {
    id: 'a1-ask-4',
    german: 'Wo ist...?',
    english: 'Where is...?',
    context: 'asking',
    level: 'A1',
    example: 'Wo ist die Toilette?',
    exampleTranslation: 'Where is the toilet?',
    tags: ['basic', 'question', 'location'],
  },
  {
    id: 'a1-ask-5',
    german: 'Wie viel kostet...?',
    english: 'How much does... cost?',
    context: 'asking',
    level: 'A1',
    example: 'Wie viel kostet das?',
    exampleTranslation: 'How much does that cost?',
    tags: ['basic', 'question', 'shopping'],
  },
  {
    id: 'a1-ask-6',
    german: 'Wann...?',
    english: 'When...?',
    context: 'asking',
    level: 'A1',
    example: 'Wann kommst du?',
    exampleTranslation: 'When are you coming?',
    tags: ['basic', 'question', 'time'],
  },

  // ============================================
  // Requesting
  // ============================================
  {
    id: 'a1-request-1',
    german: 'Kann ich... haben?',
    english: 'Can I have...?',
    context: 'requesting',
    level: 'A1',
    example: 'Kann ich Wasser haben?',
    exampleTranslation: 'Can I have water?',
    tags: ['polite', 'basic'],
  },
  {
    id: 'a1-request-2',
    german: 'Ich möchte...',
    english: 'I would like...',
    context: 'requesting',
    level: 'A1',
    example: 'Ich möchte einen Kaffee.',
    exampleTranslation: 'I would like a coffee.',
    tags: ['polite', 'basic', 'ordering'],
  },
  {
    id: 'a1-request-3',
    german: 'Können Sie mir helfen?',
    english: 'Can you help me?',
    context: 'requesting',
    level: 'A1',
    tags: ['polite', 'basic', 'help'],
  },
  {
    id: 'a1-request-4',
    german: 'Entschuldigung!',
    english: 'Excuse me!',
    context: 'requesting',
    level: 'A1',
    tags: ['polite', 'basic', 'attention'],
  },

  // ============================================
  // Apologizing
  // ============================================
  {
    id: 'a1-apology-1',
    german: 'Entschuldigung!',
    english: 'Sorry!',
    context: 'apologizing',
    level: 'A1',
    tags: ['polite', 'basic'],
  },
  {
    id: 'a1-apology-2',
    german: 'Es tut mir leid.',
    english: "I'm sorry.",
    context: 'apologizing',
    level: 'A1',
    tags: ['polite', 'basic'],
  },

  // ============================================
  // Agreement
  // ============================================
  {
    id: 'a1-agree-1',
    german: 'Ja, das stimmt.',
    english: 'Yes, that\'s right.',
    context: 'agreement',
    level: 'A1',
    tags: ['basic', 'affirmation'],
  },
  {
    id: 'a1-agree-2',
    german: 'Gut!',
    english: 'Good!',
    context: 'agreement',
    level: 'A1',
    tags: ['basic', 'affirmation'],
  },
  {
    id: 'a1-agree-3',
    german: 'Okay!',
    english: 'Okay!',
    context: 'agreement',
    level: 'A1',
    tags: ['basic', 'affirmation'],
  },

  // ============================================
  // Disagreement
  // ============================================
  {
    id: 'a1-disagree-1',
    german: 'Nein, das ist nicht richtig.',
    english: 'No, that\'s not right.',
    context: 'disagreement',
    level: 'A1',
    tags: ['basic', 'negation'],
  },

  // ============================================
  // Describing
  // ============================================
  {
    id: 'a1-describe-1',
    german: 'Das ist...',
    english: 'That is...',
    context: 'describing',
    level: 'A1',
    example: 'Das ist schön.',
    exampleTranslation: 'That is beautiful.',
    tags: ['basic', 'description'],
  },
  {
    id: 'a1-describe-2',
    german: 'Er/Sie ist...',
    english: 'He/She is...',
    context: 'describing',
    level: 'A1',
    example: 'Sie ist sehr nett.',
    exampleTranslation: 'She is very nice.',
    tags: ['basic', 'description', 'people'],
  },
  {
    id: 'a1-describe-3',
    german: 'Es gibt...',
    english: 'There is/are...',
    context: 'describing',
    level: 'A1',
    example: 'Es gibt viele Leute hier.',
    exampleTranslation: 'There are many people here.',
    tags: ['basic', 'description', 'existence'],
  },
];
