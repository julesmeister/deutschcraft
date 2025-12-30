/**
 * Redemittel Types
 * Shared types for phrase pattern data
 */

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ConversationContext =
  | "introduction"
  | "greetings"
  | "letter"
  | "opinion"
  | "agreement"
  | "disagreement"
  | "asking"
  | "explaining"
  | "describing"
  | "describing-images"
  | "narrating"
  | "comparing"
  | "suggesting"
  | "requesting"
  | "thanking"
  | "apologizing"
  | "complaining"
  | "persuading"
  | "hypothesizing"
  | "concluding"
  | "transitioning"
  | "emphasizing"
  | "clarifying"
  | "colloquial";

export interface Redemittel {
  id: string;
  german: string;
  english: string;
  context: ConversationContext;
  level: CEFRLevel;
  example?: string; // Optional example sentence
  exampleTranslation?: string;
  tags?: string[]; // Additional categorization
}

// Context labels for UI
export const contextLabels: Record<ConversationContext, string> = {
  introduction: "Introduction",
  greetings: "Greetings",
  letter: "Letter Writing",
  opinion: "Expressing Opinion",
  agreement: "Agreement",
  disagreement: "Disagreement",
  asking: "Asking Questions",
  explaining: "Explaining",
  describing: "Describing",
  "describing-images": "Describing Images",
  narrating: "Narrating",
  comparing: "Comparing",
  suggesting: "Making Suggestions",
  requesting: "Requesting",
  thanking: "Thanking",
  apologizing: "Apologizing",
  complaining: "Complaining",
  persuading: "Persuading",
  hypothesizing: "Hypothesizing",
  concluding: "Concluding",
  transitioning: "Transitioning",
  emphasizing: "Emphasizing",
  clarifying: "Clarifying",
  colloquial: "Colloquial/Informal",
};
