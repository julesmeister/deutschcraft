/**
 * WritingFeedback Component
 * Displays detailed AI-generated feedback for writing submissions
 */

import { WritingFeedback as WritingFeedbackType, GrammarError, VocabularySuggestion } from '@/lib/models/writing';

interface WritingFeedbackProps {
  feedback: WritingFeedbackType;
  studentText: string;
  referenceText?: string; // For translations
}

export function WritingFeedback({ feedback, studentText, referenceText }: WritingFeedbackProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-neutral-900">Overall Score</h3>
          <div className="text-5xl font-black text-blue-600">
            {feedback.overallScore}%
          </div>
        </div>
        <p className="text-neutral-700 leading-relaxed">{feedback.overallComment}</p>
      </div>

      {/* Score Breakdown */}
      <div className="flex flex-col gap-4">
        <ScoreCard
          label="Grammar"
          score={feedback.grammarScore}
          icon="📝"
          color="emerald"
        />
        <ScoreCard
          label="Vocabulary"
          score={feedback.vocabularyScore}
          icon="📚"
          color="purple"
        />
        <ScoreCard
          label="Coherence"
          score={feedback.coherenceScore}
          icon="🔗"
          color="amber"
        />
        {feedback.creativityScore !== undefined && (
          <ScoreCard
            label="Creativity"
            score={feedback.creativityScore}
            icon="✨"
            color="pink"
          />
        )}
        {feedback.accuracyScore !== undefined && (
          <ScoreCard
            label="Translation Accuracy"
            score={feedback.accuracyScore}
            icon="🎯"
            color="indigo"
          />
        )}
      </div>

      {/* Strengths */}
      {feedback.strengths && feedback.strengths.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💪</span>
            <h4 className="text-lg font-bold text-emerald-900">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-emerald-800">
                <span className="text-emerald-600 font-bold mt-1">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grammar Errors */}
      {feedback.grammarErrors && feedback.grammarErrors.length > 0 && (
        <div className="bg-white border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">❌</span>
            <h4 className="text-lg font-bold text-neutral-900">Grammar Corrections</h4>
          </div>
          <div className="space-y-4">
            {feedback.grammarErrors.map((error, idx) => (
              <GrammarErrorCard key={idx} error={error} />
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary Suggestions */}
      {feedback.vocabularySuggestions && feedback.vocabularySuggestions.length > 0 && (
        <div className="bg-white border border-purple-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💡</span>
            <h4 className="text-lg font-bold text-neutral-900">Vocabulary Improvements</h4>
          </div>
          <div className="space-y-3">
            {feedback.vocabularySuggestions.map((suggestion, idx) => (
              <VocabularySuggestionCard key={idx} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Style Comments */}
      {feedback.styleComments && feedback.styleComments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎨</span>
            <h4 className="text-lg font-bold text-blue-900">Style & Flow</h4>
          </div>
          <ul className="space-y-2">
            {feedback.styleComments.map((comment, idx) => (
              <li key={idx} className="flex items-start gap-2 text-blue-800">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>{comment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Translation-specific feedback */}
      {referenceText && (
        <div className="bg-white border border-gray-300 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔄</span>
            <h4 className="text-lg font-bold text-neutral-900">Reference Translation</h4>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-neutral-800 leading-relaxed">{referenceText}</p>
          </div>

          {feedback.missedPhrases && feedback.missedPhrases.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-neutral-700 mb-2">
                Important phrases to include:
              </h5>
              <div className="flex flex-wrap gap-2">
                {feedback.missedPhrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Score Card Component
interface ScoreCardProps {
  label: string;
  score: number;
  icon: string;
  color: 'emerald' | 'purple' | 'amber' | 'pink' | 'indigo';
}

function ScoreCard({ label, score, icon, color }: ScoreCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    pink: 'bg-pink-100 text-pink-700 border-pink-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  return (
    <div className={`border rounded-2xl p-4 ${colorClasses[color]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium mb-1 opacity-90">{label}</div>
      <div className="text-3xl font-black">{score}%</div>
    </div>
  );
}

// Grammar Error Card Component
function GrammarErrorCard({ error }: { error: GrammarError }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xs font-bold">!</span>
        </div>
        <div className="flex-1">
          <div className="mb-2">
            <span className="text-sm font-semibold text-red-900 uppercase tracking-wide">
              {error.errorType.replace(/-/g, ' ')}
            </span>
          </div>
          <div className="mb-2">
            <div className="text-sm text-neutral-600 mb-1">Your text:</div>
            <div className="bg-white border border-red-300 rounded-lg px-3 py-2">
              <span className="text-red-700 line-through">{error.originalText}</span>
            </div>
          </div>
          <div className="mb-2">
            <div className="text-sm text-neutral-600 mb-1">Suggested correction:</div>
            <div className="bg-white border border-emerald-300 rounded-lg px-3 py-2">
              <span className="text-emerald-700 font-medium">{error.suggestedCorrection}</span>
            </div>
          </div>
          <p className="text-sm text-neutral-700 italic">{error.explanation}</p>
        </div>
      </div>
    </div>
  );
}

// Vocabulary Suggestion Card Component
function VocabularySuggestionCard({ suggestion }: { suggestion: VocabularySuggestion }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
      <div className="flex flex-col gap-3 mb-2">
        <div>
          <div className="text-xs text-neutral-600 mb-1">You used:</div>
          <div className="bg-white border border-purple-300 rounded-lg px-3 py-2">
            <span className="text-neutral-800">{suggestion.originalWord}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-600 mb-1">Consider using:</div>
          <div className="bg-white border border-purple-400 rounded-lg px-3 py-2">
            <span className="text-purple-700 font-medium">{suggestion.suggestedWord}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-neutral-700 mb-2">{suggestion.reason}</p>
      {suggestion.context && (
        <div className="bg-purple-100 border border-purple-300 rounded-lg px-3 py-2 text-sm text-purple-900 italic">
          Example: {suggestion.context}
        </div>
      )}
    </div>
  );
}
