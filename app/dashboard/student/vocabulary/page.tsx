"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CEFRLevel } from "@/lib/models/cefr";
import { useRemNoteCategories } from "@/lib/hooks/useRemNoteCategories";
import { useVocabularyLevel } from "@/lib/hooks/useVocabulary";
import { VocabularyControls } from "./VocabularyControls";
import { LoadingState, ErrorState, EmptyState } from "./VocabularyStates";
import { VocabularyRow } from "./VocabularyRow";

interface VocabularyEntry {
  id: string;
  german: string;
  english: string;
  category: string;
  level: CEFRLevel;
}

export default function VocabularyPage() {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get categories for selected level
  const { categories } = useRemNoteCategories(selectedLevel);

  // Fetch vocabulary data
  const {
    data: levelData,
    isLoading,
    isError,
  } = useVocabularyLevel(selectedLevel);

  // Get all vocabulary entries for selected level
  const vocabularyEntries = useMemo(() => {
    if (!levelData || !levelData.flashcards) return [];

    return levelData.flashcards.map((card: any) => ({
      id: card.id,
      german: card.german,
      english: card.english,
      category: card.category,
      level: selectedLevel,
    })) as VocabularyEntry[];
  }, [levelData, selectedLevel]);

  // Filter and sort vocabulary
  const filteredVocabulary = useMemo(() => {
    let filtered = vocabularyEntries;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.german.toLowerCase().includes(query) ||
          entry.english.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (entry) => entry.category === selectedCategory
      );
    }

    // Sort by German (A-Z)
    filtered.sort((a, b) => a.german.localeCompare(b.german, "de"));

    return filtered;
  }, [vocabularyEntries, searchQuery, selectedCategory]);

  // Group by first letter
  const groupedVocabulary = useMemo(() => {
    const groups: { [key: string]: VocabularyEntry[] } = {};

    filteredVocabulary.forEach((entry) => {
      const firstLetter = entry.german[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(entry);
    });

    return groups;
  }, [filteredVocabulary]);

  const alphabeticalKeys = Object.keys(groupedVocabulary).sort();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title="Vocabulary Dictionary"
        subtitle="Browse and search German vocabulary by CEFR level"
      />

      <div className="container mx-auto px-6 mt-8">
        <VocabularyControls
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={filteredVocabulary.length}
        />

        {/* Dictionary Content */}
        <div className="bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState />
          ) : filteredVocabulary.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              {alphabeticalKeys.map((letter) => (
                <div
                  key={letter}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  {/* Letter Header */}
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <span className="text-2xl font-black text-brand-purple mr-3">
                        {letter}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        {groupedVocabulary[letter].length}{" "}
                        {groupedVocabulary[letter].length === 1
                          ? "word"
                          : "words"}
                      </span>
                    </div>
                  </div>

                  {/* Word List */}
                  <div className="divide-y divide-gray-100">
                    {groupedVocabulary[letter].map((entry, index) => (
                      <VocabularyRow
                        key={entry.id}
                        entry={entry}
                        colorIndex={index}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
