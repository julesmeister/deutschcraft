/**
 * C2 Level Redemittel - Mastery phrases
 */

import { Redemittel } from "./types";

export const c2Redemittel: Redemittel[] = [
  // ============================================
  // Sophisticated Correspondence
  // ============================================
  {
    id: "c2-letter-1",
    german: "Hochverehrter Herr..., / Hochverehrte Frau...,",
    english: "Highly esteemed Mr... / Ms...,",
    context: "letter",
    level: "C2",
    tags: ["letter", "highly-formal", "opening"],
  },
  {
    id: "c2-letter-2",
    german: "In der Hoffnung auf eine wohlwollende Prüfung meines Anliegens...",
    english: "Hoping for a benevolent consideration of my request...",
    context: "letter",
    level: "C2",
    tags: ["letter", "highly-formal", "closing-transition"],
  },

  // ============================================
  // Sophisticated Openings & Address
  // ============================================
  {
    id: "c2-greet-1",
    german: "Hochverehrte Gäste, ...",
    english: "Distinguished guests, ...",
    context: "greetings",
    level: "C2",
    tags: ["speech", "highly-formal"],
  },
  {
    id: "c2-greet-2",
    german: "Mit vorzüglicher Hochachtung...",
    english: "With highest regards... (Closing but related to address)",
    context: "greetings",
    level: "C2",
    tags: ["written", "highly-formal"],
  },
  {
    id: "c2-greet-3",
    german: "Es erfüllt mich mit großer Genugtuung, Sie hier zu wissen.",
    english: "It fills me with great satisfaction to know you are here.",
    context: "greetings",
    level: "C2",
    tags: ["sophisticated", "emotional"],
  },

  // ============================================
  // Nuanced Transitions
  // ============================================
  {
    id: "c2-nuance-1",
    german: "Ungeachtet dessen...",
    english: "Notwithstanding...",
    context: "transitioning",
    level: "C2",
    example: "Ungeachtet dessen müssen wir die Konsequenzen bedenken.",
    exampleTranslation: "Notwithstanding, we must consider the consequences.",
    tags: ["formal", "sophisticated"],
  },
  {
    id: "c2-nuance-2",
    german: "Unbeschadet der Tatsache, dass...",
    english: "Without prejudice to the fact that...",
    context: "transitioning",
    level: "C2",
    example:
      "Unbeschadet der Tatsache, dass Fortschritte erzielt wurden, bleiben Herausforderungen.",
    exampleTranslation:
      "Without prejudice to the fact that progress has been made, challenges remain.",
    tags: ["formal", "sophisticated", "legal"],
  },
  {
    id: "c2-transition-1",
    german: "Wenngleich...",
    english: "Albeit...",
    context: "transitioning",
    level: "C2",
    example:
      "Wenngleich die Ergebnisse vielversprechend sind, bedarf es weiterer Untersuchungen.",
    exampleTranslation:
      "Albeit the results are promising, further investigations are needed.",
    tags: ["formal", "concession"],
  },
  {
    id: "c2-transition-2",
    german: "Dessen ungeachtet...",
    english: "Regardless of that...",
    context: "transitioning",
    level: "C2",
    example:
      "Dessen ungeachtet bleibt die grundsätzliche Problematik bestehen.",
    exampleTranslation: "Regardless of that, the fundamental problem remains.",
    tags: ["formal", "sophisticated"],
  },

  // ============================================
  // Persuasion & Argumentation
  // ============================================
  {
    id: "c2-persuade-1",
    german: "Es liegt auf der Hand, dass...",
    english: "It is obvious that...",
    context: "persuading",
    level: "C2",
    example:
      "Es liegt auf der Hand, dass diese Strategie langfristig erfolgreich sein wird.",
    exampleTranslation:
      "It is obvious that this strategy will be successful in the long term.",
    tags: ["argumentation", "certainty"],
  },
  {
    id: "c2-persuade-2",
    german: "Es bedarf keiner weiteren Erläuterung, dass...",
    english: "It needs no further explanation that...",
    context: "persuading",
    level: "C2",
    example:
      "Es bedarf keiner weiteren Erläuterung, dass dies inakzeptabel ist.",
    exampleTranslation:
      "It needs no further explanation that this is unacceptable.",
    tags: ["argumentation", "emphasis", "strong"],
  },
  {
    id: "c2-persuade-3",
    german: "Man wird nicht umhinkommen anzuerkennen, dass...",
    english: "One will not be able to avoid acknowledging that...",
    context: "persuading",
    level: "C2",
    example:
      "Man wird nicht umhinkommen anzuerkennen, dass grundlegende Reformen notwendig sind.",
    exampleTranslation:
      "One will not be able to avoid acknowledging that fundamental reforms are necessary.",
    tags: ["argumentation", "formal", "inevitability"],
  },
  {
    id: "c2-persuade-4",
    german: "Es steht außer Zweifel, dass...",
    english: "It is beyond doubt that...",
    context: "persuading",
    level: "C2",
    example: "Es steht außer Zweifel, dass die Maßnahmen Wirkung zeigen.",
    exampleTranslation:
      "It is beyond doubt that the measures are showing effect.",
    tags: ["argumentation", "certainty"],
  },

  // ============================================
  // Sophisticated Conclusions
  // ============================================
  {
    id: "c2-conclude-1",
    german: "Allem Anschein nach...",
    english: "To all appearances... / Apparently...",
    context: "concluding",
    level: "C2",
    example: "Allem Anschein nach wird sich die Situation stabilisieren.",
    exampleTranslation: "To all appearances, the situation will stabilize.",
    tags: ["conclusion", "inference"],
  },
  {
    id: "c2-conclude-2",
    german: "Die vorliegenden Befunde legen nahe, dass...",
    english: "The present findings suggest that...",
    context: "concluding",
    level: "C2",
    example:
      "Die vorliegenden Befunde legen nahe, dass ein Paradigmenwechsel erforderlich ist.",
    exampleTranslation:
      "The present findings suggest that a paradigm shift is required.",
    tags: ["conclusion", "academic", "formal"],
  },
  {
    id: "c2-conclude-3",
    german: "In letzter Konsequenz bedeutet dies...",
    english: "Ultimately, this means...",
    context: "concluding",
    level: "C2",
    example:
      "In letzter Konsequenz bedeutet dies eine Neuausrichtung unserer Prioritäten.",
    exampleTranslation:
      "Ultimately, this means a realignment of our priorities.",
    tags: ["conclusion", "final"],
  },
  {
    id: "c2-conclude-4",
    german: "Hieraus ergibt sich zwangsläufig...",
    english: "From this inevitably follows...",
    context: "concluding",
    level: "C2",
    example:
      "Hieraus ergibt sich zwangsläufig die Notwendigkeit eines Umdenkens.",
    exampleTranslation:
      "From this inevitably follows the necessity of a rethink.",
    tags: ["conclusion", "necessity"],
  },

  // ============================================
  // Hypothesizing with Nuance
  // ============================================
  {
    id: "c2-hypothesize-1",
    german: "Gesetzt den Fall, dass...",
    english: "Assuming that... / In the event that...",
    context: "hypothesizing",
    level: "C2",
    example:
      "Gesetzt den Fall, dass alle Bedingungen erfüllt sind, können wir fortfahren.",
    exampleTranslation: "Assuming that all conditions are met, we can proceed.",
    tags: ["conditional", "formal"],
  },
  {
    id: "c2-hypothesize-2",
    german: "Für den Fall, dass...",
    english: "In the event that...",
    context: "hypothesizing",
    level: "C2",
    example:
      "Für den Fall, dass Komplikationen auftreten, haben wir einen Notfallplan.",
    exampleTranslation:
      "In the event that complications arise, we have a contingency plan.",
    tags: ["conditional", "preparation"],
  },
  {
    id: "c2-hypothesize-3",
    german: "Unter der Prämisse, dass...",
    english: "On the premise that...",
    context: "hypothesizing",
    level: "C2",
    example:
      "Unter der Prämisse, dass die Finanzierung gesichert ist, ist das Projekt realisierbar.",
    exampleTranslation:
      "On the premise that funding is secured, the project is feasible.",
    tags: ["conditional", "formal", "academic"],
  },

  // ============================================
  // Emphasizing with Sophistication
  // ============================================
  {
    id: "c2-emphasize-1",
    german: "Nicht zuletzt ist zu erwähnen, dass...",
    english: "Last but not least, it should be mentioned that...",
    context: "emphasizing",
    level: "C2",
    example:
      "Nicht zuletzt ist zu erwähnen, dass die ethischen Implikationen berücksichtigt werden müssen.",
    exampleTranslation:
      "Last but not least, it should be mentioned that the ethical implications must be considered.",
    tags: ["emphasis", "conclusion"],
  },
  {
    id: "c2-emphasize-2",
    german: "Von entscheidender Bedeutung ist hierbei...",
    english: "Of crucial importance here is...",
    context: "emphasizing",
    level: "C2",
    example:
      "Von entscheidender Bedeutung ist hierbei die interdisziplinäre Herangehensweise.",
    exampleTranslation:
      "Of crucial importance here is the interdisciplinary approach.",
    tags: ["emphasis", "formal", "academic"],
  },
  {
    id: "c2-emphasize-3",
    german: "Als besonders bemerkenswert erweist sich...",
    english: "As particularly noteworthy proves to be...",
    context: "emphasizing",
    level: "C2",
    example:
      "Als besonders bemerkenswert erweist sich die Konsistenz der Ergebnisse.",
    exampleTranslation:
      "As particularly noteworthy proves to be the consistency of the results.",
    tags: ["emphasis", "academic", "observation"],
  },

  // ============================================
  // Sophisticated Explanations
  // ============================================
  {
    id: "c2-explain-1",
    german: "Dies ist im Wesentlichen darauf zurückzuführen, dass...",
    english: "This is essentially attributable to the fact that...",
    context: "explaining",
    level: "C2",
    example:
      "Dies ist im Wesentlichen darauf zurückzuführen, dass die Rahmenbedingungen sich geändert haben.",
    exampleTranslation:
      "This is essentially attributable to the fact that the framework conditions have changed.",
    tags: ["explanation", "formal", "causation"],
  },
  {
    id: "c2-explain-2",
    german: "Hierin manifestiert sich...",
    english: "Herein manifests itself...",
    context: "explaining",
    level: "C2",
    example:
      "Hierin manifestiert sich der grundlegende Widerspruch des Systems.",
    exampleTranslation:
      "Herein manifests itself the fundamental contradiction of the system.",
    tags: ["explanation", "academic", "philosophical"],
  },
  {
    id: "c2-explain-3",
    german: "Die Genese dieser Entwicklung lässt sich wie folgt beschreiben...",
    english: "The genesis of this development can be described as follows...",
    context: "explaining",
    level: "C2",
    example:
      "Die Genese dieser Entwicklung lässt sich wie folgt beschreiben: Zunächst...",
    exampleTranslation:
      "The genesis of this development can be described as follows: Initially...",
    tags: ["explanation", "academic", "historical"],
  },

  // ============================================
  // Clarifying with Precision
  // ============================================
  {
    id: "c2-clarify-1",
    german: "Präzisierend sei angemerkt, dass...",
    english: "To be precise, it should be noted that...",
    context: "clarifying",
    level: "C2",
    example:
      "Präzisierend sei angemerkt, dass dies nur unter bestimmten Voraussetzungen gilt.",
    exampleTranslation:
      "To be precise, it should be noted that this only applies under certain conditions.",
    tags: ["clarification", "academic", "specification"],
  },
  {
    id: "c2-clarify-2",
    german: "In differenzierter Betrachtung zeigt sich...",
    english: "In differentiated consideration it becomes apparent...",
    context: "clarifying",
    level: "C2",
    example:
      "In differenzierter Betrachtung zeigt sich die Komplexität der Materie.",
    exampleTranslation:
      "In differentiated consideration, the complexity of the matter becomes apparent.",
    tags: ["clarification", "academic", "nuanced"],
  },
  {
    id: "c2-clarify-3",
    german: "Im engeren Sinne bezeichnet dies...",
    english: "In the narrower sense, this refers to...",
    context: "clarifying",
    level: "C2",
    example:
      "Im engeren Sinne bezeichnet dies die methodologischen Grundlagen.",
    exampleTranslation:
      "In the narrower sense, this refers to the methodological foundations.",
    tags: ["clarification", "academic", "technical"],
  },

  // ============================================
  // Opinion with Authority
  // ============================================
  {
    id: "c2-opinion-1",
    german: "Es ist m.E. unabdingbar, dass...",
    english: "It is, in my opinion, imperative that...",
    context: "opinion",
    level: "C2",
    example:
      "Es ist m.E. unabdingbar, dass wir die strukturellen Ursachen angehen.",
    exampleTranslation:
      "It is, in my opinion, imperative that we address the structural causes.",
    tags: ["opinion", "formal", "strong"],
  },
  {
    id: "c2-opinion-2",
    german: "Die Sachlage gebietet, dass...",
    english: "The situation demands that...",
    context: "opinion",
    level: "C2",
    example: "Die Sachlage gebietet, dass wir unverzüglich handeln.",
    exampleTranslation: "The situation demands that we act immediately.",
    tags: ["opinion", "formal", "urgency"],
  },
];
