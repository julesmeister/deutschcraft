# Vocabulary Categories Data

Comprehensive vocabulary category definitions organized by CEFR level for German language learning.

## 📁 Structure

The vocabulary categories are now **split into separate JSON files** for better organization and maintainability:

```
lib/data/
├── categories/
│   ├── a1.json          # 20 categories for A1 level
│   ├── a2.json          # 20 categories for A2 level
│   ├── b1.json          # 20 categories for B1 level
│   ├── b2.json          # 20 categories for B2 level
│   ├── c1.json          # 15 categories for C1 level
│   └── c2.json          # 15 categories for C2 level
├── vocabulary-categories.ts   # TypeScript utilities
├── vocabulary-categories.json # [DEPRECATED] Use split files instead
└── README.md                  # This file
```

## 📊 Overview

| Level | Categories | Focus | Examples |
|-------|-----------|-------|----------|
| **A1** | 20 | Basic everyday vocabulary | Greetings, numbers, family, food, colors |
| **A2** | 20 | Expanded daily life topics | Work, travel, health, hobbies, technology |
| **B1** | 20 | Social and abstract concepts | Media, politics, culture, environment, business |
| **B2** | 20 | Academic and professional | Research, philosophy, literature, global issues |
| **C1** | 15 | Specialized and advanced | Legal, medical, linguistics, advanced politics |
| **C2** | 15 | Mastery and native-level | Idioms, rhetoric, archaic language, expert discourse |

**Total:** 110 categories across all levels

## 🎯 Category Structure

Each category includes:

```typescript
{
  "id": string,              // Unique identifier (kebab-case)
  "name": string,           // Display name
  "icon": string,           // Emoji icon
  "description": string,    // Brief description with German examples
  "examples": string[],     // Array of example German words (optional)
  "priority": number        // Display order (1-20)
}
```

### Example Category

```json
{
  "id": "greetings-introductions",
  "name": "Greetings & Introductions",
  "icon": "👋",
  "description": "Guten Tag, Hallo, Auf Wiedersehen, introducing yourself",
  "examples": ["Hallo", "Guten Tag", "Tschüss", "Auf Wiedersehen", "Guten Morgen"],
  "priority": 1
}
```

## 📚 Usage

### TypeScript/JavaScript

```typescript
import { getCategoriesForLevel, getCategoryById } from '@/lib/data/vocabulary-categories';
import { CEFRLevel } from '@/lib/models/cefr';

// Get all categories for a level
const a1Categories = getCategoriesForLevel(CEFRLevel.A1);
// Returns: 20 categories

// Get specific category
const category = getCategoryById(CEFRLevel.A1, 'greetings-introductions');
// Returns: { id: "greetings-introductions", name: "Greetings & Introductions", ... }

// Get metadata
import { getCategoriesMetadata } from '@/lib/data/vocabulary-categories';
const metadata = getCategoriesMetadata();
// Returns: { version: "3.0.0", totalCategories: 110, categoriesPerLevel: {...} }
```

### Available Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getCategoriesForLevel(level)` | Get all categories for a CEFR level | `VocabularyCategory[]` |
| `getCategoryById(level, id)` | Get specific category | `VocabularyCategory \| undefined` |
| `getCategoryIds(level)` | Get all category IDs for a level | `string[]` |
| `getCategoriesSorted(level)` | Get categories sorted by priority | `VocabularyCategory[]` |
| `searchCategories(level, term)` | Search by name or description | `VocabularyCategory[]` |
| `getAllCategories()` | Get categories from all levels | `VocabularyCategory[]` |
| `getCategoryCount(level)` | Get count for a level | `number` |
| `isValidCategory(level, id)` | Validate category exists | `boolean` |
| `getCategoriesMetadata()` | Get metadata | `object` |

## 🔗 Integration with Firestore

### Tagging Vocabulary Words

Use category `id` values in the `tags` array:

```json
{
  "wordId": "hallo",
  "word": "Hallo",
  "translation": "Hello",
  "level": "A1",
  "tags": ["greetings-introductions"],
  "partOfSpeech": "interjection",
  "exampleSentence": "Hallo, wie geht es dir?"
}
```

