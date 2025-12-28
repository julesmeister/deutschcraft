import { CEFRLevel } from '../models/cefr';

export interface WeekSchedule {
  weekNumber: number;
  title: string;
  duration: string;
  topics: string[];
}

export interface SyllabusData {
  level: CEFRLevel;
  weeklySchedule: WeekSchedule[];
  grammarTopics: string[];
  vocabularyThemes: string[];
  communicationSkills: string[];
}

/**
 * Get comprehensive syllabus data for a specific CEFR level
 * Based on Testmanship Android app syllabus structure
 */
export function getSyllabusForLevel(level: CEFRLevel): SyllabusData {
  return {
    level,
    weeklySchedule: getWeeklySchedule(level),
    grammarTopics: getGrammarTopics(level),
    vocabularyThemes: getVocabularyThemes(level),
    communicationSkills: getCommunicationSkills(level),
  };
}

function getWeeklySchedule(level: CEFRLevel): WeekSchedule[] {
  switch (level) {
    case CEFRLevel.A1:
      return [
        { weekNumber: 1, title: 'Lektion 1 - Guten Tag. Mein Name ist ...', duration: '1 week', topics: ['Greetings and introductions', 'The German alphabet', 'Verb conjugation (singular)', 'Countries and languages'] },
        { weekNumber: 2, title: 'Lektion 2 - Meine Familie', duration: '1 week', topics: ['Family members', 'Possessive articles (mein, dein)', 'Numbers 0-20', 'Personal details'] },
        { weekNumber: 3, title: 'Lektion 3 - Einkaufen', duration: '1 week', topics: ['Groceries and food', 'Prices and numbers 20-100', 'Accusative case (den, einen, keinen)', 'Plural forms'] },
        { weekNumber: 4, title: 'Lektion 4 - Meine Wohnung', duration: '1 week', topics: ['Furniture and rooms', 'Adjectives for description', 'Definite articles (der, die, das)', 'Negation with "nicht" and "kein"'] },
        { weekNumber: 5, title: 'Lektion 5 - Mein Tag', duration: '1 week', topics: ['Daily routine', 'Time and clock', 'Separable verbs', 'Prepositions of time (am, um, von...bis)'] },
        { weekNumber: 6, title: 'Lektion 6 - Freizeit', duration: '1 week', topics: ['Hobbies and leisure activities', 'Weather and seasons', 'Modal verbs (können, wollen)', 'Accusative personal pronouns'] },
        { weekNumber: 7, title: 'Lektion 7 - Kinder und Schule', duration: '1 week', topics: ['School and education', 'Activities and abilities', 'Modal verbs (müssen, dürfen)', 'Perfekt tense introduction'] },
        { weekNumber: 8, title: 'Lektion 8 - Beruf und Arbeit', duration: '1 week', topics: ['Professions and workplace', 'Daily work routine', 'Prepositions (als, bei, vor, seit)', 'Past tense of sein and haben'] },
        { weekNumber: 9, title: 'Lektion 9 - Ämter und Behörden', duration: '1 week', topics: ['Public authorities', 'Filling out forms', 'Imperative mood', 'Modal verbs (sollen, müssen)'] },
        { weekNumber: 10, title: 'Lektion 10 - Gesundheit und Krankheit', duration: '1 week', topics: ['Body parts', 'Illness and health', 'Making appointments', 'Modal verbs (dürfen, sollen)'] },
        { weekNumber: 11, title: 'Lektion 11 - In der Stadt unterwegs', duration: '1 week', topics: ['Directions and locations', 'Transportation', 'Prepositions with Dative', 'Prepositions with Accusative'] },
        { weekNumber: 12, title: 'Lektion 12 - Kundenservice', duration: '1 week', topics: ['Customer service', 'Phone conversations', 'Polite requests', 'Dative personal pronouns'] },
        { weekNumber: 13, title: 'Lektion 13 - Neue Kleider', duration: '1 week', topics: ['Clothing and fashion', 'Shopping for clothes', 'Demonstrative pronouns (dieser, dieses)', 'Adjective endings (nominative/accusative)'] },
        { weekNumber: 14, title: 'Lektion 14 - Feste', duration: '1 week', topics: ['Celebrations and festivals', 'Ordinal numbers (dates)', 'Invitations', 'Review of A1 grammar'] },
      ];
    case CEFRLevel.A2:
      return [
        { weekNumber: 1, title: 'Lektion 1 - Ankommen', duration: '1 week', topics: ['Arrival and orientation', 'Origin and nationality', 'Perfekt tense review', 'Subordinate clauses with "weil"'] },
        { weekNumber: 2, title: 'Lektion 2 - Zu Hause', duration: '1 week', topics: ['Living arrangements', 'Furniture and moving', 'Two-way prepositions (Wechselpräpositionen)', 'Verbs with prepositions'] },
        { weekNumber: 3, title: 'Lektion 3 - Essen und Trinken', duration: '1 week', topics: ['Restaurant and dining', 'Food culture', 'Adjective endings (dative)', 'Reflexive verbs introduction'] },
        { weekNumber: 4, title: 'Lektion 4 - Arbeitswelt', duration: '1 week', topics: ['Job search and application', 'Workplace communication', 'Polite requests (Konjunktiv II)', 'Verbs with prepositional objects'] },
        { weekNumber: 5, title: 'Lektion 5 - Sport und Fitness', duration: '1 week', topics: ['Sports and health', 'Fitness activities', 'Reflexive verbs', 'Comparison (als, wie)'] },
        { weekNumber: 6, title: 'Lektion 6 - Schule und Ausbildung', duration: '1 week', topics: ['Education systems', 'Career paths', 'Präteritum (simple past) of modal verbs', 'Präteritum of regular/irregular verbs'] },
        { weekNumber: 7, title: 'Lektion 7 - Feste und Geschenke', duration: '1 week', topics: ['Gifts and occasions', 'Parties', 'Dative object pronouns', 'Position of objects'] },
        { weekNumber: 8, title: 'Lektion 8 - Am Wochenende', duration: '1 week', topics: ['Weekend activities', 'Events and culture', 'Prepositions of time', 'Subordinate clauses with "dass"'] },
        { weekNumber: 9, title: 'Lektion 9 - Meine Sachen', duration: '1 week', topics: ['Belongings and objects', 'Order and cleanliness', 'Passive voice (Present)', 'Relative clauses (Nominative)'] },
        { weekNumber: 10, title: 'Lektion 10 - Kommunikation', duration: '1 week', topics: ['Media and technology', 'Phone and email', 'Indirect questions', 'Adjectives with un- / -los'] },
        { weekNumber: 11, title: 'Lektion 11 - Unterwegs', duration: '1 week', topics: ['Travel and transport', 'Traffic rules', 'Prepositions of place', 'Adjective declension review'] },
        { weekNumber: 12, title: 'Lektion 12 - Reisen und Urlaub', duration: '1 week', topics: ['Vacation planning', 'Hotel and accommodation', 'Subordinate clauses with "wenn"', 'Indefinite pronouns'] },
        { weekNumber: 13, title: 'Lektion 13 - Geld', duration: '1 week', topics: ['Money and banking', 'Payment methods', 'Subordinate clauses with "ob"', 'Review of connectives'] },
        { weekNumber: 14, title: 'Lektion 14 - Lebensstationen', duration: '1 week', topics: ['Life stages and biography', 'Memories', 'Temporal prepositions', 'Review of A2 grammar'] },
      ];
    case CEFRLevel.B1:
      return [
        { weekNumber: 1, title: 'Lektion 1 - Glück im Alltag', duration: '1 week', topics: ['Happiness and emotions', 'Past tense narration (Präteritum vs Perfekt)', 'Adjectives as nouns', 'Genitive case introduction'] },
        { weekNumber: 2, title: 'Lektion 2 - Unterhaltung', duration: '1 week', topics: ['Entertainment and media', 'Film and music', 'Adjective endings review', 'Comparative and Superlative'] },
        { weekNumber: 3, title: 'Lektion 3 - Gesund bleiben', duration: '1 week', topics: ['Health and nutrition', 'Stress management', 'Reflexive verbs with accusative/dative', 'Genitive prepositions'] },
        { weekNumber: 4, title: 'Lektion 4 - Sprachen', duration: '1 week', topics: ['Language learning', 'Multilingualism', 'Past Perfect (Plusquamperfekt)', 'Temporal clauses (nachdem, bevor)'] },
        { weekNumber: 5, title: 'Lektion 5 - Eine Arbeit finden', duration: '1 week', topics: ['Job market', 'Application documents', 'Future tense (Futur I)', 'Final clauses (damit, um...zu)'] },
        { weekNumber: 6, title: 'Lektion 6 - Dienstleistung', duration: '1 week', topics: ['Services and repairs', 'Customer complaints', 'Passive voice (Process)', 'Passive with modal verbs'] },
        { weekNumber: 7, title: 'Lektion 7 - Rund ums Wohnen', duration: '1 week', topics: ['Housing and living', 'Neighborhood', 'Relative clauses (all cases)', 'Participles as adjectives'] },
        { weekNumber: 8, title: 'Lektion 8 - Unter Kollegen', duration: '1 week', topics: ['Workplace culture', 'Social interaction', 'Konjunktiv II (Politeness)', 'Conditional clauses'] },
        { weekNumber: 9, title: 'Lektion 9 - Die digitale Welt', duration: '1 week', topics: ['Digital media', 'Internet safety', 'Two-part connectors (zwar...aber, weder...noch)', 'Indirect speech introduction'] },
        { weekNumber: 10, title: 'Lektion 10 - Werbung und Konsum', duration: '1 week', topics: ['Advertising', 'Consumer behavior', 'Adjective declension (review)', 'N-Declension'] },
        { weekNumber: 11, title: 'Lektion 11 - Lebenslanges Lernen', duration: '1 week', topics: ['Education and training', 'Lifelong learning', 'Infinitive constructions', 'Verbs with prepositional objects'] },
        { weekNumber: 12, title: 'Lektion 12 - Miteinander leben', duration: '1 week', topics: ['Society and community', 'Social rules', 'Connectors (deshalb, trotzdem)', 'Participle constructions'] },
        { weekNumber: 13, title: 'Lektion 13 - Politik und Gesellschaft', duration: '1 week', topics: ['Politics and democracy', 'Social engagement', 'Passive voice (State passive)', 'Extended attributes'] },
        { weekNumber: 14, title: 'Lektion 14 - Alte und neue Heimat', duration: '1 week', topics: ['Migration and integration', 'Intercultural experiences', 'Review of B1 grammar', 'Exam preparation'] },
      ];
    case CEFRLevel.B2:
      return [
        { weekNumber: 1, title: 'Konjunktiv I (Reported Speech)', duration: '1-2 weeks', topics: ['Formation of Konjunktiv I', 'Reported speech (indirect speech)', 'Konjunktiv I in news and media', 'When to use Konjunktiv I vs II'] },
        { weekNumber: 2, title: 'Participle Constructions', duration: '1-2 weeks', topics: ['Present participle as adjective', 'Past participle as adjective', 'Participial phrases', 'Reducing relative clauses'] },
        { weekNumber: 3, title: 'Nominal Style', duration: '1-2 weeks', topics: ['Converting verbs to nouns', 'Nominalization patterns', 'Using nominal forms', 'Academic and business writing'] },
        { weekNumber: 4, title: 'Extended Adjective Phrases', duration: '1-2 weeks', topics: ['Multiple adjectives before nouns', 'Adjectives with complements', 'Long pre-noun modifiers', 'Understanding complex texts'] },
        { weekNumber: 5, title: 'Complex Sentence Architecture', duration: '1-2 weeks', topics: ['Multiple levels of subordination', 'Balanced sentence structure', 'Embedding and nesting clauses', 'Maintaining clarity'] },
        { weekNumber: 6, title: 'Cohesion & Text Structure', duration: '1 week', topics: ['Discourse markers (außerdem, dennoch)', 'Reference words (dieser, jener)', 'Text connectors', 'Paragraph structure'] },
        { weekNumber: 7, title: 'Advanced Conjunctions', duration: '1 week', topics: ['indem (by doing)', 'anstatt...zu (instead of)', 'sodass (so that)', 'je...desto (the...the)'] },
        { weekNumber: 8, title: 'Academic Writing', duration: '1-2 weeks', topics: ['Essay structure', 'Thesis statements', 'Topic sentences', 'Academic vocabulary'] },
        { weekNumber: 9, title: 'Argumentation & Critique', duration: '1-2 weeks', topics: ['Building arguments', 'Providing evidence', 'Analyzing texts', 'Writing critiques'] },
        { weekNumber: 10, title: 'Zustandspassiv & Alternatives', duration: '1-2 weeks', topics: ['State passive (sein + past participle)', 'man + verb', 'sich lassen + infinitive', 'sein + zu + infinitive'] },
        { weekNumber: 11, title: 'Advanced Modal Verbs', duration: '1 week', topics: ['Modal verbs in subjunctive', 'Modal verbs in passive', 'Double infinitives', 'Nuances of modals'] },
        { weekNumber: 12, title: 'Register & Style', duration: '1 week', topics: ['Formal vs informal registers', 'Spoken vs written language', 'Style appropriateness', 'Situational language'] },
        { weekNumber: 13, title: 'Word Formation & Idioms', duration: '1 week', topics: ['Prefixes and suffixes', 'Compound words', 'Common idioms', 'Cultural expressions'] },
        { weekNumber: 14, title: 'Review & Certification', duration: '2-3 weeks', topics: ['Comprehensive grammar review', 'B2 exam strategies', 'Mock exam practice', 'Final preparation'] },
      ];
    default:
      return [];
  }
}

