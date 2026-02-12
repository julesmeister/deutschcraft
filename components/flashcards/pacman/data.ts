export interface VerbEntry {
  root: string;
  prefix: string;
  meaning: string;
  full: string;
}

export interface FloatingPrefix {
  id: string;
  prefix: string;
  lane: number;
  x: number;
  speed: number;
  isCorrect: boolean;
}

export interface GameStats {
  score: number;
  correct: number;
  incorrect: number;
  streak: number;
  maxStreak: number;
}

export const PREFIXES = [
  "ab-", "an-", "auf-", "aus-", "be-", "bei-", "dar-", "durch-", "ein-",
  "ent-", "er-", "fest-", "ge-", "her-", "hin-", "mit-", "nach-", "über-", "um-", "unter-",
  "ver-", "vor-", "weg-", "zu-", "zurück-"
];

export const LANE_COUNT = 5;
export const PACMAN_X = 8;
export const PREFIX_SPAWN_X = 105;
export const BASE_SPEED = 0.15;
export const SPEED_INCREMENT = 0.008;
export const MAX_PREFIXES = 6;

const PREFIX_COLORS = [
  'from-green-500 to-emerald-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-violet-500',
  'from-pink-500 to-rose-500',
  'from-orange-500 to-amber-500',
  'from-teal-500 to-green-500',
  'from-indigo-500 to-blue-500',
  'from-red-500 to-pink-500',
  'from-yellow-500 to-orange-500',
  'from-cyan-500 to-teal-500',
];

