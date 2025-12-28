/**
 * RemNote Categories Hook
 * Provides vocabulary categories from the parsed RemNote data
 */

import { useState, useEffect } from 'react';
import { CEFRLevel } from '@/lib/models/cefr';
import remnoteStats from '@/lib/data/vocabulary/stats.json';
import a1Data from '@/lib/data/vocabulary/levels/a1.json';
import a2Data from '@/lib/data/vocabulary/levels/a2.json';
import b1Data from '@/lib/data/vocabulary/levels/b1.json';
import b2Data from '@/lib/data/vocabulary/levels/b2.json';
import c1Data from '@/lib/data/vocabulary/levels/c1.json';
import c2Data from '@/lib/data/vocabulary/levels/c2.json';

export interface RemNoteCategory {
  id: string;
  name: string;
  cardCount: number;
  icon: string;
  description?: string;
}

// Level data mapping
const levelDataMap = {
  [CEFRLevel.A1]: a1Data,
  [CEFRLevel.A2]: a2Data,
  [CEFRLevel.B1]: b1Data,
  [CEFRLevel.B2]: b2Data,
  [CEFRLevel.C1]: c1Data,
  [CEFRLevel.C2]: c2Data,
};

/**
 * Category icons mapping
 */
const categoryIcons: Record<string, string> = {
  // RemNote categories
  'Verbs': '🔀',
  'Adverbs': '⚡',
  'Redemittel': '💬',
  'Da / Wo-Wörter': '🔗',
  'Liste der Verben mit Präpositionen': '📋',
  'Richtung': '🧭',
  'Gempowerment': '💪',

  // Remapped verb categories from RemNote
  'Positional Verbs': '📍',
  'State Change Verbs': '🔄',
  'Verbs With Prepositions': '📋',
  'Intermediate Verbs': '🎯',
  'Advanced Verbs': '🚀',

  // A1 Syllabus categories
  'Greetings': '👋',
  'Pronouns': '🗣️',
  'Regular Verbs': '✍️',
  'Irregular Verbs': '🔀',
  'Modal Verbs': '🔑',
  'Understanding Verbs': '💭',
  'Family': '👨‍👩‍👧‍👦',
  'Numbers': '🔢',
  'Colors': '🎨',
  'Food Drinks': '🍽️',
  'Home': '🏠',
  'Clothing': '👕',
  'Time': '⏰',
  'Weather': '🌤️',
  'Transportation': '🚗',
  'Animals': '🐾',
  'Adjectives': '📏',
  'Question Words': '❓',
  'Countries': '🌍',
  'Fruits': '🍎',
  'Vegetables': '🥕',

  // A2 Syllabus categories
  'Professions': '💼',
  'Workplace': '🏢',
  'Travel': '✈️',
  'Body Health': '🏥',
  'Hobbies': '🎮',
  'Technology': '💻',
  'Shopping': '🛒',
  'Time Expressions': '⏳',
  'Education': '📚',
  'Nature': '🌳',
  'Feelings': '😊',
  'Restaurant': '🍴',
  'Separable Verbs': '🔄',
  'Reflexive Verbs': '🪞',
  'Past Tense Verbs': '⏮️',
  'Communication Verbs': '💬',
  'Action Verbs': '⚡',
  'Perception Verbs': '👁️',

  // B1 Syllabus categories
  'Adjective Pairs': '⚖️',
  'Business Work': '💼',
  'Conjunctions': '🔗',
  'Daily Routines': '📅',
  'Housing': '🏘️',
  'Medical Health': '⚕️',

  // B2 Syllabus categories
  'Academic': '🎓',
  'Emotions Character': '🎭',
  'Environment Climate': '🌍',
  'Idioms': '💭',
  'Politics Society': '🏛️',

  // C1 Syllabus categories
  'Abstract Concepts': '💡',
  'Economics Finance': '💰',
  'Formal Language': '📜',
  'Legal Administrative': '⚖️',
  'Professional Communication': '🤝',

  // C2 Syllabus categories
  'Literary Language': '📖',
  'Philosophical Concepts': '🧠',
};

/**
 * Category descriptions mapping
 */
const categoryDescriptions: Record<string, string> = {
  'Verbs': 'German verbs with conjugations and usage examples',
  'Adverbs': 'Adverbs of degree, time, manner, and location',
  'Redemittel': 'Common German phrases and expressions',
  'Da / Wo-Wörter': 'Compound words with da- and wo- prefixes',
  'Liste der Verben mit Präpositionen': 'Verbs requiring specific prepositions',
  'Richtung': 'Directional and positional vocabulary',
  'Gempowerment': 'Empowerment and motivational phrases',
};

/**
 * Get RemNote vocabulary categories
 * @param level - Optional CEFR level to filter by
 */
export function useRemNoteCategories(level?: CEFRLevel) {
  const [categories, setCategories] = useState<RemNoteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    try {
      setIsLoading(true);
      setIsError(false);

      if (level) {
        // Get cards for specific level
        const levelData = levelDataMap[level];
        const flashcards = levelData.flashcards;

        // Group cards by normalized category ID to prevent duplicates
        const categoryGroups: Record<string, { name: string, count: number }> = {};
        
        flashcards.forEach((card: any) => {
          const rawCat = card.category || 'Uncategorized';
          const id = rawCat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          
          if (!categoryGroups[id]) {
            categoryGroups[id] = { name: rawCat, count: 0 };
          }
          
          categoryGroups[id].count++;
        });

        // Convert to category format
        const categoriesData = Object.entries(categoryGroups).map(([id, data]) => ({
          id,
          name: data.name,
          cardCount: data.count,
          icon: categoryIcons[data.name] || '📝',
          description: categoryDescriptions[data.name] || `${data.count} flashcards`,
        }));

        setCategories(categoriesData);
      } else {
        // No level filter - show all categories
        const categoriesData = remnoteStats.categoryCounts.map((item) => ({
          id: item.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          name: item.category,
          cardCount: item.count,
          icon: categoryIcons[item.category] || '📝',
          description: categoryDescriptions[item.category] || `${item.count} flashcards`,
        }));

        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading RemNote categories:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [level]);

  return { categories, isLoading, isError };
}

/**
 * Get total flashcard count
 * @param level - Optional CEFR level to filter by
 */
export function useRemNoteTotalCards(level?: CEFRLevel) {
  if (level) {
    const levelData = levelDataMap[level];
    return levelData.totalCards;
  }
  return remnoteStats.totalFlashcards;
}

/**
 * Get category by ID
 */
export function getRemNoteCategoryById(categoryId: string): RemNoteCategory | undefined {
  const categoryData = remnoteStats.categoryCounts.find(
    (item) => item.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === categoryId
  );

  if (!categoryData) return undefined;

  return {
    id: categoryId,
    name: categoryData.category,
    cardCount: categoryData.count,
    icon: categoryIcons[categoryData.category] || '📝',
    description: categoryDescriptions[categoryData.category],
  };
}