function getGrammarTopics(level: CEFRLevel): string[] {
  switch (level) {
    case CEFRLevel.A1:
      return [
        'Personal pronouns (ich, du, er/sie/es, wir, ihr, sie)',
        "Present tense of sein (to be) and haben (to have)",
        'Articles (der, die, das) and basic gender rules',
        'Plural forms of nouns',
        'Present tense of regular verbs',
        'Basic word order (Subject-Verb-Object)',
        "Negation with 'nicht' and 'kein'",
        'Simple questions with W-words (wer, was, wo, wann)',
        'Possessive pronouns (mein, dein, sein, ihr)',
        'Prepositions with accusative (durch, für, gegen, ohne, um)',
      ];
    case CEFRLevel.A2:
      return [
        'Past tense (Perfekt) with haben and sein',
        'Modal verbs (können, müssen, dürfen, wollen, sollen)',
        'Separable and inseparable prefix verbs',
        'Comparative and superlative adjectives',
        'Dative case (indirect object)',
        'Prepositions with dative (aus, bei, mit, nach, seit, von, zu)',
        'Two-way prepositions (an, auf, in, über, unter, vor, hinter)',
        'Imperative forms',
        "Subordinate clauses with 'weil' and 'dass'",
        'Reflexive verbs (sich waschen, sich freuen)',
      ];
    case CEFRLevel.B1:
      return [
        'Past tense (Präteritum) of common verbs',
        "Future tense with 'werden'",
        'Konjunktiv II for polite requests and hypothetical situations',
        'Genitive case (possession)',
        'Relative clauses (der, die, das as relative pronouns)',
        'Passive voice (present and past)',
        'Adjective declension (all cases)',
        'Conjunctions (obwohl, während, bevor, nachdem)',
        "Infinitive clauses with 'zu'",
        'N-declension nouns (der Student → den Studenten)',
      ];
    case CEFRLevel.B2:
      return [
        'Advanced Konjunktiv II and Konjunktiv I (reported speech)',
        'Participle constructions (participial phrases)',
        'Extended adjective phrases',
        'Complex sentence structures with multiple clauses',
        'Nominal style (converting verbs to nouns)',
        'Advanced passive constructions (Zustandspassiv, Passiv Ersatzformen)',
        'Advanced conjunctions (indem, anstatt, sodass, je...desto)',
        'Subjunctive in wishes and conditional sentences',
        'Word formation (prefixes, suffixes, compound words)',
        'Fine nuances of modal verbs in subjunctive',
      ];
    default:
      return [];
  }
}