### Multiple Tags

A word can belong to multiple categories:

```json
{
  "wordId": "krankenhaus",
  "word": "Krankenhaus",
  "translation": "Hospital",
  "level": "A2",
  "tags": ["health-body", "workplace-activities"],
  "partOfSpeech": "noun",
  "gender": "neuter"
}
```

### Dynamic Category Display

The `useVocabularyCategories` hook automatically:
1. Loads predefined categories for the selected level
2. Queries Firestore for vocabulary words
3. Counts words per category using `tags`
4. Returns categories with actual card counts

```typescript
const { categories, isLoading } = useVocabularyCategories(CEFRLevel.A1);
// Returns categories with cardCount field:
// [
//   { id: "greetings-introductions", name: "...", cardCount: 25, ... },
//   { id: "numbers-time", name: "...", cardCount: 18, ... },
//   ...
// ]
```

## 📖 Category Details by Level

### A1 (20 Categories) - Beginner

Foundation vocabulary for basic communication:

1. **Greetings & Introductions** 👋 - Hallo, Guten Tag, Tschüss
2. **Personal Information** 📝 - Name, Alter, Adresse
3. **Numbers & Counting** 🔢 - eins, zwei, drei, zehn
4. **Time & Dates** 🕐 - Montag, Januar, heute, morgen
5. **Family Members** 👨‍👩‍👧‍👦 - Mutter, Vater, Schwester
6. **House & Rooms** 🏠 - Haus, Zimmer, Küche, Bad
7. **Furniture & Objects** 🛋️ - Tisch, Stuhl, Bett, Sofa
8. **Food & Drinks** 🍽️ - Brot, Wasser, Kaffee, Milch
9. **Meals & Eating** 🍴 - Frühstück, Mittagessen, essen
10. **Colors & Shapes** 🎨 - rot, blau, grün, gelb
11. **Weather & Seasons** ☀️ - Sonne, Regen, Schnee, Winter
12. **Clothing Basics** 👔 - Hose, Hemd, Kleid, Schuhe
13. **Body Parts** 💪 - Kopf, Auge, Hand, Fuß
14. **Shopping Basics** 🛍️ - kaufen, bezahlen, Euro, Preis
15. **Transportation** 🚗 - Bus, Zug, Auto, Fahrrad
16. **Directions & Locations** 🗺️ - links, rechts, hier, dort
17. **Common Verbs** 🏃 - sein, haben, gehen, kommen
18. **Daily Activities** ⏰ - schlafen, aufstehen, essen
19. **Basic Adjectives** ✨ - groß, klein, gut, schlecht
20. **Question Words** ❓ - wer, was, wo, wann, wie

### A2 (20 Categories) - Elementary

Expanded topics for everyday situations:

1. **Work & Professions** 💼 - Arzt, Lehrer, Büro
2. **Workplace Activities** 📊 - arbeiten, Kollege, Projekt
3. **Travel & Planning** ✈️ - Flughafen, Hotel, Ticket
4. **Directions & Navigation** 🧭 - Stadt, Straße, Platz
5. **Health & Medical** 🏥 - Kopf, Arzt, Krankenhaus
6. **Illnesses & Symptoms** 🤒 - Fieber, Erkältung, Husten
7. **Hobbies & Leisure** 🎮 - Sport, Musik, lesen
8. **Sports & Physical Activities** ⚽ - Fußball, Tennis, laufen
9. **Technology & Devices** 💻 - Computer, Handy, Internet
10. **Social Media & Communication** 📱 - SMS, chatten, posten
11. **Shopping & Money** 🛍️ - kaufen, verkaufen, bezahlen
12. **Stores & Shopping Places** 🏬 - Supermarkt, Bäckerei
13. **Time Expressions** ⏰ - gestern, heute, morgen
14. **School & Education** 📚 - Schule, Universität, lernen
15. **School Subjects** 📖 - Mathematik, Deutsch, Geschichte
16. **Nature & Animals** 🌳 - Baum, Blume, Park, See
17. **Pets & Common Animals** 🐕 - Hund, Katze, Vogel
18. **Feelings & Emotions** 😊 - glücklich, traurig, müde
19. **Personality & Character** 👤 - freundlich, nett, lustig
20. **Restaurant & Dining** 🍴 - Restaurant, Kellner, bestellen

