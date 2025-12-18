#!/usr/bin/env tsx

/**
 * Fill Grammar Sentences
 *
 * This script fills in [TODO] placeholders with real German grammar sentences
 * for each CEFR level.
 *
 * Usage:
 *   npx tsx scripts/fill-grammar-sentences.ts a2
 *   npx tsx scripts/fill-grammar-sentences.ts b1
 */

import fs from 'fs';
import path from 'path';

const LEVELS_DIR = path.join(process.cwd(), 'lib', 'data', 'grammar', 'levels');
const SENTENCES_DIR = path.join(process.cwd(), 'lib', 'data', 'grammar', 'sentences');

interface GrammarRule {
  id: string;
  title: string;
  category: string;
  description: string;
  examples: string[];
  notes: string;
}

interface GrammarSentence {
  sentenceId: string;
  ruleId: string;
  english: string;
  german: string;
  hints?: string[];
  keywords?: string[];
  difficulty?: number;
}

// ==================== A1 SENTENCES ====================

// A1 Definite Articles (der, die, das)
const a1ArticlesDefinite: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The man is here", german: "Der Mann ist hier", hints: ["der = masculine definite article"], keywords: ["der", "Mann"], difficulty: 1 },
  { english: "The woman is nice", german: "Die Frau ist nett", hints: ["die = feminine definite article"], keywords: ["die", "Frau"], difficulty: 1 },
  { english: "The child plays", german: "Das Kind spielt", hints: ["das = neuter definite article"], keywords: ["das", "Kind"], difficulty: 1 },
  { english: "The book is good", german: "Das Buch ist gut", hints: ["das Buch = neuter"], keywords: ["das", "Buch"], difficulty: 1 },
  { english: "The house is big", german: "Das Haus ist groß", hints: ["das Haus = neuter"], keywords: ["das", "Haus"], difficulty: 2 },
  { english: "The teacher is here", german: "Der Lehrer ist hier", hints: ["der Lehrer = masculine"], keywords: ["der", "Lehrer"], difficulty: 2 },
  { english: "The school is new", german: "Die Schule ist neu", hints: ["die Schule = feminine"], keywords: ["die", "Schule"], difficulty: 2 },
  { english: "The car is fast", german: "Das Auto ist schnell", hints: ["das Auto = neuter"], keywords: ["das", "Auto"], difficulty: 2 },
  { english: "The dog is small", german: "Der Hund ist klein", hints: ["der Hund = masculine"], keywords: ["der", "Hund"], difficulty: 2 },
  { english: "The cat is black", german: "Die Katze ist schwarz", hints: ["die Katze = feminine"], keywords: ["die", "Katze"], difficulty: 2 },
  { english: "The door is open", german: "Die Tür ist offen", hints: ["die Tür = feminine"], keywords: ["die", "Tür"], difficulty: 2 },
  { english: "The table is brown", german: "Der Tisch ist braun", hints: ["der Tisch = masculine"], keywords: ["der", "Tisch"], difficulty: 2 },
  { english: "The window is closed", german: "Das Fenster ist geschlossen", hints: ["das Fenster = neuter"], keywords: ["das", "Fenster"], difficulty: 3 },
  { english: "The chair is comfortable", german: "Der Stuhl ist bequem", hints: ["der Stuhl = masculine"], keywords: ["der", "Stuhl"], difficulty: 3 },
  { english: "The lamp is bright", german: "Die Lampe ist hell", hints: ["die Lampe = feminine"], keywords: ["die", "Lampe"], difficulty: 2 },
  { english: "The bed is soft", german: "Das Bett ist weich", hints: ["das Bett = neuter"], keywords: ["das", "Bett"], difficulty: 2 },
  { english: "The father is tall", german: "Der Vater ist groß", hints: ["der Vater = masculine"], keywords: ["der", "Vater"], difficulty: 2 },
  { english: "The mother is kind", german: "Die Mutter ist freundlich", hints: ["die Mutter = feminine"], keywords: ["die", "Mutter"], difficulty: 2 },
  { english: "The girl is young", german: "Das Mädchen ist jung", hints: ["das Mädchen = neuter (all -chen are neuter)"], keywords: ["das", "Mädchen"], difficulty: 2 },
  { english: "The boy is happy", german: "Der Junge ist glücklich", hints: ["der Junge = masculine"], keywords: ["der", "Junge"], difficulty: 2 }
];

// A1 Indefinite Articles (ein, eine)
const a1ArticlesIndefinite: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "A man is here", german: "Ein Mann ist hier", hints: ["ein = masculine/neuter indefinite"], keywords: ["ein", "Mann"], difficulty: 1 },
  { english: "A woman is here", german: "Eine Frau ist hier", hints: ["eine = feminine indefinite"], keywords: ["eine", "Frau"], difficulty: 1 },
  { english: "A child plays", german: "Ein Kind spielt", hints: ["ein = neuter indefinite"], keywords: ["ein", "Kind"], difficulty: 1 },
  { english: "I have a book", german: "Ich habe ein Buch", hints: ["ein Buch = neuter"], keywords: ["ein", "Buch"], difficulty: 2 },
  { english: "She has a cat", german: "Sie hat eine Katze", hints: ["eine Katze = feminine"], keywords: ["eine", "Katze"], difficulty: 2 },
  { english: "He has a dog", german: "Er hat einen Hund", hints: ["einen = masculine accusative"], keywords: ["einen", "Hund"], difficulty: 3 },
  { english: "There is a house", german: "Es gibt ein Haus", hints: ["es gibt = there is"], keywords: ["gibt", "ein"], difficulty: 2 },
  { english: "I need a table", german: "Ich brauche einen Tisch", hints: ["einen = masculine accusative"], keywords: ["einen", "Tisch"], difficulty: 3 },
  { english: "She wants a chair", german: "Sie will einen Stuhl", hints: ["einen Stuhl = masculine accusative"], keywords: ["einen", "Stuhl"], difficulty: 3 },
  { english: "I see a car", german: "Ich sehe ein Auto", hints: ["ein Auto = neuter accusative"], keywords: ["sehe", "Auto"], difficulty: 2 },
  { english: "There is a problem", german: "Es gibt ein Problem", hints: ["ein Problem = neuter"], keywords: ["Problem"], difficulty: 2 },
  { english: "I have a question", german: "Ich habe eine Frage", hints: ["eine Frage = feminine"], keywords: ["Frage"], difficulty: 2 },
  { english: "She reads a book", german: "Sie liest ein Buch", hints: ["ein Buch = neuter"], keywords: ["liest", "Buch"], difficulty: 2 },
  { english: "He buys a computer", german: "Er kauft einen Computer", hints: ["einen Computer = masculine accusative"], keywords: ["kauft", "Computer"], difficulty: 3 },
  { english: "I know a teacher", german: "Ich kenne einen Lehrer", hints: ["einen Lehrer = masculine accusative"], keywords: ["kenne", "Lehrer"], difficulty: 3 },
  { english: "There is a school here", german: "Hier gibt es eine Schule", hints: ["eine Schule = feminine"], keywords: ["Schule"], difficulty: 2 },
  { english: "I need a pen", german: "Ich brauche einen Stift", hints: ["einen Stift = masculine accusative"], keywords: ["Stift"], difficulty: 3 },
  { english: "She has a sister", german: "Sie hat eine Schwester", hints: ["eine Schwester = feminine"], keywords: ["Schwester"], difficulty: 2 },
  { english: "He has a brother", german: "Er hat einen Bruder", hints: ["einen Bruder = masculine accusative"], keywords: ["Bruder"], difficulty: 3 },
  { english: "I want a coffee", german: "Ich möchte einen Kaffee", hints: ["einen Kaffee = masculine accusative"], keywords: ["Kaffee"], difficulty: 3 }
];

// A1 Present Tense - Regular Verbs
const a1PresentTenseRegular: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I learn German", german: "Ich lerne Deutsch", hints: ["lernen → lerne (ich)"], keywords: ["lerne"], difficulty: 1 },
  { english: "You live in Berlin", german: "Du wohnst in Berlin", hints: ["wohnen → wohnst (du)"], keywords: ["wohnst"], difficulty: 2 },
  { english: "She works here", german: "Sie arbeitet hier", hints: ["arbeiten → arbeitet (sie)"], keywords: ["arbeitet"], difficulty: 2 },
  { english: "We play soccer", german: "Wir spielen Fußball", hints: ["spielen → spielen (wir)"], keywords: ["spielen"], difficulty: 2 },
  { english: "They come tomorrow", german: "Sie kommen morgen", hints: ["kommen → kommen (sie)"], keywords: ["kommen"], difficulty: 2 },
  { english: "I make breakfast", german: "Ich mache Frühstück", hints: ["machen → mache (ich)"], keywords: ["mache"], difficulty: 2 },
  { english: "You say nothing", german: "Du sagst nichts", hints: ["sagen → sagst (du)"], keywords: ["sagst"], difficulty: 2 },
  { english: "He asks a question", german: "Er fragt eine Frage", hints: ["fragen → fragt (er)"], keywords: ["fragt"], difficulty: 2 },
  { english: "We listen to music", german: "Wir hören Musik", hints: ["hören → hören (wir)"], keywords: ["hören"], difficulty: 2 },
  { english: "You all dance well", german: "Ihr tanzt gut", hints: ["tanzen → tanzt (ihr)"], keywords: ["tanzt"], difficulty: 2 },
  { english: "I buy bread", german: "Ich kaufe Brot", hints: ["kaufen → kaufe (ich)"], keywords: ["kaufe"], difficulty: 2 },
  { english: "She cooks dinner", german: "Sie kocht Abendessen", hints: ["kochen → kocht (sie)"], keywords: ["kocht"], difficulty: 2 },
  { english: "We travel often", german: "Wir reisen oft", hints: ["reisen → reisen (wir)"], keywords: ["reisen"], difficulty: 2 },
  { english: "They laugh loudly", german: "Sie lachen laut", hints: ["lachen → lachen (sie)"], keywords: ["lachen"], difficulty: 2 },
  { english: "I count to ten", german: "Ich zähle bis zehn", hints: ["zählen → zähle (ich)"], keywords: ["zähle"], difficulty: 3 },
  { english: "You wait here", german: "Du wartest hier", hints: ["warten → wartest (du), -t- inserted"], keywords: ["wartest"], difficulty: 3 },
  { english: "He studies medicine", german: "Er studiert Medizin", hints: ["studieren → studiert (er)"], keywords: ["studiert"], difficulty: 3 },
  { english: "We search for the key", german: "Wir suchen den Schlüssel", hints: ["suchen → suchen (wir)"], keywords: ["suchen"], difficulty: 3 },
  { english: "You all need help", german: "Ihr braucht Hilfe", hints: ["brauchen → braucht (ihr)"], keywords: ["braucht"], difficulty: 2 },
  { english: "I believe you", german: "Ich glaube dir", hints: ["glauben → glaube (ich)"], keywords: ["glaube"], difficulty: 3 }
];

// A1 Present Tense - sein (to be)
const a1PresentTenseSein: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I am tired", german: "Ich bin müde", hints: ["sein → bin (ich)"], keywords: ["bin"], difficulty: 1 },
  { english: "You are nice", german: "Du bist nett", hints: ["sein → bist (du)"], keywords: ["bist"], difficulty: 1 },
  { english: "He is here", german: "Er ist hier", hints: ["sein → ist (er/sie/es)"], keywords: ["ist"], difficulty: 1 },
  { english: "She is a teacher", german: "Sie ist Lehrerin", hints: ["ist + profession (no article)"], keywords: ["ist", "Lehrerin"], difficulty: 2 },
  { english: "It is cold", german: "Es ist kalt", hints: ["ist for weather"], keywords: ["ist", "kalt"], difficulty: 2 },
  { english: "We are students", german: "Wir sind Studenten", hints: ["sein → sind (wir/sie)"], keywords: ["sind"], difficulty: 2 },
  { english: "You all are late", german: "Ihr seid spät", hints: ["sein → seid (ihr)"], keywords: ["seid"], difficulty: 2 },
  { english: "They are happy", german: "Sie sind glücklich", hints: ["sein → sind (sie)"], keywords: ["sind"], difficulty: 2 },
  { english: "I am from Germany", german: "Ich bin aus Deutschland", hints: ["bin aus = am from"], keywords: ["bin", "aus"], difficulty: 2 },
  { english: "You are very kind", german: "Du bist sehr freundlich", hints: ["sehr = very"], keywords: ["bist", "sehr"], difficulty: 2 },
  { english: "The weather is nice", german: "Das Wetter ist schön", hints: ["ist schön"], keywords: ["Wetter", "schön"], difficulty: 2 },
  { english: "We are at home", german: "Wir sind zu Hause", hints: ["zu Hause = at home"], keywords: ["sind", "Hause"], difficulty: 2 },
  { english: "You are right", german: "Du hast recht", hints: ["haben recht = to be right (idiomatic)"], keywords: ["hast", "recht"], difficulty: 4 },
  { english: "The book is interesting", german: "Das Buch ist interessant", hints: ["ist + adjective"], keywords: ["ist", "interessant"], difficulty: 2 },
  { english: "I am hungry", german: "Ich habe Hunger", hints: ["haben Hunger = to be hungry (idiomatic)"], keywords: ["habe", "Hunger"], difficulty: 4 },
  { english: "She is 20 years old", german: "Sie ist 20 Jahre alt", hints: ["ist + number + Jahre alt"], keywords: ["ist", "Jahre", "alt"], difficulty: 3 },
  { english: "We are ready", german: "Wir sind bereit", hints: ["bereit = ready"], keywords: ["sind", "bereit"], difficulty: 2 },
  { english: "They are in the city", german: "Sie sind in der Stadt", hints: ["in der Stadt"], keywords: ["sind", "Stadt"], difficulty: 3 },
  { english: "It is my book", german: "Es ist mein Buch", hints: ["mein = my"], keywords: ["ist", "mein"], difficulty: 2 },
  { english: "You all are German", german: "Ihr seid deutsch", hints: ["Nationalities are not capitalized as adjectives"], keywords: ["seid", "deutsch"], difficulty: 3 }
];

// A1 Present Tense - haben (to have)
const a1PresentTenseHaben: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I have a dog", german: "Ich habe einen Hund", hints: ["haben → habe (ich)"], keywords: ["habe"], difficulty: 2 },
  { english: "You have time", german: "Du hast Zeit", hints: ["haben → hast (du)"], keywords: ["hast"], difficulty: 2 },
  { english: "He has a car", german: "Er hat ein Auto", hints: ["haben → hat (er/sie/es)"], keywords: ["hat"], difficulty: 2 },
  { english: "She has a cat", german: "Sie hat eine Katze", hints: ["hat eine Katze"], keywords: ["hat", "Katze"], difficulty: 2 },
  { english: "We have homework", german: "Wir haben Hausaufgaben", hints: ["haben → haben (wir/sie)"], keywords: ["haben"], difficulty: 2 },
  { english: "You all have a test", german: "Ihr habt einen Test", hints: ["haben → habt (ihr)"], keywords: ["habt"], difficulty: 2 },
  { english: "They have children", german: "Sie haben Kinder", hints: ["haben Kinder"], keywords: ["haben", "Kinder"], difficulty: 2 },
  { english: "I have no money", german: "Ich habe kein Geld", hints: ["kein = no/not a"], keywords: ["habe", "kein"], difficulty: 3 },
  { english: "You have a question", german: "Du hast eine Frage", hints: ["eine Frage"], keywords: ["hast", "Frage"], difficulty: 2 },
  { english: "She has two brothers", german: "Sie hat zwei Brüder", hints: ["zwei = two"], keywords: ["hat", "zwei"], difficulty: 2 },
  { english: "We have a problem", german: "Wir haben ein Problem", hints: ["ein Problem"], keywords: ["haben", "Problem"], difficulty: 2 },
  { english: "I have hunger", german: "Ich habe Hunger", hints: ["haben Hunger = to be hungry"], keywords: ["habe", "Hunger"], difficulty: 2 },
  { english: "You have luck", german: "Du hast Glück", hints: ["haben Glück = to be lucky"], keywords: ["hast", "Glück"], difficulty: 3 },
  { english: "He has thirst", german: "Er hat Durst", hints: ["haben Durst = to be thirsty"], keywords: ["hat", "Durst"], difficulty: 2 },
  { english: "She has fear", german: "Sie hat Angst", hints: ["haben Angst = to be afraid"], keywords: ["hat", "Angst"], difficulty: 3 },
  { english: "We have an idea", german: "Wir haben eine Idee", hints: ["eine Idee"], keywords: ["haben", "Idee"], difficulty: 2 },
  { english: "You all have a plan", german: "Ihr habt einen Plan", hints: ["einen Plan"], keywords: ["habt", "Plan"], difficulty: 2 },
  { english: "They have no time", german: "Sie haben keine Zeit", hints: ["keine Zeit = no time"], keywords: ["haben", "keine"], difficulty: 3 },
  { english: "I have right", german: "Ich habe recht", hints: ["haben recht = to be right"], keywords: ["habe", "recht"], difficulty: 3 },
  { english: "You have a cold", german: "Du hast eine Erkältung", hints: ["eine Erkältung = a cold"], keywords: ["hast", "Erkältung"], difficulty: 3 }
];

// A1 Basic Word Order (SVO)
const a1WordOrderBasic: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I drink coffee", german: "Ich trinke Kaffee", hints: ["Subject-Verb-Object"], keywords: ["Ich", "trinke", "Kaffee"], difficulty: 1 },
  { english: "She reads the book", german: "Sie liest das Buch", hints: ["SVO order"], keywords: ["Sie", "liest", "Buch"], difficulty: 2 },
  { english: "We eat pizza", german: "Wir essen Pizza", hints: ["SVO order"], keywords: ["Wir", "essen", "Pizza"], difficulty: 1 },
  { english: "He loves music", german: "Er liebt Musik", hints: ["SVO order"], keywords: ["Er", "liebt", "Musik"], difficulty: 2 },
  { english: "They visit Berlin", german: "Sie besuchen Berlin", hints: ["SVO order"], keywords: ["Sie", "besuchen", "Berlin"], difficulty: 2 },
  { english: "I see the man", german: "Ich sehe den Mann", hints: ["Verb in second position"], keywords: ["sehe", "Mann"], difficulty: 2 },
  { english: "You buy bread", german: "Du kaufst Brot", hints: ["SVO order"], keywords: ["kaufst", "Brot"], difficulty: 1 },
  { english: "She knows the answer", german: "Sie kennt die Antwort", hints: ["SVO order"], keywords: ["kennt", "Antwort"], difficulty: 2 },
  { english: "Today I learn German", german: "Heute lerne ich Deutsch", hints: ["Time first, then verb, then subject (inversion)"], keywords: ["Heute", "lerne", "ich"], difficulty: 3 },
  { english: "Tomorrow we go to school", german: "Morgen gehen wir zur Schule", hints: ["Time first causes inversion"], keywords: ["Morgen", "gehen", "wir"], difficulty: 3 },
  { english: "In Berlin lives my sister", german: "In Berlin wohnt meine Schwester", hints: ["Place first causes inversion"], keywords: ["Berlin", "wohnt", "meine"], difficulty: 4 },
  { english: "The child plays", german: "Das Kind spielt", hints: ["Simple SV"], keywords: ["Kind", "spielt"], difficulty: 1 },
  { english: "I write a letter", german: "Ich schreibe einen Brief", hints: ["SVO"], keywords: ["schreibe", "Brief"], difficulty: 2 },
  { english: "Now I understand", german: "Jetzt verstehe ich", hints: ["Time word first, inversion"], keywords: ["Jetzt", "verstehe", "ich"], difficulty: 3 },
  { english: "The teacher explains the topic", german: "Der Lehrer erklärt das Thema", hints: ["SVO"], keywords: ["Lehrer", "erklärt", "Thema"], difficulty: 2 },
  { english: "At home I cook", german: "Zu Hause koche ich", hints: ["Place first, inversion"], keywords: ["Hause", "koche", "ich"], difficulty: 3 },
  { english: "She opens the door", german: "Sie öffnet die Tür", hints: ["SVO"], keywords: ["öffnet", "Tür"], difficulty: 2 },
  { english: "We need help", german: "Wir brauchen Hilfe", hints: ["SVO"], keywords: ["brauchen", "Hilfe"], difficulty: 2 },
  { english: "You make a mistake", german: "Du machst einen Fehler", hints: ["SVO"], keywords: ["machst", "Fehler"], difficulty: 2 },
  { english: "Every day I study", german: "Jeden Tag lerne ich", hints: ["Time expression first"], keywords: ["Jeden", "Tag", "lerne"], difficulty: 3 }
];

// A1 Nominative Case
const a1NominativeCase: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The man is tall", german: "Der Mann ist groß", hints: ["der Mann = nominative masculine"], keywords: ["der", "Mann"], difficulty: 1 },
  { english: "The woman is friendly", german: "Die Frau ist freundlich", hints: ["die Frau = nominative feminine"], keywords: ["die", "Frau"], difficulty: 1 },
  { english: "The child is small", german: "Das Kind ist klein", hints: ["das Kind = nominative neuter"], keywords: ["das", "Kind"], difficulty: 1 },
  { english: "A dog barks", german: "Ein Hund bellt", hints: ["ein Hund = nominative"], keywords: ["ein", "Hund"], difficulty: 2 },
  { english: "A cat sleeps", german: "Eine Katze schläft", hints: ["eine Katze = nominative"], keywords: ["eine", "Katze"], difficulty: 2 },
  { english: "My father works", german: "Mein Vater arbeitet", hints: ["mein Vater = nominative"], keywords: ["mein", "Vater"], difficulty: 2 },
  { english: "My mother cooks", german: "Meine Mutter kocht", hints: ["meine Mutter = nominative"], keywords: ["meine", "Mutter"], difficulty: 2 },
  { english: "My book is new", german: "Mein Buch ist neu", hints: ["mein Buch = nominative"], keywords: ["mein", "Buch"], difficulty: 2 },
  { english: "The students are here", german: "Die Studenten sind hier", hints: ["die = nominative plural"], keywords: ["die", "Studenten"], difficulty: 2 },
  { english: "The teacher is strict", german: "Der Lehrer ist streng", hints: ["der Lehrer = nominative"], keywords: ["der", "Lehrer"], difficulty: 2 },
  { english: "My sister is young", german: "Meine Schwester ist jung", hints: ["meine Schwester = nominative"], keywords: ["meine", "Schwester"], difficulty: 2 },
  { english: "The house is big", german: "Das Haus ist groß", hints: ["das Haus = nominative"], keywords: ["das", "Haus"], difficulty: 1 },
  { english: "Your brother is funny", german: "Dein Bruder ist lustig", hints: ["dein Bruder = nominative"], keywords: ["dein", "Bruder"], difficulty: 2 },
  { english: "Her car is red", german: "Ihr Auto ist rot", hints: ["ihr Auto = nominative"], keywords: ["ihr", "Auto"], difficulty: 2 },
  { english: "Our dog is old", german: "Unser Hund ist alt", hints: ["unser Hund = nominative"], keywords: ["unser", "Hund"], difficulty: 2 },
  { english: "Your cat is cute", german: "Deine Katze ist süß", hints: ["deine Katze = nominative"], keywords: ["deine", "Katze"], difficulty: 2 },
  { english: "His friend is nice", german: "Sein Freund ist nett", hints: ["sein Freund = nominative"], keywords: ["sein", "Freund"], difficulty: 2 },
  { english: "Their house is beautiful", german: "Ihr Haus ist schön", hints: ["ihr Haus = nominative"], keywords: ["ihr", "Haus"], difficulty: 2 },
  { english: "The children are loud", german: "Die Kinder sind laut", hints: ["die Kinder = nominative plural"], keywords: ["die", "Kinder"], difficulty: 2 },
  { english: "The table is brown", german: "Der Tisch ist braun", hints: ["der Tisch = nominative"], keywords: ["der", "Tisch"], difficulty: 1 }
];

// A1 Accusative Case
const a1AccusativeCase: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I see the man", german: "Ich sehe den Mann", hints: ["den Mann = accusative masculine"], keywords: ["den", "Mann"], difficulty: 2 },
  { english: "I see the woman", german: "Ich sehe die Frau", hints: ["die Frau = accusative (same as nominative)"], keywords: ["die", "Frau"], difficulty: 2 },
  { english: "I see the child", german: "Ich sehe das Kind", hints: ["das Kind = accusative (same as nominative)"], keywords: ["das", "Kind"], difficulty: 2 },
  { english: "She has a dog", german: "Sie hat einen Hund", hints: ["einen Hund = accusative masculine"], keywords: ["einen", "Hund"], difficulty: 3 },
  { english: "He buys a book", german: "Er kauft ein Buch", hints: ["ein Buch = accusative neuter"], keywords: ["ein", "Buch"], difficulty: 2 },
  { english: "We visit the city", german: "Wir besuchen die Stadt", hints: ["die Stadt = accusative"], keywords: ["die", "Stadt"], difficulty: 2 },
  { english: "I need my book", german: "Ich brauche mein Buch", hints: ["mein Buch = accusative"], keywords: ["mein", "Buch"], difficulty: 2 },
  { english: "She loves her father", german: "Sie liebt ihren Vater", hints: ["ihren Vater = accusative masculine"], keywords: ["ihren", "Vater"], difficulty: 3 },
  { english: "I know the teacher", german: "Ich kenne den Lehrer", hints: ["den Lehrer = accusative"], keywords: ["den", "Lehrer"], difficulty: 3 },
  { english: "We eat the pizza", german: "Wir essen die Pizza", hints: ["die Pizza = accusative"], keywords: ["die", "Pizza"], difficulty: 2 },
  { english: "He drinks a coffee", german: "Er trinkt einen Kaffee", hints: ["einen Kaffee = accusative"], keywords: ["einen", "Kaffee"], difficulty: 3 },
  { english: "I read your letter", german: "Ich lese deinen Brief", hints: ["deinen Brief = accusative"], keywords: ["deinen", "Brief"], difficulty: 3 },
  { english: "She opens the window", german: "Sie öffnet das Fenster", hints: ["das Fenster = accusative"], keywords: ["das", "Fenster"], difficulty: 2 },
  { english: "We hear the music", german: "Wir hören die Musik", hints: ["die Musik = accusative"], keywords: ["die", "Musik"], difficulty: 2 },
  { english: "I take the bus", german: "Ich nehme den Bus", hints: ["den Bus = accusative"], keywords: ["den", "Bus"], difficulty: 3 },
  { english: "He sees his sister", german: "Er sieht seine Schwester", hints: ["seine Schwester = accusative"], keywords: ["seine", "Schwester"], difficulty: 2 },
  { english: "They buy the house", german: "Sie kaufen das Haus", hints: ["das Haus = accusative"], keywords: ["das", "Haus"], difficulty: 2 },
  { english: "I meet my friend", german: "Ich treffe meinen Freund", hints: ["meinen Freund = accusative"], keywords: ["meinen", "Freund"], difficulty: 3 },
  { english: "She makes a cake", german: "Sie macht einen Kuchen", hints: ["einen Kuchen = accusative"], keywords: ["einen", "Kuchen"], difficulty: 3 },
  { english: "We find the key", german: "Wir finden den Schlüssel", hints: ["den Schlüssel = accusative"], keywords: ["den", "Schlüssel"], difficulty: 3 }
];

// A1 Personal Pronouns
const a1PersonalPronouns: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I am here", german: "Ich bin hier", hints: ["ich = I"], keywords: ["ich"], difficulty: 1 },
  { english: "You are nice", german: "Du bist nett", hints: ["du = you (informal singular)"], keywords: ["du"], difficulty: 1 },
  { english: "He is tall", german: "Er ist groß", hints: ["er = he"], keywords: ["er"], difficulty: 1 },
  { english: "She is kind", german: "Sie ist nett", hints: ["sie = she"], keywords: ["sie"], difficulty: 1 },
  { english: "It is cold", german: "Es ist kalt", hints: ["es = it"], keywords: ["es"], difficulty: 1 },
  { english: "We are students", german: "Wir sind Studenten", hints: ["wir = we"], keywords: ["wir"], difficulty: 1 },
  { english: "You all are late", german: "Ihr seid spät", hints: ["ihr = you (informal plural)"], keywords: ["ihr"], difficulty: 2 },
  { english: "They are happy", german: "Sie sind glücklich", hints: ["sie = they"], keywords: ["sie"], difficulty: 1 },
  { english: "I see you", german: "Ich sehe dich", hints: ["dich = you (accusative)"], keywords: ["dich"], difficulty: 3 },
  { english: "He loves her", german: "Er liebt sie", hints: ["sie = her (accusative)"], keywords: ["liebt", "sie"], difficulty: 2 },
  { english: "She knows him", german: "Sie kennt ihn", hints: ["ihn = him (accusative)"], keywords: ["ihn"], difficulty: 3 },
  { english: "We help you", german: "Wir helfen dir", hints: ["dir = you (dative)"], keywords: ["dir"], difficulty: 4 },
  { english: "They visit us", german: "Sie besuchen uns", hints: ["uns = us (accusative)"], keywords: ["uns"], difficulty: 3 },
  { english: "I give him the book", german: "Ich gebe ihm das Buch", hints: ["ihm = him (dative)"], keywords: ["ihm"], difficulty: 4 },
  { english: "She tells me", german: "Sie sagt mir", hints: ["mir = me (dative)"], keywords: ["mir"], difficulty: 4 },
  { english: "You call me", german: "Du rufst mich an", hints: ["mich = me (accusative)"], keywords: ["mich"], difficulty: 3 },
  { english: "It belongs to you", german: "Es gehört dir", hints: ["dir = you (dative)"], keywords: ["gehört", "dir"], difficulty: 4 },
  { english: "We know them", german: "Wir kennen sie", hints: ["sie = them (accusative)"], keywords: ["kennen", "sie"], difficulty: 2 },
  { english: "He asks us", german: "Er fragt uns", hints: ["uns = us (accusative)"], keywords: ["fragt", "uns"], difficulty: 3 },
  { english: "I believe you all", german: "Ich glaube euch", hints: ["euch = you all (dative)"], keywords: ["euch"], difficulty: 4 }
];

// A1 Numbers 1-20
const a1Numbers120: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I have one book", german: "Ich habe ein Buch", hints: ["ein = one"], keywords: ["ein", "Buch"], difficulty: 1 },
  { english: "She has two cats", german: "Sie hat zwei Katzen", hints: ["zwei = two"], keywords: ["zwei", "Katzen"], difficulty: 1 },
  { english: "There are three apples", german: "Es gibt drei Äpfel", hints: ["drei = three"], keywords: ["drei", "Äpfel"], difficulty: 2 },
  { english: "I am four years old", german: "Ich bin vier Jahre alt", hints: ["vier = four"], keywords: ["vier"], difficulty: 2 },
  { english: "Five people are here", german: "Fünf Leute sind hier", hints: ["fünf = five"], keywords: ["fünf"], difficulty: 1 },
  { english: "I have six brothers", german: "Ich habe sechs Brüder", hints: ["sechs = six"], keywords: ["sechs"], difficulty: 2 },
  { english: "Seven days in a week", german: "Sieben Tage in einer Woche", hints: ["sieben = seven"], keywords: ["sieben"], difficulty: 2 },
  { english: "Eight students are absent", german: "Acht Studenten fehlen", hints: ["acht = eight"], keywords: ["acht"], difficulty: 2 },
  { english: "I need nine chairs", german: "Ich brauche neun Stühle", hints: ["neun = nine"], keywords: ["neun"], difficulty: 2 },
  { english: "Ten fingers on hands", german: "Zehn Finger an den Händen", hints: ["zehn = ten"], keywords: ["zehn"], difficulty: 2 },
  { english: "Eleven players in soccer", german: "Elf Spieler im Fußball", hints: ["elf = eleven"], keywords: ["elf"], difficulty: 2 },
  { english: "Twelve months in a year", german: "Zwölf Monate im Jahr", hints: ["zwölf = twelve"], keywords: ["zwölf"], difficulty: 2 },
  { english: "She is thirteen", german: "Sie ist dreizehn", hints: ["dreizehn = thirteen"], keywords: ["dreizehn"], difficulty: 1 },
  { english: "Fourteen days", german: "Vierzehn Tage", hints: ["vierzehn = fourteen"], keywords: ["vierzehn"], difficulty: 1 },
  { english: "I buy fifteen eggs", german: "Ich kaufe fünfzehn Eier", hints: ["fünfzehn = fifteen"], keywords: ["fünfzehn"], difficulty: 2 },
  { english: "Sixteen people came", german: "Sechzehn Leute kamen", hints: ["sechzehn = sixteen"], keywords: ["sechzehn"], difficulty: 2 },
  { english: "He is seventeen", german: "Er ist siebzehn", hints: ["siebzehn = seventeen"], keywords: ["siebzehn"], difficulty: 1 },
  { english: "Eighteen students pass", german: "Achtzehn Studenten bestehen", hints: ["achtzehn = eighteen"], keywords: ["achtzehn"], difficulty: 2 },
  { english: "I wait nineteen minutes", german: "Ich warte neunzehn Minuten", hints: ["neunzehn = nineteen"], keywords: ["neunzehn"], difficulty: 2 },
  { english: "Twenty euros please", german: "Zwanzig Euro bitte", hints: ["zwanzig = twenty"], keywords: ["zwanzig"], difficulty: 2 }
];

// A1 Negation with 'nicht'
const a1NegationNicht: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I am not tired", german: "Ich bin nicht müde", hints: ["nicht after verb"], keywords: ["nicht", "müde"], difficulty: 2 },
  { english: "She does not come", german: "Sie kommt nicht", hints: ["nicht at end"], keywords: ["nicht"], difficulty: 2 },
  { english: "We do not understand", german: "Wir verstehen nicht", hints: ["nicht at end"], keywords: ["nicht"], difficulty: 2 },
  { english: "He is not here", german: "Er ist nicht hier", hints: ["nicht before location"], keywords: ["nicht", "hier"], difficulty: 2 },
  { english: "I do not work today", german: "Ich arbeite heute nicht", hints: ["nicht at end"], keywords: ["nicht"], difficulty: 2 },
  { english: "She does not speak German", german: "Sie spricht nicht Deutsch", hints: ["nicht before object"], keywords: ["nicht", "Deutsch"], difficulty: 3 },
  { english: "It is not cold", german: "Es ist nicht kalt", hints: ["nicht before adjective"], keywords: ["nicht", "kalt"], difficulty: 2 },
  { english: "We are not ready", german: "Wir sind nicht bereit", hints: ["nicht before adjective"], keywords: ["nicht", "bereit"], difficulty: 2 },
  { english: "I do not know", german: "Ich weiß nicht", hints: ["nicht at end"], keywords: ["nicht"], difficulty: 2 },
  { english: "He does not live here", german: "Er wohnt nicht hier", hints: ["nicht before location"], keywords: ["nicht", "hier"], difficulty: 2 },
  { english: "She is not a teacher", german: "Sie ist nicht Lehrerin", hints: ["nicht before noun"], keywords: ["nicht", "Lehrerin"], difficulty: 2 },
  { english: "I do not like that", german: "Ich mag das nicht", hints: ["nicht at end"], keywords: ["nicht"], difficulty: 2 },
  { english: "We do not go there", german: "Wir gehen nicht dahin", hints: ["nicht before direction"], keywords: ["nicht", "dahin"], difficulty: 3 },
  { english: "It does not work", german: "Es funktioniert nicht", hints: ["nicht at end"], keywords: ["nicht"], difficulty: 2 },
  { english: "They are not at home", german: "Sie sind nicht zu Hause", hints: ["nicht before location"], keywords: ["nicht", "Hause"], difficulty: 2 },
  { english: "I do not believe it", german: "Ich glaube es nicht", hints: ["nicht at end"], keywords: ["nicht"], difficulty: 2 },
  { english: "She does not want that", german: "Sie will das nicht", hints: ["nicht at end"], keywords: ["nicht"], difficulty: 2 },
  { english: "It is not my book", german: "Es ist nicht mein Buch", hints: ["nicht before possessive"], keywords: ["nicht", "mein"], difficulty: 2 },
  { english: "We do not need help", german: "Wir brauchen nicht Hilfe", hints: ["nicht before object"], keywords: ["nicht", "Hilfe"], difficulty: 3 },
  { english: "He does not play soccer", german: "Er spielt nicht Fußball", hints: ["nicht before object"], keywords: ["nicht", "Fußball"], difficulty: 2 }
];

// A1 Negation with 'kein'
const a1NegationKein: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I have no time", german: "Ich habe keine Zeit", hints: ["keine = no (feminine)"], keywords: ["keine", "Zeit"], difficulty: 2 },
  { english: "She has no dog", german: "Sie hat keinen Hund", hints: ["keinen = no (masculine accusative)"], keywords: ["keinen", "Hund"], difficulty: 3 },
  { english: "He has no money", german: "Er hat kein Geld", hints: ["kein = no (neuter)"], keywords: ["kein", "Geld"], difficulty: 2 },
  { english: "We have no car", german: "Wir haben kein Auto", hints: ["kein Auto"], keywords: ["kein", "Auto"], difficulty: 2 },
  { english: "There is no problem", german: "Es gibt kein Problem", hints: ["kein Problem"], keywords: ["kein", "Problem"], difficulty: 2 },
  { english: "I see no man", german: "Ich sehe keinen Mann", hints: ["keinen = accusative masculine"], keywords: ["keinen", "Mann"], difficulty: 3 },
  { english: "She needs no help", german: "Sie braucht keine Hilfe", hints: ["keine Hilfe"], keywords: ["keine", "Hilfe"], difficulty: 2 },
  { english: "That is no book", german: "Das ist kein Buch", hints: ["kein Buch"], keywords: ["kein", "Buch"], difficulty: 2 },
  { english: "I have no brother", german: "Ich habe keinen Bruder", hints: ["keinen Bruder"], keywords: ["keinen", "Bruder"], difficulty: 3 },
  { english: "We make no noise", german: "Wir machen keinen Lärm", hints: ["keinen Lärm"], keywords: ["keinen", "Lärm"], difficulty: 3 },
  { english: "He is no teacher", german: "Er ist kein Lehrer", hints: ["kein Lehrer"], keywords: ["kein", "Lehrer"], difficulty: 2 },
  { english: "She has no sister", german: "Sie hat keine Schwester", hints: ["keine Schwester"], keywords: ["keine", "Schwester"], difficulty: 2 },
  { english: "I drink no coffee", german: "Ich trinke keinen Kaffee", hints: ["keinen Kaffee"], keywords: ["keinen", "Kaffee"], difficulty: 3 },
  { english: "There is no water", german: "Es gibt kein Wasser", hints: ["kein Wasser"], keywords: ["kein", "Wasser"], difficulty: 2 },
  { english: "We have no children", german: "Wir haben keine Kinder", hints: ["keine = plural"], keywords: ["keine", "Kinder"], difficulty: 2 },
  { english: "That is no answer", german: "Das ist keine Antwort", hints: ["keine Antwort"], keywords: ["keine", "Antwort"], difficulty: 2 },
  { english: "I have no idea", german: "Ich habe keine Idee", hints: ["keine Idee"], keywords: ["keine", "Idee"], difficulty: 2 },
  { english: "He makes no mistake", german: "Er macht keinen Fehler", hints: ["keinen Fehler"], keywords: ["keinen", "Fehler"], difficulty: 3 },
  { english: "She has no cat", german: "Sie hat keine Katze", hints: ["keine Katze"], keywords: ["keine", "Katze"], difficulty: 2 },
  { english: "I need no pen", german: "Ich brauche keinen Stift", hints: ["keinen Stift"], keywords: ["keinen", "Stift"], difficulty: 3 }
];

// A1 Yes/No Questions
const a1QuestionsYesNo: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Are you tired?", german: "Bist du müde?", hints: ["Verb first in yes/no questions"], keywords: ["Bist"], difficulty: 1 },
  { english: "Do you speak German?", german: "Sprichst du Deutsch?", hints: ["Verb-Subject order"], keywords: ["Sprichst"], difficulty: 2 },
  { english: "Is he here?", german: "Ist er hier?", hints: ["Verb first"], keywords: ["Ist"], difficulty: 1 },
  { english: "Do they come today?", german: "Kommen sie heute?", hints: ["Verb first"], keywords: ["Kommen"], difficulty: 2 },
  { english: "Does she work?", german: "Arbeitet sie?", hints: ["Verb first"], keywords: ["Arbeitet"], difficulty: 2 },
  { english: "Do we have time?", german: "Haben wir Zeit?", hints: ["Verb first"], keywords: ["Haben"], difficulty: 2 },
  { english: "Are you at home?", german: "Bist du zu Hause?", hints: ["Verb first"], keywords: ["Bist"], difficulty: 2 },
  { english: "Does it work?", german: "Funktioniert es?", hints: ["Verb first"], keywords: ["Funktioniert"], difficulty: 2 },
  { english: "Do you understand?", german: "Verstehst du?", hints: ["Verb first"], keywords: ["Verstehst"], difficulty: 2 },
  { english: "Is that correct?", german: "Ist das richtig?", hints: ["Verb first"], keywords: ["Ist"], difficulty: 2 },
  { english: "Do you know that?", german: "Weißt du das?", hints: ["Verb first"], keywords: ["Weißt"], difficulty: 2 },
  { english: "Does he have a car?", german: "Hat er ein Auto?", hints: ["Verb first"], keywords: ["Hat"], difficulty: 2 },
  { english: "Are we late?", german: "Sind wir spät?", hints: ["Verb first"], keywords: ["Sind"], difficulty: 2 },
  { english: "Can you help me?", german: "Kannst du mir helfen?", hints: ["Modal verb first"], keywords: ["Kannst"], difficulty: 3 },
  { english: "Do they live here?", german: "Wohnen sie hier?", hints: ["Verb first"], keywords: ["Wohnen"], difficulty: 2 },
  { english: "Is she a teacher?", german: "Ist sie Lehrerin?", hints: ["Verb first"], keywords: ["Ist"], difficulty: 2 },
  { english: "Do you like coffee?", german: "Magst du Kaffee?", hints: ["Verb first"], keywords: ["Magst"], difficulty: 2 },
  { english: "Does it cost much?", german: "Kostet es viel?", hints: ["Verb first"], keywords: ["Kostet"], difficulty: 2 },
  { english: "Are they students?", german: "Sind sie Studenten?", hints: ["Verb first"], keywords: ["Sind"], difficulty: 2 },
  { english: "Do you need help?", german: "Brauchst du Hilfe?", hints: ["Verb first"], keywords: ["Brauchst"], difficulty: 2 }
];

// A1 W-Questions (Question Words)
const a1QuestionsWQuestions: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "What is that?", german: "Was ist das?", hints: ["was = what"], keywords: ["Was"], difficulty: 1 },
  { english: "Who is he?", german: "Wer ist er?", hints: ["wer = who"], keywords: ["Wer"], difficulty: 1 },
  { english: "Where do you live?", german: "Wo wohnst du?", hints: ["wo = where"], keywords: ["Wo"], difficulty: 2 },
  { english: "When do you come?", german: "Wann kommst du?", hints: ["wann = when"], keywords: ["Wann"], difficulty: 2 },
  { english: "Why are you late?", german: "Warum bist du spät?", hints: ["warum = why"], keywords: ["Warum"], difficulty: 2 },
  { english: "How are you?", german: "Wie geht es dir?", hints: ["wie = how"], keywords: ["Wie"], difficulty: 2 },
  { english: "How much does it cost?", german: "Wie viel kostet es?", hints: ["wie viel = how much"], keywords: ["viel"], difficulty: 2 },
  { english: "Where from are you?", german: "Woher kommst du?", hints: ["woher = from where"], keywords: ["Woher"], difficulty: 2 },
  { english: "Where to are you going?", german: "Wohin gehst du?", hints: ["wohin = to where"], keywords: ["Wohin"], difficulty: 3 },
  { english: "Which book do you want?", german: "Welches Buch willst du?", hints: ["welches = which (neuter)"], keywords: ["Welches"], difficulty: 3 },
  { english: "Whose car is that?", german: "Wessen Auto ist das?", hints: ["wessen = whose"], keywords: ["Wessen"], difficulty: 3 },
  { english: "How many children do you have?", german: "Wie viele Kinder hast du?", hints: ["wie viele = how many"], keywords: ["viele"], difficulty: 3 },
  { english: "What time is it?", german: "Wie spät ist es?", hints: ["wie spät = what time"], keywords: ["spät"], difficulty: 2 },
  { english: "Who is calling?", german: "Wer ruft an?", hints: ["wer ruft an"], keywords: ["Wer", "ruft"], difficulty: 2 },
  { english: "What do you do?", german: "Was machst du?", hints: ["was machst du"], keywords: ["Was", "machst"], difficulty: 2 },
  { english: "Where is the station?", german: "Wo ist der Bahnhof?", hints: ["wo ist"], keywords: ["Wo", "Bahnhof"], difficulty: 2 },
  { english: "When does the train leave?", german: "Wann fährt der Zug?", hints: ["wann fährt"], keywords: ["Wann", "fährt"], difficulty: 2 },
  { english: "Why do you ask?", german: "Warum fragst du?", hints: ["warum fragst du"], keywords: ["Warum", "fragst"], difficulty: 2 },
  { english: "How old are you?", german: "Wie alt bist du?", hints: ["wie alt"], keywords: ["alt"], difficulty: 2 },
  { english: "Which one do you want?", german: "Welchen willst du?", hints: ["welchen = which (accusative masculine)"], keywords: ["Welchen"], difficulty: 3 }
];

// A1 Plural Formation
const a1PluralFormation: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The books are new", german: "Die Bücher sind neu", hints: ["Buch → Bücher"], keywords: ["Bücher"], difficulty: 2 },
  { english: "The children play", german: "Die Kinder spielen", hints: ["Kind → Kinder"], keywords: ["Kinder"], difficulty: 2 },
  { english: "The houses are big", german: "Die Häuser sind groß", hints: ["Haus → Häuser"], keywords: ["Häuser"], difficulty: 2 },
  { english: "The students learn", german: "Die Studenten lernen", hints: ["Student → Studenten"], keywords: ["Studenten"], difficulty: 2 },
  { english: "The women are here", german: "Die Frauen sind hier", hints: ["Frau → Frauen"], keywords: ["Frauen"], difficulty: 2 },
  { english: "The men work", german: "Die Männer arbeiten", hints: ["Mann → Männer"], keywords: ["Männer"], difficulty: 2 },
  { english: "The cars are fast", german: "Die Autos sind schnell", hints: ["Auto → Autos"], keywords: ["Autos"], difficulty: 2 },
  { english: "The cats sleep", german: "Die Katzen schlafen", hints: ["Katze → Katzen"], keywords: ["Katzen"], difficulty: 2 },
  { english: "The dogs bark", german: "Die Hunde bellen", hints: ["Hund → Hunde"], keywords: ["Hunde"], difficulty: 2 },
  { english: "The teachers are strict", german: "Die Lehrer sind streng", hints: ["Lehrer → Lehrer (no change)"], keywords: ["Lehrer"], difficulty: 2 },
  { english: "The windows are open", german: "Die Fenster sind offen", hints: ["Fenster → Fenster (no change)"], keywords: ["Fenster"], difficulty: 2 },
  { english: "The girls are nice", german: "Die Mädchen sind nett", hints: ["Mädchen → Mädchen (no change)"], keywords: ["Mädchen"], difficulty: 2 },
  { english: "The mothers cook", german: "Die Mütter kochen", hints: ["Mutter → Mütter"], keywords: ["Mütter"], difficulty: 2 },
  { english: "The fathers work", german: "Die Väter arbeiten", hints: ["Vater → Väter"], keywords: ["Väter"], difficulty: 2 },
  { english: "The chairs are comfortable", german: "Die Stühle sind bequem", hints: ["Stuhl → Stühle"], keywords: ["Stühle"], difficulty: 2 },
  { english: "The schools are new", german: "Die Schulen sind neu", hints: ["Schule → Schulen"], keywords: ["Schulen"], difficulty: 2 },
  { english: "The brothers are tall", german: "Die Brüder sind groß", hints: ["Bruder → Brüder"], keywords: ["Brüder"], difficulty: 2 },
  { english: "The sisters are young", german: "Die Schwestern sind jung", hints: ["Schwester → Schwestern"], keywords: ["Schwestern"], difficulty: 2 },
  { english: "The friends are funny", german: "Die Freunde sind lustig", hints: ["Freund → Freunde"], keywords: ["Freunde"], difficulty: 2 },
  { english: "The tables are brown", german: "Die Tische sind braun", hints: ["Tisch → Tische"], keywords: ["Tische"], difficulty: 2 }
];

// A1 Basic Adjectives (Predicative)
const a1AdjectivesBasic: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The book is good", german: "Das Buch ist gut", hints: ["Predicative adjective (no ending)"], keywords: ["gut"], difficulty: 1 },
  { english: "The house is big", german: "Das Haus ist groß", hints: ["groß = big/large"], keywords: ["groß"], difficulty: 1 },
  { english: "The car is fast", german: "Das Auto ist schnell", hints: ["schnell = fast"], keywords: ["schnell"], difficulty: 1 },
  { english: "She is beautiful", german: "Sie ist schön", hints: ["schön = beautiful"], keywords: ["schön"], difficulty: 1 },
  { english: "He is young", german: "Er ist jung", hints: ["jung = young"], keywords: ["jung"], difficulty: 1 },
  { english: "The coffee is hot", german: "Der Kaffee ist heiß", hints: ["heiß = hot"], keywords: ["heiß"], difficulty: 2 },
  { english: "The water is cold", german: "Das Wasser ist kalt", hints: ["kalt = cold"], keywords: ["kalt"], difficulty: 1 },
  { english: "The teacher is friendly", german: "Der Lehrer ist freundlich", hints: ["freundlich = friendly"], keywords: ["freundlich"], difficulty: 2 },
  { english: "The test is difficult", german: "Der Test ist schwer", hints: ["schwer = difficult/heavy"], keywords: ["schwer"], difficulty: 2 },
  { english: "The homework is easy", german: "Die Hausaufgabe ist leicht", hints: ["leicht = easy/light"], keywords: ["leicht"], difficulty: 2 },
  { english: "The door is open", german: "Die Tür ist offen", hints: ["offen = open"], keywords: ["offen"], difficulty: 2 },
  { english: "The window is closed", german: "Das Fenster ist geschlossen", hints: ["geschlossen = closed"], keywords: ["geschlossen"], difficulty: 2 },
  { english: "The child is happy", german: "Das Kind ist glücklich", hints: ["glücklich = happy"], keywords: ["glücklich"], difficulty: 2 },
  { english: "The dog is small", german: "Der Hund ist klein", hints: ["klein = small"], keywords: ["klein"], difficulty: 1 },
  { english: "The cat is quiet", german: "Die Katze ist ruhig", hints: ["ruhig = quiet/calm"], keywords: ["ruhig"], difficulty: 2 },
  { english: "The room is clean", german: "Das Zimmer ist sauber", hints: ["sauber = clean"], keywords: ["sauber"], difficulty: 2 },
  { english: "The street is dirty", german: "Die Straße ist schmutzig", hints: ["schmutzig = dirty"], keywords: ["schmutzig"], difficulty: 2 },
  { english: "The lamp is bright", german: "Die Lampe ist hell", hints: ["hell = bright"], keywords: ["hell"], difficulty: 2 },
  { english: "The night is dark", german: "Die Nacht ist dunkel", hints: ["dunkel = dark"], keywords: ["dunkel"], difficulty: 2 },
  { english: "The bed is soft", german: "Das Bett ist weich", hints: ["weich = soft"], keywords: ["weich"], difficulty: 2 }
];

// A1 Possessives: mein, dein
const a1PossessivesMeinDein: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "My book is here", german: "Mein Buch ist hier", hints: ["mein = my (neuter)"], keywords: ["mein", "Buch"], difficulty: 2 },
  { english: "Your dog is cute", german: "Dein Hund ist süß", hints: ["dein = your (masculine)"], keywords: ["dein", "Hund"], difficulty: 2 },
  { english: "My cat is black", german: "Meine Katze ist schwarz", hints: ["meine = my (feminine)"], keywords: ["meine", "Katze"], difficulty: 2 },
  { english: "Your house is big", german: "Dein Haus ist groß", hints: ["dein Haus = your house"], keywords: ["dein", "Haus"], difficulty: 2 },
  { english: "My mother is kind", german: "Meine Mutter ist nett", hints: ["meine Mutter"], keywords: ["meine", "Mutter"], difficulty: 2 },
  { english: "Your father works", german: "Dein Vater arbeitet", hints: ["dein Vater"], keywords: ["dein", "Vater"], difficulty: 2 },
  { english: "I see my friend", german: "Ich sehe meinen Freund", hints: ["meinen = my (accusative masculine)"], keywords: ["meinen", "Freund"], difficulty: 3 },
  { english: "You read your book", german: "Du liest dein Buch", hints: ["dein Buch"], keywords: ["dein", "Buch"], difficulty: 2 },
  { english: "My sister is here", german: "Meine Schwester ist hier", hints: ["meine Schwester"], keywords: ["meine", "Schwester"], difficulty: 2 },
  { english: "Your brother is tall", german: "Dein Bruder ist groß", hints: ["dein Bruder"], keywords: ["dein", "Bruder"], difficulty: 2 },
  { english: "I love my car", german: "Ich liebe mein Auto", hints: ["mein Auto"], keywords: ["mein", "Auto"], difficulty: 2 },
  { english: "You need your key", german: "Du brauchst deinen Schlüssel", hints: ["deinen = your (accusative)"], keywords: ["deinen", "Schlüssel"], difficulty: 3 },
  { english: "My children are young", german: "Meine Kinder sind jung", hints: ["meine = my (plural)"], keywords: ["meine", "Kinder"], difficulty: 2 },
  { english: "Your parents are nice", german: "Deine Eltern sind nett", hints: ["deine = your (plural)"], keywords: ["deine", "Eltern"], difficulty: 2 },
  { english: "I know my teacher", german: "Ich kenne meinen Lehrer", hints: ["meinen Lehrer"], keywords: ["meinen", "Lehrer"], difficulty: 3 },
  { english: "You have your pen", german: "Du hast deinen Stift", hints: ["deinen Stift"], keywords: ["deinen", "Stift"], difficulty: 3 },
  { english: "My room is clean", german: "Mein Zimmer ist sauber", hints: ["mein Zimmer"], keywords: ["mein", "Zimmer"], difficulty: 2 },
  { english: "Your school is new", german: "Deine Schule ist neu", hints: ["deine Schule"], keywords: ["deine", "Schule"], difficulty: 2 },
  { english: "I meet my sister", german: "Ich treffe meine Schwester", hints: ["meine Schwester"], keywords: ["meine", "Schwester"], difficulty: 2 },
  { english: "You see your friend", german: "Du siehst deinen Freund", hints: ["deinen Freund"], keywords: ["deinen", "Freund"], difficulty: 3 }
];

// A1 Prepositions: in, aus
const a1PrepositionsInAus: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I am in the house", german: "Ich bin im Haus", hints: ["im = in dem"], keywords: ["im", "Haus"], difficulty: 2 },
  { english: "She is in the school", german: "Sie ist in der Schule", hints: ["in der = in the (dative feminine)"], keywords: ["in", "der", "Schule"], difficulty: 3 },
  { english: "He is from Germany", german: "Er ist aus Deutschland", hints: ["aus = from"], keywords: ["aus", "Deutschland"], difficulty: 2 },
  { english: "We live in Berlin", german: "Wir wohnen in Berlin", hints: ["in + city name"], keywords: ["in", "Berlin"], difficulty: 2 },
  { english: "I come from Austria", german: "Ich komme aus Österreich", hints: ["aus Österreich"], keywords: ["aus", "Österreich"], difficulty: 2 },
  { english: "The book is in the bag", german: "Das Buch ist in der Tasche", hints: ["in der Tasche"], keywords: ["in", "Tasche"], difficulty: 3 },
  { english: "She comes from Switzerland", german: "Sie kommt aus der Schweiz", hints: ["aus der Schweiz"], keywords: ["aus", "Schweiz"], difficulty: 3 },
  { english: "I am in the city", german: "Ich bin in der Stadt", hints: ["in der Stadt"], keywords: ["in", "Stadt"], difficulty: 3 },
  { english: "He is from the village", german: "Er ist aus dem Dorf", hints: ["aus dem = from the (dative neuter)"], keywords: ["aus", "dem", "Dorf"], difficulty: 3 },
  { english: "We are in the car", german: "Wir sind im Auto", hints: ["im Auto"], keywords: ["im", "Auto"], difficulty: 2 },
  { english: "The cat is in the garden", german: "Die Katze ist im Garten", hints: ["im Garten"], keywords: ["im", "Garten"], difficulty: 2 },
  { english: "I am from the city", german: "Ich bin aus der Stadt", hints: ["aus der Stadt"], keywords: ["aus", "Stadt"], difficulty: 3 },
  { english: "She works in the office", german: "Sie arbeitet im Büro", hints: ["im Büro"], keywords: ["im", "Büro"], difficulty: 2 },
  { english: "He comes from the house", german: "Er kommt aus dem Haus", hints: ["aus dem Haus"], keywords: ["aus", "Haus"], difficulty: 3 },
  { english: "We are in the park", german: "Wir sind im Park", hints: ["im Park"], keywords: ["im", "Park"], difficulty: 2 },
  { english: "The dog is from the shelter", german: "Der Hund ist aus dem Tierheim", hints: ["aus dem Tierheim"], keywords: ["aus", "Tierheim"], difficulty: 3 },
  { english: "I study in Munich", german: "Ich studiere in München", hints: ["in München"], keywords: ["in", "München"], difficulty: 2 },
  { english: "She is from Hamburg", german: "Sie ist aus Hamburg", hints: ["aus Hamburg"], keywords: ["aus", "Hamburg"], difficulty: 2 },
  { english: "The children are in the room", german: "Die Kinder sind im Zimmer", hints: ["im Zimmer"], keywords: ["im", "Zimmer"], difficulty: 2 },
  { english: "We come from the market", german: "Wir kommen aus dem Markt", hints: ["aus dem Markt"], keywords: ["aus", "Markt"], difficulty: 3 }
];

// A1 Days of the Week
const a1TimeDaysWeek: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Today is Monday", german: "Heute ist Montag", hints: ["Montag = Monday"], keywords: ["Montag"], difficulty: 1 },
  { english: "Tomorrow is Tuesday", german: "Morgen ist Dienstag", hints: ["Dienstag = Tuesday"], keywords: ["Dienstag"], difficulty: 2 },
  { english: "Yesterday was Wednesday", german: "Gestern war Mittwoch", hints: ["Mittwoch = Wednesday"], keywords: ["Mittwoch"], difficulty: 2 },
  { english: "I work on Thursday", german: "Ich arbeite am Donnerstag", hints: ["Donnerstag = Thursday, am = on"], keywords: ["Donnerstag"], difficulty: 2 },
  { english: "Friday is my favorite", german: "Freitag ist mein Favorit", hints: ["Freitag = Friday"], keywords: ["Freitag"], difficulty: 2 },
  { english: "On Saturday I rest", german: "Am Samstag ruhe ich", hints: ["Samstag = Saturday"], keywords: ["Samstag"], difficulty: 2 },
  { english: "Sunday is a day off", german: "Sonntag ist ein freier Tag", hints: ["Sonntag = Sunday"], keywords: ["Sonntag"], difficulty: 2 },
  { english: "I have class on Monday", german: "Ich habe am Montag Unterricht", hints: ["am Montag"], keywords: ["Montag", "Unterricht"], difficulty: 3 },
  { english: "We meet on Tuesday", german: "Wir treffen uns am Dienstag", hints: ["am Dienstag"], keywords: ["Dienstag"], difficulty: 3 },
  { english: "She comes on Wednesday", german: "Sie kommt am Mittwoch", hints: ["am Mittwoch"], keywords: ["Mittwoch"], difficulty: 2 },
  { english: "Thursday is free", german: "Donnerstag ist frei", hints: ["frei = free"], keywords: ["Donnerstag", "frei"], difficulty: 2 },
  { english: "Every Friday I cook", german: "Jeden Freitag koche ich", hints: ["jeden Freitag = every Friday"], keywords: ["Freitag", "koche"], difficulty: 3 },
  { english: "I sleep long on Saturday", german: "Am Samstag schlafe ich lange", hints: ["lange = long"], keywords: ["Samstag", "schlafe"], difficulty: 3 },
  { english: "Sunday I visit my parents", german: "Sonntag besuche ich meine Eltern", hints: ["Sonntag (no article needed)"], keywords: ["Sonntag", "besuche"], difficulty: 3 },
  { english: "From Monday to Friday", german: "Von Montag bis Freitag", hints: ["von...bis = from...to"], keywords: ["von", "bis"], difficulty: 3 },
  { english: "I love Saturdays", german: "Ich liebe Samstage", hints: ["Samstage = Saturdays (plural)"], keywords: ["Samstage"], difficulty: 2 },
  { english: "Mondays are hard", german: "Montage sind schwer", hints: ["Montage = Mondays (plural)"], keywords: ["Montage", "schwer"], difficulty: 2 },
  { english: "Next Wednesday", german: "Nächsten Mittwoch", hints: ["nächsten = next (accusative)"], keywords: ["nächsten", "Mittwoch"], difficulty: 3 },
  { english: "Last Thursday", german: "Letzten Donnerstag", hints: ["letzten = last (accusative)"], keywords: ["letzten", "Donnerstag"], difficulty: 3 },
  { english: "This Friday", german: "Diesen Freitag", hints: ["diesen = this (accusative)"], keywords: ["diesen", "Freitag"], difficulty: 3 }
];

// A1 Months of the Year
const a1TimeMonths: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "January is cold", german: "Januar ist kalt", hints: ["Januar = January"], keywords: ["Januar"], difficulty: 1 },
  { english: "In February it snows", german: "Im Februar schneit es", hints: ["Februar = February"], keywords: ["Februar"], difficulty: 2 },
  { english: "March is windy", german: "März ist windig", hints: ["März = March"], keywords: ["März"], difficulty: 2 },
  { english: "April brings flowers", german: "April bringt Blumen", hints: ["April = April"], keywords: ["April"], difficulty: 2 },
  { english: "I was born in May", german: "Ich bin im Mai geboren", hints: ["Mai = May"], keywords: ["Mai"], difficulty: 3 },
  { english: "June is warm", german: "Juni ist warm", hints: ["Juni = June"], keywords: ["Juni"], difficulty: 1 },
  { english: "July is very hot", german: "Juli ist sehr heiß", hints: ["Juli = July"], keywords: ["Juli"], difficulty: 2 },
  { english: "In August I travel", german: "Im August reise ich", hints: ["August = August"], keywords: ["August"], difficulty: 2 },
  { english: "September starts school", german: "September beginnt die Schule", hints: ["September = September"], keywords: ["September"], difficulty: 3 },
  { english: "October is beautiful", german: "Oktober ist schön", hints: ["Oktober = October"], keywords: ["Oktober"], difficulty: 2 },
  { english: "November is dark", german: "November ist dunkel", hints: ["November = November"], keywords: ["November"], difficulty: 2 },
  { english: "December has Christmas", german: "Dezember hat Weihnachten", hints: ["Dezember = December"], keywords: ["Dezember"], difficulty: 2 },
  { english: "I love May", german: "Ich liebe Mai", hints: ["Mai (no article)"], keywords: ["Mai"], difficulty: 2 },
  { english: "In January I start", german: "Im Januar fange ich an", hints: ["im Januar"], keywords: ["Januar", "fange"], difficulty: 3 },
  { english: "From March to June", german: "Von März bis Juni", hints: ["von...bis"], keywords: ["März", "Juni"], difficulty: 3 },
  { english: "Every July we go to the beach", german: "Jeden Juli fahren wir zum Strand", hints: ["jeden Juli"], keywords: ["Juli", "Strand"], difficulty: 4 },
  { english: "Last September", german: "Letzten September", hints: ["letzten September"], keywords: ["letzten", "September"], difficulty: 3 },
  { english: "Next December", german: "Nächsten Dezember", hints: ["nächsten Dezember"], keywords: ["nächsten", "Dezember"], difficulty: 3 },
  { english: "This October", german: "Diesen Oktober", hints: ["diesen Oktober"], keywords: ["diesen", "Oktober"], difficulty: 3 },
  { english: "I visit in April", german: "Ich besuche im April", hints: ["im April"], keywords: ["April"], difficulty: 2 }
];

// A1 Common Greetings
const a1Greetings: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Good morning", german: "Guten Morgen", hints: ["Standard morning greeting"], keywords: ["Guten", "Morgen"], difficulty: 1 },
  { english: "Good day", german: "Guten Tag", hints: ["Formal daytime greeting"], keywords: ["Guten", "Tag"], difficulty: 1 },
  { english: "Good evening", german: "Guten Abend", hints: ["Evening greeting"], keywords: ["Guten", "Abend"], difficulty: 1 },
  { english: "Good night", german: "Gute Nacht", hints: ["Said when going to bed"], keywords: ["Gute", "Nacht"], difficulty: 1 },
  { english: "Hello (informal)", german: "Hallo", hints: ["Casual greeting"], keywords: ["Hallo"], difficulty: 1 },
  { english: "Hi (very informal)", german: "Hi", hints: ["Very casual"], keywords: ["Hi"], difficulty: 1 },
  { english: "Goodbye", german: "Auf Wiedersehen", hints: ["Formal goodbye"], keywords: ["Wiedersehen"], difficulty: 2 },
  { english: "Bye (informal)", german: "Tschüss", hints: ["Casual goodbye"], keywords: ["Tschüss"], difficulty: 1 },
  { english: "See you later", german: "Bis später", hints: ["bis später = until later"], keywords: ["später"], difficulty: 2 },
  { english: "See you tomorrow", german: "Bis morgen", hints: ["bis morgen = until tomorrow"], keywords: ["morgen"], difficulty: 2 },
  { english: "See you soon", german: "Bis bald", hints: ["bis bald = until soon"], keywords: ["bald"], difficulty: 2 },
  { english: "How are you? (formal)", german: "Wie geht es Ihnen?", hints: ["Formal you = Ihnen"], keywords: ["Ihnen"], difficulty: 3 },
  { english: "How are you? (informal)", german: "Wie geht es dir?", hints: ["Informal you = dir"], keywords: ["dir"], difficulty: 2 },
  { english: "I'm fine, thanks", german: "Mir geht es gut, danke", hints: ["mir geht es gut"], keywords: ["gut", "danke"], difficulty: 2 },
  { english: "Welcome", german: "Willkommen", hints: ["Greeting for arrivals"], keywords: ["Willkommen"], difficulty: 1 },
  { english: "Please", german: "Bitte", hints: ["Please/you're welcome"], keywords: ["Bitte"], difficulty: 1 },
  { english: "Thank you", german: "Danke", hints: ["Thanks"], keywords: ["Danke"], difficulty: 1 },
  { english: "Thank you very much", german: "Vielen Dank", hints: ["Vielen Dank = many thanks"], keywords: ["Vielen", "Dank"], difficulty: 2 },
  { english: "You're welcome", german: "Bitte schön", hints: ["Polite you're welcome"], keywords: ["Bitte", "schön"], difficulty: 2 },
  { english: "Excuse me", german: "Entschuldigung", hints: ["To get attention or apologize"], keywords: ["Entschuldigung"], difficulty: 2 }
];

// A1 Numbers 20-100
const a1Numbers20100: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I am twenty years old", german: "Ich bin zwanzig Jahre alt", hints: ["zwanzig = 20"], keywords: ["zwanzig"], difficulty: 2 },
  { english: "She has thirty books", german: "Sie hat dreißig Bücher", hints: ["dreißig = 30"], keywords: ["dreißig"], difficulty: 2 },
  { english: "It costs forty euros", german: "Es kostet vierzig Euro", hints: ["vierzig = 40"], keywords: ["vierzig"], difficulty: 2 },
  { english: "Fifty people came", german: "Fünfzig Leute kamen", hints: ["fünfzig = 50"], keywords: ["fünfzig"], difficulty: 2 },
  { english: "I need sixty chairs", german: "Ich brauche sechzig Stühle", hints: ["sechzig = 60"], keywords: ["sechzig"], difficulty: 2 },
  { english: "Seventy students passed", german: "Siebzig Studenten haben bestanden", hints: ["siebzig = 70"], keywords: ["siebzig"], difficulty: 3 },
  { english: "He is eighty years old", german: "Er ist achtzig Jahre alt", hints: ["achtzig = 80"], keywords: ["achtzig"], difficulty: 2 },
  { english: "Ninety minutes", german: "Neunzig Minuten", hints: ["neunzig = 90"], keywords: ["neunzig"], difficulty: 2 },
  { english: "One hundred euros", german: "Einhundert Euro", hints: ["einhundert = 100"], keywords: ["einhundert"], difficulty: 2 },
  { english: "Twenty-one days", german: "Einundzwanzig Tage", hints: ["21 = ein-und-zwanzig"], keywords: ["Einundzwanzig"], difficulty: 3 },
  { english: "Thirty-five people", german: "Fünfunddreißig Leute", hints: ["35 = fünf-und-dreißig"], keywords: ["Fünfunddreißig"], difficulty: 3 },
  { english: "Forty-two is the answer", german: "Zweiundvierzig ist die Antwort", hints: ["42 = zwei-und-vierzig"], keywords: ["Zweiundvierzig"], difficulty: 3 },
  { english: "Fifty-seven students", german: "Siebenundfünfzig Studenten", hints: ["57 = sieben-und-fünfzig"], keywords: ["Siebenundfünfzig"], difficulty: 3 },
  { english: "Sixty-three euros", german: "Dreiundsechzig Euro", hints: ["63 = drei-und-sechzig"], keywords: ["Dreiundsechzig"], difficulty: 3 },
  { english: "Seventy-eight years", german: "Achtundsiebzig Jahre", hints: ["78 = acht-und-siebzig"], keywords: ["Achtundsiebzig"], difficulty: 3 },
  { english: "Eighty-four books", german: "Vierundachtzig Bücher", hints: ["84 = vier-und-achtzig"], keywords: ["Vierundachtzig"], difficulty: 3 },
  { english: "Ninety-nine problems", german: "Neunundneunzig Probleme", hints: ["99 = neun-und-neunzig"], keywords: ["Neunundneunzig"], difficulty: 3 },
  { english: "Twenty-five percent", german: "Fünfundzwanzig Prozent", hints: ["25%"], keywords: ["Fünfundzwanzig", "Prozent"], difficulty: 3 },
  { english: "It costs fifty euros", german: "Es kostet fünfzig Euro", hints: ["fünfzig Euro"], keywords: ["fünfzig"], difficulty: 2 },
  { english: "I wait thirty minutes", german: "Ich warte dreißig Minuten", hints: ["dreißig Minuten"], keywords: ["dreißig"], difficulty: 2 }
];

// A1 Telling Time (Basic)
const a1TellingTimeBasic: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "What time is it?", german: "Wie spät ist es?", hints: ["wie spät = what time"], keywords: ["spät"], difficulty: 2 },
  { english: "It is one o'clock", german: "Es ist ein Uhr", hints: ["ein Uhr = 1:00"], keywords: ["Uhr"], difficulty: 2 },
  { english: "It is two o'clock", german: "Es ist zwei Uhr", hints: ["zwei Uhr = 2:00"], keywords: ["zwei", "Uhr"], difficulty: 2 },
  { english: "It is half past three", german: "Es ist halb vier", hints: ["halb vier = 3:30 (half to 4)"], keywords: ["halb", "vier"], difficulty: 3 },
  { english: "It is quarter past five", german: "Es ist Viertel nach fünf", hints: ["Viertel nach = quarter past"], keywords: ["Viertel", "nach"], difficulty: 3 },
  { english: "It is quarter to six", german: "Es ist Viertel vor sechs", hints: ["Viertel vor = quarter to"], keywords: ["Viertel", "vor"], difficulty: 3 },
  { english: "It is ten past seven", german: "Es ist zehn nach sieben", hints: ["nach = past"], keywords: ["nach"], difficulty: 3 },
  { english: "It is twenty to eight", german: "Es ist zwanzig vor acht", hints: ["vor = to"], keywords: ["vor"], difficulty: 3 },
  { english: "It is twelve noon", german: "Es ist zwölf Uhr mittags", hints: ["mittags = noon"], keywords: ["mittags"], difficulty: 3 },
  { english: "It is midnight", german: "Es ist Mitternacht", hints: ["Mitternacht = midnight"], keywords: ["Mitternacht"], difficulty: 2 },
  { english: "At what time?", german: "Um wie viel Uhr?", hints: ["um = at (time)"], keywords: ["um"], difficulty: 3 },
  { english: "At five o'clock", german: "Um fünf Uhr", hints: ["um fünf Uhr"], keywords: ["um", "fünf"], difficulty: 2 },
  { english: "I come at eight", german: "Ich komme um acht", hints: ["um acht = at 8"], keywords: ["um", "acht"], difficulty: 3 },
  { english: "The train leaves at ten", german: "Der Zug fährt um zehn ab", hints: ["um zehn"], keywords: ["um", "zehn"], difficulty: 3 },
  { english: "It is morning", german: "Es ist Morgen", hints: ["Morgen = morning"], keywords: ["Morgen"], difficulty: 1 },
  { english: "It is afternoon", german: "Es ist Nachmittag", hints: ["Nachmittag = afternoon"], keywords: ["Nachmittag"], difficulty: 2 },
  { english: "It is evening", german: "Es ist Abend", hints: ["Abend = evening"], keywords: ["Abend"], difficulty: 1 },
  { english: "It is night", german: "Es ist Nacht", hints: ["Nacht = night"], keywords: ["Nacht"], difficulty: 1 },
  { english: "It is exactly three", german: "Es ist genau drei Uhr", hints: ["genau = exactly"], keywords: ["genau", "drei"], difficulty: 3 },
  { english: "It is about four", german: "Es ist ungefähr vier Uhr", hints: ["ungefähr = about/approximately"], keywords: ["ungefähr", "vier"], difficulty: 3 }
];

// A1 The Verb 'möchten' (would like)
const a1VerbMoechten: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I would like coffee", german: "Ich möchte Kaffee", hints: ["möchten → möchte (ich)"], keywords: ["möchte"], difficulty: 2 },
  { english: "You would like tea", german: "Du möchtest Tee", hints: ["möchten → möchtest (du)"], keywords: ["möchtest"], difficulty: 2 },
  { english: "He would like water", german: "Er möchte Wasser", hints: ["möchten → möchte (er/sie/es)"], keywords: ["möchte"], difficulty: 2 },
  { english: "She would like pizza", german: "Sie möchte Pizza", hints: ["möchte Pizza"], keywords: ["möchte", "Pizza"], difficulty: 2 },
  { english: "We would like to go", german: "Wir möchten gehen", hints: ["möchten + infinitive"], keywords: ["möchten", "gehen"], difficulty: 3 },
  { english: "You all would like to help", german: "Ihr möchtet helfen", hints: ["möchten → möchtet (ihr)"], keywords: ["möchtet"], difficulty: 3 },
  { english: "They would like to come", german: "Sie möchten kommen", hints: ["möchten → möchten (sie)"], keywords: ["möchten", "kommen"], difficulty: 3 },
  { english: "I would like a book", german: "Ich möchte ein Buch", hints: ["möchte ein Buch"], keywords: ["möchte", "Buch"], difficulty: 2 },
  { english: "Would you like cake?", german: "Möchtest du Kuchen?", hints: ["Question with möchtest"], keywords: ["Möchtest", "Kuchen"], difficulty: 3 },
  { english: "She would like to learn", german: "Sie möchte lernen", hints: ["möchte lernen"], keywords: ["möchte", "lernen"], difficulty: 3 },
  { english: "We would like ice cream", german: "Wir möchten Eis", hints: ["möchten Eis"], keywords: ["möchten", "Eis"], difficulty: 2 },
  { english: "He would like to sleep", german: "Er möchte schlafen", hints: ["möchte schlafen"], keywords: ["möchte", "schlafen"], difficulty: 3 },
  { english: "I would like a beer", german: "Ich möchte ein Bier", hints: ["möchte ein Bier"], keywords: ["möchte", "Bier"], difficulty: 2 },
  { english: "You would like to eat", german: "Du möchtest essen", hints: ["möchtest essen"], keywords: ["möchtest", "essen"], difficulty: 3 },
  { english: "They would like soup", german: "Sie möchten Suppe", hints: ["möchten Suppe"], keywords: ["möchten", "Suppe"], difficulty: 2 },
  { english: "We would like to travel", german: "Wir möchten reisen", hints: ["möchten reisen"], keywords: ["möchten", "reisen"], difficulty: 3 },
  { english: "She would like juice", german: "Sie möchte Saft", hints: ["möchte Saft"], keywords: ["möchte", "Saft"], difficulty: 2 },
  { english: "I would like to stay", german: "Ich möchte bleiben", hints: ["möchte bleiben"], keywords: ["möchte", "bleiben"], difficulty: 3 },
  { english: "You all would like wine", german: "Ihr möchtet Wein", hints: ["möchtet Wein"], keywords: ["möchtet", "Wein"], difficulty: 2 },
  { english: "He would like to work", german: "Er möchte arbeiten", hints: ["möchte arbeiten"], keywords: ["möchte", "arbeiten"], difficulty: 3 }
];

// A1 Common Regular Verbs
const a1CommonVerbs: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I live in Berlin", german: "Ich wohne in Berlin", hints: ["wohnen = to live"], keywords: ["wohne"], difficulty: 2 },
  { english: "You come tomorrow", german: "Du kommst morgen", hints: ["kommen = to come"], keywords: ["kommst"], difficulty: 2 },
  { english: "She makes breakfast", german: "Sie macht Frühstück", hints: ["machen = to make/do"], keywords: ["macht"], difficulty: 2 },
  { english: "We say nothing", german: "Wir sagen nichts", hints: ["sagen = to say"], keywords: ["sagen"], difficulty: 2 },
  { english: "They play soccer", german: "Sie spielen Fußball", hints: ["spielen = to play"], keywords: ["spielen"], difficulty: 2 },
  { english: "I hear music", german: "Ich höre Musik", hints: ["hören = to hear/listen"], keywords: ["höre"], difficulty: 2 },
  { english: "You ask a question", german: "Du fragst eine Frage", hints: ["fragen = to ask"], keywords: ["fragst"], difficulty: 2 },
  { english: "He buys bread", german: "Er kauft Brot", hints: ["kaufen = to buy"], keywords: ["kauft"], difficulty: 2 },
  { english: "She cooks dinner", german: "Sie kocht Abendessen", hints: ["kochen = to cook"], keywords: ["kocht"], difficulty: 2 },
  { english: "We travel often", german: "Wir reisen oft", hints: ["reisen = to travel"], keywords: ["reisen"], difficulty: 2 },
  { english: "They laugh a lot", german: "Sie lachen viel", hints: ["lachen = to laugh"], keywords: ["lachen"], difficulty: 2 },
  { english: "I count to ten", german: "Ich zähle bis zehn", hints: ["zählen = to count"], keywords: ["zähle"], difficulty: 3 },
  { english: "You wait here", german: "Du wartest hier", hints: ["warten = to wait"], keywords: ["wartest"], difficulty: 3 },
  { english: "He studies medicine", german: "Er studiert Medizin", hints: ["studieren = to study (university)"], keywords: ["studiert"], difficulty: 3 },
  { english: "We search the key", german: "Wir suchen den Schlüssel", hints: ["suchen = to search"], keywords: ["suchen"], difficulty: 3 },
  { english: "They need help", german: "Sie brauchen Hilfe", hints: ["brauchen = to need"], keywords: ["brauchen"], difficulty: 2 },
  { english: "I believe you", german: "Ich glaube dir", hints: ["glauben = to believe"], keywords: ["glaube"], difficulty: 3 },
  { english: "You show the way", german: "Du zeigst den Weg", hints: ["zeigen = to show"], keywords: ["zeigst"], difficulty: 3 },
  { english: "She opens the door", german: "Sie öffnet die Tür", hints: ["öffnen = to open"], keywords: ["öffnet"], difficulty: 2 },
  { english: "We answer correctly", german: "Wir antworten richtig", hints: ["antworten = to answer"], keywords: ["antworten"], difficulty: 3 }
];

// A1 Courtesy Phrases
const a1CourtesyPhrases: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Please help me", german: "Bitte hilf mir", hints: ["bitte = please"], keywords: ["Bitte", "hilf"], difficulty: 2 },
  { english: "Thank you very much", german: "Vielen Dank", hints: ["vielen Dank = many thanks"], keywords: ["Vielen", "Dank"], difficulty: 2 },
  { english: "You're welcome", german: "Gern geschehen", hints: ["gern geschehen = gladly done"], keywords: ["Gern", "geschehen"], difficulty: 2 },
  { english: "Excuse me please", german: "Entschuldigen Sie bitte", hints: ["formal excuse me"], keywords: ["Entschuldigen"], difficulty: 3 },
  { english: "I'm sorry", german: "Es tut mir leid", hints: ["es tut mir leid"], keywords: ["leid"], difficulty: 3 },
  { english: "No problem", german: "Kein Problem", hints: ["kein Problem"], keywords: ["Problem"], difficulty: 1 },
  { english: "Of course", german: "Natürlich", hints: ["natürlich = of course/naturally"], keywords: ["Natürlich"], difficulty: 2 },
  { english: "Gladly", german: "Gerne", hints: ["gerne = gladly/with pleasure"], keywords: ["Gerne"], difficulty: 2 },
  { english: "With pleasure", german: "Mit Vergnügen", hints: ["mit Vergnügen"], keywords: ["Vergnügen"], difficulty: 3 },
  { english: "May I?", german: "Darf ich?", hints: ["darf ich = may I"], keywords: ["Darf"], difficulty: 2 },
  { english: "Can you help me?", german: "Können Sie mir helfen?", hints: ["formal you"], keywords: ["Können", "helfen"], difficulty: 3 },
  { english: "I don't understand", german: "Ich verstehe nicht", hints: ["verstehe nicht"], keywords: ["verstehe", "nicht"], difficulty: 2 },
  { english: "Please repeat", german: "Bitte wiederholen", hints: ["wiederholen = to repeat"], keywords: ["wiederholen"], difficulty: 3 },
  { english: "Speak slowly please", german: "Sprechen Sie bitte langsam", hints: ["langsam = slowly"], keywords: ["langsam"], difficulty: 3 },
  { english: "That's very kind", german: "Das ist sehr nett", hints: ["sehr nett"], keywords: ["nett"], difficulty: 2 },
  { english: "I beg your pardon", german: "Wie bitte?", hints: ["wie bitte = pardon"], keywords: ["bitte"], difficulty: 2 },
  { english: "One moment please", german: "Einen Moment bitte", hints: ["einen Moment"], keywords: ["Moment"], difficulty: 2 },
  { english: "Have a nice day", german: "Einen schönen Tag", hints: ["schönen Tag"], keywords: ["schönen", "Tag"], difficulty: 2 },
  { english: "All the best", german: "Alles Gute", hints: ["alles Gute"], keywords: ["Alles", "Gute"], difficulty: 2 },
  { english: "Good luck", german: "Viel Glück", hints: ["viel Glück"], keywords: ["Glück"], difficulty: 2 }
];

// ==================== A2 SENTENCES ====================

// A2 Perfect Tense sentences
const a2PerfectTenseSentences: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I learned German", german: "Ich habe Deutsch gelernt", hints: ["Use 'haben' + past participle", "gelernt = learned"], keywords: ["haben", "gelernt"], difficulty: 2 },
  { english: "She went home", german: "Sie ist nach Hause gegangen", hints: ["Verbs of motion use 'sein'", "gegangen = gone"], keywords: ["ist", "gegangen"], difficulty: 3 },
  { english: "We ate pizza", german: "Wir haben Pizza gegessen", hints: ["Use 'haben' with eating", "gegessen = eaten"], keywords: ["haben", "gegessen"], difficulty: 2 },
  { english: "He came yesterday", german: "Er ist gestern gekommen", hints: ["Verbs of arrival use 'sein'", "gekommen = come"], keywords: ["ist", "gekommen"], difficulty: 3 },
  { english: "I bought a car", german: "Ich habe ein Auto gekauft", hints: ["Use 'haben' with buying", "gekauft = bought"], keywords: ["haben", "gekauft"], difficulty: 3 },
  { english: "They traveled to Berlin", german: "Sie sind nach Berlin gereist", hints: ["Travel uses 'sein'", "gereist = traveled"], keywords: ["sind", "gereist"], difficulty: 4 },
  { english: "She has written a letter", german: "Sie hat einen Brief geschrieben", hints: ["Use 'haben' with writing", "geschrieben = written"], keywords: ["hat", "geschrieben"], difficulty: 4 },
  { english: "We stayed at home", german: "Wir sind zu Hause geblieben", hints: ["State change uses 'sein'", "geblieben = stayed"], keywords: ["sind", "geblieben"], difficulty: 4 },
  { english: "I have seen the movie", german: "Ich habe den Film gesehen", hints: ["Use 'haben' with seeing", "gesehen = seen"], keywords: ["haben", "gesehen"], difficulty: 3 },
  { english: "He has become a teacher", german: "Er ist Lehrer geworden", hints: ["'werden' uses 'sein'", "geworden = become"], keywords: ["ist", "geworden"], difficulty: 5 },
  { english: "They have worked hard", german: "Sie haben hart gearbeitet", hints: ["Use 'haben' with working", "gearbeitet = worked"], keywords: ["haben", "gearbeitet"], difficulty: 4 },
  { english: "I have slept well", german: "Ich habe gut geschlafen", hints: ["Use 'haben' with sleeping", "geschlafen = slept"], keywords: ["haben", "geschlafen"], difficulty: 3 },
  { english: "She has run fast", german: "Sie ist schnell gelaufen", hints: ["Running uses 'sein'", "gelaufen = run"], keywords: ["ist", "gelaufen"], difficulty: 5 },
  { english: "We have spoken German", german: "Wir haben Deutsch gesprochen", hints: ["Use 'haben' with speaking", "gesprochen = spoken"], keywords: ["haben", "gesprochen"], difficulty: 4 },
  { english: "He has driven to work", german: "Er ist zur Arbeit gefahren", hints: ["Driving uses 'sein'", "gefahren = driven"], keywords: ["ist", "gefahren"], difficulty: 5 },
  { english: "I have drunk coffee", german: "Ich habe Kaffee getrunken", hints: ["Use 'haben' with drinking", "getrunken = drunk"], keywords: ["haben", "getrunken"], difficulty: 4 },
  { english: "They have swum in the lake", german: "Sie sind im See geschwommen", hints: ["Swimming uses 'sein'", "geschwommen = swum"], keywords: ["sind", "geschwommen"], difficulty: 6 },
  { english: "She has found the keys", german: "Sie hat die Schlüssel gefunden", hints: ["Use 'haben' with finding", "gefunden = found"], keywords: ["hat", "gefunden"], difficulty: 5 },
  { english: "We have forgotten the homework", german: "Wir haben die Hausaufgaben vergessen", hints: ["Use 'haben' with forgetting", "vergessen = forgotten"], keywords: ["haben", "vergessen"], difficulty: 6 },
  { english: "He has grown tall", german: "Er ist groß gewachsen", hints: ["Growth uses 'sein'", "gewachsen = grown"], keywords: ["ist", "gewachsen"], difficulty: 7 }
];

// A2 Dative Case sentences
const a2DativeCaseSentences: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I give the man a book", german: "Ich gebe dem Mann ein Buch", hints: ["dem Mann = to the man (dative)", "indirect object"], keywords: ["dem", "Mann"], difficulty: 3 },
  { english: "She helps the woman", german: "Sie hilft der Frau", hints: ["helfen takes dative", "der Frau = to the woman"], keywords: ["hilft", "der"], difficulty: 3 },
  { english: "He speaks with the child", german: "Er spricht mit dem Kind", hints: ["mit requires dative", "dem Kind = with the child"], keywords: ["mit", "dem"], difficulty: 3 },
  { english: "I thank my friend", german: "Ich danke meinem Freund", hints: ["danken takes dative", "meinem Freund = to my friend"], keywords: ["danke", "meinem"], difficulty: 4 },
  { english: "The book belongs to me", german: "Das Buch gehört mir", hints: ["gehören takes dative", "mir = to me"], keywords: ["gehört", "mir"], difficulty: 3 },
  { english: "She answers the teacher", german: "Sie antwortet dem Lehrer", hints: ["antworten takes dative", "dem Lehrer = to the teacher"], keywords: ["antwortet", "dem"], difficulty: 4 },
  { english: "I come from the city", german: "Ich komme aus der Stadt", hints: ["aus requires dative", "der Stadt = from the city"], keywords: ["aus", "der"], difficulty: 4 },
  { english: "He goes to the school", german: "Er geht zu der Schule", hints: ["zu requires dative", "der Schule = to the school"], keywords: ["zu", "der"], difficulty: 4 },
  { english: "We live with our parents", german: "Wir wohnen bei unseren Eltern", hints: ["bei requires dative", "unseren Eltern = with our parents"], keywords: ["bei", "unseren"], difficulty: 5 },
  { english: "The gift is for my mother", german: "Das Geschenk ist für meine Mutter", hints: ["Wait - 'für' takes accusative!", "This is a trick question"], keywords: ["für", "meine"], difficulty: 6 },
  { english: "She comes from the station", german: "Sie kommt von dem Bahnhof", hints: ["von requires dative", "dem Bahnhof = from the station"], keywords: ["von", "dem"], difficulty: 4 },
  { english: "I am going to my grandmother", german: "Ich fahre zu meiner Großmutter", hints: ["zu requires dative", "meiner Großmutter = to my grandmother"], keywords: ["zu", "meiner"], difficulty: 5 },
  { english: "He walks with his dog", german: "Er geht mit seinem Hund spazieren", hints: ["mit requires dative", "seinem Hund = with his dog"], keywords: ["mit", "seinem"], difficulty: 5 },
  { english: "We eat at the restaurant", german: "Wir essen in dem Restaurant", hints: ["in + location = dative", "dem Restaurant = at the restaurant"], keywords: ["in", "dem"], difficulty: 5 },
  { english: "The cat sleeps on the bed", german: "Die Katze schläft auf dem Bett", hints: ["auf + location = dative", "dem Bett = on the bed"], keywords: ["auf", "dem"], difficulty: 5 },
  { english: "I send you a letter", german: "Ich schicke dir einen Brief", hints: ["dir = to you (dative)", "indirect object"], keywords: ["dir", "schicke"], difficulty: 6 },
  { english: "She shows us the pictures", german: "Sie zeigt uns die Bilder", hints: ["uns = to us (dative)", "indirect object"], keywords: ["zeigt", "uns"], difficulty: 6 },
  { english: "The shoes fit me well", german: "Die Schuhe passen mir gut", hints: ["passen takes dative", "mir = to me"], keywords: ["passen", "mir"], difficulty: 6 },
  { english: "I trust my sister", german: "Ich vertraue meiner Schwester", hints: ["vertrauen takes dative", "meiner Schwester = my sister"], keywords: ["vertraue", "meiner"], difficulty: 7 },
  { english: "He congratulates his colleague", german: "Er gratuliert seinem Kollegen", hints: ["gratulieren takes dative", "seinem Kollegen = to his colleague"], keywords: ["gratuliert", "seinem"], difficulty: 7 }
];

// A2 Modal Verbs sentences
const a2ModalVerbsSentences: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I can swim", german: "Ich kann schwimmen", hints: ["können = can/to be able to", "Infinitive goes to end"], keywords: ["kann", "schwimmen"], difficulty: 2 },
  { english: "You must learn", german: "Du musst lernen", hints: ["müssen = must/have to", "Infinitive at end"], keywords: ["musst", "lernen"], difficulty: 2 },
  { english: "She wants to sleep", german: "Sie will schlafen", hints: ["wollen = to want", "Infinitive at end"], keywords: ["will", "schlafen"], difficulty: 2 },
  { english: "We may go", german: "Wir dürfen gehen", hints: ["dürfen = may/to be allowed to", "Infinitive at end"], keywords: ["dürfen", "gehen"], difficulty: 3 },
  { english: "He should study", german: "Er soll studieren", hints: ["sollen = should/supposed to", "Infinitive at end"], keywords: ["soll", "studieren"], difficulty: 3 },
  { english: "I like to read", german: "Ich mag lesen", hints: ["mögen = to like", "Also means 'may'"], keywords: ["mag", "lesen"], difficulty: 3 },
  { english: "Can you help me", german: "Kannst du mir helfen", hints: ["können = can", "mir = dative pronoun"], keywords: ["kannst", "helfen"], difficulty: 4 },
  { english: "She must work tomorrow", german: "Sie muss morgen arbeiten", hints: ["müssen = must", "Time word before infinitive"], keywords: ["muss", "arbeiten"], difficulty: 4 },
  { english: "We want to travel to Spain", german: "Wir wollen nach Spanien reisen", hints: ["wollen = want", "nach + country name"], keywords: ["wollen", "reisen"], difficulty: 4 },
  { english: "You are not allowed to smoke here", german: "Du darfst hier nicht rauchen", hints: ["nicht + infinitive", "dürfen negated = not allowed"], keywords: ["darfst", "nicht"], difficulty: 5 },
  { english: "He cannot come today", german: "Er kann heute nicht kommen", hints: ["nicht before infinitive", "können negated"], keywords: ["kann", "nicht"], difficulty: 5 },
  { english: "I should eat more vegetables", german: "Ich soll mehr Gemüse essen", hints: ["sollen = should", "mehr = more"], keywords: ["soll", "mehr"], difficulty: 5 },
  { english: "Do you want to watch a movie", german: "Willst du einen Film sehen", hints: ["wollen in question", "einen Film = accusative"], keywords: ["willst", "sehen"], difficulty: 5 },
  { english: "She can speak three languages", german: "Sie kann drei Sprachen sprechen", hints: ["können + sprechen", "drei Sprachen = object"], keywords: ["kann", "sprechen"], difficulty: 6 },
  { english: "We have to finish the homework", german: "Wir müssen die Hausaufgaben fertigmachen", hints: ["müssen = have to", "fertigmachen = to finish"], keywords: ["müssen", "fertigmachen"], difficulty: 6 },
  { english: "May I ask a question", german: "Darf ich eine Frage stellen", hints: ["dürfen = may/permission", "eine Frage stellen = ask a question"], keywords: ["darf", "stellen"], difficulty: 6 },
  { english: "You should not drink so much coffee", german: "Du sollst nicht so viel Kaffee trinken", hints: ["sollen + nicht", "so viel = so much"], keywords: ["sollst", "nicht"], difficulty: 7 },
  { english: "He wants to become a doctor", german: "Er will Arzt werden", hints: ["wollen + werden", "No article before professions"], keywords: ["will", "werden"], difficulty: 7 },
  { english: "I would like to order", german: "Ich möchte bestellen", hints: ["möchten = would like (subjunctive)", "Polite form"], keywords: ["möchte", "bestellen"], difficulty: 7 },
  { english: "Can you tell me the way", german: "Können Sie mir den Weg sagen", hints: ["können in formal question", "mir = to me, den Weg = the way"], keywords: ["können", "sagen"], difficulty: 8 }
];

// A2 Comparative Adjectives sentences
const a2ComparativeAdjectivesSentences: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The car is bigger", german: "Das Auto ist größer", hints: ["groß + er = größer", "Umlaut added"], keywords: ["größer"], difficulty: 2 },
  { english: "She is older than me", german: "Sie ist älter als ich", hints: ["alt + er = älter", "als = than"], keywords: ["älter", "als"], difficulty: 3 },
  { english: "This house is smaller", german: "Dieses Haus ist kleiner", hints: ["klein + er = kleiner", "No umlaut needed"], keywords: ["kleiner"], difficulty: 2 },
  { english: "He runs faster", german: "Er läuft schneller", hints: ["schnell + er = schneller", "No umlaut"], keywords: ["schneller"], difficulty: 3 },
  { english: "The book is more interesting", german: "Das Buch ist interessanter", hints: ["Add -er to long adjectives too", "interessant + er"], keywords: ["interessanter"], difficulty: 4 },
  { english: "My brother is younger", german: "Mein Bruder ist jünger", hints: ["jung + er = jünger", "Umlaut added"], keywords: ["jünger"], difficulty: 3 },
  { english: "This test is harder", german: "Dieser Test ist schwerer", hints: ["schwer + er = schwerer", "No umlaut"], keywords: ["schwerer"], difficulty: 4 },
  { english: "The weather is warmer today", german: "Das Wetter ist heute wärmer", hints: ["warm + er = wärmer", "Umlaut added"], keywords: ["wärmer"], difficulty: 4 },
  { english: "She is smarter than him", german: "Sie ist klüger als er", hints: ["klug + er = klüger", "als er = than him"], keywords: ["klüger", "als"], difficulty: 5 },
  { english: "This bag is heavier", german: "Diese Tasche ist schwerer", hints: ["schwer = heavy/difficult", "schwerer = heavier"], keywords: ["schwerer"], difficulty: 4 },
  { english: "The coffee is stronger", german: "Der Kaffee ist stärker", hints: ["stark + er = stärker", "Umlaut added"], keywords: ["stärker"], difficulty: 5 },
  { english: "Her hair is longer", german: "Ihr Haar ist länger", hints: ["lang + er = länger", "Umlaut added"], keywords: ["länger"], difficulty: 5 },
  { english: "This chair is more comfortable", german: "Dieser Stuhl ist bequemer", hints: ["bequem + er = bequemer", "No umlaut"], keywords: ["bequemer"], difficulty: 6 },
  { english: "The movie is better", german: "Der Film ist besser", hints: ["Irregular: gut → besser", "Not 'guter'!"], keywords: ["besser"], difficulty: 6 },
  { english: "I have more time", german: "Ich habe mehr Zeit", hints: ["Irregular: viel → mehr", "Not 'vieler'!"], keywords: ["mehr"], difficulty: 6 },
  { english: "This street is narrower", german: "Diese Straße ist enger", hints: ["eng + er = enger", "No umlaut"], keywords: ["enger"], difficulty: 6 },
  { english: "The train is faster than the bus", german: "Der Zug ist schneller als der Bus", hints: ["schneller als", "der Bus = nominative after als"], keywords: ["schneller", "als"], difficulty: 7 },
  { english: "My apartment is closer to the city", german: "Meine Wohnung ist näher zur Stadt", hints: ["nah + er = näher (irregular)", "Umlaut + different stem"], keywords: ["näher"], difficulty: 7 },
  { english: "He is taller than his father", german: "Er ist größer als sein Vater", hints: ["größer als", "sein Vater = his father"], keywords: ["größer", "als"], difficulty: 7 },
  { english: "This exercise is more difficult than the last one", german: "Diese Übung ist schwieriger als die letzte", hints: ["schwierig + er", "die letzte = the last one"], keywords: ["schwieriger", "als"], difficulty: 8 }
];

// A2 Separable Verbs sentences
const a2SeparableVerbsSentences: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I get up at 7 o'clock", german: "Ich stehe um 7 Uhr auf", hints: ["aufstehen = to get up", "Prefix 'auf' goes to end"], keywords: ["stehe", "auf"], difficulty: 3 },
  { english: "She goes shopping", german: "Sie kauft ein", hints: ["einkaufen = to shop", "Prefix 'ein' to end"], keywords: ["kauft", "ein"], difficulty: 3 },
  { english: "Are you coming along", german: "Kommst du mit", hints: ["mitkommen = to come along", "'mit' to end"], keywords: ["kommst", "mit"], difficulty: 3 },
  { english: "He calls me back", german: "Er ruft mich zurück", hints: ["zurückrufen = to call back", "'zurück' to end"], keywords: ["ruft", "zurück"], difficulty: 4 },
  { english: "We turn on the TV", german: "Wir schalten den Fernseher ein", hints: ["einschalten = to turn on", "'ein' to end"], keywords: ["schalten", "ein"], difficulty: 4 },
  { english: "I clean up my room", german: "Ich räume mein Zimmer auf", hints: ["aufräumen = to clean up", "'auf' to end"], keywords: ["räume", "auf"], difficulty: 4 },
  { english: "She takes off her shoes", german: "Sie zieht ihre Schuhe aus", hints: ["ausziehen = to take off", "'aus' to end"], keywords: ["zieht", "aus"], difficulty: 5 },
  { english: "The train departs at 10", german: "Der Zug fährt um 10 Uhr ab", hints: ["abfahren = to depart", "'ab' to end"], keywords: ["fährt", "ab"], difficulty: 5 },
  { english: "I pick you up", german: "Ich hole dich ab", hints: ["abholen = to pick up", "'ab' to end"], keywords: ["hole", "ab"], difficulty: 5 },
  { english: "He closes the door", german: "Er macht die Tür zu", hints: ["zumachen = to close", "'zu' to end"], keywords: ["macht", "zu"], difficulty: 4 },
  { english: "We arrive tomorrow", german: "Wir kommen morgen an", hints: ["ankommen = to arrive", "'an' to end"], keywords: ["kommen", "an"], difficulty: 5 },
  { english: "She brings the children", german: "Sie bringt die Kinder mit", hints: ["mitbringen = to bring along", "'mit' to end"], keywords: ["bringt", "mit"], difficulty: 6 },
  { english: "I turn off the light", german: "Ich mache das Licht aus", hints: ["ausmachen = to turn off", "'aus' to end"], keywords: ["mache", "aus"], difficulty: 5 },
  { english: "He invites us", german: "Er lädt uns ein", hints: ["einladen = to invite", "'ein' to end, stem change"], keywords: ["lädt", "ein"], difficulty: 6 },
  { english: "The movie starts at 8", german: "Der Film fängt um 8 Uhr an", hints: ["anfangen = to start", "'an' to end"], keywords: ["fängt", "an"], difficulty: 6 },
  { english: "I throw away the garbage", german: "Ich werfe den Müll weg", hints: ["wegwerfen = to throw away", "'weg' to end"], keywords: ["werfe", "weg"], difficulty: 7 },
  { english: "She writes down the number", german: "Sie schreibt die Nummer auf", hints: ["aufschreiben = to write down", "'auf' to end"], keywords: ["schreibt", "auf"], difficulty: 7 },
  { english: "We give back the books", german: "Wir geben die Bücher zurück", hints: ["zurückgeben = to give back", "'zurück' to end"], keywords: ["geben", "zurück"], difficulty: 7 },
  { english: "He looks forward to the vacation", german: "Er freut sich auf den Urlaub", hints: ["sich freuen auf = to look forward to", "Reflexive + separable"], keywords: ["freut", "sich", "auf"], difficulty: 8 },
  { english: "I get dressed", german: "Ich ziehe mich an", hints: ["sich anziehen = to get dressed", "Reflexive separable verb"], keywords: ["ziehe", "an"], difficulty: 7 }
];

// A2 Two-Way Prepositions sentences
const a2TwoWayPrepositionsSentences: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I go into the school", german: "Ich gehe in die Schule", hints: ["Motion → accusative", "in + die (accusative)"], keywords: ["in", "die"], difficulty: 4 },
  { english: "I am in the school", german: "Ich bin in der Schule", hints: ["Location → dative", "in + der (dative)"], keywords: ["in", "der"], difficulty: 4 },
  { english: "He puts the book on the table", german: "Er legt das Buch auf den Tisch", hints: ["legen = motion → accusative", "auf + den"], keywords: ["auf", "den"], difficulty: 5 },
  { english: "The book is on the table", german: "Das Buch liegt auf dem Tisch", hints: ["liegen = location → dative", "auf + dem"], keywords: ["auf", "dem"], difficulty: 5 },
  { english: "She goes to the board", german: "Sie geht an die Tafel", hints: ["Motion → accusative", "an + die"], keywords: ["an", "die"], difficulty: 5 },
  { english: "The lamp hangs on the ceiling", german: "Die Lampe hängt an der Decke", hints: ["Location → dative", "an + der"], keywords: ["an", "der"], difficulty: 5 },
  { english: "The bird flies over the house", german: "Der Vogel fliegt über das Haus", hints: ["Motion → accusative", "über + das"], keywords: ["über", "das"], difficulty: 6 },
  { english: "The picture hangs above the sofa", german: "Das Bild hängt über dem Sofa", hints: ["Location → dative", "über + dem"], keywords: ["über", "dem"], difficulty: 6 },
  { english: "The cat runs under the table", german: "Die Katze läuft unter den Tisch", hints: ["Motion → accusative", "unter + den"], keywords: ["unter", "den"], difficulty: 6 },
  { english: "The cat sleeps under the table", german: "Die Katze schläft unter dem Tisch", hints: ["Location → dative", "unter + dem"], keywords: ["unter", "dem"], difficulty: 6 },
  { english: "He steps in front of the door", german: "Er tritt vor die Tür", hints: ["Motion → accusative", "vor + die"], keywords: ["vor", "die"], difficulty: 6 },
  { english: "He stands in front of the door", german: "Er steht vor der Tür", hints: ["Location → dative", "vor + der"], keywords: ["vor", "der"], difficulty: 6 },
  { english: "The dog runs behind the house", german: "Der Hund rennt hinter das Haus", hints: ["Motion → accusative", "hinter + das"], keywords: ["hinter", "das"], difficulty: 7 },
  { english: "The garden is behind the house", german: "Der Garten ist hinter dem Haus", hints: ["Location → dative", "hinter + dem"], keywords: ["hinter", "dem"], difficulty: 7 },
  { english: "She sits down next to her friend", german: "Sie setzt sich neben ihren Freund", hints: ["Motion → accusative", "neben + ihren"], keywords: ["neben", "ihren"], difficulty: 7 },
  { english: "She sits next to her friend", german: "Sie sitzt neben ihrem Freund", hints: ["Location → dative", "neben + ihrem"], keywords: ["neben", "ihrem"], difficulty: 7 },
  { english: "He places the vase between the books", german: "Er stellt die Vase zwischen die Bücher", hints: ["Motion → accusative", "zwischen + die"], keywords: ["zwischen", "die"], difficulty: 8 },
  { english: "The vase stands between the books", german: "Die Vase steht zwischen den Büchern", hints: ["Location → dative", "zwischen + den"], keywords: ["zwischen", "den"], difficulty: 8 },
  { english: "I hang the picture on the wall", german: "Ich hänge das Bild an die Wand", hints: ["hängen (transitive) → accusative", "an + die"], keywords: ["hänge", "an"], difficulty: 8 },
  { english: "The coat hangs in the closet", german: "Der Mantel hängt im Schrank", hints: ["hängen (intransitive) → dative", "im = in dem"], keywords: ["hängt", "im"], difficulty: 7 }
];

// A2 Reflexive Verbs sentences
const a2ReflexiveVerbsSentences: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I wash myself", german: "Ich wasche mich", hints: ["sich waschen", "mich = myself"], keywords: ["wasche", "mich"], difficulty: 3 },
  { english: "You are happy", german: "Du freust dich", hints: ["sich freuen = to be happy", "dich = yourself"], keywords: ["freust", "dich"], difficulty: 3 },
  { english: "She is interested in music", german: "Sie interessiert sich für Musik", hints: ["sich interessieren für", "sich = herself"], keywords: ["interessiert", "sich"], difficulty: 4 },
  { english: "We meet at 8 o'clock", german: "Wir treffen uns um 8 Uhr", hints: ["sich treffen = to meet", "uns = ourselves"], keywords: ["treffen", "uns"], difficulty: 4 },
  { english: "I remember the name", german: "Ich erinnere mich an den Namen", hints: ["sich erinnern an", "mich = myself"], keywords: ["erinnere", "mich"], difficulty: 5 },
  { english: "He hurries", german: "Er beeilt sich", hints: ["sich beeilen = to hurry", "sich = himself"], keywords: ["beeilt", "sich"], difficulty: 4 },
  { english: "Do you feel well", german: "Fühlst du dich wohl", hints: ["sich fühlen = to feel", "dich = yourself"], keywords: ["fühlst", "dich"], difficulty: 5 },
  { english: "She is looking forward to the weekend", german: "Sie freut sich auf das Wochenende", hints: ["sich freuen auf", "Accusative after 'auf'"], keywords: ["freut", "sich", "auf"], difficulty: 6 },
  { english: "I apologize", german: "Ich entschuldige mich", hints: ["sich entschuldigen", "mich = myself"], keywords: ["entschuldige", "mich"], difficulty: 5 },
  { english: "We rest", german: "Wir erholen uns", hints: ["sich erholen = to rest/relax", "uns = ourselves"], keywords: ["erholen", "uns"], difficulty: 5 },
  { english: "He is annoyed about the noise", german: "Er ärgert sich über den Lärm", hints: ["sich ärgern über", "Accusative after 'über'"], keywords: ["ärgert", "sich", "über"], difficulty: 6 },
  { english: "I am getting dressed", german: "Ich ziehe mich an", hints: ["sich anziehen", "Separable + reflexive"], keywords: ["ziehe", "mich", "an"], difficulty: 6 },
  { english: "She is taking a break", german: "Sie macht sich eine Pause", hints: ["sich eine Pause machen", "Dative reflexive"], keywords: ["macht", "sich"], difficulty: 7 },
  { english: "We are deciding", german: "Wir entscheiden uns", hints: ["sich entscheiden = to decide", "uns = ourselves"], keywords: ["entscheiden", "uns"], difficulty: 6 },
  { english: "You should relax", german: "Du sollst dich entspannen", hints: ["sich entspannen", "Modal + reflexive"], keywords: ["entspannen", "dich"], difficulty: 7 },
  { english: "He is concentrating on his work", german: "Er konzentriert sich auf seine Arbeit", hints: ["sich konzentrieren auf", "Accusative after 'auf'"], keywords: ["konzentriert", "sich"], difficulty: 7 },
  { english: "I can imagine that", german: "Ich kann mir das vorstellen", hints: ["sich vorstellen (dative)", "Dative reflexive + modal"], keywords: ["vorstellen", "mir"], difficulty: 8 },
  { english: "She is worried about her exam", german: "Sie sorgt sich um ihre Prüfung", hints: ["sich sorgen um", "Accusative after 'um'"], keywords: ["sorgt", "sich", "um"], difficulty: 8 },
  { english: "We are complaining about the service", german: "Wir beschweren uns über den Service", hints: ["sich beschweren über", "Accusative after 'über'"], keywords: ["beschweren", "uns"], difficulty: 8 },
  { english: "I am brushing my teeth", german: "Ich putze mir die Zähne", hints: ["Dative reflexive possession", "mir = my (dative)"], keywords: ["putze", "mir"], difficulty: 7 }
];

// A2 Imperative sentences
const a2ImperativeSentences: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Come", german: "Komm", hints: ["du-form: drop -st", "Informal singular"], keywords: ["komm"], difficulty: 2 },
  { english: "Come (plural)", german: "Kommt", hints: ["ihr-form: same as present", "Informal plural"], keywords: ["kommt"], difficulty: 2 },
  { english: "Come (formal)", german: "Kommen Sie", hints: ["Sie-form: infinitive + Sie", "Formal"], keywords: ["kommen", "Sie"], difficulty: 3 },
  { english: "Go", german: "Geh", hints: ["du-form: gehen → geh", "e-ending optional"], keywords: ["geh"], difficulty: 2 },
  { english: "Be quiet", german: "Sei ruhig", hints: ["sein → sei (irregular)", "du-form"], keywords: ["sei", "ruhig"], difficulty: 4 },
  { english: "Be quiet (plural)", german: "Seid ruhig", hints: ["sein → seid (irregular)", "ihr-form"], keywords: ["seid", "ruhig"], difficulty: 4 },
  { english: "Take a seat", german: "Nehmen Sie Platz", hints: ["Formal imperative", "Platz nehmen = take a seat"], keywords: ["nehmen", "Platz"], difficulty: 5 },
  { english: "Help me", german: "Hilf mir", hints: ["helfen → hilf", "Stem-vowel change"], keywords: ["hilf", "mir"], difficulty: 5 },
  { english: "Read the book", german: "Lies das Buch", hints: ["lesen → lies", "Stem-vowel change"], keywords: ["lies"], difficulty: 5 },
  { english: "Wait", german: "Warte", hints: ["warten → warte", "e-ending for -ten verbs"], keywords: ["warte"], difficulty: 3 },
  { english: "Write the letter", german: "Schreib den Brief", hints: ["schreiben → schreib", "du-form"], keywords: ["schreib"], difficulty: 4 },
  { english: "Speak louder", german: "Sprich lauter", hints: ["sprechen → sprich", "Stem-vowel change"], keywords: ["sprich", "lauter"], difficulty: 6 },
  { english: "Have patience", german: "Hab Geduld", hints: ["haben → hab", "Geduld = patience"], keywords: ["hab", "Geduld"], difficulty: 5 },
  { english: "Don't forget", german: "Vergiss nicht", hints: ["vergessen → vergiss", "nicht at end"], keywords: ["vergiss", "nicht"], difficulty: 6 },
  { english: "Get up", german: "Steh auf", hints: ["aufstehen → steh ... auf", "Separable verb"], keywords: ["steh", "auf"], difficulty: 6 },
  { english: "Close the door", german: "Mach die Tür zu", hints: ["zumachen → mach ... zu", "Separable verb"], keywords: ["mach", "zu"], difficulty: 6 },
  { english: "Turn off the light", german: "Mach das Licht aus", hints: ["ausmachen → mach ... aus", "Separable verb"], keywords: ["mach", "aus"], difficulty: 6 },
  { english: "Please sit down", german: "Setzen Sie sich bitte", hints: ["Reflexive formal imperative", "bitte = please"], keywords: ["setzen", "sich"], difficulty: 7 },
  { english: "Let's go", german: "Gehen wir", hints: ["wir-form imperative", "Same as present tense"], keywords: ["gehen", "wir"], difficulty: 5 },
  { english: "Don't be afraid", german: "Hab keine Angst", hints: ["haben imperative", "keine Angst = no fear"], keywords: ["hab", "keine"], difficulty: 7 }
];

// A2 Possessive Pronouns sentences
const a2PossessivePronounsSentences: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "My book", german: "Mein Buch", hints: ["mein + neuter noun", "Nominative"], keywords: ["mein"], difficulty: 2 },
  { english: "Your bag", german: "Deine Tasche", hints: ["dein + feminine", "-e ending for feminine"], keywords: ["deine"], difficulty: 2 },
  { english: "His car", german: "Sein Auto", hints: ["sein = his", "Neuter nominative"], keywords: ["sein"], difficulty: 2 },
  { english: "Her house", german: "Ihr Haus", hints: ["ihr = her", "Neuter nominative"], keywords: ["ihr"], difficulty: 3 },
  { english: "Our friends", german: "Unsere Freunde", hints: ["unser + plural", "-e ending for plural"], keywords: ["unsere"], difficulty: 3 },
  { english: "Your dog (informal plural)", german: "Euer Hund", hints: ["euer = your (ihr-form)", "Masculine nominative"], keywords: ["euer"], difficulty: 4 },
  { english: "Their children", german: "Ihre Kinder", hints: ["ihr (plural) = their", "Plural nominative"], keywords: ["ihre"], difficulty: 3 },
  { english: "I see your brother", german: "Ich sehe deinen Bruder", hints: ["Accusative masculine", "dein → deinen"], keywords: ["deinen"], difficulty: 5 },
  { english: "He loves his mother", german: "Er liebt seine Mutter", hints: ["Accusative feminine", "sein → seine"], keywords: ["seine"], difficulty: 5 },
  { english: "We visit our grandmother", german: "Wir besuchen unsere Großmutter", hints: ["Accusative feminine", "unser → unsere"], keywords: ["unsere"], difficulty: 5 },
  { english: "I give my father a gift", german: "Ich gebe meinem Vater ein Geschenk", hints: ["Dative masculine", "mein → meinem"], keywords: ["meinem"], difficulty: 6 },
  { english: "She helps her sister", german: "Sie hilft ihrer Schwester", hints: ["Dative feminine", "ihr → ihrer"], keywords: ["ihrer"], difficulty: 6 },
  { english: "He thanks his teacher", german: "Er dankt seinem Lehrer", hints: ["Dative masculine", "sein → seinem"], keywords: ["seinem"], difficulty: 6 },
  { english: "I write to my parents", german: "Ich schreibe meinen Eltern", hints: ["Dative plural", "mein → meinen"], keywords: ["meinen"], difficulty: 7 },
  { english: "Your son (formal)", german: "Ihr Sohn", hints: ["Ihr = your (Sie-form)", "Capitalize for formal"], keywords: ["Ihr"], difficulty: 4 },
  { english: "Our teacher is nice", german: "Unser Lehrer ist nett", hints: ["unser + masculine", "Nominative"], keywords: ["unser"], difficulty: 4 },
  { english: "I like your dress", german: "Ich mag dein Kleid", hints: ["Accusative neuter", "dein Kleid"], keywords: ["dein"], difficulty: 5 },
  { english: "His books are interesting", german: "Seine Bücher sind interessant", hints: ["Nominative plural", "sein → seine"], keywords: ["seine"], difficulty: 6 },
  { english: "We live in our house", german: "Wir wohnen in unserem Haus", hints: ["Dative neuter", "unser → unserem"], keywords: ["unserem"], difficulty: 7 },
  { english: "She plays with her friends", german: "Sie spielt mit ihren Freunden", hints: ["Dative plural", "ihr → ihren + -n"], keywords: ["ihren"], difficulty: 7 }
];

// A2 Past Tense - sein and haben
const a2PastTenseSeinhaben: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I was at the cinema yesterday", german: "Ich war gestern im Kino", hints: ["war = was (ich)", "im = in dem"], keywords: ["war", "gestern"], difficulty: 3 },
  { english: "You were very nice", german: "Du warst sehr nett", hints: ["warst = were (du)", "sehr = very"], keywords: ["warst", "nett"], difficulty: 3 },
  { english: "She was tired", german: "Sie war müde", hints: ["war = was (sie)", "müde = tired"], keywords: ["war", "müde"], difficulty: 3 },
  { english: "We were in Berlin", german: "Wir waren in Berlin", hints: ["waren = were (wir)", "Plural form"], keywords: ["waren"], difficulty: 3 },
  { english: "You were happy (plural)", german: "Ihr wart glücklich", hints: ["wart = were (ihr)", "glücklich = happy"], keywords: ["wart", "glücklich"], difficulty: 4 },
  { english: "They were at home", german: "Sie waren zu Hause", hints: ["waren = were (sie pl.)", "zu Hause = at home"], keywords: ["waren", "Hause"], difficulty: 4 },
  { english: "I had a lot of work", german: "Ich hatte viel Arbeit", hints: ["hatte = had (ich)", "viel = a lot"], keywords: ["hatte", "viel"], difficulty: 4 },
  { english: "You had no time", german: "Du hattest keine Zeit", hints: ["hattest = had (du)", "keine = no"], keywords: ["hattest", "keine"], difficulty: 4 },
  { english: "He had a good idea", german: "Er hatte eine gute Idee", hints: ["hatte = had (er)", "gute Idee"], keywords: ["hatte", "gute"], difficulty: 4 },
  { english: "We had a car", german: "Wir hatten ein Auto", hints: ["hatten = had (wir)", "Plural form"], keywords: ["hatten"], difficulty: 4 },
  { english: "She had many friends", german: "Sie hatte viele Freunde", hints: ["hatte = had (sie)", "viele = many"], keywords: ["hatte", "viele"], difficulty: 5 },
  { english: "It was cold", german: "Es war kalt", hints: ["war = was", "kalt = cold"], keywords: ["war", "kalt"], difficulty: 3 },
  { english: "The weather was beautiful", german: "Das Wetter war schön", hints: ["war = was", "schön = beautiful"], keywords: ["Wetter", "war"], difficulty: 5 },
  { english: "We were students", german: "Wir waren Studenten", hints: ["waren = were", "No article before profession/status"], keywords: ["waren", "Studenten"], difficulty: 5 },
  { english: "I had a question", german: "Ich hatte eine Frage", hints: ["hatte = had", "eine Frage = a question"], keywords: ["hatte", "Frage"], difficulty: 5 },
  { english: "You were right", german: "Du hattest recht", hints: ["recht haben = to be right", "Past: hattest recht"], keywords: ["hattest", "recht"], difficulty: 6 },
  { english: "They had luck", german: "Sie hatten Glück", hints: ["Glück haben = to have luck", "hatten = had"], keywords: ["hatten", "Glück"], difficulty: 6 },
  { english: "Were you at the party", german: "Warst du auf der Party", hints: ["Question: warst du", "auf der Party = at the party"], keywords: ["warst", "Party"], difficulty: 6 },
  { english: "I was not hungry", german: "Ich war nicht hungrig", hints: ["war nicht = was not", "hungrig = hungry"], keywords: ["war", "nicht"], difficulty: 6 },
  { english: "We had no money", german: "Wir hatten kein Geld", hints: ["hatten kein = had no", "Geld = money"], keywords: ["hatten", "kein"], difficulty: 6 }
];

// A2 Subordinating Conjunctions
const a2SubordinatingConjunctions: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I learn German because it is interesting", german: "Ich lerne Deutsch, weil es interessant ist", hints: ["weil = because", "Verb goes to end"], keywords: ["weil", "ist"], difficulty: 4 },
  { english: "He says that he is tired", german: "Er sagt, dass er müde ist", hints: ["dass = that", "Verb to end"], keywords: ["dass", "ist"], difficulty: 4 },
  { english: "If you have time, we can meet", german: "Wenn du Zeit hast, können wir uns treffen", hints: ["wenn = if/when", "Verb to end in clause"], keywords: ["wenn", "hast"], difficulty: 5 },
  { english: "She stays home because she is sick", german: "Sie bleibt zu Hause, weil sie krank ist", hints: ["weil = because", "ist at end"], keywords: ["weil", "krank"], difficulty: 5 },
  { english: "I think that you are right", german: "Ich denke, dass du recht hast", hints: ["dass = that", "hast to end"], keywords: ["dass", "hast"], difficulty: 5 },
  { english: "When it rains, I stay inside", german: "Wenn es regnet, bleibe ich drinnen", hints: ["wenn = when", "regnet at end"], keywords: ["wenn", "regnet"], difficulty: 5 },
  { english: "Although it is late, I am not tired", german: "Obwohl es spät ist, bin ich nicht müde", hints: ["obwohl = although", "ist at end"], keywords: ["obwohl", "ist"], difficulty: 6 },
  { english: "She is happy because she passed the test", german: "Sie ist glücklich, weil sie die Prüfung bestanden hat", hints: ["weil + perfect tense", "hat at very end"], keywords: ["weil", "bestanden", "hat"], difficulty: 7 },
  { english: "I know that he can speak German", german: "Ich weiß, dass er Deutsch sprechen kann", hints: ["dass with modal", "kann to end"], keywords: ["dass", "kann"], difficulty: 6 },
  { english: "When I am hungry, I eat", german: "Wenn ich hungrig bin, esse ich", hints: ["wenn = when", "bin at end of clause"], keywords: ["wenn", "bin"], difficulty: 6 },
  { english: "He works hard because he wants to succeed", german: "Er arbeitet hart, weil er erfolgreich sein will", hints: ["weil + modal", "will at end"], keywords: ["weil", "will"], difficulty: 7 },
  { english: "I believe that she is coming", german: "Ich glaube, dass sie kommt", hints: ["dass = that", "kommt to end"], keywords: ["glaube", "dass"], difficulty: 5 },
  { english: "If you want, you can come", german: "Wenn du willst, kannst du kommen", hints: ["wenn = if", "willst at end"], keywords: ["wenn", "willst"], difficulty: 6 },
  { english: "She says that the movie is good", german: "Sie sagt, dass der Film gut ist", hints: ["dass = that", "ist to end"], keywords: ["sagt", "dass"], difficulty: 6 },
  { english: "Although he studies, he fails", german: "Obwohl er lernt, fällt er durch", hints: ["obwohl = although", "lernt at end"], keywords: ["obwohl", "lernt"], difficulty: 7 },
  { english: "I stay home when I am sick", german: "Ich bleibe zu Hause, wenn ich krank bin", hints: ["wenn = when", "bin at end"], keywords: ["wenn", "bin"], difficulty: 6 },
  { english: "He is sad because his dog died", german: "Er ist traurig, weil sein Hund gestorben ist", hints: ["weil + perfect", "ist at end"], keywords: ["weil", "gestorben"], difficulty: 8 },
  { english: "I know that you have been waiting", german: "Ich weiß, dass du gewartet hast", hints: ["dass + perfect", "hast at end"], keywords: ["dass", "gewartet"], difficulty: 8 },
  { english: "When the sun shines, we go outside", german: "Wenn die Sonne scheint, gehen wir nach draußen", hints: ["wenn = when", "scheint at end"], keywords: ["wenn", "scheint"], difficulty: 7 },
  { english: "She doesn't come because she has no time", german: "Sie kommt nicht, weil sie keine Zeit hat", hints: ["weil = because", "hat at end"], keywords: ["weil", "hat"], difficulty: 7 }
];

// A2 Coordinating Conjunctions
const a2CoordinatingConjunctions: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I go home and I eat", german: "Ich gehe nach Hause und ich esse", hints: ["und = and", "No word order change"], keywords: ["und"], difficulty: 2 },
  { english: "She is nice but sometimes loud", german: "Sie ist nett, aber manchmal laut", hints: ["aber = but", "No word order change"], keywords: ["aber"], difficulty: 3 },
  { english: "Do you want coffee or tea", german: "Willst du Kaffee oder Tee", hints: ["oder = or", "No word order change"], keywords: ["oder"], difficulty: 2 },
  { english: "I stay here because it is raining", german: "Ich bleibe hier, denn es regnet", hints: ["denn = because", "No word order change"], keywords: ["denn"], difficulty: 4 },
  { english: "He works and she studies", german: "Er arbeitet und sie studiert", hints: ["und = and", "Normal word order both sides"], keywords: ["und"], difficulty: 3 },
  { english: "I am tired but I continue", german: "Ich bin müde, aber ich mache weiter", hints: ["aber = but", "Normal word order"], keywords: ["aber"], difficulty: 4 },
  { english: "We can walk or take the bus", german: "Wir können laufen oder den Bus nehmen", hints: ["oder = or", "Two infinitives"], keywords: ["oder"], difficulty: 4 },
  { english: "She didn't come because she was sick", german: "Sie kam nicht, denn sie war krank", hints: ["denn = because", "War stays in position 2"], keywords: ["denn"], difficulty: 5 },
  { english: "I like apples and pears", german: "Ich mag Äpfel und Birnen", hints: ["und = and", "Connecting nouns"], keywords: ["und"], difficulty: 3 },
  { english: "He is young but very smart", german: "Er ist jung, aber sehr klug", hints: ["aber = but", "Connecting adjectives"], keywords: ["aber"], difficulty: 4 },
  { english: "Should I call or write", german: "Soll ich anrufen oder schreiben", hints: ["oder = or", "Two infinitives"], keywords: ["oder"], difficulty: 5 },
  { english: "I don't like it because it is boring", german: "Ich mag es nicht, denn es ist langweilig", hints: ["denn = because", "ist stays position 2"], keywords: ["denn"], difficulty: 5 },
  { english: "She reads and he watches TV", german: "Sie liest und er sieht fern", hints: ["und = and", "Two complete clauses"], keywords: ["und"], difficulty: 5 },
  { english: "It is cheap but not good", german: "Es ist billig, aber nicht gut", hints: ["aber = but", "Connecting adjectives"], keywords: ["aber"], difficulty: 4 },
  { english: "Coffee or tea or water", german: "Kaffee oder Tee oder Wasser", hints: ["oder = or", "Multiple items"], keywords: ["oder"], difficulty: 3 },
  { english: "I wanted to go but it was too late", german: "Ich wollte gehen, aber es war zu spät", hints: ["aber = but", "Past tense both sides"], keywords: ["aber"], difficulty: 6 },
  { english: "He neither smokes nor drinks", german: "Er raucht weder noch trinkt er", hints: ["weder...noch = neither...nor", "Inverted word order after noch"], keywords: ["weder", "noch"], difficulty: 8 },
  { english: "She comes today or tomorrow", german: "Sie kommt heute oder morgen", hints: ["oder = or", "Time expressions"], keywords: ["oder"], difficulty: 4 },
  { english: "I study hard but I still fail", german: "Ich lerne fleißig, aber ich falle trotzdem durch", hints: ["aber = but", "trotzdem = still/nevertheless"], keywords: ["aber", "trotzdem"], difficulty: 7 },
  { english: "We eat and then we sleep", german: "Wir essen und dann schlafen wir", hints: ["und dann = and then", "dann triggers inversion"], keywords: ["und", "dann"], difficulty: 6 }
];

// A2 Superlative Adjectives
const a2SuperlativeAdjectives: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "This is the fastest car", german: "Das ist das schnellste Auto", hints: ["schnell → schnellste", "Definite article + -ste"], keywords: ["schnellste"], difficulty: 4 },
  { english: "She is the smartest student", german: "Sie ist die klügste Studentin", hints: ["klug → klügste", "Umlaut + -ste"], keywords: ["klügste"], difficulty: 4 },
  { english: "He runs the fastest", german: "Er läuft am schnellsten", hints: ["am + adjective + -sten", "Adverbial form"], keywords: ["am", "schnellsten"], difficulty: 4 },
  { english: "This is the biggest house", german: "Das ist das größte Haus", hints: ["groß → größte", "Umlaut + -ste"], keywords: ["größte"], difficulty: 4 },
  { english: "She sings the best", german: "Sie singt am besten", hints: ["Irregular: gut → am besten", "Not 'gutesten'!"], keywords: ["am", "besten"], difficulty: 5 },
  { english: "He has the most money", german: "Er hat das meiste Geld", hints: ["Irregular: viel → meiste", "das meiste"], keywords: ["meiste"], difficulty: 5 },
  { english: "This is the most beautiful flower", german: "Das ist die schönste Blume", hints: ["schön → schönste", "Umlaut + -ste"], keywords: ["schönste"], difficulty: 5 },
  { english: "Winter is the coldest season", german: "Winter ist die kälteste Jahreszeit", hints: ["kalt → kälteste", "Umlaut + -este"], keywords: ["kälteste"], difficulty: 5 },
  { english: "She is the oldest", german: "Sie ist die Älteste", hints: ["alt → Älteste", "Capitalized as noun"], keywords: ["Älteste"], difficulty: 6 },
  { english: "This street is the longest", german: "Diese Straße ist die längste", hints: ["lang → längste", "Umlaut + -ste"], keywords: ["längste"], difficulty: 5 },
  { english: "He learns the most", german: "Er lernt am meisten", hints: ["Irregular: viel → am meisten", "Adverbial"], keywords: ["am", "meisten"], difficulty: 6 },
  { english: "This is the most expensive restaurant", german: "Das ist das teuerste Restaurant", hints: ["teuer → teuerste", "Drop -e before -ste"], keywords: ["teuerste"], difficulty: 6 },
  { english: "She is the youngest in the class", german: "Sie ist die Jüngste in der Klasse", hints: ["jung → Jüngste", "Capitalized"], keywords: ["Jüngste"], difficulty: 6 },
  { english: "This is the closest supermarket", german: "Das ist der nächste Supermarkt", hints: ["Irregular: nah → nächste", "Different stem"], keywords: ["nächste"], difficulty: 7 },
  { english: "He speaks the loudest", german: "Er spricht am lautesten", hints: ["laut → am lautesten", "Adverbial form"], keywords: ["am", "lautesten"], difficulty: 6 },
  { english: "This is the most interesting book", german: "Das ist das interessanteste Buch", hints: ["interessant → interessanteste", "Long adjectives too"], keywords: ["interessanteste"], difficulty: 7 },
  { english: "She works the hardest", german: "Sie arbeitet am härtesten", hints: ["hart → am härtesten", "Umlaut"], keywords: ["am", "härtesten"], difficulty: 7 },
  { english: "This is the highest mountain", german: "Das ist der höchste Berg", hints: ["Irregular: hoch → höchste", "Different stem"], keywords: ["höchste"], difficulty: 7 },
  { english: "He has the fewest mistakes", german: "Er hat die wenigsten Fehler", hints: ["Irregular: wenig → wenigsten", "die wenigsten"], keywords: ["wenigsten"], difficulty: 8 },
  { english: "This is the most popular song", german: "Das ist das beliebteste Lied", hints: ["beliebt → beliebteste", "Long adjective"], keywords: ["beliebteste"], difficulty: 7 }
];

// A2 Time Expressions
const a2TimeExpressions: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "What time is it", german: "Wie spät ist es", hints: ["Wie spät = what time", "Standard question"], keywords: ["spät"], difficulty: 2 },
  { english: "It is 3 o'clock", german: "Es ist drei Uhr", hints: ["Uhr = o'clock", "Use cardinal numbers"], keywords: ["Uhr"], difficulty: 2 },
  { english: "At what time", german: "Um wie viel Uhr", hints: ["Um = at (time)", "wie viel Uhr"], keywords: ["um"], difficulty: 3 },
  { english: "I come at 8 o'clock", german: "Ich komme um 8 Uhr", hints: ["um + time", "Accusative"], keywords: ["um"], difficulty: 3 },
  { english: "In the morning", german: "Morgens", hints: ["morgens = in the morning", "Adverb"], keywords: ["morgens"], difficulty: 3 },
  { english: "In the afternoon", german: "Nachmittags", hints: ["nachmittags = in the afternoon", "Adverb"], keywords: ["nachmittags"], difficulty: 3 },
  { english: "In the evening", german: "Abends", hints: ["abends = in the evening", "Adverb"], keywords: ["abends"], difficulty: 3 },
  { english: "Today", german: "Heute", hints: ["heute = today", "Accusative time"], keywords: ["heute"], difficulty: 2 },
  { english: "Yesterday", german: "Gestern", hints: ["gestern = yesterday", "Accusative time"], keywords: ["gestern"], difficulty: 2 },
  { english: "Tomorrow", german: "Morgen", hints: ["morgen = tomorrow", "Not 'Morgen' (morning)"], keywords: ["morgen"], difficulty: 2 },
  { english: "Last week", german: "Letzte Woche", hints: ["letzte = last", "Accusative"], keywords: ["letzte"], difficulty: 4 },
  { english: "Next year", german: "Nächstes Jahr", hints: ["nächstes = next", "Accusative neuter"], keywords: ["nächstes"], difficulty: 4 },
  { english: "This month", german: "Diesen Monat", hints: ["diesen = this", "Accusative masculine"], keywords: ["diesen"], difficulty: 5 },
  { english: "It is 15 o'clock", german: "Es ist 15 Uhr", hints: ["24-hour format", "15 Uhr = 3 PM"], keywords: ["15"], difficulty: 4 },
  { english: "On Monday", german: "Am Montag", hints: ["am = on (days)", "Dative"], keywords: ["am"], difficulty: 4 },
  { english: "In January", german: "Im Januar", hints: ["im = in (months)", "Dative"], keywords: ["im"], difficulty: 4 },
  { english: "Every day", german: "Jeden Tag", hints: ["jeden = every", "Accusative"], keywords: ["jeden"], difficulty: 5 },
  { english: "At night", german: "Nachts", hints: ["nachts = at night", "Adverb"], keywords: ["nachts"], difficulty: 4 },
  { english: "I work from Monday to Friday", german: "Ich arbeite von Montag bis Freitag", hints: ["von...bis = from...to", "No article"], keywords: ["von", "bis"], difficulty: 6 },
  { english: "The day after tomorrow", german: "Übermorgen", hints: ["übermorgen = day after tomorrow", "One word"], keywords: ["übermorgen"], difficulty: 6 }
];

// A2 Dative Verbs
const a2DativeVerbs: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I help you", german: "Ich helfe dir", hints: ["helfen takes dative", "dir = to you"], keywords: ["helfe", "dir"], difficulty: 3 },
  { english: "She thanks him", german: "Sie dankt ihm", hints: ["danken takes dative", "ihm = to him"], keywords: ["dankt", "ihm"], difficulty: 3 },
  { english: "I like the book", german: "Das Buch gefällt mir", hints: ["gefallen takes dative", "mir = to me, literally 'pleases me'"], keywords: ["gefällt", "mir"], difficulty: 5 },
  { english: "The car belongs to my father", german: "Das Auto gehört meinem Vater", hints: ["gehören takes dative", "meinem Vater"], keywords: ["gehört", "meinem"], difficulty: 4 },
  { english: "The dog follows the child", german: "Der Hund folgt dem Kind", hints: ["folgen takes dative", "dem Kind"], keywords: ["folgt", "dem"], difficulty: 4 },
  { english: "He answers me", german: "Er antwortet mir", hints: ["antworten takes dative", "mir = to me"], keywords: ["antwortet", "mir"], difficulty: 4 },
  { english: "I congratulate you", german: "Ich gratuliere dir", hints: ["gratulieren takes dative", "dir = to you"], keywords: ["gratuliere", "dir"], difficulty: 5 },
  { english: "The shoes fit me", german: "Die Schuhe passen mir", hints: ["passen takes dative", "mir = to me"], keywords: ["passen", "mir"], difficulty: 5 },
  { english: "He trusts her", german: "Er vertraut ihr", hints: ["vertrauen takes dative", "ihr = to her"], keywords: ["vertraut", "ihr"], difficulty: 6 },
  { english: "It is important to me", german: "Es ist mir wichtig", hints: ["wichtig sein takes dative", "mir = to me"], keywords: ["mir", "wichtig"], difficulty: 6 },
  { english: "The movie pleases us", german: "Der Film gefällt uns", hints: ["gefallen takes dative", "uns = to us"], keywords: ["gefällt", "uns"], difficulty: 5 },
  { english: "I believe you", german: "Ich glaube dir", hints: ["glauben takes dative", "dir = you"], keywords: ["glaube", "dir"], difficulty: 6 },
  { english: "The house belongs to them", german: "Das Haus gehört ihnen", hints: ["gehören takes dative", "ihnen = to them"], keywords: ["gehört", "ihnen"], difficulty: 6 },
  { english: "She listens to him", german: "Sie hört ihm zu", hints: ["zuhören takes dative", "Separable verb"], keywords: ["hört", "zu"], difficulty: 7 },
  { english: "I meet him", german: "Ich begegne ihm", hints: ["begegnen takes dative", "ihm = to him"], keywords: ["begegne", "ihm"], difficulty: 7 },
  { english: "The book is missing to me", german: "Das Buch fehlt mir", hints: ["fehlen takes dative", "mir = to me"], keywords: ["fehlt", "mir"], difficulty: 7 },
  { english: "He advises me", german: "Er rät mir", hints: ["raten takes dative", "mir = to me"], keywords: ["rät", "mir"], difficulty: 7 },
  { english: "I forgive you", german: "Ich verzeihe dir", hints: ["verzeihen takes dative", "dir = you"], keywords: ["verzeihe", "dir"], difficulty: 8 },
  { english: "It is cold to me", german: "Mir ist kalt", hints: ["Dative for personal feelings", "mir = to me"], keywords: ["mir", "kalt"], difficulty: 6 },
  { english: "The color suits you", german: "Die Farbe steht dir", hints: ["stehen (suit) takes dative", "dir = you"], keywords: ["steht", "dir"], difficulty: 8 }
];

// A2 Adjective Endings
const a2AdjectiveEndings: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The tall man", german: "Der große Mann", hints: ["Masculine nominative", "große (weak ending)"], keywords: ["große"], difficulty: 4 },
  { english: "The beautiful woman", german: "Die schöne Frau", hints: ["Feminine nominative", "schöne (weak ending)"], keywords: ["schöne"], difficulty: 4 },
  { english: "The small child", german: "Das kleine Kind", hints: ["Neuter nominative", "kleine (weak ending)"], keywords: ["kleine"], difficulty: 4 },
  { english: "I see the tall man", german: "Ich sehe den großen Mann", hints: ["Masculine accusative", "großen (weak ending)"], keywords: ["großen"], difficulty: 5 },
  { english: "I see the beautiful woman", german: "Ich sehe die schöne Frau", hints: ["Feminine accusative", "schöne (same as nom)"], keywords: ["schöne"], difficulty: 5 },
  { english: "I see the small child", german: "Ich sehe das kleine Kind", hints: ["Neuter accusative", "kleine (same as nom)"], keywords: ["kleine"], difficulty: 5 },
  { english: "With the tall man", german: "Mit dem großen Mann", hints: ["Masculine dative", "großen (weak ending)"], keywords: ["großen"], difficulty: 6 },
  { english: "With the beautiful woman", german: "Mit der schönen Frau", hints: ["Feminine dative", "schönen (weak ending)"], keywords: ["schönen"], difficulty: 6 },
  { english: "With the small child", german: "Mit dem kleinen Kind", hints: ["Neuter dative", "kleinen (weak ending)"], keywords: ["kleinen"], difficulty: 6 },
  { english: "The old houses", german: "Die alten Häuser", hints: ["Plural nominative", "alten (weak ending)"], keywords: ["alten"], difficulty: 6 },
  { english: "I see the old houses", german: "Ich sehe die alten Häuser", hints: ["Plural accusative", "alten (same as nom)"], keywords: ["alten"], difficulty: 6 },
  { english: "With the old houses", german: "Mit den alten Häusern", hints: ["Plural dative", "alten + -n on noun"], keywords: ["alten"], difficulty: 7 },
  { english: "A good idea", german: "Eine gute Idee", hints: ["After 'ein': mixed ending", "gute"], keywords: ["gute"], difficulty: 5 },
  { english: "I have a good idea", german: "Ich habe eine gute Idee", hints: ["Accusative feminine", "gute (same)"], keywords: ["gute"], difficulty: 5 },
  { english: "With a good friend", german: "Mit einem guten Freund", hints: ["Dative masculine", "guten (mixed ending)"], keywords: ["guten"], difficulty: 7 },
  { english: "The red car is fast", german: "Das rote Auto ist schnell", hints: ["Neuter nominative", "rote (weak)"], keywords: ["rote"], difficulty: 6 },
  { english: "I buy the red car", german: "Ich kaufe das rote Auto", hints: ["Neuter accusative", "rote (same)"], keywords: ["rote"], difficulty: 6 },
  { english: "The new teacher is nice", german: "Der neue Lehrer ist nett", hints: ["Masculine nominative", "neue (weak)"], keywords: ["neue"], difficulty: 6 },
  { english: "I know the new teacher", german: "Ich kenne den neuen Lehrer", hints: ["Masculine accusative", "neuen (weak)"], keywords: ["neuen"], difficulty: 7 },
  { english: "The young students learn fast", german: "Die jungen Studenten lernen schnell", hints: ["Plural nominative", "jungen (weak)"], keywords: ["jungen"], difficulty: 7 }
];

// A2 Future Tense
const a2FutureTense: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I will come tomorrow", german: "Ich werde morgen kommen", hints: ["werden + infinitive", "Infinitive at end"], keywords: ["werde", "kommen"], difficulty: 4 },
  { english: "She will learn German", german: "Sie wird Deutsch lernen", hints: ["wird = will (sie)", "lernen at end"], keywords: ["wird", "lernen"], difficulty: 4 },
  { english: "We will drive to Berlin", german: "Wir werden nach Berlin fahren", hints: ["werden = will (wir)", "fahren at end"], keywords: ["werden", "fahren"], difficulty: 4 },
  { english: "You will be late", german: "Du wirst zu spät sein", hints: ["wirst = will (du)", "sein at end"], keywords: ["wirst", "sein"], difficulty: 5 },
  { english: "He will call you", german: "Er wird dich anrufen", hints: ["wird + infinitive", "Separable verb"], keywords: ["wird", "anrufen"], difficulty: 5 },
  { english: "They will help us", german: "Sie werden uns helfen", hints: ["werden = will (sie pl.)", "helfen at end"], keywords: ["werden", "helfen"], difficulty: 5 },
  { english: "I will not come", german: "Ich werde nicht kommen", hints: ["nicht before infinitive", "Negation"], keywords: ["werde", "nicht"], difficulty: 6 },
  { english: "Will you come", german: "Wirst du kommen", hints: ["Question: wirst du", "Infinitive at end"], keywords: ["wirst"], difficulty: 5 },
  { english: "She will probably be at home", german: "Sie wird wohl zu Hause sein", hints: ["Future for probability", "wohl = probably"], keywords: ["wird", "wohl"], difficulty: 7 },
  { english: "We will see", german: "Wir werden sehen", hints: ["werden + sehen", "Common phrase"], keywords: ["werden", "sehen"], difficulty: 5 },
  { english: "It will rain", german: "Es wird regnen", hints: ["Weather with future", "wird regnen"], keywords: ["wird", "regnen"], difficulty: 5 },
  { english: "He will be successful", german: "Er wird erfolgreich sein", hints: ["Adjective + sein", "sein at end"], keywords: ["wird", "erfolgreich"], difficulty: 6 },
  { english: "When will you arrive", german: "Wann wirst du ankommen", hints: ["Question word + future", "ankommen at end"], keywords: ["wann", "wirst"], difficulty: 6 },
  { english: "I will have to work", german: "Ich werde arbeiten müssen", hints: ["Future with modal", "Double infinitive at end"], keywords: ["werde", "müssen"], difficulty: 8 },
  { english: "She will probably know", german: "Sie wird es wohl wissen", hints: ["Future = probability", "wohl = probably"], keywords: ["wird", "wohl"], difficulty: 7 },
  { english: "We will move next month", german: "Wir werden nächsten Monat umziehen", hints: ["Future with separable", "umziehen at end"], keywords: ["werden", "umziehen"], difficulty: 7 },
  { english: "You will understand", german: "Du wirst verstehen", hints: ["Simple future", "verstehen at end"], keywords: ["wirst", "verstehen"], difficulty: 6 },
  { english: "They will not believe it", german: "Sie werden es nicht glauben", hints: ["Negation with future", "nicht before infinitive"], keywords: ["werden", "nicht"], difficulty: 7 },
  { english: "He will have time", german: "Er wird Zeit haben", hints: ["Future of haben", "haben at end"], keywords: ["wird", "haben"], difficulty: 6 },
  { english: "What will you do", german: "Was wirst du machen", hints: ["Question: was wirst du", "machen at end"], keywords: ["was", "wirst"], difficulty: 7 }
];

// ============== B1 SENTENCES ==============

// B1 Subordinate Clauses
const b1SubordinateClauses: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I stay home because it is raining", german: "Ich bleibe zu Hause, weil es regnet", hints: ["weil = because", "Verb to end"], keywords: ["weil", "regnet"], difficulty: 4 },
  { english: "He says that he is tired", german: "Er sagt, dass er müde ist", hints: ["dass = that", "ist at end"], keywords: ["dass", "ist"], difficulty: 4 },
  { english: "If you have time, call me", german: "Wenn du Zeit hast, ruf mich an", hints: ["wenn = if", "hast at end, main clause starts with verb"], keywords: ["wenn", "hast"], difficulty: 5 },
  { english: "She doesn't come because she is sick", german: "Sie kommt nicht, weil sie krank ist", hints: ["weil = because", "ist at end"], keywords: ["weil", "krank"], difficulty: 5 },
  { english: "I know that you are right", german: "Ich weiß, dass du recht hast", hints: ["dass = that", "hast at end"], keywords: ["dass", "hast"], difficulty: 5 },
  { english: "Although it is cold, I go outside", german: "Obwohl es kalt ist, gehe ich nach draußen", hints: ["obwohl = although", "Main verb immediately after comma"], keywords: ["obwohl", "ist"], difficulty: 6 },
  { english: "He works hard so that he succeeds", german: "Er arbeitet hart, damit er Erfolg hat", hints: ["damit = so that", "hat at end"], keywords: ["damit", "hat"], difficulty: 6 },
  { english: "Since I don't have time, I can't come", german: "Da ich keine Zeit habe, kann ich nicht kommen", hints: ["da = since/because", "kann immediately after comma"], keywords: ["da", "habe"], difficulty: 6 },
  { english: "I'll wait until you come", german: "Ich warte, bis du kommst", hints: ["bis = until", "kommst at end"], keywords: ["bis", "kommst"], difficulty: 5 },
  { english: "Before you go, we should talk", german: "Bevor du gehst, sollten wir sprechen", hints: ["bevor = before", "sollten immediately after"], keywords: ["bevor", "gehst"], difficulty: 7 },
  { english: "After I had eaten, I went to bed", german: "Nachdem ich gegessen hatte, ging ich ins Bett", hints: ["nachdem = after", "Past perfect + preterite"], keywords: ["nachdem", "hatte"], difficulty: 8 },
  { english: "While he was sleeping, I worked", german: "Während er schlief, arbeitete ich", hints: ["während = while", "Preterite in both clauses"], keywords: ["während", "schlief"], difficulty: 7 },
  { english: "As soon as I arrive, I'll call you", german: "Sobald ich ankomme, rufe ich dich an", hints: ["sobald = as soon as", "Present for future"], keywords: ["sobald", "ankomme"], difficulty: 7 },
  { english: "I learned German so that I could work in Germany", german: "Ich lernte Deutsch, damit ich in Deutschland arbeiten konnte", hints: ["damit + modal", "konnte at end"], keywords: ["damit", "konnte"], difficulty: 8 },
  { english: "Even though he studied, he failed", german: "Obwohl er gelernt hatte, fiel er durch", hints: ["obwohl + past perfect", "hatte at end"], keywords: ["obwohl", "hatte"], difficulty: 8 },
  { english: "I don't know whether he is coming", german: "Ich weiß nicht, ob er kommt", hints: ["ob = whether/if", "kommt at end"], keywords: ["ob", "kommt"], difficulty: 6 },
  { english: "Since it was raining, we stayed inside", german: "Weil es regnete, blieben wir drinnen", hints: ["weil + preterite", "blieben after comma"], keywords: ["weil", "regnete"], difficulty: 7 },
  { english: "Unless you hurry, you'll be late", german: "Wenn du dich nicht beeilst, wirst du zu spät kommen", hints: ["wenn + nicht = unless", "Future tense"], keywords: ["wenn", "beeilst"], difficulty: 8 },
  { english: "As far as I know, he lives in Berlin", german: "Soweit ich weiß, wohnt er in Berlin", hints: ["soweit = as far as", "weiß at end"], keywords: ["soweit", "weiß"], difficulty: 8 },
  { english: "The fact that he didn't come worries me", german: "Dass er nicht gekommen ist, macht mir Sorgen", hints: ["dass-clause as subject", "ist at end of clause"], keywords: ["dass", "ist"], difficulty: 9 }
];

// B1 Genitive Case
const b1GenitiveCase: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The man's car", german: "Das Auto des Mannes", hints: ["des Mannes (genitive)", "Add -s to masculine noun"], keywords: ["des", "Mannes"], difficulty: 5 },
  { english: "My parents' house", german: "Das Haus meiner Eltern", hints: ["meiner Eltern (genitive plural)", "No -s added to plural"], keywords: ["meiner", "Eltern"], difficulty: 5 },
  { english: "The color of the sky", german: "Die Farbe des Himmels", hints: ["des Himmels (genitive)", "Himmel + -s"], keywords: ["des", "Himmels"], difficulty: 5 },
  { english: "The woman's bag", german: "Die Tasche der Frau", hints: ["der Frau (genitive feminine)", "No -s on feminine nouns"], keywords: ["der", "Frau"], difficulty: 5 },
  { english: "The child's toy", german: "Das Spielzeug des Kindes", hints: ["des Kindes (genitive neuter)", "Kind + -es"], keywords: ["des", "Kindes"], difficulty: 6 },
  { english: "My brother's friend", german: "Der Freund meines Bruders", hints: ["meines Bruders (genitive)", "Bruder + -s"], keywords: ["meines", "Bruders"], difficulty: 6 },
  { english: "The door of the house", german: "Die Tür des Hauses", hints: ["des Hauses (genitive)", "Haus + -es"], keywords: ["des", "Hauses"], difficulty: 6 },
  { english: "The teacher's book", german: "Das Buch des Lehrers", hints: ["des Lehrers (genitive)", "Lehrer + -s"], keywords: ["des", "Lehrers"], difficulty: 6 },
  { english: "The beginning of the year", german: "Der Anfang des Jahres", hints: ["des Jahres (genitive)", "Jahr + -es"], keywords: ["des", "Jahres"], difficulty: 6 },
  { english: "The name of my sister", german: "Der Name meiner Schwester", hints: ["meiner Schwester (genitive)", "Name is n-declension"], keywords: ["meiner", "Schwester"], difficulty: 7 },
  { english: "The end of the movie", german: "Das Ende des Films", hints: ["des Films (genitive)", "Film + -s"], keywords: ["des", "Films"], difficulty: 6 },
  { english: "My father's car", german: "Das Auto meines Vaters", hints: ["meines Vaters (genitive)", "Vater + -s"], keywords: ["meines", "Vaters"], difficulty: 6 },
  { english: "The capital of Germany", german: "Die Hauptstadt Deutschlands", hints: ["Deutschlands (genitive)", "Country name + -s"], keywords: ["Deutschlands"], difficulty: 7 },
  { english: "The owner of the restaurant", german: "Der Besitzer des Restaurants", hints: ["des Restaurants (genitive)", "Restaurant + -s"], keywords: ["des", "Restaurants"], difficulty: 7 },
  { english: "The wife of the president", german: "Die Frau des Präsidenten", hints: ["des Präsidenten (genitive)", "Präsident is n-declension"], keywords: ["des", "Präsidenten"], difficulty: 7 },
  { english: "The result of the test", german: "Das Ergebnis des Tests", hints: ["des Tests (genitive)", "Test + -s"], keywords: ["des", "Tests"], difficulty: 7 },
  { english: "The opinion of the people", german: "Die Meinung der Leute", hints: ["der Leute (genitive plural)", "Leute = people"], keywords: ["der", "Leute"], difficulty: 7 },
  { english: "The price of the ticket", german: "Der Preis des Tickets", hints: ["des Tickets (genitive)", "Ticket + -s"], keywords: ["des", "Tickets"], difficulty: 7 },
  { english: "The center of the city", german: "Das Zentrum der Stadt", hints: ["der Stadt (genitive feminine)", "No ending on Stadt"], keywords: ["der", "Stadt"], difficulty: 7 },
  { english: "The rights of the workers", german: "Die Rechte der Arbeiter", hints: ["der Arbeiter (genitive plural)", "Arbeiter unchanged"], keywords: ["der", "Arbeiter"], difficulty: 8 }
];

// B1 Passive Voice
const b1PassiveVoice: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The car is being repaired", german: "Das Auto wird repariert", hints: ["werden + past participle", "Present passive"], keywords: ["wird", "repariert"], difficulty: 5 },
  { english: "The letter was written", german: "Der Brief wurde geschrieben", hints: ["wurde = was (passive)", "Past passive"], keywords: ["wurde", "geschrieben"], difficulty: 5 },
  { english: "The house is being built", german: "Das Haus wird gebaut", hints: ["wird gebaut", "Present passive"], keywords: ["wird", "gebaut"], difficulty: 5 },
  { english: "German is spoken here", german: "Hier wird Deutsch gesprochen", hints: ["wird gesprochen", "No agent mentioned"], keywords: ["wird", "gesprochen"], difficulty: 6 },
  { english: "The door was opened", german: "Die Tür wurde geöffnet", hints: ["wurde geöffnet", "Past passive"], keywords: ["wurde", "geöffnet"], difficulty: 6 },
  { english: "The book is read by many people", german: "Das Buch wird von vielen Leuten gelesen", hints: ["von + dative for agent", "vielen Leuten"], keywords: ["von", "gelesen"], difficulty: 7 },
  { english: "The windows are cleaned every week", german: "Die Fenster werden jede Woche geputzt", hints: ["werden + past participle (plural)", "jede Woche"], keywords: ["werden", "geputzt"], difficulty: 7 },
  { english: "The problem was solved", german: "Das Problem wurde gelöst", hints: ["wurde gelöst", "lösen = to solve"], keywords: ["wurde", "gelöst"], difficulty: 6 },
  { english: "The letter will be sent", german: "Der Brief wird geschickt werden", hints: ["Future passive", "wird...werden"], keywords: ["wird", "geschickt", "werden"], difficulty: 8 },
  { english: "The cake was made by my mother", german: "Der Kuchen wurde von meiner Mutter gemacht", hints: ["von + dative agent", "meiner Mutter"], keywords: ["von", "meiner"], difficulty: 7 },
  { english: "The meeting has been cancelled", german: "Das Treffen ist abgesagt worden", hints: ["Perfect passive", "ist...worden (not geworden!)"], keywords: ["ist", "worden"], difficulty: 8 },
  { english: "The work must be finished", german: "Die Arbeit muss beendet werden", hints: ["Modal + werden + participle", "muss...werden"], keywords: ["muss", "werden"], difficulty: 8 },
  { english: "The building was destroyed by fire", german: "Das Gebäude wurde durch Feuer zerstört", hints: ["durch for means/cause", "Feuer"], keywords: ["durch", "zerstört"], difficulty: 8 },
  { english: "Many books are sold every year", german: "Viele Bücher werden jedes Jahr verkauft", hints: ["werden verkauft (plural)", "jedes Jahr"], keywords: ["werden", "verkauft"], difficulty: 7 },
  { english: "The new law was introduced", german: "Das neue Gesetz wurde eingeführt", hints: ["wurde eingeführt", "Separable verb in passive"], keywords: ["wurde", "eingeführt"], difficulty: 8 },
  { english: "The students are being tested", german: "Die Studenten werden geprüft", hints: ["werden geprüft", "Testing in progress"], keywords: ["werden", "geprüft"], difficulty: 7 },
  { english: "The report had been written", german: "Der Bericht war geschrieben worden", hints: ["Past perfect passive", "war...worden"], keywords: ["war", "worden"], difficulty: 9 },
  { english: "The room can be rented", german: "Das Zimmer kann gemietet werden", hints: ["Modal + passive infinitive", "kann...werden"], keywords: ["kann", "werden"], difficulty: 8 },
  { english: "The decision is made by the manager", german: "Die Entscheidung wird vom Manager getroffen", hints: ["vom = von dem", "getroffen"], keywords: ["vom", "getroffen"], difficulty: 8 },
  { english: "The bridge is being repaired", german: "Die Brücke wird gerade repariert", hints: ["gerade = right now", "Present progressive passive"], keywords: ["gerade", "repariert"], difficulty: 7 }
];

// B1 Konjunktiv II
const b1KonjunktivII: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I would like to come", german: "Ich würde gerne kommen", hints: ["würde + gerne + infinitive", "Polite wish"], keywords: ["würde", "gerne"], difficulty: 5 },
  { english: "Could you help me", german: "Könntest du mir helfen", hints: ["können → könntest", "Polite request"], keywords: ["könntest", "helfen"], difficulty: 5 },
  { english: "If I had time, I would help", german: "Wenn ich Zeit hätte, würde ich helfen", hints: ["hätte = would have", "Conditional sentence"], keywords: ["hätte", "würde"], difficulty: 6 },
  { english: "He would come if he could", german: "Er würde kommen, wenn er könnte", hints: ["könnte = could", "Conditional"], keywords: ["würde", "könnte"], difficulty: 6 },
  { english: "I wish I were rich", german: "Ich wünschte, ich wäre reich", hints: ["wäre = would be", "Wish/unreal situation"], keywords: ["wünschte", "wäre"], difficulty: 7 },
  { english: "Would you like coffee", german: "Möchtest du Kaffee", hints: ["mögen → möchtest", "Polite offer"], keywords: ["möchtest"], difficulty: 5 },
  { english: "I should learn more", german: "Ich sollte mehr lernen", hints: ["sollen → sollte", "Recommendation"], keywords: ["sollte", "lernen"], difficulty: 6 },
  { english: "We could go to the cinema", german: "Wir könnten ins Kino gehen", hints: ["können → könnten", "Suggestion"], keywords: ["könnten", "gehen"], difficulty: 6 },
  { english: "If I were you, I would wait", german: "Wenn ich du wäre, würde ich warten", hints: ["Wenn ich du wäre", "Advice structure"], keywords: ["wäre", "würde"], difficulty: 7 },
  { english: "It would be nice if you came", german: "Es wäre schön, wenn du kämest", hints: ["kämest = would come", "Formal subjunctive"], keywords: ["wäre", "kämest"], difficulty: 8 },
  { english: "I would have time", german: "Ich hätte Zeit", hints: ["haben → hätte", "Simple subjunctive"], keywords: ["hätte"], difficulty: 6 },
  { english: "That wouldn't be good", german: "Das wäre nicht gut", hints: ["sein → wäre", "Negation"], keywords: ["wäre", "nicht"], difficulty: 6 },
  { english: "He would rather stay home", german: "Er würde lieber zu Hause bleiben", hints: ["lieber = rather", "Preference"], keywords: ["würde", "lieber"], difficulty: 7 },
  { english: "Could you please close the door", german: "Könnten Sie bitte die Tür schließen", hints: ["Formal polite request", "Könnten Sie"], keywords: ["könnten", "bitte"], difficulty: 7 },
  { english: "If only I had known", german: "Wenn ich das nur gewusst hätte", hints: ["Past subjunctive", "hätte + participle"], keywords: ["gewusst", "hätte"], difficulty: 9 },
  { english: "I would like to order", german: "Ich hätte gern bestellt", hints: ["hätte gern", "Restaurant context"], keywords: ["hätte", "gern"], difficulty: 7 },
  { english: "You should have called", german: "Du hättest anrufen sollen", hints: ["Past subjunctive with modal", "hättest...sollen"], keywords: ["hättest", "sollen"], difficulty: 9 },
  { english: "It would be possible", german: "Es wäre möglich", hints: ["sein → wäre", "Possibility"], keywords: ["wäre", "möglich"], difficulty: 6 },
  { english: "I wouldn't do that", german: "Ich würde das nicht machen", hints: ["würde + nicht", "Negation"], keywords: ["würde", "nicht"], difficulty: 7 },
  { english: "If he had asked, I would have helped", german: "Wenn er gefragt hätte, hätte ich geholfen", hints: ["Past conditional", "Both clauses with hätte"], keywords: ["gefragt", "hätte"], difficulty: 9 }
];

// B1 Relative Clauses
const b1RelativeClauses: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The man who is standing there is my teacher", german: "Der Mann, der dort steht, ist mein Lehrer", hints: ["der = who (masc. nom.)", "steht at end"], keywords: ["der", "steht"], difficulty: 6 },
  { english: "The book that I am reading is exciting", german: "Das Buch, das ich lese, ist spannend", hints: ["das = that (neut. acc.)", "lese at end"], keywords: ["das", "lese"], difficulty: 6 },
  { english: "The woman with whom I am speaking is nice", german: "Die Frau, mit der ich spreche, ist nett", hints: ["mit der (dative)", "spreche at end"], keywords: ["mit", "der"], difficulty: 7 },
  { english: "The car that I bought is red", german: "Das Auto, das ich gekauft habe, ist rot", hints: ["das (neut. acc.)", "habe at end"], keywords: ["das", "gekauft"], difficulty: 7 },
  { english: "The students who learn German are smart", german: "Die Studenten, die Deutsch lernen, sind klug", hints: ["die (plural nom.)", "lernen at end"], keywords: ["die", "lernen"], difficulty: 6 },
  { english: "The house that we live in is old", german: "Das Haus, in dem wir wohnen, ist alt", hints: ["in dem (dative)", "wohnen at end"], keywords: ["in", "dem"], difficulty: 7 },
  { english: "The teacher whose book I have is strict", german: "Der Lehrer, dessen Buch ich habe, ist streng", hints: ["dessen = whose (masc.)", "Genitive relative"], keywords: ["dessen", "habe"], difficulty: 8 },
  { english: "The city that I visited was beautiful", german: "Die Stadt, die ich besucht habe, war schön", hints: ["die (fem. acc.)", "habe at end"], keywords: ["die", "besucht"], difficulty: 7 },
  { english: "The friend to whom I wrote lives in Berlin", german: "Der Freund, dem ich geschrieben habe, wohnt in Berlin", hints: ["dem (masc. dative)", "habe at end"], keywords: ["dem", "geschrieben"], difficulty: 8 },
  { english: "The children whose parents work are at school", german: "Die Kinder, deren Eltern arbeiten, sind in der Schule", hints: ["deren = whose (plural)", "arbeiten at end"], keywords: ["deren", "arbeiten"], difficulty: 8 },
  { english: "The movie that we watched was boring", german: "Der Film, den wir gesehen haben, war langweilig", hints: ["den (masc. acc.)", "haben at end"], keywords: ["den", "gesehen"], difficulty: 7 },
  { english: "The woman whose car was stolen is sad", german: "Die Frau, deren Auto gestohlen wurde, ist traurig", hints: ["deren = whose (fem.)", "wurde at end"], keywords: ["deren", "wurde"], difficulty: 9 },
  { english: "The restaurant where we ate was expensive", german: "Das Restaurant, in dem wir gegessen haben, war teuer", hints: ["in dem = where", "haben at end"], keywords: ["in", "dem"], difficulty: 8 },
  { english: "The people who I met were friendly", german: "Die Leute, die ich getroffen habe, waren freundlich", hints: ["die (plural acc.)", "habe at end"], keywords: ["die", "getroffen"], difficulty: 7 },
  { english: "The dog that belongs to my neighbor is loud", german: "Der Hund, der meinem Nachbarn gehört, ist laut", hints: ["der (masc. nom.)", "gehört takes dative"], keywords: ["der", "gehört"], difficulty: 8 },
  { english: "The girl whom I helped thanked me", german: "Das Mädchen, dem ich geholfen habe, dankte mir", hints: ["dem (neut. dative)", "helfen takes dative"], keywords: ["dem", "geholfen"], difficulty: 8 },
  { english: "The place where I was born is small", german: "Der Ort, wo ich geboren wurde, ist klein", hints: ["wo = where (alternative)", "wurde at end"], keywords: ["wo", "wurde"], difficulty: 7 },
  { english: "The woman who called me is my boss", german: "Die Frau, die mich angerufen hat, ist meine Chefin", hints: ["die (fem. nom.)", "hat at end"], keywords: ["die", "angerufen"], difficulty: 7 },
  { english: "The chair on which I sit is uncomfortable", german: "Der Stuhl, auf dem ich sitze, ist unbequem", hints: ["auf dem (dative)", "sitze at end"], keywords: ["auf", "dem"], difficulty: 8 },
  { english: "The language that I am learning is difficult", german: "Die Sprache, die ich lerne, ist schwierig", hints: ["die (fem. acc.)", "lerne at end"], keywords: ["die", "lerne"], difficulty: 7 }
];

// B1 Preterite Tense (Regular Verbs) - copy from batch2
const b1PreteriteTense: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I learned German", german: "Ich lernte Deutsch", hints: ["lernen → lernte", "Regular preterite"], keywords: ["lernte"], difficulty: 5 },
  { english: "She worked yesterday", german: "Sie arbeitete gestern", hints: ["arbeiten → arbeitete", "Add -ete for -ten verbs"], keywords: ["arbeitete"], difficulty: 5 },
  { english: "We played football", german: "Wir spielten Fußball", hints: ["spielen → spielten", "Regular -ten ending"], keywords: ["spielten"], difficulty: 5 },
  { english: "He said nothing", german: "Er sagte nichts", hints: ["sagen → sagte", "Regular preterite"], keywords: ["sagte"], difficulty: 5 },
  { english: "They lived in Berlin", german: "Sie wohnten in Berlin", hints: ["wohnen → wohnten", "Regular plural"], keywords: ["wohnten"], difficulty: 5 },
  { english: "I bought a car", german: "Ich kaufte ein Auto", hints: ["kaufen → kaufte", "Regular preterite"], keywords: ["kaufte"], difficulty: 6 },
  { english: "She opened the window", german: "Sie öffnete das Fenster", hints: ["öffnen → öffnete", "Add -ete"], keywords: ["öffnete"], difficulty: 6 },
  { english: "We waited for the bus", german: "Wir warteten auf den Bus", hints: ["warten → warteten", "Add -ete for -ten verbs"], keywords: ["warteten"], difficulty: 6 },
  { english: "You showed me the way", german: "Du zeigtest mir den Weg", hints: ["zeigen → zeigtest", "Regular -test"], keywords: ["zeigtest"], difficulty: 6 },
  { english: "He answered the question", german: "Er beantwortete die Frage", hints: ["beantworten → beantwortete", "Long stem + -ete"], keywords: ["beantwortete"], difficulty: 7 },
  { english: "They searched for the key", german: "Sie suchten den Schlüssel", hints: ["suchen → suchten", "Regular plural"], keywords: ["suchten"], difficulty: 6 },
  { english: "I believed him", german: "Ich glaubte ihm", hints: ["glauben → glaubte", "Dative object"], keywords: ["glaubte"], difficulty: 6 },
  { english: "She cooked dinner", german: "Sie kochte Abendessen", hints: ["kochen → kochte", "Regular preterite"], keywords: ["kochte"], difficulty: 6 },
  { english: "We listened to music", german: "Wir hörten Musik", hints: ["hören → hörten", "Regular plural"], keywords: ["hörten"], difficulty: 6 },
  { english: "He needed help", german: "Er brauchte Hilfe", hints: ["brauchen → brauchte", "Regular preterite"], keywords: ["brauchte"], difficulty: 6 },
  { english: "I asked a question", german: "Ich stellte eine Frage", hints: ["stellen → stellte", "eine Frage stellen"], keywords: ["stellte"], difficulty: 7 },
  { english: "They cleaned the house", german: "Sie putzten das Haus", hints: ["putzen → putzten", "Regular plural"], keywords: ["putzten"], difficulty: 7 },
  { english: "She smiled at me", german: "Sie lächelte mich an", hints: ["anlächeln → lächelte...an", "Separable in preterite"], keywords: ["lächelte"], difficulty: 7 },
  { english: "We followed the road", german: "Wir folgten der Straße", hints: ["folgen → folgten", "Takes dative"], keywords: ["folgten"], difficulty: 7 },
  { english: "He placed the book on the table", german: "Er legte das Buch auf den Tisch", hints: ["legen → legte", "Regular but note accusative"], keywords: ["legte"], difficulty: 7 }
];

// B1 Preterite Irregular
const b1PreteriteIrregular: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I went home", german: "Ich ging nach Hause", hints: ["gehen → ging", "Vowel change"], keywords: ["ging"], difficulty: 6 },
  { english: "She came yesterday", german: "Sie kam gestern", hints: ["kommen → kam", "Vowel change"], keywords: ["kam"], difficulty: 6 },
  { english: "We saw the movie", german: "Wir sahen den Film", hints: ["sehen → sahen", "Vowel change"], keywords: ["sahen"], difficulty: 6 },
  { english: "He took the bus", german: "Er nahm den Bus", hints: ["nehmen → nahm", "Vowel change"], keywords: ["nahm"], difficulty: 6 },
  { english: "They gave me a gift", german: "Sie gaben mir ein Geschenk", hints: ["geben → gaben", "Dative object"], keywords: ["gaben"], difficulty: 6 },
  { english: "I found the key", german: "Ich fand den Schlüssel", hints: ["finden → fand", "Vowel change"], keywords: ["fand"], difficulty: 6 },
  { english: "She wrote a letter", german: "Sie schrieb einen Brief", hints: ["schreiben → schrieb", "Vowel change"], keywords: ["schrieb"], difficulty: 7 },
  { english: "We read the book", german: "Wir lasen das Buch", hints: ["lesen → lasen", "Vowel change"], keywords: ["lasen"], difficulty: 7 },
  { english: "He drank coffee", german: "Er trank Kaffee", hints: ["trinken → trank", "Vowel change"], keywords: ["trank"], difficulty: 7 },
  { english: "I slept well", german: "Ich schlief gut", hints: ["schlafen → schlief", "Vowel change"], keywords: ["schlief"], difficulty: 7 },
  { english: "They ran fast", german: "Sie liefen schnell", hints: ["laufen → liefen", "Vowel change"], keywords: ["liefen"], difficulty: 7 },
  { english: "She helped me", german: "Sie half mir", hints: ["helfen → half", "Takes dative"], keywords: ["half"], difficulty: 7 },
  { english: "We drove to Berlin", german: "Wir fuhren nach Berlin", hints: ["fahren → fuhren", "Vowel change"], keywords: ["fuhren"], difficulty: 7 },
  { english: "He ate the apple", german: "Er aß den Apfel", hints: ["essen → aß", "Vowel change"], keywords: ["aß"], difficulty: 7 },
  { english: "I knew the answer", german: "Ich wusste die Antwort", hints: ["wissen → wusste", "Mixed conjugation"], keywords: ["wusste"], difficulty: 8 },
  { english: "She spoke German", german: "Sie sprach Deutsch", hints: ["sprechen → sprach", "Vowel change"], keywords: ["sprach"], difficulty: 7 },
  { english: "We stood there", german: "Wir standen dort", hints: ["stehen → standen", "Vowel change"], keywords: ["standen"], difficulty: 8 },
  { english: "He thought about it", german: "Er dachte darüber nach", hints: ["nachdenken → dachte...nach", "Mixed conjugation"], keywords: ["dachte"], difficulty: 8 },
  { english: "They sang a song", german: "Sie sangen ein Lied", hints: ["singen → sangen", "Vowel change"], keywords: ["sangen"], difficulty: 8 },
  { english: "I brought flowers", german: "Ich brachte Blumen", hints: ["bringen → brachte", "Mixed conjugation"], keywords: ["brachte"], difficulty: 8 }
];

// B1 Infinitive with zu
const b1InfinitiveWithZu: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I hope to see you soon", german: "Ich hoffe, dich bald zu sehen", hints: ["hoffen + zu + infinitive", "Comma before zu-clause"], keywords: ["hoffe", "zu"], difficulty: 6 },
  { english: "It is important to learn German", german: "Es ist wichtig, Deutsch zu lernen", hints: ["Es ist + adjective + zu", "Impersonal construction"], keywords: ["wichtig", "zu"], difficulty: 6 },
  { english: "I have no time to go to the cinema", german: "Ich habe keine Zeit, ins Kino zu gehen", hints: ["Zeit haben + zu", "Separable verb with zu"], keywords: ["Zeit", "zu"], difficulty: 7 },
  { english: "She tries to be punctual", german: "Sie versucht, pünktlich zu sein", hints: ["versuchen + zu", "sein at end"], keywords: ["versucht", "zu"], difficulty: 6 },
  { english: "I forgot to call him", german: "Ich vergaß, ihn anzurufen", hints: ["vergessen + zu", "zu between prefix and verb"], keywords: ["vergaß", "anzurufen"], difficulty: 8 },
  { english: "He decided to stay", german: "Er entschied sich, zu bleiben", hints: ["sich entscheiden + zu", "Reflexive verb"], keywords: ["entschied", "zu"], difficulty: 7 },
  { english: "We promise to come", german: "Wir versprechen zu kommen", hints: ["versprechen + zu", "No comma with short clause"], keywords: ["versprechen", "zu"], difficulty: 6 },
  { english: "It is difficult to understand", german: "Es ist schwierig zu verstehen", hints: ["Es ist + adjective + zu", "No comma needed"], keywords: ["schwierig", "zu"], difficulty: 7 },
  { english: "I plan to travel to Germany", german: "Ich plane, nach Deutschland zu reisen", hints: ["planen + zu", "nach + country"], keywords: ["plane", "zu"], difficulty: 7 },
  { english: "She began to cry", german: "Sie begann zu weinen", hints: ["beginnen + zu", "No comma"], keywords: ["begann", "zu"], difficulty: 7 },
  { english: "I'm afraid to ask", german: "Ich habe Angst zu fragen", hints: ["Angst haben + zu", "No comma"], keywords: ["Angst", "zu"], difficulty: 7 },
  { english: "He offered to help me", german: "Er bot an, mir zu helfen", hints: ["anbieten + zu", "Separable verb anbieten"], keywords: ["bot", "zu"], difficulty: 8 },
  { english: "We refuse to pay", german: "Wir weigern uns zu zahlen", hints: ["sich weigern + zu", "Reflexive"], keywords: ["weigern", "zu"], difficulty: 8 },
  { english: "It is easy to learn", german: "Es ist leicht zu lernen", hints: ["Es ist + adjective + zu", "leicht = easy"], keywords: ["leicht", "zu"], difficulty: 6 },
  { english: "I advised him to wait", german: "Ich riet ihm zu warten", hints: ["raten + zu", "Dative object"], keywords: ["riet", "zu"], difficulty: 8 },
  { english: "She stopped smoking", german: "Sie hörte auf zu rauchen", hints: ["aufhören + zu", "Separable verb"], keywords: ["aufhören", "zu"], difficulty: 8 },
  { english: "I have the opportunity to work abroad", german: "Ich habe die Möglichkeit, im Ausland zu arbeiten", hints: ["Möglichkeit haben + zu", "Long zu-clause"], keywords: ["Möglichkeit", "zu"], difficulty: 8 },
  { english: "He seems to be tired", german: "Er scheint müde zu sein", hints: ["scheinen + zu", "No comma"], keywords: ["scheint", "zu"], difficulty: 7 },
  { english: "We managed to find it", german: "Es gelang uns, es zu finden", hints: ["gelingen + zu", "es gelang uns"], keywords: ["gelang", "zu"], difficulty: 9 },
  { english: "I'm looking forward to seeing you", german: "Ich freue mich darauf, dich zu sehen", hints: ["sich freuen darauf + zu", "Prepositional object"], keywords: ["darauf", "zu"], difficulty: 9 }
];

// B1 Genitive Prepositions
const b1GenitivePrepositions: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "During the day", german: "Während des Tages", hints: ["während + genitive", "des Tages"], keywords: ["während", "des"], difficulty: 6 },
  { english: "Because of the weather", german: "Wegen des Wetters", hints: ["wegen + genitive", "des Wetters"], keywords: ["wegen", "des"], difficulty: 6 },
  { english: "Despite the cold", german: "Trotz der Kälte", hints: ["trotz + genitive", "der Kälte"], keywords: ["trotz", "der"], difficulty: 6 },
  { english: "Outside the city", german: "Außerhalb der Stadt", hints: ["außerhalb + genitive", "der Stadt"], keywords: ["außerhalb", "der"], difficulty: 7 },
  { english: "Within a week", german: "Innerhalb einer Woche", hints: ["innerhalb + genitive", "einer Woche"], keywords: ["innerhalb", "einer"], difficulty: 7 },
  { english: "Instead of money", german: "Statt des Geldes", hints: ["statt + genitive", "des Geldes"], keywords: ["statt", "des"], difficulty: 7 },
  { english: "During the summer", german: "Während des Sommers", hints: ["während + genitive", "des Sommers"], keywords: ["während", "Sommers"], difficulty: 7 },
  { english: "Because of the children", german: "Wegen der Kinder", hints: ["wegen + genitive plural", "der Kinder"], keywords: ["wegen", "Kinder"], difficulty: 7 },
  { english: "Despite the rain", german: "Trotz des Regens", hints: ["trotz + genitive", "des Regens"], keywords: ["trotz", "Regens"], difficulty: 7 },
  { english: "On behalf of my father", german: "Namens meines Vaters", hints: ["namens + genitive", "meines Vaters"], keywords: ["namens", "meines"], difficulty: 8 },
  { english: "Instead of the car", german: "Anstatt des Autos", hints: ["anstatt + genitive", "des Autos"], keywords: ["anstatt", "Autos"], difficulty: 7 },
  { english: "During the meeting", german: "Während des Treffens", hints: ["während + genitive", "des Treffens"], keywords: ["während", "Treffens"], difficulty: 7 },
  { english: "Because of me", german: "Meinetwegen", hints: ["wegen + genitive pronoun", "One word!"], keywords: ["meinetwegen"], difficulty: 8 },
  { english: "On the other side of the street", german: "Jenseits der Straße", hints: ["jenseits + genitive", "der Straße"], keywords: ["jenseits", "Straße"], difficulty: 8 },
  { english: "During the winter", german: "Während des Winters", hints: ["während + genitive", "des Winters"], keywords: ["während", "Winters"], difficulty: 7 },
  { english: "Because of you", german: "Deinetwegen", hints: ["wegen + genitive pronoun", "One word"], keywords: ["deinetwegen"], difficulty: 8 },
  { english: "Beyond the mountains", german: "Jenseits der Berge", hints: ["jenseits + genitive plural", "der Berge"], keywords: ["jenseits", "Berge"], difficulty: 8 },
  { english: "Instead of wine", german: "Anstelle des Weins", hints: ["anstelle + genitive", "des Weins"], keywords: ["anstelle", "Weins"], difficulty: 8 },
  { english: "During my studies", german: "Während meines Studiums", hints: ["während + genitive", "meines Studiums"], keywords: ["während", "Studiums"], difficulty: 8 },
  { english: "For the sake of peace", german: "Um des Friedens willen", hints: ["um...willen + genitive", "Split construction"], keywords: ["um", "willen"], difficulty: 9 }
];

// B1 Adverbs of Degree
const b1AdverbsOfDegree: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Very good", german: "Sehr gut", hints: ["sehr = very", "Before adjective"], keywords: ["sehr"], difficulty: 3 },
  { english: "Quite tired", german: "Ziemlich müde", hints: ["ziemlich = quite", "Before adjective"], keywords: ["ziemlich"], difficulty: 5 },
  { english: "Somewhat cold", german: "Etwas kalt", hints: ["etwas = somewhat", "Weakens adjective"], keywords: ["etwas"], difficulty: 5 },
  { english: "Especially beautiful", german: "Besonders schön", hints: ["besonders = especially", "Emphasizes"], keywords: ["besonders"], difficulty: 6 },
  { english: "Completely crazy", german: "Völlig verrückt", hints: ["völlig = completely", "Total degree"], keywords: ["völlig"], difficulty: 6 },
  { english: "Barely visible", german: "Kaum sichtbar", hints: ["kaum = barely/hardly", "Minimal degree"], keywords: ["kaum"], difficulty: 6 },
  { english: "Extremely important", german: "Äußerst wichtig", hints: ["äußerst = extremely", "Very strong"], keywords: ["äußerst"], difficulty: 7 },
  { english: "Too expensive", german: "Zu teuer", hints: ["zu = too (excessive)", "Negative connotation"], keywords: ["zu"], difficulty: 4 },
  { english: "Rather late", german: "Ziemlich spät", hints: ["ziemlich = rather/quite", "Moderate degree"], keywords: ["ziemlich"], difficulty: 5 },
  { english: "Totally wrong", german: "Völlig falsch", hints: ["völlig = totally", "Complete degree"], keywords: ["völlig"], difficulty: 6 },
  { english: "Pretty expensive", german: "Recht teuer", hints: ["recht = pretty/quite", "Informal"], keywords: ["recht"], difficulty: 6 },
  { english: "Absolutely right", german: "Absolut richtig", hints: ["absolut = absolutely", "Complete agreement"], keywords: ["absolut"], difficulty: 6 },
  { english: "Incredibly fast", german: "Unglaublich schnell", hints: ["unglaublich = incredibly", "Strong emphasis"], keywords: ["unglaublich"], difficulty: 7 },
  { english: "So beautiful", german: "So schön", hints: ["so = so (as degree)", "Exclamatory"], keywords: ["so"], difficulty: 4 },
  { english: "Relatively easy", german: "Relativ einfach", hints: ["relativ = relatively", "Moderate assessment"], keywords: ["relativ"], difficulty: 7 },
  { english: "Absolutely necessary", german: "Unbedingt notwendig", hints: ["unbedingt = absolutely", "Essential"], keywords: ["unbedingt"], difficulty: 7 },
  { english: "Fairly good", german: "Ziemlich gut", hints: ["ziemlich = fairly", "Moderate positive"], keywords: ["ziemlich"], difficulty: 5 },
  { english: "Almost finished", german: "Fast fertig", hints: ["fast = almost/nearly", "Not quite complete"], keywords: ["fast"], difficulty: 6 },
  { english: "Particularly interesting", german: "Besonders interessant", hints: ["besonders = particularly", "Stands out"], keywords: ["besonders"], difficulty: 7 },
  { english: "Slightly better", german: "Etwas besser", hints: ["etwas = slightly", "Small improvement"], keywords: ["etwas"], difficulty: 6 }
];

// B1 Compound Nouns
const b1CompoundNouns: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Front door", german: "Die Haustür", hints: ["Haus + Tür = Haustür", "Gender from last word (die Tür)"], keywords: ["Haustür"], difficulty: 5 },
  { english: "Apple juice", german: "Der Apfelsaft", hints: ["Apfel + Saft = Apfelsaft", "Gender from Saft (der)"], keywords: ["Apfelsaft"], difficulty: 5 },
  { english: "Office/study room", german: "Das Arbeitszimmer", hints: ["Arbeit + Zimmer = Arbeitszimmer", "Gender from Zimmer (das)"], keywords: ["Arbeitszimmer"], difficulty: 6 },
  { english: "Glove", german: "Der Handschuh", hints: ["Hand + Schuh = Handschuh", "Literally 'hand shoe'"], keywords: ["Handschuh"], difficulty: 6 },
  { english: "Birthday", german: "Der Geburtstag", hints: ["Geburt + Tag = Geburtstag", "s-connector between words"], keywords: ["Geburtstag"], difficulty: 5 },
  { english: "Train station", german: "Der Bahnhof", hints: ["Bahn + Hof = Bahnhof", "Gender from Hof"], keywords: ["Bahnhof"], difficulty: 5 },
  { english: "Refrigerator", german: "Der Kühlschrank", hints: ["Kühl + Schrank = Kühlschrank", "Literally 'cool cupboard'"], keywords: ["Kühlschrank"], difficulty: 6 },
  { english: "Driving license", german: "Der Führerschein", hints: ["Führer + Schein = Führerschein", "er-connector"], keywords: ["Führerschein"], difficulty: 6 },
  { english: "Notebook", german: "Das Notizbuch", hints: ["Notiz + Buch = Notizbuch", "Gender from Buch"], keywords: ["Notizbuch"], difficulty: 6 },
  { english: "Washing machine", german: "Die Waschmaschine", hints: ["Wasch + Maschine = Waschmaschine", "Gender from Maschine"], keywords: ["Waschmaschine"], difficulty: 6 },
  { english: "Weekend", german: "Das Wochenende", hints: ["Woche + Ende = Wochenende", "n-connector"], keywords: ["Wochenende"], difficulty: 5 },
  { english: "Airport", german: "Der Flughafen", hints: ["Flug + Hafen = Flughafen", "Literally 'flight harbor'"], keywords: ["Flughafen"], difficulty: 6 },
  { english: "Textbook", german: "Das Lehrbuch", hints: ["Lehr + Buch = Lehrbuch", "From lehren (to teach)"], keywords: ["Lehrbuch"], difficulty: 6 },
  { english: "Vacation home", german: "Das Ferienhaus", hints: ["Ferien + Haus = Ferienhaus", "n-connector"], keywords: ["Ferienhaus"], difficulty: 7 },
  { english: "Hospital", german: "Das Krankenhaus", hints: ["Kranken + Haus = Krankenhaus", "n-connector"], keywords: ["Krankenhaus"], difficulty: 6 },
  { english: "Sunglasses", german: "Die Sonnenbrille", hints: ["Sonnen + Brille = Sonnenbrille", "n-connector"], keywords: ["Sonnenbrille"], difficulty: 7 },
  { english: "Vocabulary", german: "Der Wortschatz", hints: ["Wort + Schatz = Wortschatz", "Literally 'word treasure'"], keywords: ["Wortschatz"], difficulty: 7 },
  { english: "Credit card", german: "Die Kreditkarte", hints: ["Kredit + Karte = Kreditkarte", "Modern compound"], keywords: ["Kreditkarte"], difficulty: 6 },
  { english: "Pedestrian zone", german: "Die Fußgängerzone", hints: ["Fußgänger + Zone = Fußgängerzone", "Long compound"], keywords: ["Fußgängerzone"], difficulty: 8 },
  { english: "Fireplace", german: "Der Kamin", hints: ["Not a compound! Single word", "Common mistake"], keywords: ["Kamin"], difficulty: 7 }
];

// B1 Adjectival Nouns
const b1AdjectivalNouns: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The German (man)", german: "Der Deutsche", hints: ["Adjective as noun", "Masculine nominative"], keywords: ["Deutsche"], difficulty: 6 },
  { english: "A German man", german: "Ein Deutscher", hints: ["After ein", "Strong ending -er"], keywords: ["Deutscher"], difficulty: 6 },
  { english: "A German woman", german: "Eine Deutsche", hints: ["After eine", "Strong ending -e"], keywords: ["Deutsche"], difficulty: 6 },
  { english: "Something beautiful", german: "Etwas Schönes", hints: ["After etwas", "Capitalized, neuter ending"], keywords: ["Schönes"], difficulty: 7 },
  { english: "Nothing new", german: "Nichts Neues", hints: ["After nichts", "Capitalized, neuter ending"], keywords: ["Neues"], difficulty: 7 },
  { english: "All the best", german: "Alles Gute", hints: ["After alles", "Capitalized, neuter ending"], keywords: ["Gute"], difficulty: 7 },
  { english: "I met a German", german: "Ich traf einen Deutschen", hints: ["Accusative masculine", "Weak ending -en"], keywords: ["Deutschen"], difficulty: 7 },
  { english: "The Germans", german: "Die Deutschen", hints: ["Plural nominative", "Takes adjective endings"], keywords: ["Deutschen"], difficulty: 6 },
  { english: "Something interesting", german: "Etwas Interessantes", hints: ["After etwas", "Long adjective capitalized"], keywords: ["Interessantes"], difficulty: 7 },
  { english: "The unemployed person", german: "Der Arbeitslose", hints: ["arbeitslos → Arbeitslose", "Masculine nominative"], keywords: ["Arbeitslose"], difficulty: 7 },
  { english: "Many unemployed people", german: "Viele Arbeitslose", hints: ["Plural", "Takes plural adjective ending"], keywords: ["Arbeitslose"], difficulty: 7 },
  { english: "The sick person", german: "Der Kranke", hints: ["krank → Kranke", "Capitalized adjective"], keywords: ["Kranke"], difficulty: 7 },
  { english: "Nothing special", german: "Nichts Besonderes", hints: ["After nichts", "besonders → Besonderes"], keywords: ["Besonderes"], difficulty: 7 },
  { english: "The old man", german: "Der Alte", hints: ["alt → Alte", "Masculine noun"], keywords: ["Alte"], difficulty: 6 },
  { english: "Everything good", german: "Alles Gute", hints: ["After alles", "Common expression"], keywords: ["Gute"], difficulty: 6 },
  { english: "The rich", german: "Die Reichen", hints: ["reich → Reichen", "Plural, the rich people"], keywords: ["Reichen"], difficulty: 7 },
  { english: "Something cold", german: "Etwas Kaltes", hints: ["After etwas", "kalt → Kaltes"], keywords: ["Kaltes"], difficulty: 7 },
  { english: "The dead person", german: "Der Tote", hints: ["tot → Tote", "Masculine"], keywords: ["Tote"], difficulty: 8 },
  { english: "I'll tell you something nice", german: "Ich erzähle dir etwas Schönes", hints: ["etwas + adjective noun", "Accusative"], keywords: ["Schönes"], difficulty: 8 },
  { english: "The unknown", german: "Das Unbekannte", hints: ["unbekannt → Unbekannte", "Neuter noun"], keywords: ["Unbekannte"], difficulty: 8 }
];

// B1 Indirect Questions
const b1IndirectQuestions: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I don't know where he lives", german: "Ich weiß nicht, wo er wohnt", hints: ["wo = where", "Verb to end"], keywords: ["wo", "wohnt"], difficulty: 6 },
  { english: "She asks if you are coming", german: "Sie fragt, ob du kommst", hints: ["ob = if/whether", "Verb to end"], keywords: ["ob", "kommst"], difficulty: 6 },
  { english: "He wants to know when the train leaves", german: "Er möchte wissen, wann der Zug fährt", hints: ["wann = when", "fährt at end"], keywords: ["wann", "fährt"], difficulty: 6 },
  { english: "Can you tell me what time it is", german: "Kannst du mir sagen, wie spät es ist", hints: ["wie spät = what time", "ist at end"], keywords: ["wie", "ist"], difficulty: 7 },
  { english: "I wonder how that works", german: "Ich frage mich, wie das funktioniert", hints: ["wie = how", "funktioniert at end"], keywords: ["wie", "funktioniert"], difficulty: 7 },
  { english: "Do you know why he didn't come", german: "Weißt du, warum er nicht gekommen ist", hints: ["warum = why", "ist at end"], keywords: ["warum", "ist"], difficulty: 7 },
  { english: "She doesn't know who I am", german: "Sie weiß nicht, wer ich bin", hints: ["wer = who", "bin at end"], keywords: ["wer", "bin"], difficulty: 6 },
  { english: "I asked where the station is", german: "Ich fragte, wo der Bahnhof ist", hints: ["Indirect question in past", "ist at end"], keywords: ["wo", "ist"], difficulty: 7 },
  { english: "Tell me what you want", german: "Sag mir, was du willst", hints: ["was = what", "willst at end"], keywords: ["was", "willst"], difficulty: 6 },
  { english: "I don't understand why this is important", german: "Ich verstehe nicht, warum das wichtig ist", hints: ["warum = why", "ist at end"], keywords: ["warum", "ist"], difficulty: 7 },
  { english: "Do you know whether he speaks German", german: "Weißt du, ob er Deutsch spricht", hints: ["ob = whether", "spricht at end"], keywords: ["ob", "spricht"], difficulty: 7 },
  { english: "Can you explain how this works", german: "Kannst du erklären, wie das funktioniert", hints: ["wie = how", "funktioniert at end"], keywords: ["wie", "funktioniert"], difficulty: 7 },
  { english: "I wonder when she will arrive", german: "Ich frage mich, wann sie ankommen wird", hints: ["wann + future", "wird at end"], keywords: ["wann", "wird"], difficulty: 8 },
  { english: "She asked who had called", german: "Sie fragte, wer angerufen hatte", hints: ["wer = who", "hatte at end"], keywords: ["wer", "hatte"], difficulty: 8 },
  { english: "I don't know what I should do", german: "Ich weiß nicht, was ich machen soll", hints: ["was + modal", "soll at end"], keywords: ["was", "soll"], difficulty: 7 },
  { english: "He wants to know how much it costs", german: "Er will wissen, wie viel es kostet", hints: ["wie viel = how much", "kostet at end"], keywords: ["wie", "kostet"], difficulty: 7 },
  { english: "Can you tell me where I can find it", german: "Kannst du mir sagen, wo ich es finden kann", hints: ["wo + modal", "kann at end"], keywords: ["wo", "kann"], difficulty: 8 },
  { english: "I asked why she was sad", german: "Ich fragte, warum sie traurig war", hints: ["warum + past", "war at end"], keywords: ["warum", "war"], difficulty: 7 },
  { english: "Do you remember who said that", german: "Erinnerst du dich, wer das gesagt hat", hints: ["wer + perfect", "hat at end"], keywords: ["wer", "hat"], difficulty: 8 },
  { english: "I'm not sure if I can come", german: "Ich bin nicht sicher, ob ich kommen kann", hints: ["ob + modal", "kann at end"], keywords: ["ob", "kann"], difficulty: 7 }
];

// B1 Word Order TeKaMoLo
const b1WordOrderTekamolo: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I'm driving to Berlin tomorrow by car", german: "Ich fahre morgen mit dem Auto nach Berlin", hints: ["Time (morgen) - Manner (mit dem Auto) - Place (nach Berlin)", "TeKaMoLo order"], keywords: ["morgen", "mit", "nach"], difficulty: 6 },
  { english: "She goes home quickly today because of work", german: "Sie geht heute wegen der Arbeit schnell nach Hause", hints: ["Te-Ka-Mo-Lo", "heute, wegen, schnell, nach Hause"], keywords: ["heute", "wegen", "schnell"], difficulty: 8 },
  { english: "We're meeting on Monday at the café", german: "Wir treffen uns am Montag im Café", hints: ["Time before place", "am Montag, im Café"], keywords: ["am", "im"], difficulty: 6 },
  { english: "He came yesterday by train", german: "Er kam gestern mit dem Zug", hints: ["Time before manner", "gestern, mit dem Zug"], keywords: ["gestern", "mit"], difficulty: 6 },
  { english: "She goes to school every day on foot", german: "Sie geht jeden Tag zu Fuß zur Schule", hints: ["Time - Manner - Place", "jeden Tag, zu Fuß, zur Schule"], keywords: ["jeden", "zu", "zur"], difficulty: 7 },
  { english: "I work from Monday to Friday in the office", german: "Ich arbeite von Montag bis Freitag im Büro", hints: ["Time before place", "Long time expression first"], keywords: ["von", "im"], difficulty: 7 },
  { english: "We travel next week by plane to Spain", german: "Wir reisen nächste Woche mit dem Flugzeug nach Spanien", hints: ["Te-Mo-Lo", "nächste Woche, mit dem Flugzeug, nach Spanien"], keywords: ["nächste", "mit", "nach"], difficulty: 7 },
  { english: "He stayed at home yesterday because of illness", german: "Er blieb gestern wegen Krankheit zu Hause", hints: ["Te-Ka-Lo", "gestern, wegen, zu Hause"], keywords: ["gestern", "wegen", "zu"], difficulty: 8 },
  { english: "She comes today with her friend", german: "Sie kommt heute mit ihrer Freundin", hints: ["Time before manner", "heute, mit ihrer Freundin"], keywords: ["heute", "mit"], difficulty: 6 },
  { english: "I meet him tomorrow at 3 o'clock at the train station", german: "Ich treffe ihn morgen um 3 Uhr am Bahnhof", hints: ["Time before place", "Multiple time expressions together"], keywords: ["morgen", "um", "am"], difficulty: 7 },
  { english: "We go every weekend to the mountains", german: "Wir gehen jedes Wochenende in die Berge", hints: ["Time before place", "jedes Wochenende, in die Berge"], keywords: ["jedes", "in"], difficulty: 6 },
  { english: "He walks slowly through the park in the morning", german: "Er geht morgens langsam durch den Park", hints: ["Te-Mo-Lo", "morgens, langsam, durch den Park"], keywords: ["morgens", "langsam", "durch"], difficulty: 7 },
  { english: "She traveled last year for three months to Asia", german: "Sie reiste letztes Jahr drei Monate lang nach Asien", hints: ["Multiple time expressions", "Then place"], keywords: ["letztes", "drei", "nach"], difficulty: 8 },
  { english: "I go tonight with friends to the cinema", german: "Ich gehe heute Abend mit Freunden ins Kino", hints: ["Te-Mo-Lo", "heute Abend, mit Freunden, ins Kino"], keywords: ["heute", "mit", "ins"], difficulty: 7 },
  { english: "We drive in summer always to the sea", german: "Wir fahren im Sommer immer ans Meer", hints: ["Time before place", "im Sommer, immer, ans Meer"], keywords: ["im", "immer", "ans"], difficulty: 7 },
  { english: "He ran yesterday very fast home", german: "Er lief gestern sehr schnell nach Hause", hints: ["Te-Mo-Lo", "gestern, sehr schnell, nach Hause"], keywords: ["gestern", "sehr", "nach"], difficulty: 7 },
  { english: "She works during the week gladly in the library", german: "Sie arbeitet unter der Woche gern in der Bibliothek", hints: ["Te-Mo-Lo", "unter der Woche, gern, in der Bibliothek"], keywords: ["unter", "gern", "in"], difficulty: 8 },
  { english: "I traveled last month because of business to Munich", german: "Ich reiste letzten Monat geschäftlich nach München", hints: ["Te-Ka-Lo", "letzten Monat, geschäftlich, nach München"], keywords: ["letzten", "geschäftlich", "nach"], difficulty: 8 },
  { english: "We eat on Sundays together at home", german: "Wir essen sonntags zusammen zu Hause", hints: ["Te-Mo-Lo", "sonntags, zusammen, zu Hause"], keywords: ["sonntags", "zusammen", "zu"], difficulty: 7 },
  { english: "He flies tomorrow early in the morning to London", german: "Er fliegt morgen früh am Morgen nach London", hints: ["Multiple time expressions", "Then place"], keywords: ["morgen", "früh", "nach"], difficulty: 8 }
];

// B1 Comparative Structures (als/wie)
const b1ComparativeStructures: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "He is taller than I", german: "Er ist größer als ich", hints: ["Comparative + als", "größer als"], keywords: ["größer", "als"], difficulty: 5 },
  { english: "She runs faster than her brother", german: "Sie läuft schneller als ihr Bruder", hints: ["Comparative + als", "schneller als"], keywords: ["schneller", "als"], difficulty: 6 },
  { english: "The book is as interesting as the film", german: "Das Buch ist so interessant wie der Film", hints: ["so...wie for equality", "Not 'als'"], keywords: ["so", "wie"], difficulty: 6 },
  { english: "I am just as tired as you", german: "Ich bin genauso müde wie du", hints: ["genauso...wie = just as...as", "Emphasizes equality"], keywords: ["genauso", "wie"], difficulty: 6 },
  { english: "This car is more expensive than that one", german: "Dieses Auto ist teurer als das da", hints: ["Comparative + als", "teurer als"], keywords: ["teurer", "als"], difficulty: 6 },
  { english: "She is as smart as he is", german: "Sie ist so klug wie er", hints: ["so...wie", "Equality comparison"], keywords: ["so", "wie"], difficulty: 6 },
  { english: "My brother is younger than me", german: "Mein Bruder ist jünger als ich", hints: ["jünger + als", "Umlaut in comparative"], keywords: ["jünger", "als"], difficulty: 6 },
  { english: "This exercise is easier than the last one", german: "Diese Übung ist leichter als die letzte", hints: ["leichter + als", "die letzte = the last one"], keywords: ["leichter", "als"], difficulty: 7 },
  { english: "He works as hard as she does", german: "Er arbeitet so hart wie sie", hints: ["so...wie", "Equal effort"], keywords: ["so", "wie"], difficulty: 6 },
  { english: "The weather is better than yesterday", german: "Das Wetter ist besser als gestern", hints: ["Irregular: gut → besser", "besser als"], keywords: ["besser", "als"], difficulty: 6 },
  { english: "I have more time than you", german: "Ich habe mehr Zeit als du", hints: ["Irregular: viel → mehr", "mehr als"], keywords: ["mehr", "als"], difficulty: 6 },
  { english: "She sings as beautifully as a bird", german: "Sie singt so schön wie ein Vogel", hints: ["so...wie", "Poetic comparison"], keywords: ["so", "wie"], difficulty: 7 },
  { english: "This house is bigger than ours", german: "Dieses Haus ist größer als unseres", hints: ["größer als unseres", "Possessive pronoun"], keywords: ["größer", "unseres"], difficulty: 7 },
  { english: "He speaks German as well as a native", german: "Er spricht Deutsch so gut wie ein Muttersprachler", hints: ["so gut wie", "High level comparison"], keywords: ["so", "wie"], difficulty: 7 },
  { english: "The test was harder than I thought", german: "Der Test war schwerer, als ich dachte", hints: ["Comma before als-clause", "als ich dachte"], keywords: ["schwerer", "als"], difficulty: 8 },
  { english: "She is not as tall as her sister", german: "Sie ist nicht so groß wie ihre Schwester", hints: ["nicht so...wie", "Negative comparison"], keywords: ["nicht", "so", "wie"], difficulty: 7 },
  { english: "This solution is better than that one", german: "Diese Lösung ist besser als die da", hints: ["besser als", "die da = that one"], keywords: ["besser", "als"], difficulty: 7 },
  { english: "I can run as fast as you", german: "Ich kann so schnell laufen wie du", hints: ["so schnell...wie", "With modal verb"], keywords: ["so", "wie"], difficulty: 7 },
  { english: "The movie was more boring than expected", german: "Der Film war langweiliger, als erwartet", hints: ["Comma before als", "als erwartet"], keywords: ["langweiliger", "als"], difficulty: 8 },
  { english: "He is three years older than she is", german: "Er ist drei Jahre älter als sie", hints: ["Quantity + comparative", "drei Jahre älter"], keywords: ["drei", "älter", "als"], difficulty: 8 }
];

// B1 Double Infinitive
const b1DoubleInfinitive: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I wasn't able to come", german: "Ich habe nicht kommen können", hints: ["Perfect + modal = double infinitive", "können instead of gekonnt"], keywords: ["kommen", "können"], difficulty: 7 },
  { english: "He had to repair the car", german: "Er hat das Auto reparieren müssen", hints: ["Perfect + modal", "müssen instead of gemusst"], keywords: ["reparieren", "müssen"], difficulty: 7 },
  { english: "She wanted to learn German", german: "Sie hat Deutsch lernen wollen", hints: ["Perfect + modal", "wollen instead of gewollt"], keywords: ["lernen", "wollen"], difficulty: 7 },
  { english: "We had to wait a long time", german: "Wir haben lange warten müssen", hints: ["Perfect + modal", "Both infinitives at end"], keywords: ["warten", "müssen"], difficulty: 7 },
  { english: "I couldn't find it", german: "Ich habe es nicht finden können", hints: ["Perfect + modal", "Double infinitive construction"], keywords: ["finden", "können"], difficulty: 7 },
  { english: "She was allowed to go", german: "Sie hat gehen dürfen", hints: ["Perfect + modal", "dürfen instead of gedurft"], keywords: ["gehen", "dürfen"], difficulty: 8 },
  { english: "We wanted to stay longer", german: "Wir haben länger bleiben wollen", hints: ["Perfect + modal", "länger between haben and infinitives"], keywords: ["bleiben", "wollen"], difficulty: 8 },
  { english: "He had to work overtime", german: "Er hat Überstunden machen müssen", hints: ["Perfect + modal", "Object before infinitives"], keywords: ["machen", "müssen"], difficulty: 8 },
  { english: "I should have called", german: "Ich hätte anrufen sollen", hints: ["Past subjunctive + modal", "hätte with double infinitive"], keywords: ["anrufen", "sollen"], difficulty: 9 },
  { english: "They were able to help us", german: "Sie haben uns helfen können", hints: ["Perfect + modal", "uns before infinitives"], keywords: ["helfen", "können"], difficulty: 8 },
  { english: "She didn't want to eat", german: "Sie hat nicht essen wollen", hints: ["Perfect + modal + nicht", "nicht before infinitives"], keywords: ["essen", "wollen"], difficulty: 8 },
  { english: "I had to get up early", german: "Ich habe früh aufstehen müssen", hints: ["Perfect + modal + separable", "aufstehen together"], keywords: ["aufstehen", "müssen"], difficulty: 8 },
  { english: "We couldn't understand him", german: "Wir haben ihn nicht verstehen können", hints: ["Perfect + modal", "Object pronoun before infinitives"], keywords: ["verstehen", "können"], difficulty: 8 },
  { english: "He was supposed to come", german: "Er hat kommen sollen", hints: ["Perfect + modal", "sollen instead of gesollt"], keywords: ["kommen", "sollen"], difficulty: 7 },
  { english: "I would have liked to see it", german: "Ich hätte es gern sehen mögen", hints: ["Past subjunctive + mögen", "hätte...mögen"], keywords: ["sehen", "mögen"], difficulty: 9 },
  { english: "She had to leave early", german: "Sie hat früh gehen müssen", hints: ["Perfect + modal", "früh before infinitives"], keywords: ["gehen", "müssen"], difficulty: 7 },
  { english: "We wanted to buy it", german: "Wir haben es kaufen wollen", hints: ["Perfect + modal", "es before infinitives"], keywords: ["kaufen", "wollen"], difficulty: 7 },
  { english: "He couldn't sleep", german: "Er hat nicht schlafen können", hints: ["Perfect + modal", "nicht before infinitives"], keywords: ["schlafen", "können"], difficulty: 7 },
  { english: "I had to tell him", german: "Ich habe es ihm sagen müssen", hints: ["Perfect + modal", "Both objects before infinitives"], keywords: ["sagen", "müssen"], difficulty: 8 },
  { english: "They should have known", german: "Sie hätten es wissen sollen", hints: ["Past subjunctive + modal", "hätten...sollen"], keywords: ["wissen", "sollen"], difficulty: 9 }
];

// B1 N-Declension
const b1NDeclension: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I know the student", german: "Ich kenne den Studenten", hints: ["Accusative: den Studenten", "Add -en"], keywords: ["Studenten"], difficulty: 6 },
  { english: "The student's car is new", german: "Das Auto des Studenten ist neu", hints: ["Genitive: des Studenten", "Add -en"], keywords: ["Studenten"], difficulty: 7 },
  { english: "I give the student a book", german: "Ich gebe dem Studenten ein Buch", hints: ["Dative: dem Studenten", "Add -en"], keywords: ["Studenten"], difficulty: 7 },
  { english: "The colleague's office", german: "Das Büro des Kollegen", hints: ["Genitive: des Kollegen", "Add -n"], keywords: ["Kollegen"], difficulty: 7 },
  { english: "I help the colleague", german: "Ich helfe dem Kollegen", hints: ["Dative: dem Kollegen", "helfen takes dative"], keywords: ["Kollegen"], difficulty: 7 },
  { english: "The boy is playing", german: "Der Junge spielt", hints: ["Nominative: no ending", "Only case without -n"], keywords: ["Junge"], difficulty: 6 },
  { english: "I see the boy", german: "Ich sehe den Jungen", hints: ["Accusative: den Jungen", "Add -n"], keywords: ["Jungen"], difficulty: 6 },
  { english: "The man is tall", german: "Der Herr ist groß", hints: ["Nominative: no ending change", "Herr unchanged"], keywords: ["Herr"], difficulty: 5 },
  { english: "I greet the gentleman", german: "Ich grüße den Herrn", hints: ["Accusative: den Herrn", "Add -n"], keywords: ["Herrn"], difficulty: 7 },
  { english: "The neighbor is friendly", german: "Der Nachbar ist freundlich", hints: ["Nominative unchanged", "Nachbar"], keywords: ["Nachbar"], difficulty: 6 },
  { english: "I talk to the neighbor", german: "Ich spreche mit dem Nachbarn", hints: ["Dative: dem Nachbarn", "Add -n"], keywords: ["Nachbarn"], difficulty: 7 },
  { english: "The customer's order", german: "Die Bestellung des Kunden", hints: ["Genitive: des Kunden", "Add -n"], keywords: ["Kunden"], difficulty: 7 },
  { english: "I help the customer", german: "Ich helfe dem Kunden", hints: ["Dative: dem Kunden", "Add -n"], keywords: ["Kunden"], difficulty: 7 },
  { english: "The name of the man", german: "Der Name des Mannes", hints: ["Name is n-declension", "des Mannes"], keywords: ["Name"], difficulty: 7 },
  { english: "What is your name", german: "Wie ist dein Name", hints: ["Nominative: Name unchanged", "No -n"], keywords: ["Name"], difficulty: 5 },
  { english: "I forget the name", german: "Ich vergesse den Namen", hints: ["Accusative: den Namen", "Add -n"], keywords: ["Namen"], difficulty: 7 },
  { english: "The human is mortal", german: "Der Mensch ist sterblich", hints: ["Nominative unchanged", "Mensch"], keywords: ["Mensch"], difficulty: 6 },
  { english: "I see the human", german: "Ich sehe den Menschen", hints: ["Accusative: den Menschen", "Add -en"], keywords: ["Menschen"], difficulty: 7 },
  { english: "The boy's friend", german: "Der Freund des Jungen", hints: ["Genitive: des Jungen", "Add -n"], keywords: ["Jungen"], difficulty: 7 },
  { english: "The heart of the poet", german: "Das Herz des Dichters", hints: ["Herz is special n-declension", "Genitive: Herzens"], keywords: ["Herz"], difficulty: 8 }
];

// B1 als/wenn/wann
const b1AlsWennWann: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "When I was young, I lived in Berlin", german: "Als ich jung war, lebte ich in Berlin", hints: ["als = one-time past event", "Single occurrence"], keywords: ["als", "war"], difficulty: 6 },
  { english: "When I have time, I like to read", german: "Wenn ich Zeit habe, lese ich gern", hints: ["wenn = repeated action", "Habitual"], keywords: ["wenn", "habe"], difficulty: 6 },
  { english: "When are you coming", german: "Wann kommst du", hints: ["wann = in questions", "Question word"], keywords: ["wann"], difficulty: 5 },
  { english: "When he came home, he was tired", german: "Als er nach Hause kam, war er müde", hints: ["als = single past event", "kam = preterite"], keywords: ["als", "kam"], difficulty: 6 },
  { english: "When it rains, I stay inside", german: "Wenn es regnet, bleibe ich drinnen", hints: ["wenn = repeated/conditional", "Habitual action"], keywords: ["wenn", "regnet"], difficulty: 6 },
  { english: "I don't know when he will arrive", german: "Ich weiß nicht, wann er ankommt", hints: ["wann in indirect question", "ankommt at end"], keywords: ["wann", "ankommt"], difficulty: 7 },
  { english: "When I was a child, I played a lot", german: "Als ich ein Kind war, spielte ich viel", hints: ["als = one-time period", "Specific past time"], keywords: ["als", "war"], difficulty: 7 },
  { english: "If you want, you can come", german: "Wenn du willst, kannst du kommen", hints: ["wenn = if/conditional", "Future possibility"], keywords: ["wenn", "willst"], difficulty: 6 },
  { english: "When does the train leave", german: "Wann fährt der Zug ab", hints: ["wann = question word", "Direct question"], keywords: ["wann"], difficulty: 5 },
  { english: "When I saw her, I was happy", german: "Als ich sie sah, war ich glücklich", hints: ["als = single past event", "sah = preterite"], keywords: ["als", "sah"], difficulty: 7 },
  { english: "Whenever I visit him, he cooks", german: "Wenn ich ihn besuche, kocht er", hints: ["wenn = whenever", "Repeated action"], keywords: ["wenn", "besuche"], difficulty: 7 },
  { english: "Can you tell me when it starts", german: "Kannst du mir sagen, wann es anfängt", hints: ["wann in indirect question", "anfängt at end"], keywords: ["wann", "anfängt"], difficulty: 7 },
  { english: "When we met, it was raining", german: "Als wir uns trafen, regnete es", hints: ["als = single past meeting", "trafen = preterite"], keywords: ["als", "trafen"], difficulty: 7 },
  { english: "When I'm hungry, I eat", german: "Wenn ich Hunger habe, esse ich", hints: ["wenn = whenever", "General statement"], keywords: ["wenn", "habe"], difficulty: 6 },
  { english: "Since when do you live here", german: "Seit wann wohnst du hier", hints: ["Seit wann = since when", "Question"], keywords: ["wann"], difficulty: 7 },
  { english: "When the war ended, people celebrated", german: "Als der Krieg endete, feierten die Leute", hints: ["als = specific historical event", "One-time past"], keywords: ["als", "endete"], difficulty: 8 },
  { english: "If it snows tomorrow, we'll stay home", german: "Wenn es morgen schneit, bleiben wir zu Hause", hints: ["wenn = if (future)", "Conditional"], keywords: ["wenn", "schneit"], difficulty: 7 },
  { english: "I asked when the meeting is", german: "Ich fragte, wann das Treffen ist", hints: ["wann in indirect question", "ist at end"], keywords: ["wann", "ist"], difficulty: 7 },
  { english: "When I turned 18, I got my license", german: "Als ich 18 wurde, machte ich den Führerschein", hints: ["als = specific birthday", "One-time event"], keywords: ["als", "wurde"], difficulty: 8 },
  { english: "When you're ready, call me", german: "Wenn du fertig bist, ruf mich an", hints: ["wenn = when (future)", "Future instruction"], keywords: ["wenn", "bist"], difficulty: 7 }
];

// B1 Lassen Construction
const b1LassenConstruction: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I'm having my car repaired", german: "Ich lasse mein Auto reparieren", hints: ["lassen + infinitive", "Having something done"], keywords: ["lasse", "reparieren"], difficulty: 7 },
  { english: "She doesn't let me go", german: "Sie lässt mich nicht gehen", hints: ["lassen = to let/allow", "nicht before infinitive"], keywords: ["lässt", "gehen"], difficulty: 6 },
  { english: "Let's go home", german: "Lass uns nach Hause gehen", hints: ["Imperative + lassen", "Let's construction"], keywords: ["lass", "gehen"], difficulty: 6 },
  { english: "He had the letter translated", german: "Er ließ den Brief übersetzen", hints: ["ließ = preterite of lassen", "Past tense"], keywords: ["ließ", "übersetzen"], difficulty: 8 },
  { english: "I'm having my hair cut", german: "Ich lasse mir die Haare schneiden", hints: ["Dative reflexive", "mir die Haare"], keywords: ["lasse", "schneiden"], difficulty: 7 },
  { english: "She lets the children play", german: "Sie lässt die Kinder spielen", hints: ["lassen = to let", "Allow to do"], keywords: ["lässt", "spielen"], difficulty: 6 },
  { english: "Let me think", german: "Lass mich nachdenken", hints: ["Imperative", "Let me..."], keywords: ["lass", "nachdenken"], difficulty: 6 },
  { english: "I had it checked", german: "Ich habe es prüfen lassen", hints: ["Perfect with lassen", "habe...lassen"], keywords: ["prüfen", "lassen"], difficulty: 8 },
  { english: "He's having a house built", german: "Er lässt ein Haus bauen", hints: ["lassen + bauen", "Having done"], keywords: ["lässt", "bauen"], difficulty: 7 },
  { english: "Leave me alone", german: "Lass mich in Ruhe", hints: ["lassen = to leave", "Idiomatic expression"], keywords: ["lass", "Ruhe"], difficulty: 6 },
  { english: "She had her eyes tested", german: "Sie ließ ihre Augen testen", hints: ["ließ = preterite", "Past tense"], keywords: ["ließ", "testen"], difficulty: 8 },
  { english: "I can't let you do that", german: "Ich kann dich das nicht machen lassen", hints: ["Modal + lassen", "kann...lassen"], keywords: ["machen", "lassen"], difficulty: 8 },
  { english: "Let's eat", german: "Lass uns essen", hints: ["Let's construction", "lass uns"], keywords: ["lass", "essen"], difficulty: 5 },
  { english: "He leaves the window open", german: "Er lässt das Fenster offen", hints: ["lassen = to leave in state", "offen = open"], keywords: ["lässt", "offen"], difficulty: 7 },
  { english: "I'm having it delivered", german: "Ich lasse es liefern", hints: ["lassen + liefern", "Having delivered"], keywords: ["lasse", "liefern"], difficulty: 7 },
  { english: "She lets nothing show", german: "Sie lässt sich nichts anmerken", hints: ["Reflexive + lassen", "Idiomatic"], keywords: ["lässt", "anmerken"], difficulty: 9 },
  { english: "Leave the door open", german: "Lass die Tür offen", hints: ["Imperative + adjective", "Leave in state"], keywords: ["lass", "offen"], difficulty: 6 },
  { english: "I had my luggage brought up", german: "Ich ließ mein Gepäck hinauftragen", hints: ["ließ + compound verb", "Past tense"], keywords: ["ließ", "hinauftragen"], difficulty: 9 },
  { english: "That can be done", german: "Das lässt sich machen", hints: ["sich lassen = can be", "Passive meaning"], keywords: ["lässt", "sich"], difficulty: 8 },
  { english: "He won't let himself be helped", german: "Er lässt sich nicht helfen", hints: ["Reflexive passive", "lässt sich + infinitive"], keywords: ["lässt", "sich"], difficulty: 9 }
];

// B1 Placeholder 'es'
const b1EsAsPlaceholder: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Many guests are coming", german: "Es kommen viele Gäste", hints: ["es as placeholder", "Subject is viele Gäste"], keywords: ["es", "kommen"], difficulty: 6 },
  { english: "Tomorrow many guests are coming", german: "Morgen kommen viele Gäste", hints: ["No es when another element is first", "Morgen takes first position"], keywords: ["morgen", "kommen"], difficulty: 7 },
  { english: "There are many problems", german: "Es gibt viele Probleme", hints: ["es gibt = there is/are", "Fixed expression"], keywords: ["es", "gibt"], difficulty: 5 },
  { english: "It is important to be punctual", german: "Es ist wichtig, pünktlich zu sein", hints: ["Impersonal es", "Real subject is zu-clause"], keywords: ["es", "wichtig"], difficulty: 6 },
  { english: "Someone is knocking", german: "Es klopft jemand", hints: ["es as placeholder", "jemand is real subject"], keywords: ["es", "klopft"], difficulty: 7 },
  { english: "It is raining", german: "Es regnet", hints: ["Weather es", "No real subject"], keywords: ["es", "regnet"], difficulty: 4 },
  { english: "It smells good", german: "Es riecht gut", hints: ["Impersonal es", "Sensory verb"], keywords: ["es", "riecht"], difficulty: 5 },
  { english: "How are you doing", german: "Wie geht es dir", hints: ["Idiomatic es", "wie geht es"], keywords: ["es", "dir"], difficulty: 5 },
  { english: "Yesterday there was a concert", german: "Gestern gab es ein Konzert", hints: ["es gibt in past", "gab es"], keywords: ["gab", "es"], difficulty: 6 },
  { english: "It seems that he is sick", german: "Es scheint, dass er krank ist", hints: ["es + scheint", "dass-clause follows"], keywords: ["es", "scheint"], difficulty: 7 },
  { english: "Three people are standing there", german: "Es stehen drei Leute dort", hints: ["es as placeholder", "Plural verb"], keywords: ["es", "stehen"], difficulty: 7 },
  { english: "In summer there are many tourists", german: "Im Sommer gibt es viele Touristen", hints: ["es gibt", "No placeholder es (Im Sommer is first)"], keywords: ["gibt", "es"], difficulty: 6 },
  { english: "It is snowing", german: "Es schneit", hints: ["Weather es", "No subject"], keywords: ["es", "schneit"], difficulty: 4 },
  { english: "There is a problem", german: "Es gibt ein Problem", hints: ["es gibt singular", "ein Problem"], keywords: ["es", "gibt"], difficulty: 5 },
  { english: "It was loud", german: "Es war laut", hints: ["Impersonal es", "General statement"], keywords: ["es", "war"], difficulty: 5 },
  { english: "It is said that...", german: "Es heißt, dass...", hints: ["es heißt = it is said", "Impersonal"], keywords: ["es", "heißt"], difficulty: 7 },
  { english: "It's cold to me", german: "Mir ist kalt", hints: ["No es when dative is first", "Personal feeling"], keywords: ["mir", "kalt"], difficulty: 6 },
  { english: "It is getting dark", german: "Es wird dunkel", hints: ["Impersonal es + werden", "Weather/time"], keywords: ["es", "wird"], difficulty: 6 },
  { english: "It tastes good", german: "Es schmeckt gut", hints: ["Impersonal es", "Taste"], keywords: ["es", "schmeckt"], difficulty: 5 },
  { english: "It depends on you", german: "Es kommt auf dich an", hints: ["Idiomatic: es kommt an auf", "Depends on"], keywords: ["es", "kommt", "an"], difficulty: 8 }
];

// B1 Plusquamperfekt (Past Perfect)
const b1Plusquamperfekt: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "After I had finished my homework, I went outside to play soccer with my friends in the park", german: "Nachdem ich meine Hausaufgaben gemacht hatte, ging ich nach draußen, um mit meinen Freunden im Park Fußball zu spielen", hints: ["nachdem + Plusquamperfekt", "hatte gemacht", "Main clause in simple past"], keywords: ["nachdem", "hatte", "gemacht"], difficulty: 7 },
  { english: "She had already left for work when I arrived at her apartment to pick her up for the meeting", german: "Sie war schon zur Arbeit gegangen, als ich zu ihrer Wohnung kam, um sie für die Besprechung abzuholen", hints: ["war...gegangen", "gehen uses sein", "als + simple past"], keywords: ["war", "gegangen", "als"], difficulty: 7 },
  { english: "Before the teacher came into the classroom, the students had already opened their books and prepared their notebooks", german: "Bevor der Lehrer ins Klassenzimmer kam, hatten die Schüler schon ihre Bücher aufgemacht und ihre Hefte vorbereitet", hints: ["bevor + simple past", "hatten...aufgemacht und vorbereitet", "Two past participles"], keywords: ["bevor", "hatten", "aufgemacht", "vorbereitet"], difficulty: 7 },
  { english: "We had been living in Munich for five years before we decided to move to Berlin for my new job", german: "Wir hatten fünf Jahre lang in München gewohnt, bevor wir beschlossen, für meine neue Arbeit nach Berlin zu ziehen", hints: ["hatten...gewohnt", "fünf Jahre lang", "Time duration before another past action"], keywords: ["hatten", "gewohnt", "bevor"], difficulty: 7 },
  { english: "Because he had forgotten his wallet at home, he couldn't pay for the expensive dinner at the restaurant", german: "Weil er sein Portemonnaie zu Hause vergessen hatte, konnte er nicht für das teure Abendessen im Restaurant bezahlen", hints: ["weil + Plusquamperfekt", "hatte...vergessen", "Result in simple past with modal"], keywords: ["weil", "hatte", "vergessen"], difficulty: 7 },
  { english: "After they had traveled through Europe for three months, they finally returned home completely exhausted but very happy", german: "Nachdem sie drei Monate lang durch Europa gereist waren, kehrten sie endlich völlig erschöpft, aber sehr glücklich nach Hause zurück", hints: ["nachdem + Plusquamperfekt", "waren...gereist", "Motion verb uses sein"], keywords: ["nachdem", "waren", "gereist"], difficulty: 8 },
  { english: "The movie had already started when we arrived at the cinema, so we had to wait for the next showing", german: "Der Film hatte schon angefangen, als wir im Kino ankamen, also mussten wir auf die nächste Vorstellung warten", hints: ["hatte...angefangen", "als + simple past", "also = so/therefore"], keywords: ["hatte", "angefangen", "als"], difficulty: 7 },
  { english: "My grandmother had baked a delicious cake before the guests arrived for her eightieth birthday celebration", german: "Meine Großmutter hatte einen köstlichen Kuchen gebacken, bevor die Gäste zu ihrer achtzigsten Geburtstagsfeier ankamen", hints: ["hatte...gebacken", "bevor + simple past", "Strong verb: backen→gebacken"], keywords: ["hatte", "gebacken", "bevor"], difficulty: 7 },
  { english: "After the storm had destroyed many houses in the village, the residents began rebuilding their homes together", german: "Nachdem der Sturm viele Häuser im Dorf zerstört hatte, begannen die Bewohner gemeinsam, ihre Häuser wieder aufzubauen", hints: ["nachdem + Plusquamperfekt", "hatte...zerstört", "begannen + zu + infinitive"], keywords: ["nachdem", "hatte", "zerstört"], difficulty: 8 },
  { english: "She was very disappointed because she had studied hard for the exam but still didn't pass it", german: "Sie war sehr enttäuscht, weil sie hart für die Prüfung gelernt hatte, aber trotzdem nicht bestanden hatte", hints: ["weil + Plusquamperfekt", "hatte gelernt...hatte bestanden", "Two Plusquamperfekt verbs"], keywords: ["weil", "hatte", "gelernt", "bestanden"], difficulty: 8 },
  { english: "When I came home from work, I noticed that someone had broken into my apartment and stolen my laptop", german: "Als ich von der Arbeit nach Hause kam, bemerkte ich, dass jemand in meine Wohnung eingebrochen war und meinen Laptop gestohlen hatte", hints: ["als + simple past", "war eingebrochen (sein)", "hatte gestohlen (haben)", "Mixed auxiliaries"], keywords: ["als", "war", "eingebrochen", "hatte", "gestohlen"], difficulty: 9 },
  { english: "Before I started learning German, I had already learned English and French at school for many years", german: "Bevor ich anfing, Deutsch zu lernen, hatte ich schon viele Jahre lang Englisch und Französisch in der Schule gelernt", hints: ["bevor + simple past", "hatte...gelernt", "viele Jahre lang"], keywords: ["bevor", "hatte", "gelernt"], difficulty: 7 },
  { english: "After we had eaten the delicious Italian pasta, we ordered a tiramisu for dessert because we were still hungry", german: "Nachdem wir die köstliche italienische Pasta gegessen hatten, bestellten wir ein Tiramisu als Nachtisch, weil wir noch Hunger hatten", hints: ["nachdem + Plusquamperfekt", "hatten...gegessen", "Two simple past clauses follow"], keywords: ["nachdem", "hatten", "gegessen"], difficulty: 8 },
  { english: "He had never been to Germany before, so he was very excited when he finally got the opportunity to visit Berlin", german: "Er war noch nie in Deutschland gewesen, also war er sehr aufgeregt, als er endlich die Gelegenheit bekam, Berlin zu besuchen", hints: ["war...gewesen", "sein uses sein", "noch nie = never before"], keywords: ["war", "gewesen", "noch", "nie"], difficulty: 8 },
  { english: "Because the train had already departed from the platform, we had to wait two hours for the next train to Hamburg", german: "Weil der Zug schon vom Bahnsteig abgefahren war, mussten wir zwei Stunden auf den nächsten Zug nach Hamburg warten", hints: ["weil + Plusquamperfekt", "war...abgefahren", "abfahren uses sein"], keywords: ["weil", "war", "abgefahren"], difficulty: 7 },
  { english: "After my parents had sold their old house in the countryside, they bought a modern apartment in the city center", german: "Nachdem meine Eltern ihr altes Haus auf dem Land verkauft hatten, kauften sie eine moderne Wohnung im Stadtzentrum", hints: ["nachdem + Plusquamperfekt", "hatten...verkauft", "kauften = simple past"], keywords: ["nachdem", "hatten", "verkauft"], difficulty: 7 },
  { english: "The children were very tired because they had played outside in the snow for more than three hours without a break", german: "Die Kinder waren sehr müde, weil sie mehr als drei Stunden lang ohne Pause draußen im Schnee gespielt hatten", hints: ["weil + Plusquamperfekt", "hatten...gespielt", "mehr als drei Stunden"], keywords: ["weil", "hatten", "gespielt"], difficulty: 7 },
  { english: "When the doctor finally arrived at the hospital, the patient had already been waiting in the emergency room for over an hour", german: "Als der Arzt endlich im Krankenhaus ankam, hatte der Patient schon über eine Stunde lang in der Notaufnahme gewartet", hints: ["als + simple past", "hatte...gewartet", "über eine Stunde lang"], keywords: ["als", "hatte", "gewartet"], difficulty: 8 },
  { english: "After she had become a successful lawyer, she decided to help poor people who couldn't afford legal representation", german: "Nachdem sie eine erfolgreiche Anwältin geworden war, beschloss sie, armen Menschen zu helfen, die sich keine Rechtsvertretung leisten konnten", hints: ["nachdem + Plusquamperfekt", "war...geworden", "werden uses sein", "Complex sentence"], keywords: ["nachdem", "war", "geworden"], difficulty: 9 },
  { english: "Before the Internet existed, people had communicated with each other through letters, telephone calls, and personal visits", german: "Bevor das Internet existierte, hatten die Menschen durch Briefe, Telefonanrufe und persönliche Besuche miteinander kommuniziert", hints: ["bevor + simple past", "hatten...kommuniziert", "miteinander = with each other"], keywords: ["bevor", "hatten", "kommuniziert"], difficulty: 8 }
];

// ============= B2 SENTENCES =============

// B2 Partizip I (Present Participle)
const b2PartizipI: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The playing child", german: "Das spielende Kind", hints: ["spielen + d = spielend", "Takes adjective ending"], keywords: ["spielende"], difficulty: 7 },
  { english: "The running woman", german: "Die laufende Frau", hints: ["laufen + d = laufend", "Feminine nominative"], keywords: ["laufende"], difficulty: 7 },
  { english: "A growing tree", german: "Ein wachsender Baum", hints: ["wachsen + d = wachsend", "Strong masculine ending"], keywords: ["wachsender"], difficulty: 7 },
  { english: "The crying baby", german: "Das weinende Baby", hints: ["weinen + d = weinend", "Neuter nominative"], keywords: ["weinende"], difficulty: 7 },
  { english: "A sleeping cat", german: "Eine schlafende Katze", hints: ["schlafen + d = schlafend", "Feminine after ein"], keywords: ["schlafende"], difficulty: 7 },
  { english: "The singing birds", german: "Die singenden Vögel", hints: ["singen + d = singend", "Plural ending -en"], keywords: ["singenden"], difficulty: 7 },
  { english: "I saw a flying bird", german: "Ich sah einen fliegenden Vogel", hints: ["fliegen + d", "Accusative masculine"], keywords: ["fliegenden"], difficulty: 8 },
  { english: "The working people", german: "Die arbeitenden Menschen", hints: ["arbeiten + d", "Plural"], keywords: ["arbeitenden"], difficulty: 7 },
  { english: "With a smiling face", german: "Mit einem lächelnden Gesicht", hints: ["lächeln + d", "Dative neuter"], keywords: ["lächelnden"], difficulty: 8 },
  { english: "The barking dog", german: "Der bellende Hund", hints: ["bellen + d", "Masculine nominative"], keywords: ["bellende"], difficulty: 7 },
  { english: "A burning house", german: "Ein brennendes Haus", hints: ["brennen + d", "Neuter after ein"], keywords: ["brennendes"], difficulty: 8 },
  { english: "The rising sun", german: "Die aufgehende Sonne", hints: ["aufgehen + d", "Separable verb + d"], keywords: ["aufgehende"], difficulty: 8 },
  { english: "The falling leaves", german: "Die fallenden Blätter", hints: ["fallen + d", "Plural"], keywords: ["fallenden"], difficulty: 7 },
  { english: "A growing problem", german: "Ein wachsendes Problem", hints: ["wachsen + d", "Neuter problem"], keywords: ["wachsendes"], difficulty: 8 },
  { english: "The passing time", german: "Die vergehende Zeit", hints: ["vergehen + d", "Zeit is feminine"], keywords: ["vergehende"], difficulty: 8 },
  { english: "The increasing number", german: "Die steigende Zahl", hints: ["steigen + d", "Zahl is feminine"], keywords: ["steigende"], difficulty: 8 },
  { english: "A dancing couple", german: "Ein tanzendes Paar", hints: ["tanzen + d", "Paar is neuter"], keywords: ["tanzendes"], difficulty: 7 },
  { english: "The waiting guests", german: "Die wartenden Gäste", hints: ["warten + d", "Plural"], keywords: ["wartenden"], difficulty: 7 },
  { english: "A developing country", german: "Ein sich entwickelndes Land", hints: ["sich entwickeln + d", "Reflexive + d"], keywords: ["entwickelndes"], difficulty: 9 },
  { english: "The remaining questions", german: "Die verbleibenden Fragen", hints: ["verbleiben + d", "Plural feminine"], keywords: ["verbleibenden"], difficulty: 8 }
];

// B2 Extended Adjective Constructions
const b2ExtendedAdjective: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The study published last year", german: "Die im letzten Jahr veröffentlichte Studie", hints: ["Extended phrase before noun", "veröffentlicht + adjective ending"], keywords: ["veröffentlichte"], difficulty: 8 },
  { english: "The report started yesterday", german: "Der gestern angefangene Bericht", hints: ["Past participle as adjective", "angefangen + e"], keywords: ["angefangene"], difficulty: 8 },
  { english: "The book recommended by experts", german: "Das von Experten empfohlene Buch", hints: ["von + dative in extended phrase", "empfohlen + e"], keywords: ["empfohlene"], difficulty: 8 },
  { english: "The car repaired in the garage", german: "Das in der Werkstatt reparierte Auto", hints: ["in der + dative", "repariert + e"], keywords: ["reparierte"], difficulty: 8 },
  { english: "The newly built house", german: "Das neu gebaute Haus", hints: ["neu + past participle", "gebaut + e"], keywords: ["gebaute"], difficulty: 7 },
  { english: "The highly praised film", german: "Der viel gelobte Film", hints: ["viel + gelobt", "Masculine nominative"], keywords: ["gelobte"], difficulty: 8 },
  { english: "The often mentioned problem", german: "Das oft erwähnte Problem", hints: ["oft + erwähnt", "Neuter"], keywords: ["erwähnte"], difficulty: 8 },
  { english: "The recently discovered planet", german: "Der kürzlich entdeckte Planet", hints: ["kürzlich + entdeckt", "Masculine"], keywords: ["entdeckte"], difficulty: 8 },
  { english: "The widely read newspaper", german: "Die weit verbreitete Zeitung", hints: ["weit verbreitet", "Feminine"], keywords: ["verbreitete"], difficulty: 8 },
  { english: "The carefully planned trip", german: "Die sorgfältig geplante Reise", hints: ["sorgfältig + geplant", "Feminine"], keywords: ["geplante"], difficulty: 8 },
  { english: "The well-known author", german: "Der bekannte Autor", hints: ["bekannt = well-known", "Simple form"], keywords: ["bekannte"], difficulty: 7 },
  { english: "The much discussed topic", german: "Das viel diskutierte Thema", hints: ["viel + diskutiert", "Neuter"], keywords: ["diskutierte"], difficulty: 8 },
  { english: "The badly damaged building", german: "Das schwer beschädigte Gebäude", hints: ["schwer + beschädigt", "Neuter"], keywords: ["beschädigte"], difficulty: 8 },
  { english: "The long awaited answer", german: "Die lang erwartete Antwort", hints: ["lang + erwartet", "Feminine"], keywords: ["erwartete"], difficulty: 8 },
  { english: "The internationally recognized university", german: "Die international anerkannte Universität", hints: ["international + anerkannt", "Feminine"], keywords: ["anerkannte"], difficulty: 9 },
  { english: "The quickly prepared meal", german: "Das schnell zubereitete Essen", hints: ["schnell + zubereitet", "Neuter"], keywords: ["zubereitete"], difficulty: 8 },
  { english: "The recently opened restaurant", german: "Das kürzlich eröffnete Restaurant", hints: ["kürzlich + eröffnet", "Neuter"], keywords: ["eröffnete"], difficulty: 8 },
  { english: "The strongly recommended course", german: "Der stark empfohlene Kurs", hints: ["stark + empfohlen", "Masculine"], keywords: ["empfohlene"], difficulty: 8 },
  { english: "The completely renovated apartment", german: "Die komplett renovierte Wohnung", hints: ["komplett + renoviert", "Feminine"], keywords: ["renovierte"], difficulty: 8 },
  { english: "The incorrectly filled form", german: "Das falsch ausgefüllte Formular", hints: ["falsch + ausgefüllt", "Neuter"], keywords: ["ausgefüllte"], difficulty: 9 }
];

// B2 Nominalization
const b2Nominalization: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Running is healthy", german: "Das Laufen ist gesund", hints: ["laufen → das Laufen", "Always neuter"], keywords: ["Laufen"], difficulty: 7 },
  { english: "Beauty is subjective", german: "Die Schönheit ist subjektiv", hints: ["schön → die Schönheit", "-heit suffix"], keywords: ["Schönheit"], difficulty: 7 },
  { english: "Friendliness is important", german: "Die Freundlichkeit ist wichtig", hints: ["freundlich → -keit", "Feminine"], keywords: ["Freundlichkeit"], difficulty: 7 },
  { english: "Swimming is fun", german: "Das Schwimmen macht Spaß", hints: ["schwimmen → das Schwimmen", "Neuter"], keywords: ["Schwimmen"], difficulty: 7 },
  { english: "The truth hurts", german: "Die Wahrheit tut weh", hints: ["wahr → die Wahrheit", "-heit suffix"], keywords: ["Wahrheit"], difficulty: 7 },
  { english: "The possibility exists", german: "Die Möglichkeit besteht", hints: ["möglich → -keit", "Feminine"], keywords: ["Möglichkeit"], difficulty: 7 },
  { english: "Reading books is relaxing", german: "Das Lesen von Büchern ist entspannend", hints: ["lesen → das Lesen", "von + dative"], keywords: ["Lesen"], difficulty: 8 },
  { english: "The illness was severe", german: "Die Krankheit war schwer", hints: ["krank → die Krankheit", "-heit suffix"], keywords: ["Krankheit"], difficulty: 7 },
  { english: "The meaning is unclear", german: "Die Bedeutung ist unklar", hints: ["bedeuten → die Bedeutung", "-ung suffix"], keywords: ["Bedeutung"], difficulty: 7 },
  { english: "Cooking takes time", german: "Das Kochen braucht Zeit", hints: ["kochen → das Kochen", "Neuter verb noun"], keywords: ["Kochen"], difficulty: 7 },
  { english: "Freedom is valuable", german: "Die Freiheit ist wertvoll", hints: ["frei → die Freiheit", "-heit suffix"], keywords: ["Freiheit"], difficulty: 7 },
  { english: "The housing situation", german: "Die Wohnung", hints: ["wohnen → die Wohnung", "-ung = apartment/housing"], keywords: ["Wohnung"], difficulty: 6 },
  { english: "Wisdom comes with age", german: "Die Weisheit kommt mit dem Alter", hints: ["weise → die Weisheit", "-heit suffix"], keywords: ["Weisheit"], difficulty: 8 },
  { english: "The teacher teaches", german: "Der Lehrer unterrichtet", hints: ["lehren → der Lehrer", "-er suffix masculine"], keywords: ["Lehrer"], difficulty: 6 },
  { english: "Friendship is important", german: "Die Freundschaft ist wichtig", hints: ["Freund → -schaft", "Feminine"], keywords: ["Freundschaft"], difficulty: 7 },
  { english: "Science progresses", german: "Die Wissenschaft macht Fortschritte", hints: ["wissen → die Wissenschaft", "-schaft suffix"], keywords: ["Wissenschaft"], difficulty: 8 },
  { english: "The worker works hard", german: "Der Arbeiter arbeitet hart", hints: ["arbeiten → der Arbeiter", "-er masculine"], keywords: ["Arbeiter"], difficulty: 6 },
  { english: "Loneliness is difficult", german: "Die Einsamkeit ist schwer", hints: ["einsam → -keit", "Feminine"], keywords: ["Einsamkeit"], difficulty: 7 },
  { english: "The development continues", german: "Die Entwicklung geht weiter", hints: ["entwickeln → -ung", "Feminine"], keywords: ["Entwicklung"], difficulty: 7 },
  { english: "Dancing brings joy", german: "Das Tanzen bringt Freude", hints: ["tanzen → das Tanzen", "Neuter infinitive"], keywords: ["Tanzen"], difficulty: 7 }
];

// B2 Future Perfect (Futur II)
const b2FuturePerfect: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I will have read the book", german: "Ich werde das Buch gelesen haben", hints: ["werden + past participle + haben", "Futur II"], keywords: ["werde", "gelesen", "haben"], difficulty: 8 },
  { english: "She will have arrived", german: "Sie wird angekommen sein", hints: ["werden + past participle + sein", "Motion verb"], keywords: ["wird", "angekommen", "sein"], difficulty: 8 },
  { english: "By tomorrow we will be finished", german: "Bis morgen werden wir fertig sein", hints: ["bis + time expression", "werden + fertig + sein"], keywords: ["bis", "werden", "sein"], difficulty: 8 },
  { english: "He will have left", german: "Er wird gegangen sein", hints: ["gehen uses sein", "Future perfect"], keywords: ["wird", "gegangen", "sein"], difficulty: 8 },
  { english: "They will have eaten", german: "Sie werden gegessen haben", hints: ["essen uses haben", "Futur II"], keywords: ["werden", "gegessen", "haben"], difficulty: 8 },
  { english: "By then I will have learned German", german: "Bis dahin werde ich Deutsch gelernt haben", hints: ["bis dahin = by then", "Future perfect"], keywords: ["bis", "gelernt", "haben"], difficulty: 8 },
  { english: "You will have forgotten it", german: "Du wirst es vergessen haben", hints: ["vergessen + haben", "Second person"], keywords: ["wirst", "vergessen", "haben"], difficulty: 8 },
  { english: "We will have moved", german: "Wir werden umgezogen sein", hints: ["umziehen uses sein", "Change of state"], keywords: ["werden", "umgezogen", "sein"], difficulty: 8 },
  { english: "The train will have departed", german: "Der Zug wird abgefahren sein", hints: ["abfahren uses sein", "Motion"], keywords: ["wird", "abgefahren", "sein"], difficulty: 8 },
  { english: "I will have completed the work", german: "Ich werde die Arbeit erledigt haben", hints: ["erledigen + haben", "Completion"], keywords: ["werde", "erledigt", "haben"], difficulty: 8 },
  { english: "They will have returned", german: "Sie werden zurückgekehrt sein", hints: ["zurückkehren uses sein", "Motion back"], keywords: ["werden", "zurückgekehrt", "sein"], difficulty: 8 },
  { english: "By next week he will have decided", german: "Bis nächste Woche wird er entschieden haben", hints: ["bis + time", "entscheiden + haben"], keywords: ["bis", "entschieden", "haben"], difficulty: 9 },
  { english: "You will have understood", german: "Ihr werdet verstanden haben", hints: ["verstehen + haben", "Plural you"], keywords: ["werdet", "verstanden", "haben"], difficulty: 8 },
  { english: "She will have grown older", german: "Sie wird älter geworden sein", hints: ["werden uses sein", "Comparative + geworden"], keywords: ["wird", "geworden", "sein"], difficulty: 9 },
  { english: "The problem will have been solved", german: "Das Problem wird gelöst worden sein", hints: ["Passive Futur II", "worden for passive"], keywords: ["wird", "gelöst", "worden", "sein"], difficulty: 10 },
  { english: "I will have written the letter", german: "Ich werde den Brief geschrieben haben", hints: ["schreiben + haben", "Accusative"], keywords: ["werde", "geschrieben", "haben"], difficulty: 8 },
  { english: "They will have disappeared", german: "Sie werden verschwunden sein", hints: ["verschwinden uses sein", "Disappearance"], keywords: ["werden", "verschwunden", "sein"], difficulty: 8 },
  { english: "By Sunday you will have recovered", german: "Bis Sonntag wirst du dich erholt haben", hints: ["sich erholen + haben", "Reflexive"], keywords: ["bis", "erholt", "haben"], difficulty: 9 },
  { english: "The flowers will have wilted", german: "Die Blumen werden verwelkt sein", hints: ["verwelken uses sein", "Change of state"], keywords: ["werden", "verwelkt", "sein"], difficulty: 9 },
  { english: "We will have forgotten everything", german: "Wir werden alles vergessen haben", hints: ["vergessen + haben", "alles = everything"], keywords: ["werden", "vergessen", "haben"], difficulty: 8 }
];

// B2 Partizip II as Adjective
const b2PartizipIIAdjective: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The boiled egg", german: "Das gekochte Ei", hints: ["kochen → gekocht", "Neuter nominative"], keywords: ["gekochte"], difficulty: 7 },
  { english: "The read books", german: "Die gelesenen Bücher", hints: ["lesen → gelesen", "Plural -en ending"], keywords: ["gelesenen"], difficulty: 7 },
  { english: "An opened window", german: "Ein geöffnetes Fenster", hints: ["öffnen → geöffnet", "Neuter after ein"], keywords: ["geöffnetes"], difficulty: 7 },
  { english: "The repaired car", german: "Der reparierte Wagen", hints: ["reparieren → repariert", "Masculine nominative"], keywords: ["reparierte"], difficulty: 7 },
  { english: "A broken glass", german: "Ein zerbrochenes Glas", hints: ["zerbrechen → zerbrochen", "Neuter"], keywords: ["zerbrochenes"], difficulty: 7 },
  { english: "The closed door", german: "Die geschlossene Tür", hints: ["schließen → geschlossen", "Feminine"], keywords: ["geschlossene"], difficulty: 7 },
  { english: "The stolen bike", german: "Das gestohlene Fahrrad", hints: ["stehlen → gestohlen", "Neuter"], keywords: ["gestohlene"], difficulty: 7 },
  { english: "A written letter", german: "Ein geschriebener Brief", hints: ["schreiben → geschrieben", "Masculine after ein"], keywords: ["geschriebener"], difficulty: 7 },
  { english: "The lost key", german: "Der verlorene Schlüssel", hints: ["verlieren → verloren", "Masculine"], keywords: ["verlorene"], difficulty: 7 },
  { english: "The found wallet", german: "Die gefundene Geldbörse", hints: ["finden → gefunden", "Feminine"], keywords: ["gefundene"], difficulty: 7 },
  { english: "A baked cake", german: "Ein gebackener Kuchen", hints: ["backen → gebacken", "Masculine"], keywords: ["gebackener"], difficulty: 7 },
  { english: "The forgotten umbrella", german: "Der vergessene Regenschirm", hints: ["vergessen → vergessen", "Masculine"], keywords: ["vergessene"], difficulty: 7 },
  { english: "The washed clothes", german: "Die gewaschene Kleidung", hints: ["waschen → gewaschen", "Feminine"], keywords: ["gewaschene"], difficulty: 7 },
  { english: "A painted picture", german: "Ein gemaltes Bild", hints: ["malen → gemalt", "Neuter"], keywords: ["gemaltes"], difficulty: 7 },
  { english: "The burnt toast", german: "Der verbrannte Toast", hints: ["verbrennen → verbrannt", "Masculine"], keywords: ["verbrannte"], difficulty: 7 },
  { english: "The built house", german: "Das gebaute Haus", hints: ["bauen → gebaut", "Neuter"], keywords: ["gebaute"], difficulty: 7 },
  { english: "The received message", german: "Die empfangene Nachricht", hints: ["empfangen → empfangen", "Feminine"], keywords: ["empfangene"], difficulty: 8 },
  { english: "A solved problem", german: "Ein gelöstes Problem", hints: ["lösen → gelöst", "Neuter"], keywords: ["gelöstes"], difficulty: 7 },
  { english: "The bought groceries", german: "Die gekauften Lebensmittel", hints: ["kaufen → gekauft", "Plural"], keywords: ["gekauften"], difficulty: 7 },
  { english: "The sent package", german: "Das gesendete Paket", hints: ["senden → gesendet", "Neuter"], keywords: ["gesendete"], difficulty: 7 }
];

// B2 Passive with Modal Verbs
const b2PassiveModals: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The car must be repaired", german: "Das Auto muss repariert werden", hints: ["modal + past participle + werden", "muss = must"], keywords: ["muss", "repariert", "werden"], difficulty: 8 },
  { english: "The letter can be sent today", german: "Der Brief kann heute geschickt werden", hints: ["kann = can", "geschickt werden"], keywords: ["kann", "geschickt", "werden"], difficulty: 8 },
  { english: "The task should be completed by tomorrow", german: "Die Aufgabe soll bis morgen erledigt werden", hints: ["soll = should", "bis morgen"], keywords: ["soll", "erledigt", "werden"], difficulty: 8 },
  { english: "The problem could be solved", german: "Das Problem konnte gelöst werden", hints: ["Past tense: konnte", "gelöst werden"], keywords: ["konnte", "gelöst", "werden"], difficulty: 8 },
  { english: "The house must be cleaned", german: "Das Haus muss geputzt werden", hints: ["muss + geputzt + werden", "Passive present"], keywords: ["muss", "geputzt", "werden"], difficulty: 7 },
  { english: "The book can be read quickly", german: "Das Buch kann schnell gelesen werden", hints: ["kann + gelesen + werden", "schnell = quickly"], keywords: ["kann", "gelesen", "werden"], difficulty: 8 },
  { english: "The door should be closed", german: "Die Tür soll geschlossen werden", hints: ["soll + geschlossen + werden", "Tür feminine"], keywords: ["soll", "geschlossen", "werden"], difficulty: 7 },
  { english: "The test must be written", german: "Der Test muss geschrieben werden", hints: ["muss + geschrieben + werden", "Test masculine"], keywords: ["muss", "geschrieben", "werden"], difficulty: 8 },
  { english: "The message can be sent later", german: "Die Nachricht kann später gesendet werden", hints: ["kann + später + gesendet", "später = later"], keywords: ["kann", "gesendet", "werden"], difficulty: 8 },
  { english: "The window should be opened", german: "Das Fenster soll geöffnet werden", hints: ["soll + geöffnet + werden", "Fenster neuter"], keywords: ["soll", "geöffnet", "werden"], difficulty: 7 },
  { english: "The project may be finished", german: "Das Projekt darf fertiggestellt werden", hints: ["darf = may/allowed", "fertiggestellt"], keywords: ["darf", "fertiggestellt", "werden"], difficulty: 8 },
  { english: "The report must be submitted", german: "Der Bericht muss abgegeben werden", hints: ["muss + abgegeben + werden", "Bericht masculine"], keywords: ["muss", "abgegeben", "werden"], difficulty: 8 },
  { english: "The plan can be changed", german: "Der Plan kann geändert werden", hints: ["kann + geändert + werden", "Plan masculine"], keywords: ["kann", "geändert", "werden"], difficulty: 8 },
  { english: "The contract should be signed", german: "Der Vertrag soll unterschrieben werden", hints: ["soll + unterschrieben", "Vertrag = contract"], keywords: ["soll", "unterschrieben", "werden"], difficulty: 8 },
  { english: "The mistake must be corrected", german: "Der Fehler muss korrigiert werden", hints: ["muss + korrigiert + werden", "Fehler masculine"], keywords: ["muss", "korrigiert", "werden"], difficulty: 8 },
  { english: "The question can be answered", german: "Die Frage kann beantwortet werden", hints: ["kann + beantwortet + werden", "Frage feminine"], keywords: ["kann", "beantwortet", "werden"], difficulty: 8 },
  { english: "The room should be reserved", german: "Das Zimmer soll reserviert werden", hints: ["soll + reserviert + werden", "Zimmer neuter"], keywords: ["soll", "reserviert", "werden"], difficulty: 8 },
  { english: "The food can be ordered", german: "Das Essen kann bestellt werden", hints: ["kann + bestellt + werden", "Essen neuter"], keywords: ["kann", "bestellt", "werden"], difficulty: 7 },
  { english: "The decision must be made", german: "Die Entscheidung muss getroffen werden", hints: ["muss + getroffen + werden", "Entscheidung treffen"], keywords: ["muss", "getroffen", "werden"], difficulty: 9 },
  { english: "The information can be found", german: "Die Information kann gefunden werden", hints: ["kann + gefunden + werden", "Information feminine"], keywords: ["kann", "gefunden", "werden"], difficulty: 8 }
];

// B2 Konjunktiv II for Wishes and Regrets
const b2SubjunctiveWishes: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "If only I were rich", german: "Wenn ich doch reich wäre", hints: ["wenn...doch", "wäre = subjunctive of sein"], keywords: ["wenn", "doch", "wäre"], difficulty: 8 },
  { english: "If only I had known that", german: "Hätte ich das nur gewusst", hints: ["hätte + past participle", "nur = only"], keywords: ["hätte", "nur", "gewusst"], difficulty: 8 },
  { english: "If only I had stayed home", german: "Wäre ich doch zu Hause geblieben", hints: ["wäre + past participle", "Past wish with sein"], keywords: ["wäre", "doch", "geblieben"], difficulty: 8 },
  { english: "I wish I could fly", german: "Ich wünschte, ich könnte fliegen", hints: ["ich wünschte + subjunctive", "könnte = could"], keywords: ["wünschte", "könnte"], difficulty: 8 },
  { english: "If only it would stop raining", german: "Wenn es doch aufhören würde zu regnen", hints: ["würde + infinitive", "aufhören = stop"], keywords: ["würde", "aufhören"], difficulty: 9 },
  { english: "I wish you were here", german: "Ich wünschte, du wärst hier", hints: ["wünschte + wärst", "wärst = you were (subj)"], keywords: ["wünschte", "wärst"], difficulty: 8 },
  { english: "If only I had more time", german: "Hätte ich doch mehr Zeit", hints: ["hätte + mehr", "Present wish about having"], keywords: ["hätte", "doch", "mehr"], difficulty: 7 },
  { english: "If only she had called", german: "Hätte sie doch angerufen", hints: ["hätte + past participle", "Past regret"], keywords: ["hätte", "angerufen"], difficulty: 8 },
  { english: "I wish I lived in Germany", german: "Ich wünschte, ich würde in Deutschland leben", hints: ["würde + infinitive", "leben = live"], keywords: ["wünschte", "würde", "leben"], difficulty: 8 },
  { english: "If only I had studied more", german: "Hätte ich nur mehr gelernt", hints: ["hätte + nur + past participle", "Past regret"], keywords: ["hätte", "nur", "gelernt"], difficulty: 8 },
  { english: "If only the weather were better", german: "Wenn das Wetter nur besser wäre", hints: ["wenn...nur", "wäre = were"], keywords: ["wenn", "nur", "wäre"], difficulty: 8 },
  { english: "I wish I could speak German", german: "Ich wünschte, ich könnte Deutsch sprechen", hints: ["könnte + infinitive", "Present wish"], keywords: ["wünschte", "könnte", "sprechen"], difficulty: 8 },
  { english: "If only they had listened", german: "Hätten sie nur zugehört", hints: ["hätten + zugehört", "Plural past regret"], keywords: ["hätten", "nur", "zugehört"], difficulty: 8 },
  { english: "If only I were younger", german: "Wäre ich doch jünger", hints: ["wäre + comparative", "jünger = younger"], keywords: ["wäre", "doch", "jünger"], difficulty: 8 },
  { english: "I wish I had gone", german: "Ich wünschte, ich wäre gegangen", hints: ["wünschte + wäre + past participle", "Motion verb"], keywords: ["wünschte", "wäre", "gegangen"], difficulty: 9 },
  { english: "If only they would help", german: "Würden sie doch helfen", hints: ["würden + infinitive", "Present wish about others"], keywords: ["würden", "doch", "helfen"], difficulty: 8 },
  { english: "If only I had money", german: "Hätte ich nur Geld", hints: ["hätte + nur", "Simple present wish"], keywords: ["hätte", "nur", "Geld"], difficulty: 7 },
  { english: "I wish it weren't so expensive", german: "Ich wünschte, es wäre nicht so teuer", hints: ["wünschte + wäre + nicht", "teuer = expensive"], keywords: ["wünschte", "wäre", "teuer"], difficulty: 8 },
  { english: "If only we had known", german: "Hätten wir nur gewusst", hints: ["hätten + nur + gewusst", "Plural past regret"], keywords: ["hätten", "nur", "gewusst"], difficulty: 8 },
  { english: "I wish I could help", german: "Ich wünschte, ich könnte helfen", hints: ["könnte + infinitive", "Present wish"], keywords: ["wünschte", "könnte", "helfen"], difficulty: 8 }
];

// B2 Alternatives to Passive Voice
const b2AlternativesPassive: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "German is spoken here", german: "Man spricht hier Deutsch", hints: ["man = one/people", "Active alternative to passive"], keywords: ["man", "spricht"], difficulty: 7 },
  { english: "That can be easily explained", german: "Das lässt sich leicht erklären", hints: ["sich lassen + infinitive", "Implies possibility"], keywords: ["lässt", "sich", "erklären"], difficulty: 8 },
  { english: "The book is easy to read", german: "Das Buch ist leicht zu lesen", hints: ["zu + infinitive", "Shows feasibility"], keywords: ["zu", "lesen"], difficulty: 8 },
  { english: "The text is difficult to understand", german: "Der Text ist schwer zu verstehen", hints: ["schwer + zu + infinitive", "Difficulty"], keywords: ["schwer", "zu", "verstehen"], difficulty: 8 },
  { english: "One can solve that", german: "Das kann man lösen", hints: ["man + kann", "Alternative to passive with modal"], keywords: ["man", "kann", "lösen"], difficulty: 7 },
  { english: "That cannot be changed", german: "Das lässt sich nicht ändern", hints: ["lässt sich nicht", "Negative possibility"], keywords: ["lässt", "sich", "nicht", "ändern"], difficulty: 8 },
  { english: "English is spoken everywhere", german: "Man spricht überall Englisch", hints: ["man + spricht", "überall = everywhere"], keywords: ["man", "überall"], difficulty: 7 },
  { english: "The problem is solvable", german: "Das Problem lässt sich lösen", hints: ["lässt sich + infinitive", "Solvable = can be solved"], keywords: ["lässt", "sich", "lösen"], difficulty: 8 },
  { english: "That is hard to believe", german: "Das ist schwer zu glauben", hints: ["schwer + zu + glauben", "glauben = believe"], keywords: ["schwer", "zu", "glauben"], difficulty: 8 },
  { english: "One says that...", german: "Man sagt, dass...", hints: ["man sagt = it is said", "Alternative to es wird gesagt"], keywords: ["man", "sagt"], difficulty: 7 },
  { english: "That can easily be done", german: "Das lässt sich leicht machen", hints: ["lässt sich leicht + infinitive", "machen = do"], keywords: ["lässt", "sich", "machen"], difficulty: 8 },
  { english: "The door is easy to open", german: "Die Tür ist leicht zu öffnen", hints: ["zu öffnen", "öffnen = open"], keywords: ["zu", "öffnen"], difficulty: 8 },
  { english: "One must work hard", german: "Man muss hart arbeiten", hints: ["man muss", "General statement"], keywords: ["man", "muss"], difficulty: 7 },
  { english: "That cannot be proven", german: "Das lässt sich nicht beweisen", hints: ["lässt sich nicht beweisen", "beweisen = prove"], keywords: ["lässt", "sich", "nicht", "beweisen"], difficulty: 9 },
  { english: "The task is impossible to complete", german: "Die Aufgabe ist unmöglich zu erledigen", hints: ["unmöglich + zu", "erledigen = complete"], keywords: ["unmöglich", "zu", "erledigen"], difficulty: 9 },
  { english: "One needs patience", german: "Man braucht Geduld", hints: ["man braucht = one needs", "Geduld = patience"], keywords: ["man", "braucht", "Geduld"], difficulty: 7 },
  { english: "That can be seen", german: "Das lässt sich sehen", hints: ["lässt sich sehen", "Visible/viewable"], keywords: ["lässt", "sich", "sehen"], difficulty: 8 },
  { english: "The question is difficult to answer", german: "Die Frage ist schwer zu beantworten", hints: ["schwer + zu beantworten", "beantworten = answer"], keywords: ["schwer", "zu", "beantworten"], difficulty: 8 },
  { english: "One can find it here", german: "Man kann es hier finden", hints: ["man kann finden", "Alternative to 'it can be found'"], keywords: ["man", "kann", "finden"], difficulty: 7 },
  { english: "That is not to be forgotten", german: "Das ist nicht zu vergessen", hints: ["nicht + zu + infinitive", "Should not be forgotten"], keywords: ["nicht", "zu", "vergessen"], difficulty: 8 }
];

// B2 Word Formation with Prefixes
const b2Prefixes: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "He sells cars", german: "Er verkauft Autos", hints: ["kaufen → verkaufen", "ver- changes meaning"], keywords: ["verkauft"], difficulty: 7 },
  { english: "I understand you", german: "Ich verstehe dich", hints: ["stehen → verstehen", "ver- prefix"], keywords: ["verstehe"], difficulty: 6 },
  { english: "She receives a gift", german: "Sie bekommt ein Geschenk", hints: ["kommen → bekommen", "be- prefix"], keywords: ["bekommt"], difficulty: 7 },
  { english: "We visit the museum", german: "Wir besuchen das Museum", hints: ["suchen → besuchen", "be- changes meaning"], keywords: ["besuchen"], difficulty: 7 },
  { english: "They discovered America", german: "Sie entdeckten Amerika", hints: ["decken → entdecken", "ent- = dis-/un-"], keywords: ["entdeckten"], difficulty: 7 },
  { english: "The company develops software", german: "Die Firma entwickelt Software", hints: ["wickeln → entwickeln", "ent- prefix"], keywords: ["entwickelt"], difficulty: 7 },
  { english: "That is impossible", german: "Das ist unmöglich", hints: ["möglich → unmöglich", "un- = un-/im-"], keywords: ["unmöglich"], difficulty: 6 },
  { english: "He is unhappy", german: "Er ist unglücklich", hints: ["glücklich → unglücklich", "un- negates"], keywords: ["unglücklich"], difficulty: 6 },
  { english: "I explain the rule", german: "Ich erkläre die Regel", hints: ["er- prefix", "erklären = explain"], keywords: ["erkläre"], difficulty: 7 },
  { english: "She tells a story", german: "Sie erzählt eine Geschichte", hints: ["zählen → erzählen", "er- changes meaning"], keywords: ["erzählt"], difficulty: 7 },
  { english: "The glass breaks", german: "Das Glas zerbricht", hints: ["brechen → zerbrechen", "zer- = into pieces"], keywords: ["zerbricht"], difficulty: 7 },
  { english: "The paper tears", german: "Das Papier zerreißt", hints: ["reißen → zerreißen", "zer- = tear apart"], keywords: ["zerreißt"], difficulty: 7 },
  { english: "He misunderstands me", german: "Er missversteht mich", hints: ["verstehen → missverstehen", "miss- = mis-"], keywords: ["missversteht"], difficulty: 8 },
  { english: "I trust you", german: "Ich vertraue dir", hints: ["ver- + trauen", "Dative verb"], keywords: ["vertraue"], difficulty: 7 },
  { english: "She forbids it", german: "Sie verbietet es", hints: ["bieten → verbieten", "ver- = for-"], keywords: ["verbietet"], difficulty: 7 },
  { english: "We escape", german: "Wir entkommen", hints: ["kommen → entkommen", "ent- = escape/away"], keywords: ["entkommen"], difficulty: 7 },
  { english: "He survives", german: "Er überlebt", hints: ["leben → überleben", "über- = over/survive"], keywords: ["überlebt"], difficulty: 7 },
  { english: "I forget it", german: "Ich vergesse es", hints: ["vergessen has ver-", "No ge- in past participle"], keywords: ["vergesse"], difficulty: 6 },
  { english: "That belongs to me", german: "Das gehört mir", hints: ["ge- prefix (rare)", "gehören = belong"], keywords: ["gehört"], difficulty: 7 },
  { english: "We employ workers", german: "Wir beschäftigen Arbeiter", hints: ["be- + schäftigen", "beschäftigen = employ"], keywords: ["beschäftigen"], difficulty: 8 }
];

// B2 Word Formation with Suffixes
const b2Suffixes: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The meaning is important", german: "Die Bedeutung ist wichtig", hints: ["bedeuten → -ung", "Feminine suffix"], keywords: ["Bedeutung"], difficulty: 7 },
  { english: "The apartment is small", german: "Die Wohnung ist klein", hints: ["wohnen → die Wohnung", "-ung feminine"], keywords: ["Wohnung"], difficulty: 6 },
  { english: "The illness is serious", german: "Die Krankheit ist ernst", hints: ["krank → -heit", "Feminine suffix"], keywords: ["Krankheit"], difficulty: 7 },
  { english: "The possibility exists", german: "Die Möglichkeit besteht", hints: ["möglich → -keit", "Feminine suffix"], keywords: ["Möglichkeit"], difficulty: 7 },
  { english: "The teacher is nice", german: "Der Lehrer ist nett", hints: ["lehren → -er", "Masculine suffix"], keywords: ["Lehrer"], difficulty: 6 },
  { english: "The worker is tired", german: "Der Arbeiter ist müde", hints: ["arbeiten → -er", "Masculine"], keywords: ["Arbeiter"], difficulty: 6 },
  { english: "Friendship is valuable", german: "Die Freundschaft ist wertvoll", hints: ["-schaft feminine", "Freund → Freundschaft"], keywords: ["Freundschaft"], difficulty: 7 },
  { english: "Science is fascinating", german: "Die Wissenschaft ist faszinierend", hints: ["wissen → -schaft", "Feminine"], keywords: ["Wissenschaft"], difficulty: 7 },
  { english: "The solution is simple", german: "Die Lösung ist einfach", hints: ["lösen → -ung", "Feminine"], keywords: ["Lösung"], difficulty: 7 },
  { english: "Freedom is important", german: "Die Freiheit ist wichtig", hints: ["frei → -heit", "Feminine"], keywords: ["Freiheit"], difficulty: 7 },
  { english: "The difficulty is great", german: "Die Schwierigkeit ist groß", hints: ["schwierig → -keit", "Feminine"], keywords: ["Schwierigkeit"], difficulty: 7 },
  { english: "The driver is careful", german: "Der Fahrer ist vorsichtig", hints: ["fahren → -er", "Masculine"], keywords: ["Fahrer"], difficulty: 6 },
  { english: "The painting is beautiful", german: "Die Malerei ist schön", hints: ["malen → -erei", "Feminine activity"], keywords: ["Malerei"], difficulty: 7 },
  { english: "The bakery is closed", german: "Die Bäckerei ist geschlossen", hints: ["backen → -erei", "Feminine shop"], keywords: ["Bäckerei"], difficulty: 7 },
  { english: "Loneliness hurts", german: "Die Einsamkeit tut weh", hints: ["einsam → -keit", "Feminine"], keywords: ["Einsamkeit"], difficulty: 7 },
  { english: "The development continues", german: "Die Entwicklung geht weiter", hints: ["entwickeln → -ung", "Feminine"], keywords: ["Entwicklung"], difficulty: 7 },
  { english: "The singer is famous", german: "Der Sänger ist berühmt", hints: ["singen → -er", "Masculine"], keywords: ["Sänger"], difficulty: 6 },
  { english: "The beauty is amazing", german: "Die Schönheit ist erstaunlich", hints: ["schön → -heit", "Feminine"], keywords: ["Schönheit"], difficulty: 7 },
  { english: "The economy grows", german: "Die Wirtschaft wächst", hints: ["-schaft suffix", "Wirtschaft = economy"], keywords: ["Wirtschaft"], difficulty: 7 },
  { english: "Honesty is the best policy", german: "Ehrlichkeit ist die beste Politik", hints: ["ehrlich → -keit", "Feminine"], keywords: ["Ehrlichkeit"], difficulty: 8 }
];

// B2 Expressing Purpose (um...zu, damit)
const b2Purpose: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I'm learning German to work in Germany", german: "Ich lerne Deutsch, um in Deutschland zu arbeiten", hints: ["um...zu", "Same subject both clauses"], keywords: ["um", "zu", "arbeiten"], difficulty: 8 },
  { english: "She goes to bed early to be fit tomorrow", german: "Sie geht früh ins Bett, um morgen fit zu sein", hints: ["um...zu", "Purpose clause"], keywords: ["um", "morgen", "zu", "sein"], difficulty: 8 },
  { english: "I'm calling you so that you know", german: "Ich rufe dich an, damit du Bescheid weißt", hints: ["damit", "Different subjects"], keywords: ["damit", "Bescheid", "weißt"], difficulty: 8 },
  { english: "He speaks slowly so everyone understands", german: "Er spricht langsam, damit alle ihn verstehen", hints: ["damit + verb to end", "alle = everyone"], keywords: ["damit", "alle", "verstehen"], difficulty: 8 },
  { english: "I study hard to pass the exam", german: "Ich lerne fleißig, um die Prüfung zu bestehen", hints: ["um...zu", "fleißig = diligently"], keywords: ["um", "zu", "bestehen"], difficulty: 8 },
  { english: "She saves money to buy a car", german: "Sie spart Geld, um ein Auto zu kaufen", hints: ["um...zu", "sparen = save"], keywords: ["um", "zu", "kaufen"], difficulty: 8 },
  { english: "I write it down so I don't forget", german: "Ich schreibe es auf, damit ich es nicht vergesse", hints: ["damit + nicht", "aufschreiben = write down"], keywords: ["damit", "nicht", "vergesse"], difficulty: 9 },
  { english: "He exercises to stay healthy", german: "Er trainiert, um gesund zu bleiben", hints: ["um...zu bleiben", "trainieren = exercise"], keywords: ["um", "zu", "bleiben"], difficulty: 8 },
  { english: "We speak German so they understand us", german: "Wir sprechen Deutsch, damit sie uns verstehen", hints: ["damit", "Different subjects"], keywords: ["damit", "verstehen"], difficulty: 8 },
  { english: "She wakes up early to catch the train", german: "Sie steht früh auf, um den Zug zu erreichen", hints: ["um...zu erreichen", "erreichen = catch"], keywords: ["um", "zu", "erreichen"], difficulty: 8 },
  { english: "I open the window to get fresh air", german: "Ich öffne das Fenster, um frische Luft zu bekommen", hints: ["um...zu bekommen", "frische Luft = fresh air"], keywords: ["um", "zu", "bekommen"], difficulty: 8 },
  { english: "She whispers so nobody hears", german: "Sie flüstert, damit niemand es hört", hints: ["damit", "niemand = nobody"], keywords: ["damit", "niemand", "hört"], difficulty: 8 },
  { english: "I hurry to arrive on time", german: "Ich beeile mich, um pünktlich anzukommen", hints: ["sich beeilen + um...zu", "Reflexive verb"], keywords: ["um", "pünktlich", "anzukommen"], difficulty: 9 },
  { english: "He explains slowly so everyone understands", german: "Er erklärt langsam, damit jeder es versteht", hints: ["damit + jeder", "jeder = everyone"], keywords: ["damit", "jeder", "versteht"], difficulty: 8 },
  { english: "We work hard to succeed", german: "Wir arbeiten hart, um Erfolg zu haben", hints: ["um...zu haben", "Erfolg = success"], keywords: ["um", "Erfolg", "zu", "haben"], difficulty: 8 },
  { english: "I use a dictionary to understand the text", german: "Ich benutze ein Wörterbuch, um den Text zu verstehen", hints: ["um...zu verstehen", "Wörterbuch = dictionary"], keywords: ["um", "zu", "verstehen"], difficulty: 8 },
  { english: "She closes the door so it's quiet", german: "Sie schließt die Tür, damit es ruhig ist", hints: ["damit + es ruhig ist", "ruhig = quiet"], keywords: ["damit", "ruhig"], difficulty: 8 },
  { english: "I practice every day to improve", german: "Ich übe jeden Tag, um mich zu verbessern", hints: ["sich verbessern + um...zu", "Reflexive"], keywords: ["um", "zu", "verbessern"], difficulty: 9 },
  { english: "He turns on the light so we can see", german: "Er macht das Licht an, damit wir sehen können", hints: ["damit + modal verb", "können at end"], keywords: ["damit", "können"], difficulty: 9 },
  { english: "I take notes to remember everything", german: "Ich mache Notizen, um alles zu erinnern", hints: ["um...zu erinnern", "Notizen = notes"], keywords: ["um", "zu", "erinnern"], difficulty: 8 }
];

// B2 Relative Pronouns in All Cases
const b2RelativePronounsAllCases: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The man who stands there", german: "Der Mann, der dort steht", hints: ["Nominative masculine", "der for masculine"], keywords: ["der", "steht"], difficulty: 7 },
  { english: "The book that I'm reading", german: "Das Buch, das ich lese", hints: ["Accusative neuter", "das object of lesen"], keywords: ["das", "lese"], difficulty: 7 },
  { english: "The woman whom I help", german: "Die Frau, der ich helfe", hints: ["Dative feminine", "helfen + dative"], keywords: ["der", "helfe"], difficulty: 8 },
  { english: "The man whose car is red", german: "Der Mann, dessen Auto rot ist", hints: ["Genitive masculine", "dessen = whose"], keywords: ["dessen", "ist"], difficulty: 9 },
  { english: "The girl who is singing", german: "Das Mädchen, das singt", hints: ["Nominative neuter", "Mädchen = neuter"], keywords: ["das", "singt"], difficulty: 7 },
  { english: "The friends whom I visited", german: "Die Freunde, die ich besucht habe", hints: ["Accusative plural", "die for plural"], keywords: ["die", "besucht"], difficulty: 8 },
  { english: "The children whom I gave books", german: "Die Kinder, denen ich Bücher gab", hints: ["Dative plural", "denen for plural dative"], keywords: ["denen", "gab"], difficulty: 9 },
  { english: "The woman whose daughter studies here", german: "Die Frau, deren Tochter hier studiert", hints: ["Genitive feminine", "deren = whose (fem/pl)"], keywords: ["deren", "studiert"], difficulty: 9 },
  { english: "The house that I bought", german: "Das Haus, das ich gekauft habe", hints: ["Accusative neuter", "kaufen + accusative"], keywords: ["das", "gekauft"], difficulty: 7 },
  { english: "The teacher whom I trust", german: "Der Lehrer, dem ich vertraue", hints: ["Dative masculine", "vertrauen + dative"], keywords: ["dem", "vertraue"], difficulty: 8 },
  { english: "The dog that is barking", german: "Der Hund, der bellt", hints: ["Nominative masculine", "der bellt"], keywords: ["der", "bellt"], difficulty: 7 },
  { english: "The car that he drives", german: "Das Auto, das er fährt", hints: ["Accusative neuter", "fahren = drive"], keywords: ["das", "fährt"], difficulty: 7 },
  { english: "The student whose book is lost", german: "Der Student, dessen Buch verloren ist", hints: ["Genitive masculine", "dessen Buch"], keywords: ["dessen", "verloren"], difficulty: 9 },
  { english: "The people with whom I work", german: "Die Leute, mit denen ich arbeite", hints: ["mit + dative", "denen for plural"], keywords: ["denen", "arbeite"], difficulty: 9 },
  { english: "The city that I like", german: "Die Stadt, die ich mag", hints: ["Accusative feminine", "mögen + accusative"], keywords: ["die", "mag"], difficulty: 7 },
  { english: "The neighbor whom I see daily", german: "Der Nachbar, den ich täglich sehe", hints: ["Accusative masculine", "den for masc acc"], keywords: ["den", "sehe"], difficulty: 8 },
  { english: "The students whose parents are teachers", german: "Die Studenten, deren Eltern Lehrer sind", hints: ["Genitive plural", "deren for pl genitive"], keywords: ["deren", "sind"], difficulty: 9 },
  { english: "The restaurant in which we ate", german: "Das Restaurant, in dem wir aßen", hints: ["in + dative", "dem for neuter dative"], keywords: ["dem", "aßen"], difficulty: 9 },
  { english: "The letter that I wrote", german: "Der Brief, den ich geschrieben habe", hints: ["Accusative masculine", "den for masc acc"], keywords: ["den", "geschrieben"], difficulty: 8 },
  { english: "The child to whom I gave candy", german: "Das Kind, dem ich Süßigkeiten gab", hints: ["Dative neuter", "geben + dative"], keywords: ["dem", "gab"], difficulty: 9 }
];

// B2 Conjunctional Adverbs
const b2ConjunctionalAdverbs: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "It's raining. Therefore I'm staying home", german: "Es regnet. Deshalb bleibe ich zu Hause", hints: ["deshalb = therefore", "Position 1, verb position 2"], keywords: ["deshalb", "bleibe"], difficulty: 7 },
  { english: "He's tired. Nevertheless he continues working", german: "Er ist müde. Trotzdem arbeitet er weiter", hints: ["trotzdem = nevertheless", "Verb second position"], keywords: ["trotzdem", "arbeitet"], difficulty: 7 },
  { english: "She's learning German. Additionally she's learning Spanish", german: "Sie lernt Deutsch. Außerdem lernt sie Spanisch", hints: ["außerdem = additionally", "Adverb position 1"], keywords: ["außerdem", "lernt"], difficulty: 7 },
  { english: "The weather is bad. Nevertheless we're going for a walk", german: "Das Wetter ist schlecht. Dennoch gehen wir spazieren", hints: ["dennoch = nevertheless", "Verb in position 2"], keywords: ["dennoch", "gehen"], difficulty: 7 },
  { english: "It's late. Therefore I must go", german: "Es ist spät. Daher muss ich gehen", hints: ["daher = therefore", "Modal verb in pos 2"], keywords: ["daher", "muss"], difficulty: 7 },
  { english: "I'm sick. Otherwise I would come", german: "Ich bin krank. Sonst würde ich kommen", hints: ["sonst = otherwise", "Konjunktiv II"], keywords: ["sonst", "würde"], difficulty: 8 },
  { english: "He studied hard. Consequently he passed", german: "Er lernte fleißig. Folglich bestand er die Prüfung", hints: ["folglich = consequently", "Formal connector"], keywords: ["folglich", "bestand"], difficulty: 8 },
  { english: "She's talented. Moreover she's hardworking", german: "Sie ist talentiert. Zudem ist sie fleißig", hints: ["zudem = moreover", "fleißig = hardworking"], keywords: ["zudem", "ist"], difficulty: 8 },
  { english: "I'm tired. Still I'll continue", german: "Ich bin müde. Trotzdem mache ich weiter", hints: ["trotzdem = still/nevertheless", "weitermachen"], keywords: ["trotzdem", "mache"], difficulty: 7 },
  { english: "It's expensive. Therefore I won't buy it", german: "Es ist teuer. Deshalb kaufe ich es nicht", hints: ["deshalb + nicht", "Won't buy"], keywords: ["deshalb", "kaufe", "nicht"], difficulty: 7 },
  { english: "He's young. Nevertheless he's experienced", german: "Er ist jung. Dennoch ist er erfahren", hints: ["dennoch", "erfahren = experienced"], keywords: ["dennoch", "ist"], difficulty: 7 },
  { english: "She's busy. Still she finds time", german: "Sie ist beschäftigt. Trotzdem findet sie Zeit", hints: ["trotzdem", "beschäftigt = busy"], keywords: ["trotzdem", "findet"], difficulty: 7 },
  { english: "I don't have money. Therefore I can't go", german: "Ich habe kein Geld. Deshalb kann ich nicht gehen", hints: ["deshalb + modal", "kann nicht"], keywords: ["deshalb", "kann"], difficulty: 7 },
  { english: "It's cold. Furthermore it's raining", german: "Es ist kalt. Außerdem regnet es", hints: ["außerdem", "Furthermore"], keywords: ["außerdem", "regnet"], difficulty: 7 },
  { english: "He forgot. Otherwise he would have called", german: "Er vergaß es. Sonst hätte er angerufen", hints: ["sonst + Konjunktiv II past", "hätte angerufen"], keywords: ["sonst", "hätte"], difficulty: 9 },
  { english: "She's intelligent. Besides she's friendly", german: "Sie ist intelligent. Zudem ist sie freundlich", hints: ["zudem = besides", "Positive connector"], keywords: ["zudem", "ist"], difficulty: 7 },
  { english: "It's difficult. Nevertheless it's possible", german: "Es ist schwierig. Dennoch ist es möglich", hints: ["dennoch", "Contrast connector"], keywords: ["dennoch", "ist"], difficulty: 7 },
  { english: "I'm learning. Therefore I'm improving", german: "Ich lerne. Daher verbessere ich mich", hints: ["daher", "sich verbessern = improve"], keywords: ["daher", "verbessere"], difficulty: 8 },
  { english: "He's sick. Consequently he stays home", german: "Er ist krank. Folglich bleibt er zu Hause", hints: ["folglich", "Formal consequence"], keywords: ["folglich", "bleibt"], difficulty: 7 },
  { english: "She agreed. Otherwise there would be problems", german: "Sie stimmte zu. Sonst gäbe es Probleme", hints: ["sonst + gäbe", "Konjunktiv II"], keywords: ["sonst", "gäbe"], difficulty: 9 }
];

// B2 Verbal Nouns Usage
const b2VerbalNouns: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Smoking is forbidden here", german: "Das Rauchen ist hier verboten", hints: ["rauchen → das Rauchen", "Neuter verb noun"], keywords: ["Rauchen", "verboten"], difficulty: 7 },
  { english: "I often fall asleep while reading", german: "Beim Lesen schlafe ich oft ein", hints: ["beim + verbal noun", "beim = while -ing"], keywords: ["Beim", "Lesen"], difficulty: 8 },
  { english: "I need time for cooking", german: "Zum Kochen brauche ich Zeit", hints: ["zum + verbal noun", "zum = for -ing"], keywords: ["Zum", "Kochen"], difficulty: 8 },
  { english: "Before eating we wash our hands", german: "Vor dem Essen waschen wir uns die Hände", hints: ["vor dem + verbal noun", "Reflexive waschen"], keywords: ["vor", "dem", "Essen"], difficulty: 8 },
  { english: "After working I relax", german: "Nach dem Arbeiten entspanne ich mich", hints: ["nach dem + verbal noun", "Reflexive entspannen"], keywords: ["nach", "dem", "Arbeiten"], difficulty: 8 },
  { english: "Swimming is healthy", german: "Das Schwimmen ist gesund", hints: ["schwimmen → das Schwimmen", "Subject of sentence"], keywords: ["Schwimmen", "gesund"], difficulty: 7 },
  { english: "While walking I listen to music", german: "Beim Gehen höre ich Musik", hints: ["beim Gehen", "Simultaneous action"], keywords: ["Beim", "Gehen"], difficulty: 8 },
  { english: "For learning I need quiet", german: "Zum Lernen brauche ich Ruhe", hints: ["zum Lernen", "Ruhe = quiet"], keywords: ["Zum", "Lernen"], difficulty: 8 },
  { english: "Before going to bed I brush my teeth", german: "Vor dem Schlafengehen putze ich mir die Zähne", hints: ["das Schlafengehen", "Compound verbal noun"], keywords: ["Schlafengehen"], difficulty: 9 },
  { english: "Studying is important", german: "Das Studieren ist wichtig", hints: ["studieren → das Studieren", "Importance statement"], keywords: ["Studieren"], difficulty: 7 },
  { english: "While driving I don't phone", german: "Beim Fahren telefoniere ich nicht", hints: ["beim Fahren", "Safety rule"], keywords: ["Beim", "Fahren"], difficulty: 8 },
  { english: "For writing I use a pen", german: "Zum Schreiben benutze ich einen Stift", hints: ["zum Schreiben", "einen Stift = a pen"], keywords: ["Zum", "Schreiben"], difficulty: 8 },
  { english: "After waking up I drink coffee", german: "Nach dem Aufwachen trinke ich Kaffee", hints: ["nach dem Aufwachen", "aufwachen = wake up"], keywords: ["nach", "dem", "Aufwachen"], difficulty: 8 },
  { english: "Dancing is fun", german: "Das Tanzen macht Spaß", hints: ["tanzen → das Tanzen", "Spaß machen = be fun"], keywords: ["Tanzen", "Spaß"], difficulty: 7 },
  { english: "While singing she dances", german: "Beim Singen tanzt sie", hints: ["beim Singen", "Simultaneous actions"], keywords: ["Beim", "Singen"], difficulty: 8 },
  { english: "For thinking I need silence", german: "Zum Denken brauche ich Stille", hints: ["zum Denken", "Stille = silence"], keywords: ["Zum", "Denken"], difficulty: 8 },
  { english: "Before leaving I lock the door", german: "Vor dem Gehen schließe ich die Tür ab", hints: ["vor dem Gehen", "abschließen = lock"], keywords: ["vor", "dem", "Gehen"], difficulty: 8 },
  { english: "Running is exhausting", german: "Das Laufen ist anstrengend", hints: ["laufen → das Laufen", "anstrengend = exhausting"], keywords: ["Laufen", "anstrengend"], difficulty: 7 },
  { english: "While waiting I read", german: "Beim Warten lese ich", hints: ["beim Warten", "warten = wait"], keywords: ["Beim", "Warten"], difficulty: 8 },
  { english: "For sleeping I need a bed", german: "Zum Schlafen brauche ich ein Bett", hints: ["zum Schlafen", "Need statement"], keywords: ["Zum", "Schlafen"], difficulty: 8 }
];

// B2 Advanced Negation Strategies
const b2Negation: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I have neither time nor money", german: "Ich habe weder Zeit noch Geld", hints: ["weder...noch", "Neither...nor construction"], keywords: ["weder", "noch"], difficulty: 8 },
  { english: "That is by no means simple", german: "Das ist keineswegs einfach", hints: ["keineswegs = by no means", "Emphatic negation"], keywords: ["keineswegs"], difficulty: 8 },
  { english: "I barely slept", german: "Ich habe kaum geschlafen", hints: ["kaum = barely/hardly", "Partial negation"], keywords: ["kaum"], difficulty: 7 },
  { english: "I will never do that", german: "Das werde ich niemals tun", hints: ["niemals = never", "Strong negation"], keywords: ["niemals"], difficulty: 7 },
  { english: "Nobody came", german: "Niemand kam", hints: ["niemand = nobody", "Subject negation"], keywords: ["niemand"], difficulty: 6 },
  { english: "Nothing helps", german: "Nichts hilft", hints: ["nichts = nothing", "Object negation"], keywords: ["nichts"], difficulty: 6 },
  { english: "I no longer live there", german: "Ich wohne dort nicht mehr", hints: ["nicht mehr = no longer", "Time negation"], keywords: ["nicht", "mehr"], difficulty: 7 },
  { english: "Not yet", german: "Noch nicht", hints: ["noch nicht = not yet", "Temporal negation"], keywords: ["noch", "nicht"], difficulty: 6 },
  { english: "I don't have any friends", german: "Ich habe keine Freunde", hints: ["keine = no/not any", "Noun negation"], keywords: ["keine"], difficulty: 6 },
  { english: "Neither of them came", german: "Keiner von ihnen kam", hints: ["keiner = none/neither", "Pronoun negation"], keywords: ["keiner"], difficulty: 7 },
  { english: "She can in no way help", german: "Sie kann auf keine Weise helfen", hints: ["auf keine Weise = in no way", "Manner negation"], keywords: ["keine", "Weise"], difficulty: 8 },
  { english: "I understand nothing", german: "Ich verstehe gar nichts", hints: ["gar nichts = nothing at all", "Emphatic"], keywords: ["gar", "nichts"], difficulty: 7 },
  { english: "He never comes on time", german: "Er kommt nie pünktlich", hints: ["nie = never", "Frequency negation"], keywords: ["nie"], difficulty: 6 },
  { english: "There is absolutely no reason", german: "Es gibt überhaupt keinen Grund", hints: ["überhaupt + kein", "Absolutely no"], keywords: ["überhaupt", "keinen"], difficulty: 8 },
  { english: "I don't have a car either", german: "Ich habe auch kein Auto", hints: ["auch...nicht/kein", "Either/neither"], keywords: ["auch", "kein"], difficulty: 7 },
  { english: "Nowhere is it cheaper", german: "Nirgendwo ist es billiger", hints: ["nirgendwo = nowhere", "Place negation"], keywords: ["nirgendwo"], difficulty: 8 },
  { english: "Under no circumstances", german: "Unter keinen Umständen", hints: ["unter keinen Umständen", "Fixed expression"], keywords: ["keinen", "Umständen"], difficulty: 9 },
  { english: "I seldom go there", german: "Ich gehe selten dorthin", hints: ["selten = seldom/rarely", "Frequency"], keywords: ["selten"], difficulty: 7 },
  { english: "Neither fish nor meat", german: "Weder Fisch noch Fleisch", hints: ["weder...noch idiom", "Neither one nor other"], keywords: ["weder", "noch"], difficulty: 8 },
  { english: "I don't trust anyone", german: "Ich vertraue niemandem", hints: ["niemandem = nobody (dative)", "Trust + dative"], keywords: ["niemandem"], difficulty: 8 }
];

// B2 Fixed Expressions with 'es'
const b2EsConstructions: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "I'm doing well", german: "Es geht mir gut", hints: ["es geht mir", "Fixed expression"], keywords: ["es", "geht", "mir"], difficulty: 7 },
  { english: "I'm sorry", german: "Es tut mir leid", hints: ["es tut mir leid", "Fixed apology"], keywords: ["es", "tut", "leid"], difficulty: 7 },
  { english: "It depends", german: "Es kommt darauf an", hints: ["es kommt darauf an", "Fixed expression"], keywords: ["es", "kommt", "darauf", "an"], difficulty: 8 },
  { english: "There are many people", german: "Es gibt viele Leute", hints: ["es gibt = there is/are", "Plural"], keywords: ["es", "gibt"], difficulty: 6 },
  { english: "It concerns the weather", german: "Es handelt sich um das Wetter", hints: ["es handelt sich um", "Concern/about"], keywords: ["es", "handelt", "sich"], difficulty: 9 },
  { english: "It's difficult for me", german: "Es fällt mir schwer", hints: ["es fällt mir schwer", "Difficulty"], keywords: ["es", "fällt", "schwer"], difficulty: 8 },
  { english: "It's easy for me", german: "Es fällt mir leicht", hints: ["es fällt mir leicht", "Ease"], keywords: ["es", "fällt", "leicht"], difficulty: 8 },
  { english: "It doesn't matter", german: "Es macht nichts", hints: ["es macht nichts", "No problem"], keywords: ["es", "macht", "nichts"], difficulty: 7 },
  { english: "How are you doing", german: "Wie geht es dir", hints: ["wie geht es dir/Ihnen", "How are you"], keywords: ["wie", "geht", "es"], difficulty: 6 },
  { english: "There is hope", german: "Es gibt Hoffnung", hints: ["es gibt singular", "Hoffnung = hope"], keywords: ["es", "gibt", "Hoffnung"], difficulty: 7 },
  { english: "It's about love", german: "Es geht um Liebe", hints: ["es geht um = it's about", "um + accusative"], keywords: ["es", "geht", "um"], difficulty: 8 },
  { english: "It's worth it", german: "Es lohnt sich", hints: ["es lohnt sich", "Worthwhile"], keywords: ["es", "lohnt", "sich"], difficulty: 8 },
  { english: "It hurts me", german: "Es tut mir weh", hints: ["es tut weh", "Physical/emotional pain"], keywords: ["es", "tut", "weh"], difficulty: 7 },
  { english: "It's a matter of time", german: "Es ist eine Frage der Zeit", hints: ["Fixed expression", "Genitive Zeit"], keywords: ["es", "Frage", "Zeit"], difficulty: 8 },
  { english: "It smells good", german: "Es riecht gut", hints: ["es riecht", "Impersonal smell"], keywords: ["es", "riecht"], difficulty: 6 },
  { english: "It's getting late", german: "Es wird spät", hints: ["es wird + adjective", "Time expression"], keywords: ["es", "wird", "spät"], difficulty: 7 },
  { english: "It's been a long time", german: "Es ist lange her", hints: ["es ist...her", "Time passed"], keywords: ["es", "ist", "her"], difficulty: 8 },
  { english: "There was an accident", german: "Es gab einen Unfall", hints: ["es gab = there was", "Past tense"], keywords: ["es", "gab"], difficulty: 7 },
  { english: "It seems to me that...", german: "Es scheint mir, dass...", hints: ["es scheint mir", "Opinion"], keywords: ["es", "scheint"], difficulty: 8 },
  { english: "It's up to you", german: "Es liegt an dir", hints: ["es liegt an + dative", "Your decision"], keywords: ["es", "liegt", "an"], difficulty: 8 }
];

// B2 Attributive Genitive
const b2AttributiveGenitive: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "The invention of the computer", german: "Die Erfindung des Computers", hints: ["Genitive masculine", "des + noun"], keywords: ["Erfindung", "des"], difficulty: 8 },
  { english: "The development of technology", german: "Die Entwicklung der Technologie", hints: ["Genitive feminine", "der + noun"], keywords: ["Entwicklung", "der"], difficulty: 8 },
  { english: "The end of the war", german: "Das Ende des Krieges", hints: ["Genitive masculine", "des Krieges"], keywords: ["Ende", "des"], difficulty: 8 },
  { english: "The capital of Germany", german: "Die Hauptstadt Deutschlands", hints: ["Proper noun genitive", "-s ending"], keywords: ["Hauptstadt", "Deutschlands"], difficulty: 8 },
  { english: "The color of the sky", german: "Die Farbe des Himmels", hints: ["Genitive masculine", "des Himmels"], keywords: ["Farbe", "des"], difficulty: 8 },
  { english: "The beginning of the story", german: "Der Anfang der Geschichte", hints: ["Genitive feminine", "der Geschichte"], keywords: ["Anfang", "der"], difficulty: 8 },
  { english: "The price of freedom", german: "Der Preis der Freiheit", hints: ["Genitive feminine", "Abstract noun"], keywords: ["Preis", "der"], difficulty: 8 },
  { english: "The history of Europe", german: "Die Geschichte Europas", hints: ["Proper noun genitive", "Europas"], keywords: ["Geschichte", "Europas"], difficulty: 8 },
  { english: "The beauty of nature", german: "Die Schönheit der Natur", hints: ["Genitive feminine", "der Natur"], keywords: ["Schönheit", "der"], difficulty: 8 },
  { english: "The roof of the house", german: "Das Dach des Hauses", hints: ["Genitive neuter", "des Hauses"], keywords: ["Dach", "des"], difficulty: 8 },
  { english: "The meaning of life", german: "Die Bedeutung des Lebens", hints: ["Genitive neuter", "des Lebens"], keywords: ["Bedeutung", "des"], difficulty: 8 },
  { english: "The name of the city", german: "Der Name der Stadt", hints: ["Genitive feminine", "der Stadt"], keywords: ["Name", "der"], difficulty: 7 },
  { english: "The arrival of the train", german: "Die Ankunft des Zuges", hints: ["Genitive masculine", "des Zuges"], keywords: ["Ankunft", "des"], difficulty: 8 },
  { english: "The inhabitants of the country", german: "Die Einwohner des Landes", hints: ["Genitive neuter", "des Landes"], keywords: ["Einwohner", "des"], difficulty: 8 },
  { english: "The author of the book", german: "Der Autor des Buches", hints: ["Genitive neuter", "des Buches"], keywords: ["Autor", "des"], difficulty: 8 },
  { english: "The top of the mountain", german: "Die Spitze des Berges", hints: ["Genitive masculine", "des Berges"], keywords: ["Spitze", "des"], difficulty: 8 },
  { english: "The members of the club", german: "Die Mitglieder des Vereins", hints: ["Genitive masculine", "des Vereins"], keywords: ["Mitglieder", "des"], difficulty: 8 },
  { english: "The center of the city", german: "Das Zentrum der Stadt", hints: ["Genitive feminine", "der Stadt"], keywords: ["Zentrum", "der"], difficulty: 8 },
  { english: "The result of the test", german: "Das Ergebnis des Tests", hints: ["Genitive masculine", "des Tests"], keywords: ["Ergebnis", "des"], difficulty: 8 },
  { english: "The edge of the forest", german: "Der Rand des Waldes", hints: ["Genitive masculine", "des Waldes"], keywords: ["Rand", "des"], difficulty: 8 }
];

// B2 Tense in Reported Speech
const b2ReportedSpeech: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "He said he was tired", german: "Er sagte, er sei müde", hints: ["Konjunktiv I: sei", "Present reported"], keywords: ["sagte", "sei"], difficulty: 9 },
  { english: "She said she had eaten", german: "Sie sagte, sie habe gegessen", hints: ["Konjunktiv I perfect: habe", "Past reported"], keywords: ["sagte", "habe"], difficulty: 9 },
  { english: "He said he would come", german: "Er sagte, er werde kommen", hints: ["Konjunktiv I future: werde", "Future reported"], keywords: ["sagte", "werde"], difficulty: 9 },
  { english: "They said they were happy", german: "Sie sagten, sie seien glücklich", hints: ["Konjunktiv I plural: seien", "Plural reported"], keywords: ["sagten", "seien"], difficulty: 9 },
  { english: "She claimed she knew nothing", german: "Sie behauptete, sie wisse nichts", hints: ["Konjunktiv I: wisse", "wissen irregular"], keywords: ["behauptete", "wisse"], difficulty: 9 },
  { english: "He reported it was expensive", german: "Er berichtete, es sei teuer", hints: ["berichten + Konjunktiv I", "Reporting verb"], keywords: ["berichtete", "sei"], difficulty: 9 },
  { english: "She mentioned she had time", german: "Sie erwähnte, sie habe Zeit", hints: ["erwähnen + Konjunktiv I", "habe Zeit"], keywords: ["erwähnte", "habe"], difficulty: 9 },
  { english: "They announced they would arrive soon", german: "Sie kündigten an, sie würden bald ankommen", hints: ["würden for unclear forms", "Konjunktiv II"], keywords: ["kündigten", "würden"], difficulty: 10 },
  { english: "He explained it was difficult", german: "Er erklärte, es sei schwierig", hints: ["erklären + Konjunktiv I", "sei schwierig"], keywords: ["erklärte", "sei"], difficulty: 9 },
  { english: "She confirmed she had understood", german: "Sie bestätigte, sie habe verstanden", hints: ["bestätigen + perfect", "habe verstanden"], keywords: ["bestätigte", "habe"], difficulty: 9 },
  { english: "He promised he would help", german: "Er versprach, er werde helfen", hints: ["versprechen + future", "werde helfen"], keywords: ["versprach", "werde"], difficulty: 9 },
  { english: "They said it was possible", german: "Sie sagten, es sei möglich", hints: ["Konjunktiv I: sei", "möglich = possible"], keywords: ["sagten", "sei"], difficulty: 9 },
  { english: "She admitted she had lied", german: "Sie gab zu, sie habe gelogen", hints: ["zugeben + perfect", "habe gelogen"], keywords: ["gab", "habe"], difficulty: 10 },
  { english: "He insisted he was right", german: "Er bestand darauf, er habe recht", hints: ["bestehen auf + Konjunktiv I", "habe recht"], keywords: ["bestand", "habe"], difficulty: 10 },
  { english: "She believed she could win", german: "Sie glaubte, sie könne gewinnen", hints: ["Konjunktiv I: könne", "können irregular"], keywords: ["glaubte", "könne"], difficulty: 9 },
  { english: "They informed us it was ready", german: "Sie informierten uns, es sei fertig", hints: ["informieren + Konjunktiv I", "sei fertig"], keywords: ["informierten", "sei"], difficulty: 9 },
  { english: "He denied he had seen it", german: "Er leugnete, er habe es gesehen", hints: ["leugnen + perfect", "habe gesehen"], keywords: ["leugnete", "habe"], difficulty: 10 },
  { english: "She assured it would work", german: "Sie versicherte, es werde funktionieren", hints: ["versichern + future", "werde funktionieren"], keywords: ["versicherte", "werde"], difficulty: 9 },
  { english: "He claimed he had won", german: "Er behauptete, er habe gewonnen", hints: ["behaupten + perfect", "habe gewonnen"], keywords: ["behauptete", "habe"], difficulty: 9 },
  { english: "They said there was a problem", german: "Sie sagten, es gebe ein Problem", hints: ["Konjunktiv I: gebe", "es gibt → gebe"], keywords: ["sagten", "gebe"], difficulty: 10 }
];

// B2 Concessive Clauses
const b2ConcessiveClauses: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "Although it's raining, I'm going for a walk", german: "Obwohl es regnet, gehe ich spazieren", hints: ["obwohl + verb to end", "Subordinating conjunction"], keywords: ["obwohl", "regnet", "gehe"], difficulty: 8 },
  { english: "Despite the rain, I'm going for a walk", german: "Trotz des Regens gehe ich spazieren", hints: ["trotz + genitive", "Preposition"], keywords: ["trotz", "des"], difficulty: 8 },
  { english: "It's raining. Nevertheless I'm going for a walk", german: "Es regnet. Trotzdem gehe ich spazieren", hints: ["trotzdem = nevertheless", "Adverb, verb second"], keywords: ["trotzdem", "gehe"], difficulty: 7 },
  { english: "However tired I am, I must work", german: "So müde ich auch bin, ich muss arbeiten", hints: ["so...auch", "Concessive construction"], keywords: ["so", "auch", "bin"], difficulty: 9 },
  { english: "Although he's young, he's experienced", german: "Obwohl er jung ist, ist er erfahren", hints: ["obwohl + ist", "Contrast"], keywords: ["obwohl", "ist"], difficulty: 8 },
  { english: "Despite his age, he's fit", german: "Trotz seines Alters ist er fit", hints: ["trotz + genitive", "seines Alters"], keywords: ["trotz", "seines"], difficulty: 8 },
  { english: "It's expensive. Still I'll buy it", german: "Es ist teuer. Dennoch kaufe ich es", hints: ["dennoch = still", "Adverb"], keywords: ["dennoch", "kaufe"], difficulty: 7 },
  { english: "Although she studies, she fails", german: "Obwohl sie lernt, fällt sie durch", hints: ["obwohl + lernt", "durchfallen = fail"], keywords: ["obwohl", "lernt", "fällt"], difficulty: 8 },
  { english: "Despite the cold, we went out", german: "Trotz der Kälte gingen wir aus", hints: ["trotz + genitive feminine", "der Kälte"], keywords: ["trotz", "der"], difficulty: 8 },
  { english: "However much he tries, he can't do it", german: "So sehr er sich auch bemüht, er kann es nicht", hints: ["so sehr...auch", "Reflexive bemühen"], keywords: ["so", "auch", "bemüht"], difficulty: 10 },
  { english: "Although it's late, he's still working", german: "Obwohl es spät ist, arbeitet er noch", hints: ["obwohl + ist", "noch = still"], keywords: ["obwohl", "ist", "noch"], difficulty: 8 },
  { english: "Despite the problems, we continue", german: "Trotz der Probleme machen wir weiter", hints: ["trotz + genitive plural", "der Probleme"], keywords: ["trotz", "der"], difficulty: 8 },
  { english: "It's difficult. Nevertheless I try", german: "Es ist schwierig. Trotzdem versuche ich es", hints: ["trotzdem + verb second", "versuchen = try"], keywords: ["trotzdem", "versuche"], difficulty: 7 },
  { english: "Although I'm tired, I can't sleep", german: "Obwohl ich müde bin, kann ich nicht schlafen", hints: ["obwohl + bin", "Modal verb"], keywords: ["obwohl", "bin", "kann"], difficulty: 8 },
  { english: "Despite the heat, she wore a jacket", german: "Trotz der Hitze trug sie eine Jacke", hints: ["trotz + genitive", "der Hitze"], keywords: ["trotz", "der"], difficulty: 8 },
  { english: "However hard I work, it's not enough", german: "So hart ich auch arbeite, es reicht nicht", hints: ["so...auch construction", "reichen = suffice"], keywords: ["so", "auch", "arbeite"], difficulty: 9 },
  { english: "Although she's rich, she's unhappy", german: "Obwohl sie reich ist, ist sie unglücklich", hints: ["obwohl + ist", "Paradox"], keywords: ["obwohl", "ist"], difficulty: 8 },
  { english: "Despite my efforts, I failed", german: "Trotz meiner Bemühungen scheiterte ich", hints: ["trotz + genitive", "meiner Bemühungen"], keywords: ["trotz", "meiner"], difficulty: 9 },
  { english: "He's sick. Nevertheless he came", german: "Er ist krank. Dennoch kam er", hints: ["dennoch = nevertheless", "Came despite illness"], keywords: ["dennoch", "kam"], difficulty: 7 },
  { english: "However often I explain, he doesn't understand", german: "So oft ich es auch erkläre, er versteht es nicht", hints: ["so oft...auch", "Repeated action"], keywords: ["so", "oft", "auch"], difficulty: 10 }
];

// B2 Emphatic Structures
const b2EmphaticStructures: Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[] = [
  { english: "That was what I wanted to say", german: "Das war es, was ich sagen wollte", hints: ["das war es, was...", "Emphatic cleft"], keywords: ["das", "war", "es", "was"], difficulty: 9 },
  { english: "He is the one who helped me", german: "Er ist es, der mir geholfen hat", hints: ["er ist es, der...", "Emphasizing subject"], keywords: ["ist", "es", "der"], difficulty: 9 },
  { english: "That's exactly why I'm doing this", german: "Gerade deshalb mache ich das", hints: ["gerade = exactly", "Emphasis particle"], keywords: ["gerade", "deshalb"], difficulty: 8 },
  { english: "Of all days, it has to rain today", german: "Ausgerechnet heute muss es regnen", hints: ["ausgerechnet = of all", "Bad timing"], keywords: ["ausgerechnet", "heute"], difficulty: 8 },
  { english: "You are the one I meant", german: "Du bist es, den ich meinte", hints: ["du bist es, den...", "Accusative relative"], keywords: ["bist", "es", "den"], difficulty: 9 },
  { english: "That's precisely the problem", german: "Genau das ist das Problem", hints: ["genau = precisely", "Front position"], keywords: ["genau", "das"], difficulty: 7 },
  { english: "Only now do I understand", german: "Erst jetzt verstehe ich", hints: ["erst = only", "Time emphasis"], keywords: ["erst", "jetzt"], difficulty: 7 },
  { english: "Even he couldn't do it", german: "Selbst er konnte es nicht", hints: ["selbst = even", "Surprising"], keywords: ["selbst", "konnte"], difficulty: 8 },
  { english: "That's exactly it", german: "Genau das ist es", hints: ["genau das", "Agreement/confirmation"], keywords: ["genau", "das", "ist"], difficulty: 7 },
  { english: "Just for that reason", german: "Eben deshalb", hints: ["eben = just/exactly", "Emphatic particle"], keywords: ["eben", "deshalb"], difficulty: 8 },
  { english: "It was you who said that", german: "Du warst es, der das gesagt hat", hints: ["du warst es, der...", "Blame/credit"], keywords: ["warst", "es", "der"], difficulty: 9 },
  { english: "Of all people, he forgot", german: "Ausgerechnet er hat es vergessen", hints: ["ausgerechnet er", "Ironic"], keywords: ["ausgerechnet", "er"], difficulty: 8 },
  { english: "That's the very thing I need", german: "Genau das brauche ich", hints: ["genau das", "Perfect fit"], keywords: ["genau", "das", "brauche"], difficulty: 7 },
  { english: "Only then did I notice", german: "Erst dann bemerkte ich", hints: ["erst dann", "Delayed realization"], keywords: ["erst", "dann"], difficulty: 7 },
  { english: "Even the teacher made mistakes", german: "Selbst der Lehrer machte Fehler", hints: ["selbst + subject", "Surprising subject"], keywords: ["selbst", "der"], difficulty: 8 },
  { english: "That's absolutely correct", german: "Genau so ist es", hints: ["genau so", "Emphatic agreement"], keywords: ["genau", "so"], difficulty: 7 },
  { english: "It's the truth that matters", german: "Es ist die Wahrheit, die zählt", hints: ["es ist..., die...", "Cleft sentence"], keywords: ["ist", "die", "zählt"], difficulty: 9 },
  { english: "Just because of that", german: "Gerade deswegen", hints: ["gerade deswegen", "Causal emphasis"], keywords: ["gerade", "deswegen"], difficulty: 7 },
  { english: "You yourself said it", german: "Du selbst hast es gesagt", hints: ["selbst after pronoun", "You personally"], keywords: ["selbst", "hast"], difficulty: 7 },
  { english: "That's the exact reason", german: "Das ist genau der Grund", hints: ["genau der Grund", "Precise reason"], keywords: ["genau", "der", "Grund"], difficulty: 7 }
];

// Add more rule sets as needed
const sentenceData: Record<string, Record<string, Omit<GrammarSentence, 'sentenceId' | 'ruleId'>[]>> = {
  a1: {
    'a1-articles-definite': a1ArticlesDefinite,
    'a1-articles-indefinite': a1ArticlesIndefinite,
    'a1-present-tense-regular': a1PresentTenseRegular,
    'a1-present-tense-sein': a1PresentTenseSein,
    'a1-present-tense-haben': a1PresentTenseHaben,
    'a1-word-order-basic': a1WordOrderBasic,
    'a1-nominative-case': a1NominativeCase,
    'a1-accusative-case': a1AccusativeCase,
    'a1-personal-pronouns': a1PersonalPronouns,
    'a1-numbers-1-20': a1Numbers120,
    'a1-negation-nicht': a1NegationNicht,
    'a1-negation-kein': a1NegationKein,
    'a1-questions-yes-no': a1QuestionsYesNo,
    'a1-questions-w-questions': a1QuestionsWQuestions,
    'a1-plural-formation': a1PluralFormation,
    'a1-adjectives-basic': a1AdjectivesBasic,
    'a1-possessives-mein-dein': a1PossessivesMeinDein,
    'a1-prepositions-in-aus': a1PrepositionsInAus,
    'a1-time-days-week': a1TimeDaysWeek,
    'a1-time-months': a1TimeMonths,
    'a1-greetings': a1Greetings,
    'a1-numbers-20-100': a1Numbers20100,
    'a1-telling-time-basic': a1TellingTimeBasic,
    'a1-verb-moechten': a1VerbMoechten,
    'a1-common-verbs': a1CommonVerbs,
    'a1-courtesy-phrases': a1CourtesyPhrases,
  },
  a2: {
    'a2-perfect-tense': a2PerfectTenseSentences,
    'a2-dative-case': a2DativeCaseSentences,
    'a2-modal-verbs': a2ModalVerbsSentences,
    'a2-comparative-adjectives': a2ComparativeAdjectivesSentences,
    'a2-separable-verbs': a2SeparableVerbsSentences,
    'a2-two-way-prepositions': a2TwoWayPrepositionsSentences,
    'a2-reflexive-verbs': a2ReflexiveVerbsSentences,
    'a2-imperative': a2ImperativeSentences,
    'a2-possessive-pronouns': a2PossessivePronounsSentences,
    'a2-past-tense-sein-haben': a2PastTenseSeinhaben,
    'a2-subordinating-conjunctions': a2SubordinatingConjunctions,
    'a2-coordinating-conjunctions': a2CoordinatingConjunctions,
    'a2-superlative-adjectives': a2SuperlativeAdjectives,
    'a2-time-expressions': a2TimeExpressions,
    'a2-dative-verbs': a2DativeVerbs,
    'a2-adjective-endings': a2AdjectiveEndings,
    'a2-future-tense': a2FutureTense,
  },
  b1: {
    'b1-subordinate-clauses': b1SubordinateClauses,
    'b1-genitive-case': b1GenitiveCase,
    'b1-passive-voice': b1PassiveVoice,
    'b1-konjunktiv-ii': b1KonjunktivII,
    'b1-relative-clauses': b1RelativeClauses,
    'b1-preterite-tense': b1PreteriteTense,
    'b1-preterite-irregular': b1PreteriteIrregular,
    'b1-infinitive-with-zu': b1InfinitiveWithZu,
    'b1-genitive-prepositions': b1GenitivePrepositions,
    'b1-adverbs-of-degree': b1AdverbsOfDegree,
    'b1-compound-nouns': b1CompoundNouns,
    'b1-adjectival-nouns': b1AdjectivalNouns,
    'b1-indirect-questions': b1IndirectQuestions,
    'b1-word-order-tekamolo': b1WordOrderTekamolo,
    'b1-comparative-structures': b1ComparativeStructures,
    'b1-double-infinitive': b1DoubleInfinitive,
    'b1-n-declension': b1NDeclension,
    'b1-als-wenn-wann': b1AlsWennWann,
    'b1-lassen-construction': b1LassenConstruction,
    'b1-es-as-placeholder': b1EsAsPlaceholder,
    'b1-plusquamperfekt': b1Plusquamperfekt,
  },
  b2: {
    'b2-partizip-i': b2PartizipI,
    'b2-extended-adjective-constructions': b2ExtendedAdjective,
    'b2-nominalization': b2Nominalization,
    'b2-future-perfect': b2FuturePerfect,
    'b2-partizip-ii-as-adjective': b2PartizipIIAdjective,
    'b2-passive-with-modals': b2PassiveModals,
    'b2-subjunctive-for-wishes': b2SubjunctiveWishes,
    'b2-alternative-to-passive': b2AlternativesPassive,
    'b2-word-formation-prefixes': b2Prefixes,
    'b2-word-formation-suffixes': b2Suffixes,
    'b2-expressing-purpose': b2Purpose,
    'b2-relative-pronouns-all-cases': b2RelativePronounsAllCases,
    'b2-conjunctional-adverbs': b2ConjunctionalAdverbs,
    'b2-verbal-nouns-usage': b2VerbalNouns,
    'b2-negation-strategies': b2Negation,
    'b2-es-constructions': b2EsConstructions,
    'b2-attributive-genitive': b2AttributiveGenitive,
    'b2-reported-speech-tense': b2ReportedSpeech,
    'b2-concessive-clauses': b2ConcessiveClauses,
    'b2-emphatic-structures': b2EmphaticStructures,
  }
};

function fillSentences(level: string): void {
  console.log(`\n📝 Filling sentences for ${level.toUpperCase()}...`);

  const sentencesFile = path.join(SENTENCES_DIR, `${level}.json`);
  if (!fs.existsSync(sentencesFile)) {
    console.error(`   ❌ Sentences file not found: ${sentencesFile}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(sentencesFile, 'utf-8'));
  const sentences = data.sentences as GrammarSentence[];

  const levelData = sentenceData[level];
  if (!levelData) {
    console.log(`   ⚠️  No sentence data defined for ${level} yet`);
    return;
  }

  let updatedCount = 0;

  for (const [ruleId, newSentences] of Object.entries(levelData)) {
    const ruleSentences = sentences.filter(s => s.ruleId === ruleId);

    for (let i = 0; i < newSentences.length && i < ruleSentences.length; i++) {
      const sentence = ruleSentences[i];
      const newData = newSentences[i];

      if (sentence.english.includes('[TODO')) {
        sentence.english = newData.english;
        sentence.german = newData.german;
        sentence.hints = newData.hints;
        sentence.keywords = newData.keywords;
        sentence.difficulty = newData.difficulty;
        updatedCount++;
      }
    }

    console.log(`   ✅ ${ruleId}: ${newSentences.length} sentences filled`);
  }

  // Update completion percentage
  const todoCount = sentences.filter(s => s.english.includes('[TODO')).length;
  data.completionPercentage = Math.round(((sentences.length - todoCount) / sentences.length) * 100);

  fs.writeFileSync(sentencesFile, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n   📊 Summary:`);
  console.log(`      Updated: ${updatedCount} sentences`);
  console.log(`      Remaining TODOs: ${todoCount}`);
  console.log(`      Completion: ${data.completionPercentage}%`);
  console.log(`   ✅ Saved to: ${sentencesFile}\n`);
}

function main() {
  const args = process.argv.slice(2);
  const targetLevel = args[0]?.toLowerCase();

  if (!targetLevel) {
    console.log('\n❌ Please specify a level');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/fill-grammar-sentences.ts [level]');
    console.log('\nExample:');
    console.log('  npx tsx scripts/fill-grammar-sentences.ts a2');
    process.exit(1);
  }

  fillSentences(targetLevel);
}

main();
