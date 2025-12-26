/**
 * Answer Fields Manager Component
 * Manages answer items for exercise creation/editing
 */

'use client';

import { Plus, X } from 'lucide-react';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { ExerciseAnswer } from '@/lib/models/exercises';

interface AnswerFieldsManagerProps {
  answers: ExerciseAnswer[];
  onUpdateAnswer: (index: number, field: 'itemNumber' | 'correctAnswer', value: string) => void;
  onAddAnswer: () => void;
  onRemoveAnswer: (index: number) => void;
}

export function AnswerFieldsManager({
  answers,
  onUpdateAnswer,
  onAddAnswer,
  onRemoveAnswer,
}: AnswerFieldsManagerProps) {
  return (
    <FormField>
      <div className="flex items-center justify-between mb-2">
        <Label>Answers *</Label>
        <button
          type="button"
          onClick={onAddAnswer}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Answer
        </button>
      </div>

      <div className="space-y-3">
        {answers.map((answer, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="w-24">
              <Input
                type="text"
                value={answer.itemNumber}
                onChange={(e) => onUpdateAnswer(index, 'itemNumber', e.target.value)}
                placeholder="Item #"
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                value={answer.correctAnswer}
                onChange={(e) => onUpdateAnswer(index, 'correctAnswer', e.target.value)}
                placeholder="Correct answer"
              />
            </div>
            {answers.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveAnswer(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove answer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Add multiple answer items for exercises with numbered sub-questions
      </p>
    </FormField>
  );
}