export function getPrefixColor(prefix: string): string {
  let hash = 0;
  for (let i = 0; i < prefix.length; i++) {
    hash = prefix.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PREFIX_COLORS[Math.abs(hash) % PREFIX_COLORS.length];
}

export const VERB_DATA: VerbEntry[] = [
  // schreiben
  { root: "schreiben", prefix: "ab-", meaning: "to copy (writing)", full: "abschreiben" },
  { root: "schreiben", prefix: "an-", meaning: "to write to someone", full: "anschreiben" },
  { root: "schreiben", prefix: "auf-", meaning: "to write down", full: "aufschreiben" },
  { root: "schreiben", prefix: "aus-", meaning: "to write out / finish writing", full: "ausschreiben" },
  { root: "schreiben", prefix: "be-", meaning: "to describe", full: "beschreiben" },
  { root: "schreiben", prefix: "ein-", meaning: "to register / enroll", full: "einschreiben" },
  { root: "schreiben", prefix: "um-", meaning: "to rewrite", full: "umschreiben" },
  { root: "schreiben", prefix: "unter-", meaning: "to sign", full: "unterschreiben" },
  { root: "schreiben", prefix: "vor-", meaning: "to prescribe", full: "vorschreiben" },
  { root: "schreiben", prefix: "zu-", meaning: "to attribute to", full: "zuschreiben" },

  // nehmen
  { root: "nehmen", prefix: "ab-", meaning: "to lose weight / decrease", full: "abnehmen" },
  { root: "nehmen", prefix: "an-", meaning: "to accept / assume", full: "annehmen" },
  { root: "nehmen", prefix: "auf-", meaning: "to record / pick up", full: "aufnehmen" },
  { root: "nehmen", prefix: "aus-", meaning: "to take out / except", full: "ausnehmen" },
  { root: "nehmen", prefix: "ein-", meaning: "to take in / occupy", full: "einnehmen" },
  { root: "nehmen", prefix: "ent-", meaning: "to take from / gather", full: "entnehmen" },
  { root: "nehmen", prefix: "mit-", meaning: "to take along", full: "mitnehmen" },
  { root: "nehmen", prefix: "über-", meaning: "to take over", full: "übernehmen" },
  { root: "nehmen", prefix: "vor-", meaning: "to intend / plan", full: "vornehmen" },
  { root: "nehmen", prefix: "zu-", meaning: "to gain weight / increase", full: "zunehmen" },

  // kommen
  { root: "kommen", prefix: "an-", meaning: "to arrive", full: "ankommen" },
  { root: "kommen", prefix: "auf-", meaning: "to come up / arise", full: "aufkommen" },
  { root: "kommen", prefix: "aus-", meaning: "to come from / get by", full: "auskommen" },
  { root: "kommen", prefix: "be-", meaning: "to receive / get", full: "bekommen" },
  { root: "kommen", prefix: "ein-", meaning: "to come in / arrive", full: "einkommen" },
  { root: "kommen", prefix: "ent-", meaning: "to escape", full: "entkommen" },
  { root: "kommen", prefix: "mit-", meaning: "to come along", full: "mitkommen" },
  { root: "kommen", prefix: "nach-", meaning: "to follow / come after", full: "nachkommen" },
  { root: "kommen", prefix: "um-", meaning: "to die / perish", full: "umkommen" },
  { root: "kommen", prefix: "vor-", meaning: "to occur / happen", full: "vorkommen" },
  { root: "kommen", prefix: "zu-", meaning: "to approach / come to", full: "zukommen" },
  { root: "kommen", prefix: "zurück-", meaning: "to come back", full: "zurückkommen" },

  // gehen
  { root: "gehen", prefix: "ab-", meaning: "to leave / depart", full: "abgehen" },
  { root: "gehen", prefix: "an-", meaning: "to approach / concern", full: "angehen" },
  { root: "gehen", prefix: "auf-", meaning: "to open / rise (sun)", full: "aufgehen" },
  { root: "gehen", prefix: "aus-", meaning: "to go out", full: "ausgehen" },
  { root: "gehen", prefix: "ein-", meaning: "to enter / shrink", full: "eingehen" },
  { root: "gehen", prefix: "ent-", meaning: "to escape / elude", full: "entgehen" },
  { root: "gehen", prefix: "mit-", meaning: "to go along", full: "mitgehen" },
  { root: "gehen", prefix: "nach-", meaning: "to follow / investigate", full: "nachgehen" },
  { root: "gehen", prefix: "über-", meaning: "to go over / transition", full: "übergehen" },
  { root: "gehen", prefix: "um-", meaning: "to handle / deal with", full: "umgehen" },
  { root: "gehen", prefix: "unter-", meaning: "to sink / perish", full: "untergehen" },
  { root: "gehen", prefix: "vor-", meaning: "to proceed / go ahead", full: "vorgehen" },
  { root: "gehen", prefix: "weg-", meaning: "to go away", full: "weggehen" },
  { root: "gehen", prefix: "zu-", meaning: "to approach / close", full: "zugehen" },

  // stellen
  { root: "stellen", prefix: "ab-", meaning: "to turn off / put down", full: "abstellen" },
  { root: "stellen", prefix: "an-", meaning: "to turn on / hire", full: "anstellen" },
  { root: "stellen", prefix: "auf-", meaning: "to set up / put up", full: "aufstellen" },
  { root: "stellen", prefix: "aus-", meaning: "to exhibit / display", full: "ausstellen" },
  { root: "stellen", prefix: "be-", meaning: "to order (goods)", full: "bestellen" },
  { root: "stellen", prefix: "dar-", meaning: "to represent / depict", full: "darstellen" },
  { root: "stellen", prefix: "ein-", meaning: "to adjust / hire", full: "einstellen" },
  { root: "stellen", prefix: "her-", meaning: "to produce / manufacture", full: "herstellen" },
  { root: "stellen", prefix: "um-", meaning: "to rearrange / convert", full: "umstellen" },
  { root: "stellen", prefix: "vor-", meaning: "to introduce / present", full: "vorstellen" },
  { root: "stellen", prefix: "zu-", meaning: "to deliver / assign", full: "zustellen" },

  // geben
  { root: "geben", prefix: "ab-", meaning: "to hand in / submit", full: "abgeben" },
  { root: "geben", prefix: "an-", meaning: "to state / indicate", full: "angeben" },
  { root: "geben", prefix: "auf-", meaning: "to give up / assign", full: "aufgeben" },
  { root: "geben", prefix: "aus-", meaning: "to spend / distribute", full: "ausgeben" },
  { root: "geben", prefix: "be-", meaning: "to give / bestow", full: "begeben" },
  { root: "geben", prefix: "ein-", meaning: "to enter (data)", full: "eingeben" },
  { root: "geben", prefix: "er-", meaning: "to result / yield", full: "ergeben" },
  { root: "geben", prefix: "nach-", meaning: "to give in / yield", full: "nachgeben" },
  { root: "geben", prefix: "über-", meaning: "to hand over", full: "übergeben" },
  { root: "geben", prefix: "um-", meaning: "to surround", full: "umgeben" },
  { root: "geben", prefix: "ver-", meaning: "to forgive", full: "vergeben" },
  { root: "geben", prefix: "vor-", meaning: "to pretend", full: "vorgeben" },
  { root: "geben", prefix: "zu-", meaning: "to admit", full: "zugeben" },

  // fallen
  { root: "fallen", prefix: "ab-", meaning: "to drop / slope down", full: "abfallen" },
  { root: "fallen", prefix: "an-", meaning: "to accrue / arise", full: "anfallen" },
  { root: "fallen", prefix: "auf-", meaning: "to be noticeable", full: "auffallen" },
  { root: "fallen", prefix: "aus-", meaning: "to be canceled / fail", full: "ausfallen" },
  { root: "fallen", prefix: "be-", meaning: "to befall", full: "befallen" },
  { root: "fallen", prefix: "ein-", meaning: "to invade / occur to", full: "einfallen" },
  { root: "fallen", prefix: "ent-", meaning: "to be omitted", full: "entfallen" },
  { root: "fallen", prefix: "ge-", meaning: "to please", full: "gefallen" },
  { root: "fallen", prefix: "um-", meaning: "to fall over", full: "umfallen" },
  { root: "fallen", prefix: "ver-", meaning: "to decay / expire", full: "verfallen" },
  { root: "fallen", prefix: "zu-", meaning: "to close (door)", full: "zufallen" },

  // halten
  { root: "halten", prefix: "ab-", meaning: "to hold off / deter", full: "abhalten" },
  { root: "halten", prefix: "an-", meaning: "to stop / persist", full: "anhalten" },
  { root: "halten", prefix: "auf-", meaning: "to stop / delay", full: "aufhalten" },
  { root: "halten", prefix: "aus-", meaning: "to endure / withstand", full: "aushalten" },
  { root: "halten", prefix: "be-", meaning: "to keep / retain", full: "behalten" },
  { root: "halten", prefix: "ein-", meaning: "to keep / comply with", full: "einhalten" },
  { root: "halten", prefix: "ent-", meaning: "to contain", full: "enthalten" },
  { root: "halten", prefix: "er-", meaning: "to receive / obtain", full: "erhalten" },
  { root: "halten", prefix: "fest-", meaning: "to hold tight / capture", full: "festhalten" },
  { root: "halten", prefix: "unter-", meaning: "to maintain / support", full: "unterhalten" },
  { root: "halten", prefix: "ver-", meaning: "to behave", full: "verhalten" },
  { root: "halten", prefix: "vor-", meaning: "to reproach", full: "vorhalten" },
  { root: "halten", prefix: "zu-", meaning: "to keep closed", full: "zuhalten" },

  // machen
  { root: "machen", prefix: "ab-", meaning: "to agree / arrange", full: "abmachen" },
  { root: "machen", prefix: "an-", meaning: "to turn on / light", full: "anmachen" },
  { root: "machen", prefix: "auf-", meaning: "to open", full: "aufmachen" },
  { root: "machen", prefix: "aus-", meaning: "to turn off / matter", full: "ausmachen" },
  { root: "machen", prefix: "mit-", meaning: "to participate", full: "mitmachen" },
  { root: "machen", prefix: "nach-", meaning: "to imitate", full: "nachmachen" },
  { root: "machen", prefix: "um-", meaning: "to redo / alter", full: "ummachen" },
  { root: "machen", prefix: "vor-", meaning: "to demonstrate", full: "vormachen" },
  { root: "machen", prefix: "weg-", meaning: "to remove", full: "wegmachen" },
  { root: "machen", prefix: "zu-", meaning: "to close", full: "zumachen" },

  // legen
  { root: "legen", prefix: "ab-", meaning: "to put down / take off", full: "ablegen" },
  { root: "legen", prefix: "an-", meaning: "to put on / invest", full: "anlegen" },
  { root: "legen", prefix: "auf-", meaning: "to hang up / impose", full: "auflegen" },
  { root: "legen", prefix: "aus-", meaning: "to lay out / interpret", full: "auslegen" },
  { root: "legen", prefix: "bei-", meaning: "to enclose / add", full: "beilegen" },
  { root: "legen", prefix: "ein-", meaning: "to insert / pickle", full: "einlegen" },
  { root: "legen", prefix: "er-", meaning: "to settle / handle", full: "erledigen" },
  { root: "legen", prefix: "fest-", meaning: "to determine / fix", full: "festlegen" },
  { root: "legen", prefix: "hin-", meaning: "to lay down", full: "hinlegen" },
  { root: "legen", prefix: "nach-", meaning: "to add more", full: "nachlegen" },
  { root: "legen", prefix: "über-", meaning: "to consider", full: "überlegen" },
  { root: "legen", prefix: "um-", meaning: "to reroute / transfer", full: "umlegen" },
  { root: "legen", prefix: "unter-", meaning: "to underlay", full: "unterlegen" },
  { root: "legen", prefix: "ver-", meaning: "to misplace", full: "verlegen" },
  { root: "legen", prefix: "vor-", meaning: "to present / submit", full: "vorlegen" },
  { root: "legen", prefix: "zu-", meaning: "to gain / add", full: "zulegen" },
];
