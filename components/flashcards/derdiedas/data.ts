export interface EndingEntry {
  ending: string;
  article: 'der' | 'die' | 'das';
  examples: string[];
  rule?: string;
}

export interface FloatingArticle {
  id: string;
  article: string;
  lane: number;
  x: number;
  speed: number;
  isCorrect: boolean;
}

// Re-export GameStats from pacman (same shape)
export type { GameStats } from '../pacman/data';

export const ARTICLES = ['der', 'die', 'das'] as const;

export const ENDING_DATA: EndingEntry[] = [
  // der (masculine)
  { ending: "-er", article: "der", examples: ["der Lehrer", "der Computer", "der Finger"], rule: "Male persons & many agents" },
  { ending: "-ling", article: "der", examples: ["der Frühling", "der Lehrling", "der Schmetterling"], rule: "Diminutive/young forms" },
  { ending: "-ig", article: "der", examples: ["der Honig", "der König", "der Essig"], rule: "Nouns ending in -ig" },
  { ending: "-ich", article: "der", examples: ["der Teppich", "der Rettich", "der Kranich"], rule: "Nouns ending in -ich" },
  { ending: "-ismus", article: "der", examples: ["der Tourismus", "der Realismus", "der Optimismus"], rule: "Latin/Greek -ism words" },
  { ending: "-ist", article: "der", examples: ["der Tourist", "der Pianist", "der Optimist"], rule: "Male persons with -ist" },
  { ending: "-ant", article: "der", examples: ["der Elefant", "der Praktikant", "der Lieferant"], rule: "Latin -ant endings" },
  { ending: "-or", article: "der", examples: ["der Motor", "der Autor", "der Doktor"], rule: "Latin -or endings" },

  // die (feminine)
  { ending: "-ung", article: "die", examples: ["die Zeitung", "die Übung", "die Wohnung"], rule: "Action/process nouns" },
  { ending: "-heit", article: "die", examples: ["die Freiheit", "die Gesundheit", "die Schönheit"], rule: "Abstract quality nouns" },
  { ending: "-keit", article: "die", examples: ["die Möglichkeit", "die Schwierigkeit", "die Einsamkeit"], rule: "Abstract quality nouns" },
  { ending: "-schaft", article: "die", examples: ["die Freundschaft", "die Wissenschaft", "die Gesellschaft"], rule: "Collective/state nouns" },
  { ending: "-tion", article: "die", examples: ["die Nation", "die Situation", "die Information"], rule: "Latin -tion endings" },
  { ending: "-ie", article: "die", examples: ["die Energie", "die Fantasie", "die Demokratie"], rule: "Greek/Latin -ie endings" },
  { ending: "-ei", article: "die", examples: ["die Bäckerei", "die Polizei", "die Türkei"], rule: "Place/activity nouns" },
  { ending: "-ität", article: "die", examples: ["die Universität", "die Qualität", "die Realität"], rule: "Latin -ity endings" },
  { ending: "-ur", article: "die", examples: ["die Natur", "die Kultur", "die Frisur"], rule: "Latin -ure endings" },
  { ending: "-ik", article: "die", examples: ["die Musik", "die Politik", "die Grammatik"], rule: "Greek -ic endings" },

  // das (neuter)
  { ending: "-ment", article: "das", examples: ["das Instrument", "das Dokument", "das Experiment"], rule: "Latin -ment endings" },
  { ending: "-chen", article: "das", examples: ["das Mädchen", "das Brötchen", "das Häuschen"], rule: "Diminutive suffix" },
  { ending: "-lein", article: "das", examples: ["das Büchlein", "das Fräulein", "das Vöglein"], rule: "Diminutive suffix" },
  { ending: "-um", article: "das", examples: ["das Museum", "das Studium", "das Zentrum"], rule: "Latin -um endings" },
  { ending: "-nis", article: "das", examples: ["das Ergebnis", "das Geheimnis", "das Erlebnis"], rule: "Result/state nouns" },
  { ending: "-tum", article: "das", examples: ["das Eigentum", "das Wachstum", "das Altertum"], rule: "Collective/abstract nouns" },
  { ending: "-ma", article: "das", examples: ["das Thema", "das Drama", "das Klima"], rule: "Greek -ma endings" },
];

export function getArticleColor(article: string): string {
  switch (article) {
    case 'der': return 'from-blue-500 to-blue-600';
    case 'die': return 'from-pink-500 to-rose-500';
    case 'das': return 'from-green-500 to-emerald-500';
    default: return 'from-gray-500 to-gray-600';
  }
}

export function getArticleTextColor(article: string): string {
  switch (article) {
    case 'der': return 'text-blue-400';
    case 'die': return 'text-pink-400';
    case 'das': return 'text-green-400';
    default: return 'text-gray-400';
  }
}

export function getArticleBgColor(article: string): string {
  switch (article) {
    case 'der': return 'bg-blue-500/20';
    case 'die': return 'bg-pink-500/20';
    case 'das': return 'bg-green-500/20';
    default: return 'bg-gray-500/20';
  }
}

// Game constants — reuse same values as Pacman
export const LANE_COUNT = 3; // Only 3 lanes for 3 articles
export const PACMAN_X = 8;
export const ARTICLE_SPAWN_X = 105;
export const BASE_SPEED = 0.15;
export const SPEED_INCREMENT = 0.008;
export const MAX_ARTICLES = 4;