### B1 (20 Categories) - Intermediate

Social topics and abstract concepts:

1. **Media & News** 📰 - Zeitung, Nachrichten, Artikel
2. **Journalism & Reporting** 🎙️ - Interview, Schlagzeile
3. **Politics & Government** 🏛️ - Regierung, Wahl, Politik
4. **Civic Life & Rights** 🗳️ - Recht, Pflicht, Stimme
5. **Culture & Arts** 🎭 - Kunst, Museum, Theater
6. **Music & Performance** 🎵 - Orchester, Komponist, Oper
7. **Environment & Climate** 🌍 - Umwelt, Klima, Klimawandel
8. **Sustainability & Green Living** ♻️ - nachhaltig, recyceln
9. **Business & Economy** 💰 - Wirtschaft, Unternehmen, Markt
10. **Finance & Banking** 🏦 - Bank, Konto, Kredit
11. **Abstract Concepts** 💭 - Meinung, Erfahrung, Idee
12. **Opinions & Arguments** 🗨️ - Argument, Diskussion
13. **Legal & Administrative** ⚖️ - Vertrag, Gesetz, Behörde
14. **Bureaucracy & Documentation** 📋 - Anmeldung, Formular
15. **Idioms & Expressions** 💬 - in Ordnung, Bescheid sagen
16. **Colloquial Phrases** 🗣️ - Ich meine, eigentlich
17. **Technical Vocabulary** 🔧 - Gerät, System, Prozess
18. **Digital Technology** 💾 - Software, Hardware, Daten
19. **Social Issues** 🤝 - Bildung, Arbeitslosigkeit
20. **Relationships & Society** 👥 - Gemeinschaft, Vertrauen

### B2 (20 Categories) - Upper Intermediate

Academic and professional contexts:

1. **Academic Language** 🎓 - Hypothese, These, Fazit
2. **Research & Methodology** 🔬 - Methode, Analyse, Experiment
3. **Scientific & Technical Terms** 🧪 - Forschung, Innovation
4. **Mathematics & Logic** 📐 - Gleichung, Formel, Beweis
5. **Advanced Business** 💼 - Strategie, Konkurrenz, Gewinn
6. **Management & Leadership** 👔 - Führung, Verwaltung
7. **Philosophy & Ethics** 🤔 - Moral, Ethik, Wert
8. **Logic & Reasoning** 🧠 - Schlussfolgerung, Prämisse
9. **Literature & Literary Analysis** 📖 - Roman, Metapher, Stil
10. **Literary Devices & Techniques** ✍️ - Symbol, Ironie, Allegorie
11. **Psychology & Sociology** 🧠 - Verhalten, Gesellschaft
12. **Mental & Cognitive Processes** 💭 - Wahrnehmung, Gedächtnis
13. **Global Issues & Politics** 🌍 - Globalisierung, Migration
14. **International Relations** 🌐 - Außenpolitik, Vertrag
15. **Specialized Professional** 💡 - Fachbegriff, Expertise
16. **Law & Jurisprudence** ⚖️ - Rechtsprechung, Urteil
17. **Regional & Stylistic Variations** 🎨 - Dialekt, Register
18. **Discourse & Rhetoric** 🗣️ - Rhetorik, Diskurs
19. **Nuanced Abstract Ideas** ✨ - Ambivalenz, Paradox
20. **Critical Analysis & Evaluation** 🔍 - Kritik, Reflexion

### C1 (15 Categories) - Advanced

Specialized academic and professional fields:

