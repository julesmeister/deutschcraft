/**
 * C1 Level Email Templates
 * Advanced professional and academic correspondence
 */

import { CEFRLevel } from '@/lib/models/cefr';
import { EmailTemplate } from './types';

export const C1_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'academic-collaboration-proposal',
    title: 'Academic Collaboration Proposal',
    icon: '🎓',
    level: CEFRLevel.C1,
    scenario: 'Propose a collaborative research project to an academic colleague at another institution.',
    recipient: 'Professor Dr. Schmidt',
    subject: 'Vorschlag für ein gemeinsames Forschungsprojekt',
    structure: ['Formal greeting', 'Reference to previous work/connection', 'Research proposal overview', 'Collaboration benefits', 'Next steps suggestion', 'Formal closing'],
    keyPhrases: [
      'Sehr geehrte/r Professor/in Dr. ...',
      'Mit Bezug auf',
      'Ich möchte Ihnen einen Vorschlag unterbreiten',
      'Die Zusammenarbeit würde es ermöglichen',
      'Ich würde mich sehr freuen, dies näher zu erörtern',
      'Mit vorzüglicher Hochachtung',
    ],
    minWords: 200,
    difficulty: 'hard',
  },
  {
    id: 'policy-recommendation',
    title: 'Policy Recommendation to Government',
    icon: '🏛️',
    level: CEFRLevel.C1,
    scenario: 'Write a formal recommendation to a government official regarding environmental policy.',
    recipient: 'Ministerium für Umwelt',
    subject: 'Stellungnahme und Empfehlungen zur Umweltpolitik',
    structure: ['Formal opening', 'Background and context', 'Analysis of current situation', 'Specific recommendations', 'Expected outcomes', 'Formal closing'],
    keyPhrases: [
      'Sehr geehrte Damen und Herren',
      'Im Hinblick auf',
      'Aus unserer Sicht erscheint es erforderlich',
      'Wir empfehlen nachdrücklich',
      'Dies würde voraussichtlich dazu beitragen',
      'Hochachtungsvoll',
    ],
    minWords: 220,
    difficulty: 'hard',
  },
  {
    id: 'conference-keynote-invitation',
    title: 'Conference Keynote Speaker Invitation',
    icon: '🎤',
    level: CEFRLevel.C1,
    scenario: 'Invite a distinguished expert to deliver the keynote address at an academic conference.',
    recipient: 'Professor Dr. Müller',
    subject: 'Einladung zur Keynote-Rede auf der Jahrestagung',
    structure: ['Formal greeting', 'Conference introduction', 'Invitation with details', 'Speaker\'s expertise appreciation', 'Logistics and compensation', 'Closing'],
    keyPhrases: [
      'Sehr geehrte/r Professor/in Dr. ...',
      'Es wäre uns eine große Ehre',
      'Angesichts Ihrer herausragenden Expertise',
      'Die Konferenz findet statt',
      'Selbstverständlich übernehmen wir',
      'Wir würden uns außerordentlich freuen',
    ],
    minWords: 200,
    difficulty: 'hard',
  },
  {
    id: 'grant-proposal-cover',
    title: 'Research Grant Proposal Cover Letter',
    icon: '💼',
    level: CEFRLevel.C1,
    scenario: 'Write a cover letter for a research grant application to a funding agency.',
    recipient: 'Deutsche Forschungsgemeinschaft',
    subject: 'Antrag auf Forschungsförderung: [Projekttitel]',
    structure: ['Formal opening', 'Project overview', 'Significance and innovation', 'Qualifications', 'Funding justification', 'Attachments reference', 'Closing'],
    keyPhrases: [
      'Sehr geehrte Damen und Herren',
      'Hiermit beantrage ich',
      'Das Vorhaben zielt darauf ab',
      'Die Bedeutung dieses Projekts liegt darin',
      'Als beigefügte Unterlagen',
      'Für Rückfragen stehe ich jederzeit zur Verfügung',
    ],
    minWords: 250,
    difficulty: 'hard',
  },
];