function getVocabularyThemes(level: CEFRLevel): string[] {
  switch (level) {
    case CEFRLevel.A1:
      return [
        'Numbers 1-100',
        'Days of the week and months',
        'Family members (Mutter, Vater, Schwester, Bruder)',
        'Basic colors (rot, blau, grün, gelb)',
        'Food and drinks (Brot, Wasser, Kaffee, Apfel)',
        'Common verbs (sein, haben, gehen, kommen, machen)',
        'Greetings and farewells (Guten Tag, Auf Wiedersehen)',
        'Parts of the house (Haus, Zimmer, Küche, Bad)',
        'Clothing items (Hose, Hemd, Kleid, Schuhe)',
        'Weather expressions (Sonne, Regen, kalt, warm)',
      ];
    case CEFRLevel.A2:
      return [
        'Professions and workplace (Arzt, Lehrer, Büro, Firma)',
        'Travel and transportation (Zug, Flughafen, Ticket, Urlaub)',
        'Health and body parts (Kopf, Arm, Bein, Arzt, Krankenhaus)',
        'Hobbies and free time (Sport, Musik, lesen, schwimmen)',
        'Technology (Computer, Handy, Internet, E-Mail)',
        'Shopping and money (kaufen, bezahlen, Euro, teuer, billig)',
        'Time expressions (gestern, heute, morgen, später)',
        'School and education (Schule, Student, lernen, Prüfung)',
        'Nature and environment (Baum, Blume, Park, See)',
        'Feelings and emotions (glücklich, traurig, müde, wütend)',
      ];
    case CEFRLevel.B1:
      return [
        'Media and news (Zeitung, Nachrichten, berichten, Artikel)',
        'Politics and society (Regierung, Wahl, Politik, Bürger)',
        'Culture and arts (Kunst, Museum, Theater, Ausstellung)',
        'Environment and sustainability (Umwelt, Klima, recyceln, Energie)',
        'Economy and business (Wirtschaft, Unternehmen, Markt, Kunde)',
        'Abstract concepts (Meinung, Erfahrung, Möglichkeit, Problem)',
        'Legal and administrative (Vertrag, Gesetz, Behörde, Formular)',
        'Idioms and expressions (in Ordnung, Bescheid sagen, sich Sorgen machen)',
        'Technical vocabulary (Gerät, Funktion, System, Prozess)',
        'Social issues (Bildung, Gesundheit, Arbeitslosigkeit, Integration)',
      ];
    case CEFRLevel.B2:
      return [
        'Academic language (Hypothese, These, Argumentation, Fazit)',
        'Scientific and technical terms (Forschung, Entwicklung, Methode, Analyse)',
        'Advanced business vocabulary (Strategie, Konkurrenz, Gewinn, Verlust)',
        'Philosophy and ethics (Moral, Ethik, Wert, Prinzip)',
        'Literature and literary devices (Roman, Metapher, Stil, Interpretation)',
        'Psychology and sociology (Verhalten, Gesellschaft, Einstellung, Identität)',
        'Global issues (Globalisierung, Migration, Konflikt, Entwicklung)',
        'Specialized professional vocabulary',
        'Regional and stylistic variations',
        'Nuanced expressions for abstract ideas',
      ];
    default:
      return [];
  }
}

