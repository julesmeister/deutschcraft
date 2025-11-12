/**
 * CreativeExerciseSelector Component
 * Grid display of available creative writing exercises
 */

import { CreativeWritingExercise } from '@/lib/models/writing';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseGrid } from './ExerciseGrid';

interface CreativeExerciseSelectorProps {
  exercises: CreativeWritingExercise[];
  onSelect: (exercise: CreativeWritingExercise) => void;
}

function getCreativeIcon(type: string): string {
  switch (type) {
    case 'creative': return '✨';
    case 'descriptive': return '📸';
    case 'dialogue': return '💬';
    default: return '📝';
  }
}

export function CreativeExerciseSelector({ exercises, onSelect }: CreativeExerciseSelectorProps) {
  return (
    <ExerciseGrid
      isEmpty={exercises.length === 0}
      emptyState={{
        icon: '📝',
        title: 'No exercises available',
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
            <p className="text-sm text-neutral-600 line-clamp-2">
              {exercise.prompt}
            </p>
          }
          footer={
            <div className="flex items-center justify-between">
              <span>{exercise.estimatedTime} min</span>
              <span>{exercise.minWords}+ words</span>
              <span>{exercise.completionCount} completed</span>
            </div>
          }
        />
      ))}
    </ExerciseGrid>
  );
}
