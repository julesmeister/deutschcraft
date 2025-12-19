#!/usr/bin/env tsx
// B1 Grammar Sentences - Batch 2 (Rules 6-15)
// This file contains sentences for B1 rules 6-15
// Copy these arrays into the main fill-grammar-sentences.ts file

import { GrammarSentence } from './fill-grammar-sentences';

type SentenceData = Omit<GrammarSentence, 'sentenceId' | 'ruleId'>;

// B1 Preterite Tense (Regular Verbs)
export const b1PreteriteTense: SentenceData[] = [
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
  { english: "I asked for the bill", german: "Ich bat um die Rechnung", hints: ["bitten → bat (irregular!)", "Actually irregular"], keywords: ["bat"], difficulty: 7 },
  { english: "They cleaned the house", german: "Sie putzten das Haus", hints: ["putzen → putzten", "Regular plural"], keywords: ["putzten"], difficulty: 7 },
  { english: "She smiled at me", german: "Sie lächelte mich an", hints: ["anlächeln → lächelte...an", "Separable in preterite"], keywords: ["lächelte"], difficulty: 7 },
  { english: "We followed the road", german: "Wir folgten der Straße", hints: ["folgen → folgten", "Takes dative"], keywords: ["folgten"], difficulty: 7 },
  { english: "He placed the book on the table", german: "Er legte das Buch auf den Tisch", hints: ["legen → legte", "Regular but note accusative"], keywords: ["legte"], difficulty: 7 }
];

// B1 Preterite Irregular
export const b1PreteriteIrregular: SentenceData[] = [
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
export const b1InfinitiveWithZu: SentenceData[] = [
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
  { english: "She stopped smoking", german: "Sie hörte auf zu rauchen", hints: ["aufhören + zu", "zu between auf and hören? No!"], keywords: ["aufhören", "zu"], difficulty: 8 },
  { english: "I have the opportunity to work abroad", german: "Ich habe die Möglichkeit, im Ausland zu arbeiten", hints: ["Möglichkeit haben + zu", "Long zu-clause"], keywords: ["Möglichkeit", "zu"], difficulty: 8 },
  { english: "He seems to be tired", german: "Er scheint müde zu sein", hints: ["scheinen + zu", "No comma"], keywords: ["scheint", "zu"], difficulty: 7 },
  { english: "We managed to find it", german: "Es gelang uns, es zu finden", hints: ["gelingen + zu", "es gelang uns"], keywords: ["gelang", "zu"], difficulty: 9 },
  { english: "I'm looking forward to seeing you", german: "Ich freue mich darauf, dich zu sehen", hints: ["sich freuen darauf + zu", "Prepositional object"], keywords: ["darauf", "zu"], difficulty: 9 }
];

// B1 Genitive Prepositions
export const b1GenitivePrepositions: SentenceData[] = [
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
export const b1AdverbsOfDegree: SentenceData[] = [
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

console.log('B1 Batch 2 sentences defined. Copy arrays into main file.');
