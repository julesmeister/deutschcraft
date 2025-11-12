/**
 * CreativeWritingInstructions Component
 * Displays exercise prompt, word count requirements, grammar focus, and vocabulary suggestions
 */

import { CreativeWritingExercise } from '@/lib/models/writing';

interface CreativeWritingInstructionsProps {
  exercise: CreativeWritingExercise;
}

export function CreativeWritingInstructions({ exercise }: CreativeWritingInstructionsProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-neutral-900 mb-2">📝 Instructions</h3>
          <p className="text-neutral-700 mb-4">{exercise.prompt}</p>

          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-semibold text-neutral-900">Word count:</span>{' '}
              <span className="text-neutral-700">
                {exercise.minWords}{exercise.maxWords ? `-${exercise.maxWords}` : '+'} words
              </span>
            </div>
            <div>
              <span className="font-semibold text-neutral-900">Time:</span>{' '}
              <span className="text-neutral-700">~{exercise.estimatedTime} min</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-900">Difficulty:</span>{' '}
              <span className="text-neutral-700 capitalize">{exercise.difficulty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grammar Focus */}
      {exercise.targetGrammar && exercise.targetGrammar.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-neutral-900 mb-2">🎯 Grammar Focus:</h4>
          <div className="flex flex-wrap gap-2">
            {exercise.targetGrammar.map((item, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Vocabulary */}
      {exercise.suggestedVocabulary && exercise.suggestedVocabulary.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 mb-2">💡 Suggested Vocabulary:</h4>
          <div className="flex flex-wrap gap-2">
            {exercise.suggestedVocabulary.map((word, idx) => (
              <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