1. **Specialized Academic Fields** 🎓 - Fachrichtung, Promotion
2. **Complex Abstract Concepts** 💡 - Paradigma, Determinismus
3. **Literary Language & Style** 📖 - Stilmittel, Eloquenz
4. **Advanced Political Science** 🏛️ - Staatsform, Legislative
5. **Advanced Legal Terminology** ⚖️ - Rechtsprechung, Satzung
6. **Medical Science & Healthcare** ⚕️ - Diagnose, Pathologie
7. **Advanced Technology & AI** 🤖 - Algorithmus, KI
8. **Linguistics & Language Science** 🔤 - Phonetik, Syntax
9. **Critical Analysis & Theory** 🔍 - Hermeneutik, Diskursanalyse
10. **Sophisticated Expression** ✨ - Distinktion, Ambiguität
11. **Advanced Economics & Finance** 💹 - Konjunktur, Inflation
12. **Philosophy & Epistemology** 🤔 - Erkenntnistheorie, Ontologie
13. **Cultural Studies & Theory** 🎭 - Kulturwissenschaft, Postmoderne
14. **Historical Methodology** 📜 - Historiographie, Quellenkritik
15. **Environmental Science** 🌿 - Ökologie, Biodiversität

### C2 (15 Categories) - Mastery

Native-level proficiency and expertise:

1. **Idiomatic Expressions & Sayings** 🎭 - Redewendung, Sprichwort
2. **Register & Stylistic Mastery** 🎨 - Stilebene, Sprachregister
3. **Highly Specialized Academic** 🎓 - Terminus technicus
4. **Nuanced Semantic Distinctions** 🔬 - Bedeutungsnuance, Konnotation
5. **Cultural & Historical References** 🌍 - Anspielung, Zitat
6. **Advanced Rhetorical Devices** 🗣️ - Rhetorische Figur, Trope
7. **Professional Jargon & Vernacular** 💼 - Berufsjargon
8. **Archaic & Highly Formal Language** 📜 - Archaismus
9. **Wordplay & Creative Language** 🎪 - Wortspiel, Neologismus
10. **Expert-Level Discourse** 🏆 - Fachdiskurs, Metasprache
11. **Poetic & Literary Devices** ✍️ - Metaphorik, Allegorie
12. **Philosophical Discourse** 💭 - Existenz, Transzendenz
13. **Legal Precision & Formulation** ⚖️ - Tatbestand, Rechtsfolge
14. **Linguistic Theory** 🔤 - Sprachtheorie, Semiotik
15. **Native-Level Mastery** 🌟 - Sprachgefühl, Eloquenz

## 🔄 Version History

### v3.0.0 (2025-11-10) - Major Refactor
- **Split into separate files:** One JSON file per CEFR level
- **Expanded categories:** 62 → 110 total categories
- **Added examples:** Each category now includes example German words
- **Better organization:** 20 categories for A1-B2, 15 for C1-C2
- **Updated utilities:** TypeScript module refactored for split files

### v2.0.0 (2025-11-10)
- Updated to align with syllabusData.ts
- Added German vocabulary examples to descriptions
- Total: 62 categories

### v1.0.0 (2025-11-10)
- Initial version
- 60 categories (10 per level)

## 🎓 Pedagogical Notes

### Category Selection Strategy

**A1-A2 (Beginner/Elementary):**
- 20 categories each for comprehensive coverage
- Focus on concrete, everyday vocabulary
- Clear, specific topics (food, family, colors, etc.)

**B1-B2 (Intermediate/Upper Intermediate):**
- 20 categories each for depth
- Transition to abstract concepts
- Professional and academic vocabulary introduced

**C1-C2 (Advanced/Mastery):**
- 15 categories each (more specialized)
- Highly specialized and nuanced vocabulary
- Native-level sophistication

### Using Categories for Teaching

1. **Sequenced Learning:** Follow priority order within each level
2. **Thematic Units:** Build lessons around 2-3 related categories
3. **Spiral Curriculum:** Revisit categories at higher levels with advanced vocabulary
4. **Assessment:** Test by category to track mastery

## 📝 Maintenance

When adding new categories:

1. Edit the appropriate level file in `categories/`
2. Assign a unique `id` (kebab-case)
3. Choose an appropriate emoji `icon`
4. Set `priority` (higher number = lower priority)
5. Include `examples` array with 5-6 German words
6. Update this README if adding new levels or major changes

---

**Total Categories:** 110 (20+20+20+20+15+15)
**Last Updated:** 2025-11-10
**Version:** 3.0.0
**Aligned with:** syllabusData.ts
