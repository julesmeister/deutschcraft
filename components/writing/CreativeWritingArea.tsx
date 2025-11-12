/**
 * CreativeWritingArea Component
 * Uses reusable WritingWorkspace component
 */

import { ReactNode } from 'react';
import { CreativeWritingExercise } from '@/lib/models/writing';
import { WritingWorkspace } from './WritingWorkspace';

interface CreativeWritingAreaProps {
  exercise: CreativeWritingExercise;
  content: string;
  wordCount: number;
  onChange: (content: string) => void;
  attemptCount?: number;
  attemptHistory?: ReactNode;
  readOnly?: boolean;
  viewingAttempt?: { attemptNumber: number; status: string };
}

export function CreativeWritingArea({
  exercise,
  content,
  wordCount,
  onChange,
  attemptCount,
  attemptHistory,
  readOnly,
  viewingAttempt
}: CreativeWritingAreaProps) {
  const isUnderMin = wordCount < exercise.minWords;
  const isOverMax = exercise.maxWords && wordCount > exercise.maxWords;

  const topIndicator = (
    <div className="text-sm font-medium">
      <span className={`${
        isUnderMin ? 'text-amber-600' :
        isOverMax ? 'text-red-600' :
        'text-emerald-600'
      }`}>
        {wordCount}
      </span>
      <span className="text-gray-400 mx-1">/</span>
      <span className="text-gray-500">
        {exercise.minWords}{exercise.maxWords ? `-${exercise.maxWords}` : '+'} words
      </span>
    </div>
  );

  const instructions = (
    <>
      {/* Exercise Prompt */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">📝 Your Task</h3>
        <p className="text-base text-gray-900 leading-relaxed mb-4">
          {exercise.prompt}
        </p>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div>
            <span className="font-semibold">Time:</span> ~{exercise.estimatedTime} min
          </div>
          <div>
            <span className="font-semibold">Difficulty:</span> <span className="capitalize">{exercise.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Grammar Focus */}
      {exercise.targetGrammar && exercise.targetGrammar.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">🎯 Grammar Focus</h4>
          <div className="flex flex-wrap gap-2">
            {exercise.targetGrammar.map((item, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Vocabulary */}
      {exercise.suggestedVocabulary && exercise.suggestedVocabulary.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Vocabulary</h4>
          <div className="flex flex-wrap gap-2">
            {exercise.suggestedVocabulary.map((word, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Writing Tips */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Start with a simple outline</li>
          <li>• Use the suggested vocabulary</li>
          <li>• Check grammar before submitting</li>
          <li>• Read aloud to catch mistakes</li>
        </ul>
      </div>
    </>
  );

  return (
    <WritingWorkspace
      value={content}
      onChange={onChange}
      placeholder="Beginne hier zu schreiben..."
      topIndicator={topIndicator}
      instructions={instructions}
      attemptCount={attemptCount}
      attemptHistory={attemptHistory}
      readOnly={readOnly}
      viewingAttempt={viewingAttempt}
    />
  );
}
