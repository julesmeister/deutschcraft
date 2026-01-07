/**
 * Grammatik Page Constants
 * Color schemes, data maps, and type definitions
 */

import { CEFRLevel } from "@/lib/models/cefr";
import a1Data from "@/lib/data/grammar/levels/a1.json";
import a2Data from "@/lib/data/grammar/levels/a2.json";
import b1Data from "@/lib/data/grammar/levels/b1.json";
import b2Data from "@/lib/data/grammar/levels/b2.json";
import c1Data from "@/lib/data/grammar/levels/c1.json";
import c2Data from "@/lib/data/grammar/levels/c2.json";
import a1Sentences from "@/lib/data/grammar/sentences/a1.json";
import a2Sentences from "@/lib/data/grammar/sentences/a2.json";
import b1Sentences from "@/lib/data/grammar/sentences/b1.json";
import b2Sentences from "@/lib/data/grammar/sentences/b2.json";

export interface GrammarRule {
  id: string;
  title: string;
  category: string;
  description: string;
  examples: string[];
  notes: string;
}

export const levelDataMap = {
  [CEFRLevel.A1]: a1Data,
  [CEFRLevel.A2]: a2Data,
  [CEFRLevel.B1]: b1Data,
  [CEFRLevel.B2]: b2Data,
  [CEFRLevel.C1]: c1Data,
  [CEFRLevel.C2]: c2Data,
};

export const sentenceDataMap: Record<string, any> = {
  [CEFRLevel.A1]: a1Sentences,
  [CEFRLevel.A2]: a2Sentences,
  [CEFRLevel.B1]: b1Sentences,
  [CEFRLevel.B2]: b2Sentences,
  // TODO: Add other levels when sentence files are created
  // [CEFRLevel.C1]: c1Sentences,
  // [CEFRLevel.C2]: c2Sentences,
};

// Color schemes for grammar rule cards
export const CARD_COLOR_SCHEMES = [
  {
    bg: "hover:bg-blue-100",
    text: "group-hover:text-blue-900",
    badge: "group-hover:bg-blue-500",
    border: "hover:border-l-blue-500",
  },
  {
    bg: "hover:bg-emerald-100",
    text: "group-hover:text-emerald-900",
    badge: "group-hover:bg-emerald-500",
    border: "hover:border-l-emerald-500",
  },
  {
    bg: "hover:bg-amber-100",
    text: "group-hover:text-amber-900",
    badge: "group-hover:bg-amber-500",
    border: "hover:border-l-amber-500",
  },
  {
    bg: "hover:bg-purple-100",
    text: "group-hover:text-purple-900",
    badge: "group-hover:bg-purple-500",
    border: "hover:border-l-purple-500",
  },
  {
    bg: "hover:bg-pink-100",
    text: "group-hover:text-pink-900",
    badge: "group-hover:bg-pink-500",
    border: "hover:border-l-pink-500",
  },
  {
    bg: "hover:bg-indigo-100",
    text: "group-hover:text-indigo-900",
    badge: "group-hover:bg-indigo-500",
    border: "hover:border-l-indigo-500",
  },
];
