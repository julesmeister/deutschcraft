/**
 * C2 Level Email Templates
 * Mastery level professional and diplomatic correspondence
 */

import { CEFRLevel } from '@/lib/models/cefr';
import { EmailTemplate } from './types';

export const C2_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'diplomatic-negotiation',
    title: 'Diplomatic Negotiation Correspondence',
    icon: '🤝',
    level: CEFRLevel.C2,
    scenario: 'Draft a diplomatic letter addressing a complex international trade dispute between two countries.',
    recipient: 'Ministerium für Wirtschaft und Außenhandel',
    subject: 'Lösungsvorschlag zur bilateralen Handelsvereinbarung',
    structure: ['Highly formal opening', 'Diplomatic context setting', 'Nuanced problem analysis', 'Compromise proposal', 'Win-win framing', 'Diplomatic closing'],
    keyPhrases: [
      'Exzellenz',
      'Mit Bezugnahme auf die jüngsten Entwicklungen',
      'Unter Würdigung der beiderseitigen Interessen',
      'Im Geiste konstruktiver Zusammenarbeit',
      'Es erscheint uns angezeigt, einen Kompromiss anzustreben',
      'Genehmigen Sie, Exzellenz, die Versicherung meiner vorzüglichsten Hochachtung',
    ],
    minWords: 280,
    difficulty: 'hard',
  },
  {
    id: 'executive-strategic-memo',
    title: 'C-Level Strategic Memorandum',
    icon: '📊',
    level: CEFRLevel.C2,
    scenario: 'Write a strategic memorandum to the board of directors regarding a major corporate restructuring.',
    recipient: 'Vorstand und Aufsichtsrat',
    subject: 'Strategisches Memorandum: Neuausrichtung der Unternehmensstruktur',
    structure: ['Executive summary', 'Market analysis', 'Strategic rationale', 'Implementation roadmap', 'Risk assessment', 'Recommendation'],
    keyPhrases: [
      'Sehr geehrte Damen und Herren des Vorstands',
      'Die gegenwärtige Marktlage erfordert',
      'Unter Abwägung sämtlicher Faktoren',
      'Die vorgeschlagene Neuausrichtung zielt darauf ab',
      'Es gilt, die inhärenten Risiken zu antizipieren',
      'Wir empfehlen nachdrücklich die Implementierung',
    ],
    minWords: 300,
    difficulty: 'hard',
  },
  {
    id: 'academic-peer-review',
    title: 'Scholarly Peer Review Response',
    icon: '📝',
    level: CEFRLevel.C2,
    scenario: 'Respond to critical peer review comments on your research manuscript submitted to a prestigious journal.',
    recipient: 'Herausgeberteam',
    subject: 'Überarbeitete Fassung und Stellungnahme zu Gutachten',
    structure: ['Formal greeting', 'Gratitude for reviews', 'Point-by-point response', 'Manuscript improvements', 'Theoretical defense', 'Closing'],
    keyPhrases: [
      'Sehr geehrte Damen und Herren',
      'Wir danken den Gutachtern für die wertvollen Anmerkungen',
      'Bezugnehmend auf die Kritik hinsichtlich',
      'Wir haben die methodologischen Bedenken wie folgt adressiert',
      'Die theoretische Fundierung wurde substantiell erweitert',
      'Wir sind überzeugt, dass die überarbeitete Fassung',
    ],
    minWords: 320,
    difficulty: 'hard',
  },
  {
    id: 'legal-position-paper',
    title: 'Legal Position Paper to Court',
    icon: '⚖️',
    level: CEFRLevel.C2,
    scenario: 'Draft a legal position paper addressing a complex constitutional law question.',
    recipient: 'Bundesverfassungsgericht',
    subject: 'Stellungnahme zur verfassungsrechtlichen Zulässigkeit',
    structure: ['Formal opening', 'Legal context', 'Constitutional analysis', 'Precedent discussion', 'Argumentation', 'Legal conclusion'],
    keyPhrases: [
      'Hohes Gericht',
      'In der vorliegenden Rechtsfrage',
      'Unter Berücksichtigung der einschlägigen Rechtsprechung',
      'Die verfassungsrechtliche Würdigung ergibt',
      'Im Lichte der Grundrechte',
      'Aus den dargelegten Gründen ist zu schlussfolgern',
    ],
    minWords: 350,
    difficulty: 'hard',
  },
];
