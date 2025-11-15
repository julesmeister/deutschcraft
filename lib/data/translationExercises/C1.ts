/**
 * C1 Level Translation Exercises
 * Advanced level translations with sophisticated language and complex concepts
 */

import { CEFRLevel } from '@/lib/models/cefr';
import { TranslationExercise } from './types';

export const C1_TRANSLATION_EXERCISES: TranslationExercise[] = [
  {
    exerciseId: 'tr-c1-001',
    type: 'translation',
    level: CEFRLevel.C1,
    title: 'Academic Discourse',
    englishText: 'The paradigm shift in contemporary linguistics has led scholars to reconsider fundamental assumptions about language acquisition and cognitive development. Whereas traditional behaviorist theories emphasized environmental conditioning, modern approaches acknowledge the intricate interplay between innate biological predispositions and sociocultural influences, thereby necessitating a more nuanced, multidisciplinary framework.',
    correctGermanText: 'Der Paradigmenwechsel in der zeitgenössischen Linguistik hat Wissenschaftler dazu veranlasst, grundlegende Annahmen über Spracherwerb und kognitive Entwicklung zu überdenken. Während traditionelle behavioristische Theorien die Konditionierung durch die Umwelt betonten, erkennen moderne Ansätze das komplexe Zusammenspiel zwischen angeborenen biologischen Veranlagungen und soziokulturellen Einflüssen an, wodurch ein differenzierterer, multidisziplinärer Rahmen erforderlich wird.',
    category: 'linguistics-theory',
    difficulty: 'hard',
    estimatedTime: 50,
    targetGrammar: ['Extended attribute constructions', 'Nominalization', 'Participial constructions', 'Complex subordination'],
    targetVocabulary: ['Paradigmenwechsel', 'zeitgenössisch', 'veranlassen', 'Konditionierung', 'angeboren', 'Veranlagung', 'differenziert'],
    hints: [
      '"veranlassen zu" for "lead to"',
      'Use "wodurch" for "thereby"',
      'Academic tone requires formal register'
    ],
    completionCount: 0,
    averageScore: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    exerciseId: 'tr-c1-002',
    type: 'translation',
    level: CEFRLevel.C1,
    title: 'Philosophical Argumentation',
    englishText: 'The ethical implications of genetic engineering extend far beyond the immediate medical applications, touching upon fundamental questions of human nature and societal values. Critics contend that tampering with the human genome constitutes an unacceptable transgression of natural boundaries, whereas proponents maintain that such interventions represent a logical continuation of medical progress and could alleviate immense suffering.',
    correctGermanText: 'Die ethischen Implikationen der Gentechnik reichen weit über die unmittelbaren medizinischen Anwendungen hinaus und berühren grundlegende Fragen der menschlichen Natur und gesellschaftlicher Werte. Kritiker behaupten, dass die Manipulation des menschlichen Genoms eine unzulässige Überschreitung natürlicher Grenzen darstellt, während Befürworter argumentieren, dass solche Eingriffe eine logische Fortsetzung des medizinischen Fortschritts darstellen und immenses Leid lindern könnten.',
    category: 'ethics-philosophy',
    difficulty: 'hard',
    estimatedTime: 45,
    targetGrammar: ['Extended participial phrases', 'Genitive chains', 'Modal particles', 'Subjunctive II'],
    targetVocabulary: ['Implikationen', 'Gentechnik', 'berühren', 'Manipulation', 'Überschreitung', 'Eingriffe', 'lindern'],
    hints: [
      '"hinausreichen über" means "extend beyond"',
      'Use "während" for contrast',
      '"könnten lindern" for potential subjunctive'
    ],
    completionCount: 0,
    averageScore: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    exerciseId: 'tr-c1-003',
    type: 'translation',
    level: CEFRLevel.C1,
    title: 'Economic Analysis',
    englishText: 'The volatility inherent in cryptocurrency markets poses significant challenges for regulators attempting to establish coherent frameworks that balance innovation with consumer protection. The decentralized nature of blockchain technology fundamentally undermines traditional regulatory mechanisms, necessitating novel approaches that acknowledge both the transformative potential and systemic risks associated with digital currencies.',
    correctGermanText: 'Die Volatilität, die Kryptowährungsmärkten innewohnt, stellt Regulierungsbehörden vor erhebliche Herausforderungen beim Versuch, kohärente Rahmenwerke zu schaffen, die Innovation mit Verbraucherschutz in Einklang bringen. Die dezentralisierte Natur der Blockchain-Technologie untergräbt grundlegend traditionelle Regulierungsmechanismen, was neuartige Ansätze erforderlich macht, die sowohl das transformative Potenzial als auch die systemischen Risiken digitaler Währungen anerkennen.',
    category: 'finance-regulation',
    difficulty: 'hard',
    estimatedTime: 50,
    targetGrammar: ['Relative clauses with prepositions', 'Extended attributes', 'Participial constructions', 'Nominalization'],
    targetVocabulary: ['Volatilität', 'innewohnen', 'Regulierungsbehörde', 'kohärent', 'untergraben', 'neuartig', 'systemisch'],
    hints: [
      '"innewohnen" means "to be inherent"',
      'Use "was" to refer to previous clause',
      '"in Einklang bringen" for "balance"'
    ],
    completionCount: 0,
    averageScore: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
