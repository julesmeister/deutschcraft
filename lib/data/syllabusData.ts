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
        { weekNumber: 1, title: 'Alphabet & Pronunciation', duration: '1 week', topics: ['German alphabet (A-Z)', 'Vowel sounds (a, e, i, o, u, ä, ö, ü)', 'Consonant pronunciation (ch, sch, st, sp)', 'Umlauts and special characters (ß)'] },
        { weekNumber: 2, title: 'Basics & Greetings', duration: '1 week', topics: ['Personal pronouns (ich, du, er/sie/es)', "Verb 'sein' (to be)", 'Basic greetings (Guten Tag, Hallo)', 'Numbers 1-20'] },
        { weekNumber: 3, title: 'Everyday Objects', duration: '1 week', topics: ['Articles (der, die, das)', 'Colors and shapes', 'Household items (Haus, Zimmer)', 'Present tense of regular verbs'] },
        { weekNumber: 4, title: 'Family & Food', duration: '1 week', topics: ['Family members (Mutter, Vater, Schwester)', 'Food vocabulary (Brot, Wasser, Kaffee)', 'Possessive pronouns (mein, dein)', 'Simple questions (Was? Wer? Wo?)'] },
        { weekNumber: 5, title: 'Daily Life', duration: '1 week', topics: ['Days of the week', 'Time expressions (heute, morgen)', 'Daily routines', "Verb 'haben' (to have)"] },
        { weekNumber: 6, title: 'Shopping Basics', duration: '1 week', topics: ['Numbers 20-100', 'Money and prices (Euro, kosten)', 'Shopping phrases (kaufen, bezahlen)', 'Clothing items (Hose, Hemd, Schuhe)'] },
        { weekNumber: 7, title: 'Weather & Location', duration: '1 week', topics: ['Weather expressions (Sonne, Regen, kalt)', 'Months of the year', 'Prepositions of location (in, auf, unter)', "Negation with 'nicht'"] },
        { weekNumber: 8, title: 'Likes & Dislikes', duration: '1 week', topics: ['Common verbs (gehen, kommen, machen)', 'Expressing preferences', 'Hobbies vocabulary', 'Simple word order (SVO)'] },
        { weekNumber: 9, title: 'Transportation', duration: '1 week', topics: ['Transportation vocabulary (Bus, Zug, Auto)', 'Asking for directions (simple)', 'Prepositions with accusative (durch, für)', "Modal verb 'möchten'"] },
        { weekNumber: 10, title: 'Home & Room', duration: '1 week', topics: ['Rooms in a house (Küche, Bad)', 'Furniture (Tisch, Stuhl, Bett)', 'Describing your home', 'Plural forms of nouns'] },
        { weekNumber: 11, title: 'Free Time & Review', duration: '1-2 weeks', topics: ['Leisure activities (lesen, schwimmen)', 'Making simple plans', 'Review all A1 topics', 'A1 exam preparation'] },
      ];
    case CEFRLevel.A2:
      return [
        { weekNumber: 1, title: 'Past Tense (Perfekt)', duration: '1 week', topics: ["Perfekt with 'haben'", "Perfekt with 'sein'", 'Past participles (regular)', 'Past participles (irregular)'] },
        { weekNumber: 2, title: 'Modal Verbs', duration: '1 week', topics: ['können (can)', 'müssen (must)', 'dürfen (may)', 'wollen, sollen, mögen'] },
        { weekNumber: 3, title: 'Separable Verbs', duration: '1 week', topics: ['Separable prefix verbs (aufstehen, ankommen)', 'Inseparable prefix verbs (verstehen)', 'Usage in sentences', 'Time and place expressions'] },
        { weekNumber: 4, title: 'Dative Case Intro', duration: '1 week', topics: ['Dative articles (dem, der, den)', 'Dative personal pronouns', 'Dative prepositions (mit, nach, zu)', 'Indirect objects'] },
        { weekNumber: 5, title: 'Comparatives', duration: '1 week', topics: ['Comparative adjectives (schöner, größer)', 'Superlative forms (am schönsten)', 'Irregular comparisons (gut-besser-best)', 'Comparison structures (als, wie)'] },
        { weekNumber: 6, title: 'Two-Way Prepositions', duration: '1 week', topics: ['Wechselpräpositionen (an, auf, in)', 'Accusative vs Dative usage', 'Location vs Direction', 'Practice with verbs of motion'] },
        { weekNumber: 7, title: 'Reflexive Verbs', duration: '1 week', topics: ['Reflexive pronouns (mich, dich, sich)', 'Common reflexive verbs (sich waschen)', 'Reflexive with dative', 'Daily routine with reflexives'] },
        { weekNumber: 8, title: 'Imperatives', duration: '1 week', topics: ['Informal imperative (du)', 'Formal imperative (Sie)', 'Plural imperative (ihr)', 'Polite requests'] },
        { weekNumber: 9, title: 'Subordinate Clauses', duration: '1-2 weeks', topics: ['Conjunctions: weil (because)', 'Conjunctions: dass (that)', 'Word order in subordinate clauses', 'Combining main and sub clauses'] },
        { weekNumber: 10, title: 'Review & Practice', duration: '1-2 weeks', topics: ['Review all A2 grammar', 'Practice conversations', 'A2 exam preparation', 'Writing practice'] },
      ];
    case CEFRLevel.B1:
      return [
        { weekNumber: 1, title: 'Präteritum (Past Narrative)', duration: '1 week', topics: ['Präteritum: sein, haben', 'Präteritum: modal verbs', 'Präteritum: regular verbs', 'Präteritum: irregular verbs'] },
        { weekNumber: 2, title: 'Future Tense', duration: '1 week', topics: ["Future with 'werden'", 'Time expressions (morgen, bald)', 'Making predictions', 'Plans and intentions'] },
        { weekNumber: 3, title: 'Konjunktiv II', duration: '1-2 weeks', topics: ['Formation of Konjunktiv II', 'Polite requests (könnte, würde)', 'Wishes (ich wäre, ich hätte)', 'Conditional sentences (wenn...dann)'] },
        { weekNumber: 4, title: 'Genitive Case', duration: '1 week', topics: ['Genitive articles (des, der)', 'Genitive prepositions (wegen, trotz)', 'Possession with genitive', 'von + dative alternative'] },
        { weekNumber: 5, title: 'Relative Clauses', duration: '1-2 weeks', topics: ['Relative pronouns (der, die, das)', 'Relative clauses in all cases', 'Position in sentence', 'With prepositions'] },
        { weekNumber: 6, title: 'Passive Voice', duration: '1-2 weeks', topics: ['Formation: werden + past participle', 'Past passive (wurde)', 'Perfect passive (ist...worden)', 'Passive with modal verbs'] },
        { weekNumber: 7, title: 'Adjective Declension', duration: '1-2 weeks', topics: ['Weak declension (after der/die/das)', 'Mixed declension (after ein/eine)', 'Strong declension (no article)', 'Practice all cases'] },
        { weekNumber: 8, title: 'Advanced Conjunctions', duration: '1 week', topics: ['obwohl (although)', 'während (while)', 'bevor, nachdem (before, after)', 'Subordinate vs coordinate'] },
        { weekNumber: 9, title: 'Infinitive with zu', duration: '1 week', topics: ['Infinitive clauses', 'um...zu (in order to)', 'ohne...zu (without)', 'Infinitive or dass-clause'] },
        { weekNumber: 10, title: 'N-Declension & Formal Writing', duration: '1 week', topics: ['N-declension nouns (der Student)', 'Formal letter structure', 'Business vocabulary', 'Formal expressions'] },
        { weekNumber: 11, title: 'Discussion & Debate', duration: '1 week', topics: ['Expressing opinions', 'Justifying arguments', 'Agreeing and disagreeing', 'Discussion phrases'] },
        { weekNumber: 12, title: 'Review & Practice', duration: '2-3 weeks', topics: ['Review all B1 grammar', 'Mock exam practice', 'Writing and speaking tasks', 'B1 certification preparation'] },
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
