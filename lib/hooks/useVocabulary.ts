import { useQuery } from '@tanstack/react-query';
import { CEFRLevel } from '@/lib/models/cefr';

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

export function useVocabularyLevel(level: CEFRLevel) {
  return useQuery({
    queryKey: ['vocabulary', level],
    queryFn: () => fetchVocabularyLevel(level),
    staleTime: Infinity, // Data doesn't change often, keep it cached
    gcTime: 1000 * 60 * 60, // Keep in garbage collection for 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
