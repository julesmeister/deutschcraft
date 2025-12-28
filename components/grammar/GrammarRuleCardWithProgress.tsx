/**
 * Grammar Rule Card With Progress
 * Wrapper component that calculates progress and renders GrammarRuleCard
 */

'use client';

import { GrammarRuleCard } from './GrammarRuleCard';
import { useGrammarRuleProgress } from '@/lib/hooks/useGrammarRuleProgress';
import { GrammarReview } from '@/lib/models/grammar';

interface GrammarRule {
  id: string;
  title: string;
  category: string;
  description: string;
  examples: string[];
  notes: string;
}

interface GrammarRuleCardWithProgressProps {
  rule: GrammarRule;
  reviews: GrammarReview[];
  sentenceDataMap: Record<string, any>;
  selectedLevel: string;
  colorScheme: {
    bg: string;
    text: string;
    badge: string;
  };
  onClick: () => void;
  onView: () => void;
  onRetryMistakes: () => void;
}

export function GrammarRuleCardWithProgress({
  rule,
  reviews,
  sentenceDataMap,
  selectedLevel,
  colorScheme,
  onClick,
  onView,
  onRetryMistakes,
}: GrammarRuleCardWithProgressProps) {
  const { progress, hasMistakes, dueCount } = useGrammarRuleProgress({
    ruleId: rule.id,
    reviews,
    sentenceDataMap,
    selectedLevel,
  });

  return (
    <GrammarRuleCard
      rule={rule}
      progress={progress}
      colorScheme={colorScheme}
      onClick={onClick}
      onView={onView}
      onRetryMistakes={onRetryMistakes}
      hasMistakes={hasMistakes}
      dueCount={dueCount}
    />
  );
}
