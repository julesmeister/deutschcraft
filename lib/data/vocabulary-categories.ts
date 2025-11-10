/**
 * Vocabulary Categories Configuration
 * Provides structured category definitions for each CEFR level
 */

import { CEFRLevel } from '@/lib/models/cefr';
import a1Categories from './categories/a1.json';
import a2Categories from './categories/a2.json';
import b1Categories from './categories/b1.json';
import b2Categories from './categories/b2.json';
import c1Categories from './categories/c1.json';
import c2Categories from './categories/c2.json';

export interface VocabularyCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  examples?: string[];
  priority: number;
}

export interface LevelCategoriesData {
  level: string;
  categories: VocabularyCategory[];
}

// Map all level categories
const levelCategoriesMap: Record<CEFRLevel, VocabularyCategory[]> = {
  [CEFRLevel.A1]: a1Categories.categories,
  [CEFRLevel.A2]: a2Categories.categories,
  [CEFRLevel.B1]: b1Categories.categories,
  [CEFRLevel.B2]: b2Categories.categories,
  [CEFRLevel.C1]: c1Categories.categories,
  [CEFRLevel.C2]: c2Categories.categories,
};

/**
 * Get all vocabulary categories for a specific CEFR level
 */
export function getCategoriesForLevel(level: CEFRLevel): VocabularyCategory[] {
  return levelCategoriesMap[level] || [];
}

/**
 * Get a specific category by ID and level
 */
export function getCategoryById(level: CEFRLevel, categoryId: string): VocabularyCategory | undefined {
  const categories = getCategoriesForLevel(level);
  return categories.find(cat => cat.id === categoryId);
}

/**
 * Get all category IDs for a level (useful for validation)
 */
export function getCategoryIds(level: CEFRLevel): string[] {
  return getCategoriesForLevel(level).map(cat => cat.id);
}

/**
 * Get categories sorted by priority
 */
export function getCategoriesSorted(level: CEFRLevel): VocabularyCategory[] {
  return getCategoriesForLevel(level).sort((a, b) => a.priority - b.priority);
}

/**
 * Search categories by name or description
 */
export function searchCategories(level: CEFRLevel, searchTerm: string): VocabularyCategory[] {
  const categories = getCategoriesForLevel(level);
  const term = searchTerm.toLowerCase();

  return categories.filter(cat =>
    cat.name.toLowerCase().includes(term) ||
    cat.description.toLowerCase().includes(term)
  );
}

/**
 * Get all categories across all levels
 */
export function getAllCategories(): VocabularyCategory[] {
  const allLevels = Object.values(CEFRLevel);
  return allLevels.flatMap(level => getCategoriesForLevel(level));
}

/**
 * Get category count for a specific level
 */
export function getCategoryCount(level: CEFRLevel): number {
  return getCategoriesForLevel(level).length;
}

/**
 * Validate if a category exists for a level
 */
export function isValidCategory(level: CEFRLevel, categoryId: string): boolean {
  return getCategoryIds(level).includes(categoryId);
}

/**
 * Get metadata about the categories configuration
 */
export function getCategoriesMetadata() {
  const totalCategories = Object.values(levelCategoriesMap).reduce(
    (sum, cats) => sum + cats.length,
    0
  );

  return {
    version: '3.0.0',
    lastUpdated: '2025-11-10',
    description: 'Vocabulary categories organized by CEFR level, split into separate files',
    totalCategories,
    categoriesPerLevel: {
      A1: levelCategoriesMap[CEFRLevel.A1].length,
      A2: levelCategoriesMap[CEFRLevel.A2].length,
      B1: levelCategoriesMap[CEFRLevel.B1].length,
      B2: levelCategoriesMap[CEFRLevel.B2].length,
      C1: levelCategoriesMap[CEFRLevel.C1].length,
      C2: levelCategoriesMap[CEFRLevel.C2].length,
    },
  };
}

// Export the raw data map for direct access if needed
export const vocabularyCategoriesMap = levelCategoriesMap;
