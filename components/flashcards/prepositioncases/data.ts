export interface PrepositionEntry {
  german: string;
  english: string;
  case: 'Akkusativ' | 'Dativ' | 'Both' | 'Genitiv';
  example: string;
}

export interface FloatingCase {
  id: string;
  caseLabel: string;
  lane: number;
  x: number;
  speed: number;
  isCorrect: boolean;
}

// Re-export GameStats from shared (same shape)
export type { GameStats } from '../shared/types';

export const CASES = ['Akkusativ', 'Dativ', 'Both', 'Genitiv'] as const;

export const PREPOSITION_DATA: PrepositionEntry[] = [
  // Akkusativ
  { german: 'für', english: 'for', case: 'Akkusativ', example: 'Das Geschenk ist für dich.' },
  { german: 'um', english: 'around, at (time)', case: 'Akkusativ', example: 'Wir gehen um den Park.' },
  { german: 'durch', english: 'through', case: 'Akkusativ', example: 'Wir laufen durch den Wald.' },
  { german: 'gegen', english: 'against', case: 'Akkusativ', example: 'Er ist gegen den Plan.' },
  { german: 'entlang', english: 'along', case: 'Akkusativ', example: 'Wir gehen den Fluss entlang.' },
  { german: 'bis', english: 'until, by', case: 'Akkusativ', example: 'Ich bleibe bis nächsten Montag.' },
  { german: 'ohne', english: 'without', case: 'Akkusativ', example: 'Ich gehe ohne dich.' },
  { german: 'wider', english: 'against, contrary to', case: 'Akkusativ', example: 'Das ist wider die Natur.' },

  // Dativ
  { german: 'von', english: 'from, of', case: 'Dativ', example: 'Ich komme von der Schule.' },
  { german: 'aus', english: 'out of, from', case: 'Dativ', example: 'Er kommt aus dem Haus.' },
  { german: 'zu', english: 'to', case: 'Dativ', example: 'Ich gehe zu meiner Oma.' },
  { german: 'mit', english: 'with', case: 'Dativ', example: 'Ich fahre mit dem Bus.' },
  { german: 'nach', english: 'after, to (cities/countries)', case: 'Dativ', example: 'Nach dem Essen gehe ich schlafen.' },
  { german: 'bei', english: 'at, near, with', case: 'Dativ', example: 'Ich wohne bei meinen Eltern.' },
  { german: 'seit', english: 'since, for (time)', case: 'Dativ', example: 'Ich lerne seit einem Jahr Deutsch.' },
  { german: 'außer', english: 'except, besides', case: 'Dativ', example: 'Alle außer mir sind da.' },
  { german: 'gegenüber', english: 'across from, opposite', case: 'Dativ', example: 'Das Café ist gegenüber dem Park.' },

  // Both (Wechselpräpositionen)
  { german: 'an', english: 'at, on', case: 'Both', example: 'Ich gehe ans Fenster. / Ich bin am Fenster.' },
  { german: 'auf', english: 'on, onto', case: 'Both', example: 'Ich lege es auf den Tisch. / Es liegt auf dem Tisch.' },
  { german: 'hinter', english: 'behind', case: 'Both', example: 'Ich gehe hinter das Haus. / Ich bin hinter dem Haus.' },
  { german: 'in', english: 'in, into', case: 'Both', example: 'Ich gehe in die Schule. / Ich bin in der Schule.' },
  { german: 'neben', english: 'next to, beside', case: 'Both', example: 'Ich setze mich neben dich. / Ich sitze neben dir.' },
  { german: 'über', english: 'over, above, about', case: 'Both', example: 'Die Brücke geht über den Fluss. / Die Lampe hängt über dem Tisch.' },
  { german: 'unter', english: 'under, below, among', case: 'Both', example: 'Die Katze geht unter den Tisch. / Die Katze ist unter dem Tisch.' },
  { german: 'vor', english: 'in front of, before, ago', case: 'Both', example: 'Ich stelle mich vor die Tür. / Ich stehe vor der Tür.' },
  { german: 'zwischen', english: 'between', case: 'Both', example: 'Ich gehe zwischen die Bäume. / Ich bin zwischen den Bäumen.' },

  // Genitiv
  { german: 'während', english: 'during', case: 'Genitiv', example: 'Während des Unterrichts bin ich still.' },
  { german: 'wegen', english: 'because of', case: 'Genitiv', example: 'Wegen des Regens bleibe ich zu Hause.' },
  { german: 'trotz', english: 'despite, in spite of', case: 'Genitiv', example: 'Trotz des Wetters gehen wir spazieren.' },
  { german: 'statt', english: 'instead of', case: 'Genitiv', example: 'Statt des Autos nehme ich das Fahrrad.' },
  { german: 'außerhalb', english: 'outside of', case: 'Genitiv', example: 'Außerhalb der Stadt ist es ruhiger.' },
  { german: 'innerhalb', english: 'within, inside of', case: 'Genitiv', example: 'Innerhalb einer Woche muss ich antworten.' },
];

export function getCaseColor(c: string): string {
  switch (c) {
    case 'Akkusativ': return 'from-blue-500 to-blue-600';
    case 'Dativ': return 'from-green-500 to-emerald-500';
    case 'Both': return 'from-purple-500 to-violet-500';
    case 'Genitiv': return 'from-orange-500 to-amber-500';
    default: return 'from-gray-500 to-gray-600';
  }
}

export function getCaseTextColor(c: string): string {
  switch (c) {
    case 'Akkusativ': return 'text-blue-400';
    case 'Dativ': return 'text-green-400';
    case 'Both': return 'text-purple-400';
    case 'Genitiv': return 'text-orange-400';
    default: return 'text-gray-400';
  }
}

export function getCaseBgColor(c: string): string {
  switch (c) {
    case 'Akkusativ': return 'bg-blue-500/20';
    case 'Dativ': return 'bg-green-500/20';
    case 'Both': return 'bg-purple-500/20';
    case 'Genitiv': return 'bg-orange-500/20';
    default: return 'bg-gray-500/20';
  }
}

// Game constants
export const LANE_COUNT = 4;
export const PACMAN_X = 8;
export const CASE_SPAWN_X = 105;
export const BASE_SPEED = 0.15;
export const SPEED_INCREMENT = 0.008;
export const MAX_CASES = 4;
