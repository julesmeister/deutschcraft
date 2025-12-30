import { useQuery } from "@tanstack/react-query";
import { CEFRLevel } from "@/lib/models/cefr";

export interface Flashcard {
  id: string;
  category: string;
  german: string;
  english: string;
  examples?: string[];
  [key: string]: any;
}

export interface LevelData {
  level: string;
  flashcards: Flashcard[];
}

export interface CategoryInfo {
  name: string;
  count: number;
  file: string;
  ids?: string[];
}

export interface CategoryIndex {
  level: string;
  totalCards: number;
  totalCategories: number;
  categories: CategoryInfo[];
}

export interface CategoryData {
  level: string;
  category: string;
  totalCards: number;
  flashcards: Flashcard[];
}

async function fetchVocabularyLevel(level: CEFRLevel): Promise<LevelData> {
  const response = await fetch(`/api/vocabulary/${level}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch vocabulary for level ${level}`);
  }
  return response.json();
}

async function fetchVocabularyCategories(
  level: CEFRLevel
): Promise<CategoryIndex> {
  const response = await fetch(`/api/vocabulary/${level}/categories`);
  if (!response.ok) {
    throw new Error(`Failed to fetch vocabulary categories for level ${level}`);
  }
  return response.json();
}

export async function fetchVocabularyCategory(
  level: CEFRLevel,
  filename: string
): Promise<CategoryData> {
  const response = await fetch(`/api/vocabulary/${level}/category/${filename}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch vocabulary category ${filename} for level ${level}`
    );
  }
  return response.json();
}

/**
 * @deprecated Use useVocabularyCategories and useVocabularyCategory instead for better performance
 */
export function useVocabularyLevel(level: CEFRLevel) {
  return useQuery({
    queryKey: ["vocabulary", level],
    queryFn: () => fetchVocabularyLevel(level),
    staleTime: Infinity, // Data doesn't change often, keep it cached
    gcTime: 1000 * 60 * 60, // Keep in garbage collection for 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useVocabularyCategories(level: CEFRLevel) {
  return useQuery({
    queryKey: ["vocabulary", "categories", level],
    queryFn: () => fetchVocabularyCategories(level),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useVocabularyCategory(
  level: CEFRLevel,
  filename: string | null
) {
  return useQuery({
    queryKey: ["vocabulary", "category", level, filename],
    queryFn: () => (filename ? fetchVocabularyCategory(level, filename) : null),
    enabled: !!filename,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
