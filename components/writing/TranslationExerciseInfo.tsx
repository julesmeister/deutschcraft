/**
 * TranslationExerciseInfo Component
 * Displays exercise metadata, grammar focus, and key vocabulary
 */

import { TranslationExercise } from '@/lib/models/writing';

interface TranslationExerciseInfoProps {
  exercise: TranslationExercise;
}

export function TranslationExerciseInfo({ exercise }: TranslationExerciseInfoProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-6">
      <div className="flex flex-wrap gap-4 text-sm mb-4">
        <div>
          <span className="font-semibold text-neutral-900">Time:</span>{' '}
          <span className="text-neutral-700">~{exercise.estimatedTime} min</span>
        </div>
        <div>
          <span className="font-semibold text-neutral-900">Difficulty:</span>{' '}
          <span className="text-neutral-700 capitalize">{exercise.difficulty}</span>
        </div>
        <div>
          <span className="font-semibold text-neutral-900">Category:</span>{' '}
          <span className="text-neutral-700 capitalize">{exercise.category.replace('-', ' ')}</span>
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

      {/* Key Vocabulary */}
      {exercise.targetVocabulary && exercise.targetVocabulary.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 mb-2">📚 Key Vocabulary:</h4>
          <div className="flex flex-wrap gap-2">
            {exercise.targetVocabulary.map((word, idx) => (
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
