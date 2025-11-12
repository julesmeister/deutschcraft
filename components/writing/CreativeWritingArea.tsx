/**
 * CreativeWritingArea Component
 * Text editor with word count tracking and writing tips
 */

import { CreativeWritingExercise } from '@/lib/models/writing';

interface CreativeWritingAreaProps {
  exercise: CreativeWritingExercise;
  content: string;
  wordCount: number;
  onChange: (content: string) => void;
}

export function CreativeWritingArea({
  exercise,
  content,
  wordCount,
  onChange
}: CreativeWritingAreaProps) {
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-neutral-900">Your Writing</h3>
          <div className="text-sm font-medium">
            <span className={`${
              wordCount < exercise.minWords ? 'text-amber-600' :
              exercise.maxWords && wordCount > exercise.maxWords ? 'text-red-600' :
              'text-emerald-600'
            }`}>
              {wordCount} words
            </span>
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-600">
              {exercise.minWords}{exercise.maxWords ? `-${exercise.maxWords}` : '+'} required
            </span>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Beginne hier zu schreiben..."
          className="w-full h-96 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans text-base"
          style={{ lineHeight: '1.8' }}
        />
      </div>

      {/* Writing Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h4 className="text-sm font-bold text-amber-900 mb-2">💡 Quick Tips:</h4>
        <ul className="space-y-1 text-sm text-amber-800">
          <li>• Start with a simple outline before writing</li>
          <li>• Use the suggested vocabulary to improve your score</li>
          <li>• Check your grammar and spelling before submitting</li>
          <li>• Read your writing aloud to catch mistakes</li>
        </ul>
      </div>
    </>
  );
}
