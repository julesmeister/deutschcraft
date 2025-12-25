/**
 * Grammar Sentences View Component
 * Displays all sentences for a grammar rule (view-only mode)
 */

'use client';

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

interface GrammarSentencesViewProps {
  selectedRuleData: {
    id: string;
    title: string;
    category: string;
    description: string;
    examples: string[];
    notes: string;
  } | null;
  allSentences: any[];
  onBack: () => void;
}

export function GrammarSentencesView({
  selectedRuleData,
  allSentences,
  onBack,
}: GrammarSentencesViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <DashboardHeader
        title={selectedRuleData?.title || "Grammar Rule"}
        subtitle={`Viewing ${allSentences.length} sentences`}
        backButton={{
          label: "Back to Rules",
          onClick: onBack,
        }}
      />
      <div className="container mx-auto px-6 mt-8">
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">All Sentences</h3>
            <div className="space-y-4">
              {allSentences.map((sentence: any, index: number) => (
                <div key={sentence.sentenceId} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">{sentence.english}</p>
                      <p className="text-base font-semibold text-gray-900">{sentence.german}</p>
                      {sentence.hints && sentence.hints.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          💡 {sentence.hints.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
