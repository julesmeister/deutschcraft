/**
 * CreativeExerciseSelector Component
 * Grid display of available creative writing exercises
 */

import { CreativeWritingExercise } from '@/lib/models/writing';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseGrid } from './ExerciseGrid';
import { ExerciseFooter } from './ExerciseFooter';

interface CreativeExerciseSelectorProps {
  exercises: CreativeWritingExercise[];
  onSelect: (exercise: CreativeWritingExercise) => void;
  attemptedExerciseIds?: Set<string>;
}

function getCreativeIcon(type: string): string {
  switch (type) {
    case 'creative': return '✨';
    case 'descriptive': return '📸';
    case 'dialogue': return '💬';
    default: return '📝';
  }
}

export function CreativeExerciseSelector({ exercises, onSelect, attemptedExerciseIds }: CreativeExerciseSelectorProps) {
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
          isAttempted={attemptedExerciseIds?.has(exercise.exerciseId)}
          description={
            <p className="text-sm text-neutral-600 line-clamp-2">
              {exercise.prompt}
            </p>
          }
          footer={
            <ExerciseFooter
              left={`${exercise.estimatedTime} min`}
              right={`${exercise.minWords}+ words`}
            />
          }
        />
      ))}
    </ExerciseGrid>
  );
}
