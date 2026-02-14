/**
 * CreativeExerciseSelector Component
 * Grid display of available creative writing exercises
 */

import { useRouter } from 'next/navigation';
import { CreativeWritingExercise } from '@/lib/models/writing';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseGrid } from './ExerciseGrid';

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
  const router = useRouter();

  return (
    <ExerciseGrid
      isEmpty={exercises.length === 0}
      emptyState={{
        icon: '📝',
        title: 'No exercises available',
        description: 'Try selecting a different level or check back later'
      }}
    >
      {exercises.map((exercise) => {
        // Create feature list from prompt sentences
        const promptSentences = exercise.prompt
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .slice(0, 3);

        return (
          <ExerciseCard
            key={exercise.exerciseId}
            icon={getCreativeIcon(exercise.type)}
            title={exercise.title}
            difficulty={exercise.difficulty}
            onClick={() => router.push(`/dashboard/student/writing/creative/${exercise.exerciseId}`)}
            isAttempted={attemptedExerciseIds?.has(exercise.exerciseId)}
            description={exercise.type}
            sampleSentences={promptSentences}
            footerLeft={`⏱️ ${exercise.estimatedTime} min`}
            footerRight={`📝 ${exercise.minWords}+ words`}
          />
        );
      })}
    </ExerciseGrid>
  );
}