function getCommunicationSkills(level: CEFRLevel): string[] {
  switch (level) {
    case CEFRLevel.A1:
      return [
        'Introducing yourself and others',
        'Asking and giving personal information',
        'Describing your family',
        'Shopping for basic items',
        'Ordering food in a restaurant',
        'Asking for directions (simple)',
        'Talking about daily routines',
        'Making simple plans',
        'Expressing likes and dislikes',
        'Asking for help',
        '📝 Writing: Informal Email to a Friend',
        '📝 Writing: Postcard',
        '📝 Writing: Introduction Email',
        '📝 Writing: Simple Thank You Note',
        '📝 Writing: Simple Invitation',
      ];
    case CEFRLevel.A2:
      return [
        'Talking about past experiences',
        'Making appointments and reservations',
        'Describing your living situation',
        'Asking for and giving advice',
        'Writing simple emails and messages',
        'Talking about plans and intentions',
        'Expressing opinions (simple)',
        'Describing people and objects',
        'Telling simple stories',
        'Handling common service situations (bank, post office)',
        '📝 Writing: Formal Email - Inquiry',
        '📝 Writing: Simple Complaint Letter',
        '📝 Writing: Simple Job Application Email',
        '📝 Writing: Informal Letter - Asking for Advice',
        '📝 Writing: Hotel/Booking Confirmation Request',
        '📝 Writing: Informal Apology Letter',
        '📝 Writing: Event Organization Email',
      ];
    case CEFRLevel.B1:
      return [
        'Expressing and justifying opinions',
        'Participating in discussions and debates',
        'Writing formal letters and emails',
        'Summarizing texts and articles',
        'Making presentations on familiar topics',
        'Negotiating and reaching compromises',
        'Describing complex processes',
        'Reporting what others have said (indirect speech)',
        'Expressing wishes and regrets',
        'Understanding and using common idioms',
        '📝 Writing: Formal Job Application Letter',
        '📝 Writing: Motivation Letter (Erasmus/University)',
        '📝 Writing: Detailed Complaint Letter',
        '📝 Writing: Formal Request Letter',
        '📝 Writing: Opinion Letter to Newspaper',
        '📝 Writing: Letter of Recommendation',
        '📝 Writing: Formal Notification of Change',
        '📝 Writing: Simple Business Proposal',
      ];
    case CEFRLevel.B2:
      return [
        'Understanding complex texts and implicit meanings',
        'Writing detailed reports and essays',
        'Presenting and defending arguments effectively',
        'Understanding different registers (formal, informal, professional)',
        'Analyzing and critiquing texts',
        'Participating in professional meetings',
        'Negotiating complex situations',
        'Understanding news broadcasts and documentaries',
        'Using language flexibly for social and professional purposes',
        'Recognizing and using subtle linguistic nuances',
        '📝 Writing: Academic Research Inquiry',
        '📝 Writing: Grant Application Letter',
        '📝 Writing: Legal Formal Notice (Abmahnung)',
        '📝 Writing: Resignation Letter',
        '📝 Writing: Sponsorship Proposal',
        '📝 Writing: Press Release',
        '📝 Writing: Formal Appeal (Widerspruch)',
        '📝 Writing: Contract Termination Letter',
      ];
    case CEFRLevel.C1:
      return [
        'Understanding long, complex texts and recognizing implicit meaning',
        'Expressing ideas fluently and spontaneously',
        'Using language flexibly for social, academic, and professional purposes',
        'Producing clear, well-structured, detailed text on complex subjects',
        'Understanding and producing subtle distinctions in meaning',
        'Participating effectively in academic and professional discourse',
        'Analyzing and synthesizing complex information',
        'Adapting register and style to different contexts',
        'Understanding cultural and contextual nuances',
        'Using advanced rhetorical devices effectively',
        '📝 Writing: Academic Peer Review (Gutachten)',
        '📝 Writing: Policy Brief / Position Paper',
        '📝 Writing: Diplomatic Note (Verbalnote)',
        '📝 Writing: Expert Testimony (Sachverständigengutachten)',
        '📝 Writing: White Paper',
        '📝 Writing: Arbitration Statement (Klageerw iderung)',
        '📝 Writing: Memorandum of Understanding',
      ];
    case CEFRLevel.C2:
      return [
        'Understanding with ease virtually everything heard or read',
        'Summarizing information from different sources',
        'Expressing yourself spontaneously with precision',
        'Distinguishing finer shades of meaning in complex situations',
        'Producing clear, sophisticated, well-structured writing',
        'Mastering all registers and styles',
        'Understanding and producing highly specialized discourse',
        'Demonstrating cultural and linguistic sophistication',
        'Analyzing and critiquing at the highest level',
        'Engaging in expert-level professional communication',
        '📝 Writing: Constitutional Complaint (Verfassungsbeschwerde)',
        '📝 Writing: Legislative Draft with Memorandum',
        '📝 Writing: Academic Journal Editorial Decision',
        '📝 Writing: M&A Letter of Intent',
        '📝 Writing: International Arbitration Submission',
        '📝 Writing: Literary Criticism Essay',
        '📝 Writing: Philosophical Treatise',
      ];
    default:
      return [];
  }
}
