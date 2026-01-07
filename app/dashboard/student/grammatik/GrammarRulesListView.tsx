/**
 * Grammar Rules List View
 * Main view showing all grammar rules organized by category
 */

'use client';

import { useMemo } from 'react';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CategoryList } from '@/components/ui/CategoryList';
import { GrammarRuleCardWithProgress } from '@/components/grammar/GrammarRuleCardWithProgress';
import { CEFRLevel } from '@/lib/models/cefr';
import { GrammarReview } from '@/lib/models/grammar';
import { GrammarRule, CARD_COLOR_SCHEMES } from './constants';

interface GrammarRulesListViewProps {
  rules: GrammarRule[];
  selectedLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
  reviews: GrammarReview[];
  sentenceDataMap: Record<string, any>;
  onRuleClick: (ruleId: string) => void;
  onViewRule: (ruleId: string) => void;
  onRetryMistakes: (ruleId: string) => void;
}

export function GrammarRulesListView({
  rules,
  selectedLevel,
  onLevelChange,
  reviews,
  sentenceDataMap,
  onRuleClick,
  onViewRule,
  onRetryMistakes,
}: GrammarRulesListViewProps) {
  // Group rules by category
  const rulesByCategory = useMemo(() => {
    return rules.reduce((acc, rule) => {
      if (!acc[rule.category]) {
        acc[rule.category] = [];
      }
      acc[rule.category].push(rule);
      return acc;
    }, {} as Record<string, GrammarRule[]>);
  }, [rules]);

  const categories = Object.keys(rulesByCategory).sort();

  return (
    <div className="container mx-auto px-6 mt-8">
      {/* Controls Section */}
      <div className="bg-white border border-gray-200 shadow-sm mb-6 opacity-0 animate-fade-in-up animation-delay-100 hover:border-gray-300 transition-all duration-500 ease-out" style={{ animationFillMode: 'forwards' }}>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
              Grammar Rules ({rules.length})
            </h5>
          </div>

          {/* Level Selector */}
          <div className="transition-all duration-500 ease-out">
            <CEFRLevelSelector
              selectedLevel={selectedLevel}
              onLevelChange={onLevelChange}
              size="md"
              showDescription={true}
            />
          </div>
        </div>
      </div>

      {/* Grammar Rules by Category */}
      {rules.length > 0 && (
        <div className="opacity-0 animate-fade-in-up animation-delay-200" style={{ animationFillMode: 'forwards' }}>
          <CategoryList
            categories={categories.map((category, categoryIndex) => {
              const items = rulesByCategory[category].map((rule, ruleIndex) => {
                const colorScheme =
                  CARD_COLOR_SCHEMES[
                    ruleIndex % CARD_COLOR_SCHEMES.length
                  ];

                // Calculate staggered delay for each card (smoother, smaller increments)
                const cardDelay = (categoryIndex * 50 + ruleIndex * 30) % 500;
                const delayClass = cardDelay > 0 ? `animation-delay-${Math.min(cardDelay, 500)}` : '';

                return (
                  <div
                    key={rule.id}
                    className={`opacity-0 animate-fade-in-up ${delayClass} transition-all duration-500 ease-out hover:translate-x-1`}
                    style={{ animationFillMode: 'forwards' }}
                  >
                    <GrammarRuleCardWithProgress
                      rule={rule}
                      reviews={reviews}
                      sentenceDataMap={sentenceDataMap}
                      selectedLevel={selectedLevel}
                      colorScheme={colorScheme}
                      onClick={() => onRuleClick(rule.id)}
                      onView={() => onViewRule(rule.id)}
                      onRetryMistakes={() => onRetryMistakes(rule.id)}
                    />
                  </div>
                );
              });

              return {
                key: category,
                header: category,
                items,
              };
            })}
          />
        </div>
      )}
    </div>
  );
}
