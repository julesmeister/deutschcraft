'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CEFRLevel } from '@/lib/models/cefr';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useGrammarRulesByLevel, useGrammarReviews } from '@/lib/hooks/useGrammarExercises';
import { CatLoader } from '@/components/ui/CatLoader';
import { usePersistedLevel } from '@/lib/hooks/usePersistedLevel';

export default function GrammatikPracticePage() {
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = usePersistedLevel('grammatik-last-level');
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  // Fetch grammar rules for selected level
  const { rules, isLoading: rulesLoading } = useGrammarRulesByLevel(selectedLevel);

  // Fetch user's progress
  const { reviews, isLoading: reviewsLoading } = useGrammarReviews(session?.user?.email);

  const isLoading = rulesLoading || reviewsLoading;

  // Group rules by category
  const rulesByCategory = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, typeof rules>);

  const categories = Object.keys(rulesByCategory).sort();

  // Calculate progress for each rule
  const getRuleProgress = (ruleId: string) => {
    const ruleReviews = reviews.filter((r) => r.ruleId === ruleId);
    if (ruleReviews.length === 0) return { completed: 0, total: 0, percentage: 0 };

    const completed = ruleReviews.filter((r) => r.masteryLevel >= 80).length;
    const total = ruleReviews.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  };

  if (selectedRule) {
    // TODO: Implement practice mode component
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Grammar Practice"
          subtitle="Practice sentences for grammar rules"
        />
        <div className="container mx-auto px-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Practice Mode Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              The sentence practice interface will be implemented here.
            </p>
            <button
              onClick={() => setSelectedRule(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Back to Rules
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title="Grammatik Practice"
        subtitle="Practice German grammar with sentence exercises"
      />

      <div className="container mx-auto px-6 mt-8">
        {/* Controls Section */}
        <div className="bg-white shadow-sm mb-6">
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
                Grammar Rules ({rules.length})
              </h5>
            </div>

            {/* Level Selector */}
            <div>
              <CEFRLevelSelector
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                variant="pills"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <CatLoader message="Loading grammar rules..." />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && rules.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Grammar Rules Yet
            </h3>
            <p className="text-gray-600">
              Grammar rules for {selectedLevel} are being prepared. Check back soon!
            </p>
          </div>
        )}

        {/* Grammar Rules by Category */}
        {!isLoading && rules.length > 0 && (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                {/* Category Header */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{category}</h2>
                  <div className="h-1 w-16 bg-blue-600 rounded-full mt-2"></div>
                </div>

                {/* Rules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rulesByCategory[category].map((rule) => {
                    const progress = getRuleProgress(rule.ruleId);

                    return (
                      <div
                        key={rule.ruleId}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedRule(rule.ruleId)}
                      >
                        <div className="p-5">
                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {rule.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {rule.description}
                          </p>

                          {/* Progress Bar */}
                          {progress.total > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>
                                  {progress.completed}/{progress.total} sentences
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${progress.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors">
                            {progress.total > 0 ? 'Continue Practice' : 'Start Practice'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
