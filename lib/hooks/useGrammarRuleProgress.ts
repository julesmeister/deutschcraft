/**
 * Hook for calculating grammar rule progress and mistakes
 */

import { useMemo } from 'react';
import { GrammarReview } from '@/lib/models/grammar';

interface UseGrammarRuleProgressProps {
  ruleId: string;
  reviews: GrammarReview[];
  sentenceDataMap: Record<string, any>;
  selectedLevel: string;
}

export function useGrammarRuleProgress({
  ruleId,
  reviews,
  sentenceDataMap,
  selectedLevel,
}: UseGrammarRuleProgressProps) {
  // Calculate progress for the rule
  const progress = useMemo(() => {
    // Get total available sentences for this rule
    const sentenceData = sentenceDataMap[selectedLevel];
    const totalSentences =
      sentenceData?.sentences?.filter(
        (s: any) => s.ruleId === ruleId && !s.english.includes("[TODO")
      ).length || 0;

    // Get reviewed sentences
    const ruleReviews = reviews.filter((r) => r.ruleId === ruleId);
    const practiced = ruleReviews.length;
    const completed = ruleReviews.filter((r) => r.masteryLevel >= 80).length;
    const percentage =
      totalSentences > 0 ? Math.round((practiced / totalSentences) * 100) : 0;

    return {
      practiced,
      total: totalSentences,
      completed,
      percentage,
    };
  }, [ruleId, reviews, sentenceDataMap, selectedLevel]);

  // Check if a rule has mistakes (failed reviews)
  const hasMistakes = useMemo(() => {
    const ruleReviews = reviews.filter((r) => r.ruleId === ruleId);
    return ruleReviews.some((r) => r.masteryLevel < 50); // Consider < 50 as mistakes
  }, [ruleId, reviews]);

  return { progress, hasMistakes };
}
