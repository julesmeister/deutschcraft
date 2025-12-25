/**
 * Hook for filtering grammar sentences based on selected rule and practice mode
 */

import { useMemo } from 'react';
import { GrammarReview } from '@/lib/models/grammar';
import { applyGrammarSettings } from '@/lib/utils/grammarSelection';

interface UseFilteredSentencesProps {
  selectedRule: string | null;
  selectedLevel: string;
  isPracticeMode: boolean;
  practiceSentences: any[];
  sentenceDataMap: Record<string, any>;
  reviews: GrammarReview[];
}

export function useFilteredSentences({
  selectedRule,
  selectedLevel,
  isPracticeMode,
  practiceSentences,
  sentenceDataMap,
  reviews,
}: UseFilteredSentencesProps) {
  return useMemo(() => {
    // Practice mode: return the practice sentences we set
    if (isPracticeMode && practiceSentences.length > 0) {
      return practiceSentences;
    }

    // Regular mode: filter by selected rule
    if (!selectedRule) return [];

    const sentenceData = sentenceDataMap[selectedLevel];
    if (!sentenceData || !sentenceData.sentences) return [];

    // Filter sentences for this rule (exclude [TODO] placeholders)
    const ruleSentences = sentenceData.sentences.filter(
      (s: any) => s.ruleId === selectedRule && !s.english.includes("[TODO]")
    );

    // Apply STRICT SRS filtering - only show sentences that are due now or new
    const { sentences } = applyGrammarSettings(
      ruleSentences,
      reviews,
      {
        randomizeOrder: true,
        sentencesPerSession: 10, // Limit to 10 for bite-sized practice
      }
    );

    return sentences;
  }, [selectedRule, selectedLevel, isPracticeMode, practiceSentences, reviews, sentenceDataMap]);
}
