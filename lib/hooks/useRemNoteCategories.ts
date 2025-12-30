/**
 * RemNote Categories Hook
 * Provides vocabulary categories from the parsed RemNote data
 */

import { useState, useEffect, useMemo } from "react";
import { CEFRLevel } from "@/lib/models/cefr";
import remnoteStats from "@/lib/data/vocabulary/stats.json";
import { useVocabularyLevel } from "./useVocabulary";

export interface RemNoteCategory {
  id: string;
  name: string;
  cardCount: number;
  icon: string;
  description?: string;
}

/**
 * Category icons mapping
 */
export const categoryIcons: Record<string, string> = {
  // RemNote categories
  Verbs: "🔀",
  Adverbs: "⚡",
  Redemittel: "💬",
  "Da / Wo-Wörter": "🔗",
  "Liste der Verben mit Präpositionen": "📋",
  Richtung: "🧭",
  Gempowerment: "💪",

  // Remapped verb categories from RemNote
  "Positional Verbs": "📍",
  "State Change Verbs": "🔄",
  "Verbs With Prepositions": "📋",
  "Intermediate Verbs": "🎯",
  "Advanced Verbs": "🚀",

  // A1 Syllabus categories
  Greetings: "👋",
  Pronouns: "🗣️",
  "Regular Verbs": "✍️",
  "Irregular Verbs": "🔀",
  "Modal Verbs": "🔑",
  "Understanding Verbs": "💭",
  Family: "👨‍👩‍👧‍👦",
  Numbers: "🔢",
  Colors: "🎨",
  "Food Drinks": "🍽️",
  Home: "🏠",
  Clothing: "👕",
  Time: "⏰",
  Weather: "🌤️",
  Transportation: "🚗",
  Animals: "🐾",
  Adjectives: "📏",
  "Question Words": "❓",
  Countries: "🌍",
  Fruits: "🍎",
  Vegetables: "🥕",

  // A2 Syllabus categories
  Professions: "💼",
  Workplace: "🏢",
  Travel: "✈️",
  "Body Health": "🏥",
  Hobbies: "🎮",
  Technology: "💻",
  Shopping: "🛒",
  "Time Expressions": "⏳",
  Education: "📚",
  Nature: "🌳",
  Feelings: "😊",
  Restaurant: "🍴",
  "Separable Verbs": "🔄",
  "Reflexive Verbs": "🪞",
  "Past Tense Verbs": "⏮️",
  "Communication Verbs": "💬",
  "Action Verbs": "⚡",
  "Perception Verbs": "👁️",

  // B1 Syllabus categories
  "Adjective Pairs": "⚖️",
  "Business Work": "💼",
  Conjunctions: "🔗",
  "Daily Routines": "📅",
  Housing: "🏘️",
  "Medical Health": "⚕️",

  // B2 Syllabus categories
  Academic: "🎓",
  "Emotions Character": "🎭",
  "Environment Climate": "🌍",
  Idioms: "💭",
  "Politics Society": "🏛️",

  // C1 Syllabus categories
  "Abstract Concepts": "💡",
  "Economics Finance": "💰",
  "Formal Language": "📜",
  "Legal Administrative": "⚖️",
  "Professional Communication": "🤝",

  // C2 Syllabus categories
  "Literary Language": "📖",
  "Philosophical Concepts": "🧠",
};

/**
 * Category descriptions mapping
 */
const categoryDescriptions: Record<string, string> = {
  Verbs: "German verbs with conjugations and usage examples",
  Adverbs: "Adverbs of degree, time, manner, and location",
  Redemittel: "Common German phrases and expressions",
  "Da / Wo-Wörter": "Compound words with da- and wo- prefixes",
  "Liste der Verben mit Präpositionen": "Verbs requiring specific prepositions",
  Richtung: "Directional and positional vocabulary",
  Gempowerment: "Empowerment and motivational phrases",
};

/**
 * Get RemNote vocabulary categories
 * @param level - Optional CEFR level to filter by
 */
export function useRemNoteCategories(level?: CEFRLevel) {
  const {
    data: levelData,
    isLoading: isLevelLoading,
    isError: isLevelError,
  } = useVocabularyLevel(level as CEFRLevel);

  const categories = useMemo(() => {
    if (level && levelData) {
      const flashcards = levelData.flashcards || [];

      // Group cards by normalized category ID to prevent duplicates
      const categoryGroups: Record<string, { name: string; count: number }> =
        {};

      flashcards.forEach((card: any) => {
        const rawCat = card.category || "Uncategorized";
        const id = rawCat
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        if (!categoryGroups[id]) {
          categoryGroups[id] = { name: rawCat, count: 0 };
        }

        categoryGroups[id].count++;
      });

      // Convert to category format
      return Object.entries(categoryGroups).map(([id, data]) => ({
        id,
        name: data.name,
        cardCount: data.count,
        icon: categoryIcons[data.name] || "📝",
        description:
          categoryDescriptions[data.name] || `${data.count} flashcards`,
      }));
    } else if (!level) {
      // No level filter - show all categories from stats
      return remnoteStats.categoryCounts.map((item) => ({
        id: item.category
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        name: item.category,
        cardCount: item.count,
        icon: categoryIcons[item.category] || "📝",
        description:
          categoryDescriptions[item.category] || `${item.count} flashcards`,
      }));
    }
    return [];
  }, [level, levelData]);

  const isLoading = level ? isLevelLoading : false;
  const isError = level ? isLevelError : false;

  return { categories, isLoading, isError };
}

/**
 * Get total flashcard count
 * @param level - Optional CEFR level to filter by
 */
export function useRemNoteTotalCards(level?: CEFRLevel) {
  const { data: levelData } = useVocabularyLevel(level as CEFRLevel);

  if (level) {
    return levelData?.totalCards || 0;
  }
  return remnoteStats.totalFlashcards;
}

/**
 * Get category by ID
 */
export function getRemNoteCategoryById(
  categoryId: string
): RemNoteCategory | undefined {
  const categoryData = remnoteStats.categoryCounts.find(
    (item) =>
      item.category
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") === categoryId
  );

  if (!categoryData) return undefined;

  return {
    id: categoryId,
    name: categoryData.category,
    cardCount: categoryData.count,
    icon: categoryIcons[categoryData.category] || "📝",
    description: categoryDescriptions[categoryData.category],
  };
}
