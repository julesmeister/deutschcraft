/**
 * TranslationExerciseSelector Component
 * Grid display of available translation exercises
 */

import { TranslationExercise } from '@/lib/models/writing';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseGrid } from './ExerciseGrid';

interface TranslationExerciseSelectorProps {
  exercises: TranslationExercise[];
  onSelect: (exercise: TranslationExercise) => void;
}

export function TranslationExerciseSelector({ exercises, onSelect }: TranslationExerciseSelectorProps) {
  return (
    <ExerciseGrid
      isEmpty={exercises.length === 0}
      emptyState={{
        icon: '🔄',
        title: 'No translation exercises available',
        description: 'Try selecting a different level or check back later'
      }}
    >
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.exerciseId}
          icon=""
          title={exercise.title}
          difficulty={exercise.difficulty}
          onClick={() => onSelect(exercise)}
          description={
            <div className="bg-gray-50 border border-gray-200 p-3">
              <p className="text-sm text-neutral-600 line-clamp-2 italic">
                "{exercise.englishText.substring(0, 80)}..."
              </p>
            </div>
          }
          footer={
            <div className="flex items-center justify-between">
              <span>{exercise.estimatedTime} min</span>
              <span>{exercise.completionCount} completed</span>
            </div>
          }
        />
      ))}
    </ExerciseGrid>
  );
}
